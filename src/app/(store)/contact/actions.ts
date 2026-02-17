"use server";

import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactMessage(formData: FormData) {
	const name = String(formData.get("name") || "").trim();
	const email = String(formData.get("email") || "").trim();
	const message = String(formData.get("message") || "").trim();
	const photo = formData.get("photo") as File | null;

	if (!name || !email.includes("@") || message.length < 5) {
		return { status: 400, error: "Invalid form data" } as const;
	}

	// Moderate the text message
	try {
		const textModerationResponse = await fetch(
			`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/moderate-text`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: `${name}\n${message}`,
				}),
			},
		);

		// Only block if moderation service is working AND content is flagged
		if (textModerationResponse.ok) {
			const textModerationResult = await textModerationResponse.json();

			if (!textModerationResult.safe) {
				return {
					status: 400,
					error: "Message contains inappropriate content and cannot be sent",
				} as const;
			}
		} else if (textModerationResponse.status === 503) {
			// Service unavailable (rate limit or down) - log but allow submission
			console.warn("Text moderation service unavailable, allowing message through");
		}
	} catch (error) {
		console.error("Text moderation error:", error);
		// Continue if moderation fails to not block legitimate messages
	}

	const to = process.env.ADMIN_EMAIL;
	const from = process.env.EMAIL_FROM;

	if (!to || !from) {
		console.error("Missing ADMIN_EMAIL or EMAIL_FROM env var");
		return { status: 500, error: "Email service not configured" } as const;
	}

	let photoUrl: string | null = null;
	let photoAttachment: { filename: string; content: Buffer } | null = null;

	// Handle photo upload if present
	if (photo && photo.size > 0) {
		try {
			// Moderate the image first
			const moderationFormData = new FormData();
			moderationFormData.append("image", photo);

			const moderationResponse = await fetch(
				`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/moderate-image`,
				{
					method: "POST",
					body: moderationFormData,
				},
			);

			// Only block if moderation service is working AND content is flagged
			if (moderationResponse.ok) {
				const moderationResult = await moderationResponse.json();

				if (!moderationResult.safe) {
					return {
						status: 400,
						error: "Image contains inappropriate content and cannot be accepted",
					} as const;
				}
			} else if (moderationResponse.status === 503) {
				// Service unavailable (rate limit or down) - log but allow submission
				console.warn("Image moderation service unavailable, allowing image through");
			}

			// Convert photo to buffer for email attachment
			const bytes = await photo.arrayBuffer();
			const buffer = Buffer.from(bytes);

			photoAttachment = {
				filename: `customer-bread-${Date.now()}.${photo.name.split(".").pop()}`,
				content: buffer,
			};

			// Optionally save to pending folder for review
			const uploadsDir = join(process.cwd(), "public", "images", "customer-bread-pending");
			if (!existsSync(uploadsDir)) {
				await mkdir(uploadsDir, { recursive: true });
			}

			const filename = `${Date.now()}-${name.replace(/\s+/g, "-")}.${photo.name.split(".").pop()}`;
			const filepath = join(uploadsDir, filename);
			await writeFile(filepath, buffer);
			photoUrl = `/images/customer-bread-pending/${filename}`;
		} catch (error) {
			console.error("Photo upload error:", error);
			return { status: 500, error: "Failed to process photo" } as const;
		}
	}

	try {
		const emailBody = photoUrl
			? `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nPhoto URL: ${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}${photoUrl}`
			: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

		const emailOptions: {
			from: string;
			to: string[];
			subject: string;
			replyTo: string;
			text: string;
			attachments?: { filename: string; content: Buffer }[];
		} = {
			from,
			to: [to],
			subject: photoUrl ? `New contact from ${name} (with photo)` : `New contact from ${name}`,
			replyTo: email,
			text: emailBody,
		};

		// Attach photo if available
		if (photoAttachment) {
			emailOptions.attachments = [photoAttachment];
		}

		const result = await resend.emails.send(emailOptions);

		if ("error" in result && result.error) {
			console.error("Resend error:", result.error);
			return { status: 500, error: "Failed to send" } as const;
		}

		return { status: 200, message: "Sent" } as const;
	} catch (err) {
		console.error("sendContactMessage error:", err);
		return { status: 500, error: "Failed to send" } as const;
	}
}
