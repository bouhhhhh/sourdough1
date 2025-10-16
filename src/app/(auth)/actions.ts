"use server";
import { z } from "zod";
import argon2 from "argon2";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { encrypt } from "@/app/(auth)/session"; // <- ta fonction existante
import { cookies } from "next/headers";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // renforce si tu veux (min longueur, complexité)
});

export async function signup(_state: unknown, formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const parsed = SignupSchema.safeParse({ email, password });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) return { error: "Email already in use" };

  const passwordHash = await argon2.hash(password); // Argon2 par défaut (salé + params sûrs)
  const user = await User.create({ email, passwordHash });

  // Optionnel: envoyer un email de vérification ici

  // Auto-login après signup (facultatif)
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  const session = await encrypt({ user: { email: user.email }, expires });
  (await cookies()).set("session", session, {
    expires: new Date(expires),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return { ok: true };
}
