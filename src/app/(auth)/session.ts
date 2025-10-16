"use server";

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";

if (!process.env.SECRET) {
  throw new Error("SECRET must be defined");
}

const key = new TextEncoder().encode(process.env.SECRET);

// 24h en ms (tu peux changer)
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
// Refresh si < 1h restante
const ROLLING_THRESHOLD_MS = 60 * 60 * 1000;

export type SessionUser = {
  email: string;
  // ajoute d’autres champs si tu veux (id, role, etc.)
};

export interface SessionData extends JWTPayload {
  user: SessionUser;
  expires: number; // epoch ms
}

/* =======================
 *  JWT helpers
 * =======================
 */
export async function encrypt(payload: SessionData): Promise<string> {
  // setExpirationTime accepte ms epoch, jose gère la conversion
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expires)
    .sign(key);
}

export async function decrypt(token: string): Promise<SessionData | null> {
  try {
    const r = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return r.payload as SessionData;
  } catch (e) {
    // token expiré/invalide
    return null;
  }
}

/* =======================
 *  Cookie helpers
 * =======================
 */
const COOKIE_NAME = "session";

function setSessionCookieRaw(token: string, expiresMs: number) {
  const expDate = new Date(expiresMs);
  return (async () => {
    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expDate,
      path: "/",
    });
  })();
}

async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

/* =======================
 *  Public API
 * =======================
 */

// Crée une session et place le cookie
export async function createSession(user: SessionUser) {
  const expires = Date.now() + SESSION_DURATION_MS;
  const token = await encrypt({ user, expires });
  await setSessionCookieRaw(token, expires);
  return { token, expires };
}

// Détruit la session
export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}

// Auth “souple” : retourne SessionData ou null (ne redirige pas)
export async function auth(): Promise<SessionData | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const data = await decrypt(token);
  if (!data) {
    await clearSessionCookie();
    return null;
  }

  // token décodé mais peut être proche d’expiration → rolling session
  const remaining = data.expires - Date.now();
  if (remaining < ROLLING_THRESHOLD_MS) {
    data.expires = Date.now() + SESSION_DURATION_MS;
    const freshToken = await encrypt(data);
    await setSessionCookieRaw(freshToken, data.expires);
  }

  return data;
}

// Auth “strict” : redirige vers /login si non connecté
export async function requireAuth(): Promise<SessionData> {
  const s = await auth();
  if (!s) redirect("/login");
  return s!;
}

// Utilitaire middleware/route: rafraîchit le cookie si besoin (retourne NextResponse | void)
export async function updateSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return;

  const data = await decrypt(token);
  if (!data) {
    await clearSessionCookie();
    return;
  }

  if (data.expires - Date.now() < ROLLING_THRESHOLD_MS) {
    data.expires = Date.now() + SESSION_DURATION_MS;
    const fresh = await encrypt(data);
    await setSessionCookieRaw(fresh, data.expires);
  }
}

/* =======================
 *  Exemple de login “basique”
 *  (remplace par vérification DB si tu as un vrai signup)
 * =======================
 */
export async function login(_state: unknown, formData: FormData): Promise<{ error?: string } | undefined> {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  // Démo: variables d’env. Remplace par check DB (argon2/bcrypt) si tu as des users.
  if (email !== process.env.EMAIL || password !== process.env.PASSWORD) {
    return { error: "Invalid credentials" };
  }

  await createSession({ email });
  redirect("/orders"); // ajuste la route post-login
}
