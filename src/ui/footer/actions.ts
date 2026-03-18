"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z
	.string()
	.min(5)
	.max(150, "Requête trop volumineuse")
	.email("Format d'email invalide")
	.trim();

export async function signForNewsletter(formData: FormData) {
	const rawEmail = formData.get("email");

	// VALIDATION IMMÉDIATE
	const result = emailSchema.safeParse(rawEmail);

	if (!result.success) {
		// On renvoie une erreur 400 propre, sans charger le reste
		return { status: 400, error: result.error.errors[0].message };
	}

	// Ici, l'email est PROPRE, COURT et VALIDE.
	const email = result.data;

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
		return { status: 500, error: "Service momentanément indisponible" };
	}
}
