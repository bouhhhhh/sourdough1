import { NextResponse } from "next/server";

export interface ShippingRate {
	id: string;
	name: string;
	description: string;
	price: number; // in cents
	estimatedDays: string;
	serviceCode: string;
}

interface ShippingRateRequest {
	destination: {
		postalCode: string;
		country: string;
		city?: string;
		province?: string;
	};
	origin?: {
		postalCode: string;
	};
	package?: {
		weight: number; // in kg
		length?: number; // in cm
		width?: number; // in cm
		height?: number; // in cm
	};
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as ShippingRateRequest;
		const { destination, origin, package: pkg } = body;

		console.log("[SHIPPING-RATES] Request received:", {
			destination,
			origin,
			package: pkg,
		});

		if (!destination?.postalCode || !destination?.country) {
			console.error("[SHIPPING-RATES] Missing required fields:", {
				hasPostalCode: !!destination?.postalCode,
				hasCountry: !!destination?.country,
			});
			return NextResponse.json(
				{ error: "Destination postal code and country are required" },
				{ status: 400 }
			);
		}

		// Check if Canada Post is configured
		const apiKey = process.env.CANADA_POST_API_KEY;
		const apiSecret = process.env.CANADA_POST_API_SECRET;
		const customerNumber = process.env.CANADA_POST_CUSTOMER_NUMBER;
		const apiUrl = process.env.CANADA_POST_API_URL || "https://ct.soa-gw.canadapost.ca";

		if (!apiKey || !apiSecret || !customerNumber) {
			console.warn("Canada Post API not configured, returning mock rates");
			return NextResponse.json({
				rates: getMockRates(destination.country),
			});
		}

		// Default package dimensions if not provided
		const weight = pkg?.weight || 0.05; // 50g default
		const dimensions = {
			length: pkg?.length || 20,
			width: pkg?.width || 15,
			height: pkg?.height || 10,
		};

		// Default origin to Canada if not provided
		const originPostalCode = origin?.postalCode || "H2X1Y7"; // Default Montreal

		// Clean postal codes - remove spaces and convert to uppercase as Canada Post API requires
		const cleanOriginPostalCode = originPostalCode.replace(/\s+/g, "").toUpperCase();
		const cleanDestPostalCode = destination.postalCode.replace(/\s+/g, "").toUpperCase();

		console.log("[SHIPPING-RATES] Cleaned postal codes:", {
			origin: cleanOriginPostalCode,
			destination: cleanDestPostalCode,
			country: destination.country,
		});

