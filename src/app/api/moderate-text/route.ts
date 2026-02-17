import { type NextRequest, NextResponse } from "next/server";

/**
 * Text Moderation API Route
 * Uses OpenAI Moderation API to check text content
 *
 * Requires OPENAI_API_KEY in environment variables
 */

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as { text?: string };
		const text = body.text;

		if (!text || typeof text !== "string") {
			return NextResponse.json({ error: "No text provided" }, { status: 400 });
		}

		const apiKey = process.env.OPENAI_API_KEY;

		// If OpenAI API key is not configured, skip moderation
		if (!apiKey) {
			console.warn("OPENAI_API_KEY not configured - skipping text moderation");
			return NextResponse.json({
				safe: true,
				message: "Text accepted (moderation not configured)",
			});
		}

		// Call OpenAI Moderation API
		const response = await fetch("https://api.openai.com/v1/moderations", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				input: text,
			}),
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error("OpenAI Moderation API error:", errorData);

			// If moderation service fails, reject to be safe
			return NextResponse.json(
				{
					safe: false,
					error: "Content moderation service unavailable",
				},
				{ status: 503 },
			);
		}

		const result = (await response.json()) as {
			results?: Array<{
				flagged: boolean;
				categories: Record<string, boolean>;
				category_scores: Record<string, number>;
			}>;
		};

		const moderationResult = result.results?.[0];

		if (!moderationResult) {
			return NextResponse.json(
				{
					safe: false,
					error: "Invalid moderation response",
				},
				{ status: 500 },
			);
		}

		const isFlagged = moderationResult.flagged;

		if (isFlagged) {
			// Get the flagged categories
			const flaggedCategories = Object.entries(moderationResult.categories)
				.filter(([_, flagged]) => flagged)
				.map(([category]) => category);

			return NextResponse.json({
				safe: false,
				message: "Text contains inappropriate content",
				categories: flaggedCategories,
			});
		}

		return NextResponse.json({
			safe: true,
			message: "Text is safe",
		});
	} catch (error) {
		console.error("Text moderation error:", error);
		return NextResponse.json({ error: "Failed to moderate text" }, { status: 500 });
	}
}
