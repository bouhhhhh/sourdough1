import { type NextRequest, NextResponse } from "next/server";

/**
 * Content Moderation API Route
 * Uses OpenAI Moderation API to check uploaded images
 *
 * Setup:
 * 1. Get an OpenAI API key: https://platform.openai.com/api-keys
 * 2. Add to .env:
 *    OPENAI_API_KEY=sk-...
 */

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const image = formData.get("image") as File;

		if (!image) {
			return NextResponse.json({ error: "No image provided" }, { status: 400 });
		}

		// Check file size (max 5MB)
		if (image.size > 5 * 1024 * 1024) {
			return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400 });
		}

		// Check file type
		if (!image.type.startsWith("image/")) {
			return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
		}

		const apiKey = process.env.OPENAI_API_KEY;

		// If OpenAI API key is not configured, skip moderation
		if (!apiKey) {
			console.warn("OPENAI_API_KEY not configured - skipping image moderation");
			return NextResponse.json({
				safe: true,
				message: "Image accepted (moderation not configured)",
			});
		}

		// Convert image to base64
		const buffer = await image.arrayBuffer();
		const base64Image = Buffer.from(buffer).toString("base64");
		const imageDataUrl = `data:${image.type};base64,${base64Image}`;

		// Use GPT-4 Vision to analyze the image for inappropriate content
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{
						role: "system",
						content:
							"You are a content moderator. Analyze images and determine if they contain inappropriate content including: violence, hate symbols, sexual content, self-harm, or anything that is not food/bread related. Respond with only 'SAFE' or 'UNSAFE' followed by a brief reason.",
					},
					{
						role: "user",
						content: [
							{
								type: "text",
								text: "Is this image appropriate for a bakery website's customer gallery? The image should be bread or baked goods. Respond with SAFE or UNSAFE and a brief reason.",
							},
							{
								type: "image_url",
								image_url: {
									url: imageDataUrl,
								},
							},
						],
					},
				],
				max_tokens: 100,
			}),
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error("OpenAI API error:", errorData);

			// If moderation service fails, reject the image to be safe
			return NextResponse.json(
				{
					safe: false,
					error: "Content moderation service unavailable",
				},
				{ status: 503 },
			);
		}

		const result = (await response.json()) as {
			choices?: Array<{
				message?: {
					content?: string;
				};
			}>;
		};

		const content = result.choices?.[0]?.message?.content || "";
		const isSafe = content.toUpperCase().startsWith("SAFE");

		if (!isSafe) {
			return NextResponse.json({
				safe: false,
				message: "Image contains inappropriate content or is not bread-related",
				reason: content,
			});
		}

		return NextResponse.json({
			safe: true,
			message: "Image is safe",
			analysis: content,
		});
	} catch (error) {
		console.error("Image moderation error:", error);
		return NextResponse.json({ error: "Failed to moderate image" }, { status: 500 });
	}
}