		// Strict validation for CA and US postal/zip codes
		if (destination.country === "CA") {
			// Apple Pay only provides first 3 chars (A1A) for privacy, or full 6 chars
			const isValid3 = cleanDestPostalCode.length === 3 && /^[A-Z]\d[A-Z]$/.test(cleanDestPostalCode);
			const isValid6 = cleanDestPostalCode.length === 6 && /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleanDestPostalCode);
			const isValidCA = isValid3 || isValid6;
			console.log("[SHIPPING-RATES] CA validation:", {
				postalCode: cleanDestPostalCode,
				length: cleanDestPostalCode.length,
				isValid3,
				isValid6,
				isValid: isValidCA,
			});
			if (!isValidCA) {
				return NextResponse.json(
					{ error: "Invalid Canadian postal code format (expected: A1A or A1A1A1)" },
					{ status: 400 }
				);
			}
			// If only 3 chars, pad with zeros for Canada Post API (e.g., G6B -> G6B0A0)
			if (cleanDestPostalCode.length === 3) {
				console.log("[SHIPPING-RATES] Padding 3-char postal code for Canada Post API");
				// Canada Post needs 6 chars, use pattern A1A0A0 for partial postal codes
				const paddedPostal = `${cleanDestPostalCode}0A0`;
				console.log("[SHIPPING-RATES] Padded postal code:", paddedPostal);
				// Override the destination postal code with padded version
				destination.postalCode = paddedPostal;
			}
		}
		if (destination.country === "US") {
			const isValidUS = /^\d{5}(\d{4})?$/.test(cleanDestPostalCode);
			console.log("[SHIPPING-RATES] US validation:", {
				zipCode: cleanDestPostalCode,
				isValid: isValidUS,
			});
			if (!isValidUS) {
				return NextResponse.json(
					{ error: "Invalid US ZIP code format" },
					{ status: 400 }
				);
			}
		}
		// For other countries, just require non-empty postal code

		// Re-clean destination postal code after potential padding
		const finalDestPostalCode = destination.postalCode.replace(/\s+/g, "").toUpperCase();

		// Build Canada Post API request
		const ratesRequest = {
			"mailing-scenario": {
				"customer-number": customerNumber,
				"parcel-characteristics": {
					weight: weight,
					dimensions: {
						length: dimensions.length,
						width: dimensions.width,
						height: dimensions.height,
					},
				},
				"origin-postal-code": cleanOriginPostalCode,
				destination: {
					domestic: destination.country === "CA" ? {
						"postal-code": finalDestPostalCode,
					} : undefined,
					"united-states": destination.country === "US" ? {
						"zip-code": cleanDestPostalCode,
					} : undefined,
					international: !["CA", "US"].includes(destination.country) ? {
						"country-code": destination.country,
					} : undefined,
				},
			},
		};


		// Call Canada Post API with timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);
		let response: Response;
		try {
			console.log("[SHIPPING-RATES] Calling Canada Post API:", {
				url: `${apiUrl}/rs/ship/price`,
				hasAuth: !!(apiKey && apiSecret),
				destination: ratesRequest["mailing-scenario"].destination,
			});
			
			response = await fetch(`${apiUrl}/rs/ship/price`, {
				method: "POST",
				headers: {
					"Content-Type": "application/vnd.cpc.ship.rate-v4+xml",
					"Accept": "application/vnd.cpc.ship.rate-v4+xml",
					"Authorization": `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
					"Accept-language": "en-CA",
				},
				body: buildCanadaPostXML(ratesRequest),
				signal: controller.signal as any,
			});
			
			console.log("[SHIPPING-RATES] Canada Post response status:", response.status);
		} catch (err: any) {
			if (err?.name === "AbortError") {
				console.warn("[SHIPPING-RATES] Canada Post API request timed out, falling back to mock rates");
				return NextResponse.json({
					rates: getMockRates(destination.country),
				});
			}
			console.error("[SHIPPING-RATES] Canada Post API fetch error:", err);
			throw err;
		} finally {
			clearTimeout(timeoutId);
		}

		if (!response.ok) {
			const errorText = await response.text();
			console.error("[SHIPPING-RATES] Canada Post API error:", {
				status: response.status,
				statusText: response.statusText,
				body: errorText,
			});
			
			// Fallback to mock rates on error
			return NextResponse.json({
				rates: getMockRates(destination.country),
			});
		}

		const xmlResponse = await response.text();
		console.log("[SHIPPING-RATES] Canada Post XML response length:", xmlResponse.length);
		const rates = parseCanadaPostRates(xmlResponse);
        console.log("[SHIPPING-RATES] Parsed rates:", rates);

		return NextResponse.json({ rates });
	} catch (error: any) {
		console.error("[SHIPPING-RATES] Unexpected error:", {
			message: error?.message,
			stack: error?.stack,
			name: error?.name,
		});
		
		// Return mock rates on error
		return NextResponse.json({
			rates: getMockRates("CA"),
		});
	}
}

function buildCanadaPostXML(data: any): string {
	const scenario = data["mailing-scenario"];
	const dest = scenario.destination;
	
	let destinationXML = "";
	if (dest.domestic) {
		destinationXML = `
			<domestic>
				<postal-code>${dest.domestic["postal-code"]}</postal-code>
			</domestic>
		`;
	} else if (dest["united-states"]) {
		destinationXML = `
			<united-states>
				<zip-code>${dest["united-states"]["zip-code"]}</zip-code>
			</united-states>
		`;
	} else if (dest.international) {
		destinationXML = `
			<international>
				<country-code>${dest.international["country-code"]}</country-code>
			</international>
		`;
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
	<customer-number>${scenario["customer-number"]}</customer-number>
	<parcel-characteristics>
		<weight>${scenario["parcel-characteristics"].weight}</weight>
		<dimensions>
			<length>${scenario["parcel-characteristics"].dimensions.length}</length>
			<width>${scenario["parcel-characteristics"].dimensions.width}</width>
			<height>${scenario["parcel-characteristics"].dimensions.height}</height>
		</dimensions>
	</parcel-characteristics>
	<origin-postal-code>${scenario["origin-postal-code"]}</origin-postal-code>
	<destination>
		${destinationXML}
	</destination>
</mailing-scenario>`;
}

function parseCanadaPostRates(xml: string): ShippingRate[] {
	// Basic XML parsing for Canada Post response
	const rates: ShippingRate[] = [];
	
	const serviceRegex = /<price-quote>(.*?)<\/price-quote>/gs;
	const matches = xml.matchAll(serviceRegex);
	
	for (const match of matches) {
		const quote = match[1];
		if (!quote) continue;
		
		const serviceCode = quote.match(/<service-code>(.*?)<\/service-code>/)?.[1];
		const serviceName = quote.match(/<service-name>(.*?)<\/service-name>/)?.[1];
		const priceStr = quote.match(/<due>(.*?)<\/due>/)?.[1];
		const deliveryDate = quote.match(/<expected-delivery-date>(.*?)<\/expected-delivery-date>/)?.[1];
		
		if (serviceCode && serviceName && priceStr) {
			const price = Math.round(parseFloat(priceStr) * 100); // Convert to cents
			
			rates.push({
				id: serviceCode,
				name: serviceName,
				description: serviceName,
				price,
				estimatedDays: deliveryDate || "5-7 business days",
				serviceCode,
			});
		}
	}
	
	return rates.length > 0 ? rates : getMockRates("CA");
}

function getMockRates(country: string): ShippingRate[] {
	// Mock rates for development/fallback
	if (country === "CA") {
		return [
			{
				id: "DOM.EP",
				name: "Expedited Parcel",
				description: "Canada Post Expedited Parcel",
				price: 1500, // $15.00
				estimatedDays: "3-5 business days",
				serviceCode: "DOM.EP",
			},
			{
				id: "DOM.RP",
				name: "Regular Parcel",
				description: "Canada Post Regular Parcel",
				price: 1200, // $12.00
				estimatedDays: "5-7 business days",
				serviceCode: "DOM.RP",
			},
			{
				id: "DOM.XP",
				name: "Xpresspost",
				description: "Canada Post Xpresspost",
				price: 2000, // $20.00
				estimatedDays: "1-2 business days",
				serviceCode: "DOM.XP",
			},
		];
	} else if (country === "US") {
		return [
			{
				id: "USA.EP",
				name: "Expedited Parcel USA",
				description: "Canada Post Expedited Parcel USA",
				price: 2500, // $25.00
				estimatedDays: "4-7 business days",
				serviceCode: "USA.EP",
			},
			{
				id: "USA.XP",
				name: "Xpresspost USA",
				description: "Canada Post Xpresspost USA",
				price: 3500, // $35.00
				estimatedDays: "2-3 business days",
				serviceCode: "USA.XP",
			},
		];
	} else {
		return [
			{
				id: "INT.SP",
				name: "Small Packet International",
				description: "Canada Post Small Packet International",
				price: 3000, // $30.00
				estimatedDays: "6-10 business days",
				serviceCode: "INT.SP",
			},
			{
				id: "INT.XP",
				name: "Xpresspost International",
				description: "Canada Post Xpresspost International",
				price: 5000, // $50.00
				estimatedDays: "4-6 business days",
				serviceCode: "INT.XP",
			},
		];
	}
}
