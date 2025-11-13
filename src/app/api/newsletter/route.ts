import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { email: string };
		const { email } = body;

		if (!email || typeof email !== "string" || !email.includes("@")) {
			return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
		}

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
			return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
		}

		return NextResponse.json({ status: 200, message: "Successfully subscribed" });
	} catch (error) {
		console.error("Newsletter subscription error:", error);
		return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
	}
}
