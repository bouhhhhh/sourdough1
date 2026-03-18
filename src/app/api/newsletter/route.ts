import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z
	.string()
	.min(5)
	.max(150, "Requête trop volumineuse")
	.email("Format d'email invalide")
	.trim();

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { email: string };

		const result = emailSchema.safeParse(body.email);

		if (!result.success) {
			return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
		}

		const email = result.data;

		// Add contact to Resend audience
		// You'll need to create an audience in your Resend dashboard first
		// and replace 'YOUR_AUDIENCE_ID' with your actual audience ID
		const audienceId = process.env.RESEND_AUDIENCE_ID;

		if (!audienceId) {
			console.error("RESEND_AUDIENCE_ID is not configured");
			return NextResponse.json({ error: "Newsletter service not configured" }, { status: 500 });
		}

		const response = await resend.contacts.create({
			email,
			audienceId,
			unsubscribed: false,
		});

		if (response.error) {
			console.error("Resend API error:", response.error);
			return NextResponse.json({ error: "Service momentanément indisponible" }, { status: 500 });
		}

		return NextResponse.json({ status: 200, message: "Successfully subscribed" });
	} catch (error) {
		console.error("Newsletter subscription error:", error);
		return NextResponse.json({ error: "Service momentanément indisponible" }, { status: 500 });
	}
}
