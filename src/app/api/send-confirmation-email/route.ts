import { NextResponse } from "next/server";
import { Resend } from "resend";
import path from "path";
import fs from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);

// Load translations from JSON files
function loadTranslations(locale: string): Record<string, string> {
	const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
	try {
		const content = fs.readFileSync(messagesPath, "utf-8");
		return JSON.parse(content) as Record<string, string>;
	} catch (error) {
		console.error(`Failed to load translations for ${locale}:`, error);
		// Fallback to en-US
		const fallbackPath = path.join(process.cwd(), "messages", "en-US.json");
		const fallbackContent = fs.readFileSync(fallbackPath, "utf-8");
		return JSON.parse(fallbackContent) as Record<string, string>;
	}
}

interface OrderItem {
	name: string;
	quantity: number;
	price: number;
}

interface SendConfirmationEmailRequest {
	email: string;
	orderNumber: string;
	orderDate: string;
	items: OrderItem[];
	total: number;
	currency: string;
	locale?: string;
	shippingAddress: {
		name: string;
		address: {
			line1: string;
			line2?: string;
			city: string;
			state: string;
			postal_code: string;
			country: string;
		};
	};
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as SendConfirmationEmailRequest;
		const { email, orderNumber, orderDate, items, total, currency, shippingAddress, locale = "en-US" } = body;

		// Load translations from JSON files
		const messages = loadTranslations(locale);
		const t = {
			subject: messages["Email.confirmation.subject"],
			title: messages["Email.confirmation.title"],
			thankYou: messages["Email.confirmation.thankYou"],
			greeting: messages["Email.confirmation.greeting"],
			orderDetails: messages["Email.confirmation.orderDetails"],
			orderNumber: messages["Email.confirmation.orderNumber"],
			orderDate: messages["Email.confirmation.orderDate"],
			itemsOrdered: messages["Email.confirmation.itemsOrdered"],
			items: messages["Email.confirmation.items"],
			quantity: messages["Email.confirmation.quantity"],
			subtotal: messages["Email.confirmation.subtotal"],
			totalPaid: messages["Email.confirmation.totalPaid"],
			shipping: messages["Email.confirmation.shipping"],
			total: messages["Email.confirmation.total"],
			shippingAddress: messages["Email.confirmation.shippingAddress"],
			shippingTo: messages["Email.confirmation.shippingTo"],
			whatNext: messages["Email.confirmation.whatNext"],
			nextSteps: [
				messages["Email.confirmation.nextStep1"],
				messages["Email.confirmation.nextStep2"],
				messages["Email.confirmation.nextStep3"],
			],
			questions: messages["Email.confirmation.questions"],
			footer: messages["Email.confirmation.footer"],
		};

		// Format currency
		const formatMoney = (amount: number, curr: string) => {
			return new Intl.NumberFormat(locale === "fr-CA" ? "fr-CA" : "en-CA", {
				style: "currency",
				currency: curr.toUpperCase(),
			}).format(amount / 100);
		};

		// Build items HTML
		const itemsHTML = items
			.map(
				(item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.name}</strong><br/>
            <span style="color: #6b7280; font-size: 14px;">${t.quantity}: ${item.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${formatMoney(item.price * item.quantity, currency)}
          </td>
        </tr>
      `
			)
			.join("");

		// Build shipping address HTML
		const shippingHTML = `
      <p style="margin: 0; line-height: 1.6;">
        <strong>${shippingAddress.name}</strong><br/>
        ${shippingAddress.address.line1}<br/>
        ${shippingAddress.address.line2 ? `${shippingAddress.address.line2}<br/>` : ""}
        ${shippingAddress.address.city}, ${shippingAddress.address.state} ${shippingAddress.address.postal_code}<br/>
        ${shippingAddress.address.country}
      </p>
    `;

		const from = process.env.EMAIL_FROM!; // ex: "Heirbloom Orders <orders@mail.maisonheirbloom.ca>"

		const { data, error } = await resend.emails.send({
			from, // must be @mail.maisonheirbloom.ca
			to: [email],
			subject: `${t.subject} - ${orderNumber}`,
			html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">${t.title}</h1>
            </div>

            <!-- Success Message -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; color: #065f46;">
                ${t.thankYou}
              </p>
            </div>

            <!-- Order Details -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="margin-top: 0; font-size: 18px;">${t.orderDetails}</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">${t.orderNumber}</td>
                  <td style="padding: 8px 0; text-align: right;"><strong>${orderNumber}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">${t.orderDate}</td>
                  <td style="padding: 8px 0; text-align: right;"><strong>${orderDate}</strong></td>
                </tr>
              </table>
            </div>

            <!-- Items Ordered -->
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 18px; margin-bottom: 12px;">${t.itemsOrdered}</h2>
              <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px;">
                ${itemsHTML}
                <tr>
                  <td style="padding: 16px; background-color: #f0fdf4; font-weight: bold; font-size: 18px; border-radius: 0 0 0 8px;">
                    ${t.totalPaid}
                  </td>
                  <td style="padding: 16px; background-color: #f0fdf4; text-align: right; font-weight: bold; font-size: 18px; color: #10b981; border-radius: 0 0 8px 0;">
                    ${formatMoney(total, currency)}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Shipping Address -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="margin-top: 0; font-size: 18px;">${t.shippingTo}</h2>
              ${shippingHTML}
            </div>

            <!-- What's Next -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">${t.whatNext}</h3>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                ${t.nextSteps.map(step => `<li>${step}</li>`).join('')}
              </ul>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>${t.footer}</p>
              <p style="margin: 8px 0;">${t.questions}</p>
            </div>
          </body>
        </html>
      `,
		});

	if (error) {
		console.error("Error sending email:", error);
		return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
	}

	// Send notification to store owner
	const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
	if (adminEmail) {
		try {
			// Build a minimal admin notification email
			await resend.emails.send({
				from,
				to: [adminEmail],
				subject: `One more command`,
				html: `
					<!DOCTYPE html>
					<html>
						<head>
							<meta charset="utf-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
						</head>
						<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto;">
							<div style="background-color: #10b981; color: white; padding: 12px; text-align: center; border-radius: 4px; margin-bottom: 16px;">
								<strong style="font-size: 18px;">One more command</strong>
							</div>
							<div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
								<div style="margin-bottom: 8px;"><strong>${orderNumber}</strong> • ${orderDate}</div>
								<div style="color: #6b7280; font-size: 14px;">${email}</div>
							</div>
							<div style="background-color: #f0fdf4; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
								<strong style="color: #10b981; font-size: 20px;">${formatMoney(total, currency)}</strong>
							</div>
							<div style="font-size: 14px; color: #6b7280;">
								${items.map(item => `${item.quantity}× ${item.name}`).join('<br>')}
							</div>
						</body>
					</html>
				`,
			});
		} catch (adminError) {
			// Don't fail the main request if admin email fails
			console.error("Error sending admin notification:", adminError);
		}
	}

	return NextResponse.json({ success: true, emailId: data?.id });
} catch (error: unknown) {
	console.error("Error sending confirmation email:", error);
	return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
}
}