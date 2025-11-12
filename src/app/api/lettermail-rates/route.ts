import { NextResponse } from "next/server";

export interface LettermailRate {
	id: string;
	name: string;
	description: string;
	price: number; // in cents
	estimatedDays: string;
	serviceCode: string;
}

interface LettermailRateRequest {
	destination: {
		postalCode: string;
		country: string;
		city?: string;
		province?: string;
	};
	origin?: {
		postalCode: string;
	};
	weight: number; // in grams
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as LettermailRateRequest;
		const { destination, origin, weight } = body;

		if (!destination?.postalCode || !destination?.country) {
			return NextResponse.json(
				{ error: "Destination postal code and country are required" },
				{ status: 400 }
			);
		}

		if (!weight || weight <= 0) {
			return NextResponse.json(
				{ error: "Weight is required and must be greater than 0" },
				{ status: 400 }
			);
		}

		// Check if Canada Post is configured
		const apiKey = process.env.CANADA_POST_API_KEY;
		const apiSecret = process.env.CANADA_POST_API_SECRET;
		const customerNumber = process.env.CANADA_POST_CUSTOMER_NUMBER;
		const apiUrl = process.env.CANADA_POST_API_URL || "https://ct.soa-gw.canadapost.ca";

		if (!apiKey || !apiSecret || !customerNumber) {
			console.warn("Canada Post API not configured, returning mock lettermail rates");
			return NextResponse.json({
				rates: getMockLettermailRates(destination.country, weight),
			});
		}

		// Default origin to Canada if not provided
		const originPostalCode = origin?.postalCode || "H2X1Y7"; // Default Montreal

		// Clean postal codes - remove spaces and convert to uppercase as Canada Post API requires
		const cleanOriginPostalCode = originPostalCode.replace(/\s+/g, "").toUpperCase();
		const cleanDestPostalCode = destination.postalCode.replace(/\s+/g, "").toUpperCase();

		// Convert weight from grams to kg for API
		const weightInKg = weight / 1000;

		// Build Canada Post API request for lettermail
		const ratesRequest = {
			"mailing-scenario": {
				"customer-number": customerNumber,
				"parcel-characteristics": {
					weight: weightInKg,
				},
				"origin-postal-code": cleanOriginPostalCode,
				destination: {
					domestic: destination.country === "CA" ? {
						"postal-code": cleanDestPostalCode,
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

		// Call Canada Post API
		const response = await fetch(`${apiUrl}/rs/ship/price`, {
			method: "POST",
			headers: {
				"Content-Type": "application/vnd.cpc.ship.rate-v4+xml",
				"Accept": "application/vnd.cpc.ship.rate-v4+xml",
				"Authorization": `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
				"Accept-language": "en-CA",
			},
			body: buildCanadaPostXML(ratesRequest),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Canada Post API error:", errorText);
			
			// Fallback to mock rates on error
			return NextResponse.json({
				rates: getMockLettermailRates(destination.country, weight),
			});
		}

		const xmlResponse = await response.text();
		const rates = parseCanadaPostRates(xmlResponse);

		return NextResponse.json({ rates });
	} catch (error: any) {
		console.error("Lettermail rates error:", error);
		
		// Return mock rates on error
		return NextResponse.json({
			rates: getMockLettermailRates("CA", 50),
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
	</parcel-characteristics>
	<origin-postal-code>${scenario["origin-postal-code"]}</origin-postal-code>
	<destination>
		${destinationXML}
	</destination>
</mailing-scenario>`;
}

function parseCanadaPostRates(xml: string): LettermailRate[] {
	const rates: LettermailRate[] = [];
	
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
				estimatedDays: deliveryDate || "3-5 business days",
				serviceCode,
			});
		}
	}
	
	return rates.length > 0 ? rates : getMockLettermailRates("CA", 50);
}

function getMockLettermailRates(country: string, weight: number): LettermailRate[] {
	// Mock rates for development/fallback based on weight
	if (country === "CA") {
		if (weight <= 30) {
			return [
				{
					id: "DOM.LM",
					name: "Lettermail",
					description: "Standard Lettermail (up to 30g)",
					price: 192, // $1.92
					estimatedDays: "2-9 business days",
					serviceCode: "DOM.LM",
				},
			];
		} else if (weight <= 50) {
			return [
				{
					id: "DOM.LM",
					name: "Lettermail",
					description: "Standard Lettermail (up to 50g)",
					price: 254, // $2.54
					estimatedDays: "2-9 business days",
					serviceCode: "DOM.LM",
				},
			];
		} else if (weight <= 100) {
			return [
				{
					id: "DOM.LM",
					name: "Lettermail",
					description: "Standard Lettermail (up to 100g)",
					price: 331, // $3.31
					estimatedDays: "2-9 business days",
					serviceCode: "DOM.LM",
				},
			];
		} else {
			return [
				{
					id: "DOM.LM",
					name: "Lettermail",
					description: "Standard Lettermail (up to 500g)",
					price: 505, // $5.05
					estimatedDays: "2-9 business days",
					serviceCode: "DOM.LM",
				},
			];
		}
	} else if (country === "US") {
		if (weight <= 30) {
			return [
				{
					id: "USA.LM",
					name: "US Lettermail",
					description: "Lettermail to USA (up to 30g)",
					price: 154, // $1.54
					estimatedDays: "4-7 business days",
					serviceCode: "USA.LM",
				},
			];
		} else if (weight <= 50) {
			return [
				{
					id: "USA.LM",
					name: "US Lettermail",
					description: "Lettermail to USA (up to 50g)",
					price: 224, // $2.24
					estimatedDays: "4-7 business days",
					serviceCode: "USA.LM",
				},
			];
		} else {
			return [
				{
					id: "USA.LM",
					name: "US Lettermail",
					description: "Lettermail to USA (up to 100g)",
					price: 363, // $3.63
					estimatedDays: "4-7 business days",
					serviceCode: "USA.LM",
				},
			];
		}
	} else {
		if (weight <= 30) {
			return [
				{
					id: "INT.LM",
					name: "International Lettermail",
					description: "Lettermail International (up to 30g)",
					price: 285, // $2.85
					estimatedDays: "6-10 business days",
					serviceCode: "INT.LM",
				},
			];
		} else if (weight <= 50) {
			return [
				{
					id: "INT.LM",
					name: "International Lettermail",
					description: "Lettermail International (up to 50g)",
					price: 385, // $3.85
					estimatedDays: "6-10 business days",
					serviceCode: "INT.LM",
				},
			];
		} else {
			return [
				{
					id: "INT.LM",
					name: "International Lettermail",
					description: "Lettermail International (up to 100g)",
					price: 570, // $5.70
					estimatedDays: "6-10 business days",
					serviceCode: "INT.LM",
				},
			];
		}
	}
}
