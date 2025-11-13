"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function signForNewsletter(formData: FormData) {
	const email = formData.get("email");
	if (typeof email !== "string" || !email?.includes("@")) {
		return { status: 400, error: "Invalid email" };
	}

	const audienceId = process.env.RESEND_AUDIENCE_ID;

	if (!audienceId) {
		console.error("RESEND_AUDIENCE_ID is not configured");
		return { status: 500, error: "Newsletter service not configured" };
	}

	try {
		const response = await resend.contacts.create({
			email,
			audienceId,
			unsubscribed: false,
		});

		if (response.error) {
			console.error("Resend API error:", response.error);
			return { status: 500, error: "Failed to subscribe" };
		}

		return {
			status: 200,
			message: "Successfully subscribed",
		};
	} catch (error) {
		console.error("Newsletter subscription error:", error);
		return { status: 500, error: "Failed to subscribe" };
	}
}
