"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactMessage(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email.includes("@") || message.length < 5) {
    return { status: 400, error: "Invalid form data" } as const;
  }

  const to = process.env.ADMIN_EMAIL;
  const from = process.env.EMAIL_FROM;

  if (!to || !from) {
    console.error("Missing ADMIN_EMAIL or EMAIL_FROM env var");
    return { status: 500, error: "Email service not configured" } as const;
  }

  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      subject: `New contact from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if ((result as any).error) {
      console.error("Resend error:", (result as any).error);
      return { status: 500, error: "Failed to send" } as const;
    }

    return { status: 200, message: "Sent" } as const;
  } catch (err) {
    console.error("sendContactMessage error:", err);
    return { status: 500, error: "Failed to send" } as const;
  }
}
