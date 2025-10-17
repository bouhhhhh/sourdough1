"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { encrypt, decrypt } from "./auth-middleware";

interface User {
	email: string;
}


export async function login(_state: unknown, formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return { error: "Invalid credentials" };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Invalid credentials" };

  const expires = Date.now() + 24 * 60 * 60 * 1000;
  const session = await encrypt({ user: { email: user.email }, expires });
  (await cookies()).set("session", session, {
    expires: new Date(expires),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // ex: redirect("/orders") si tu veux garder ce comportement
  return;
}


export async function logout() {
	"use server";
	(await cookies()).delete("session");
	redirect("/login");
}

export async function auth() {
	const session = (await cookies()).get("session")?.value;
	if (!session) return null;

	const data = await decrypt(session);
	if (!data || data.expires < Date.now()) {
		(await cookies()).delete("session");
		return null;
	}

	return data;
}


