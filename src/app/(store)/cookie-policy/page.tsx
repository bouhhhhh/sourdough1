import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Cookie Policy",
	description: "Learn about the cookies we use on St-henri Sourdough",
};

export default async function CookiePolicyPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-12">
			<h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
			
			<div className="prose prose-neutral max-w-none space-y-6">
				<p className="text-lg text-neutral-600">
					Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
				</p>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">What Are Cookies</h2>
					<p>
						Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
						They are widely used to make websites work more efficiently and provide information to the site owners.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">How We Use Cookies</h2>
					<p>
						We use cookies to enhance your experience on our website, remember your preferences, and analyze how our site is used. 
						Below is a detailed list of the cookies we use and their purposes.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">Cookies We Use</h2>

					<div className="space-y-6">
						{/* Necessary Cookies */}
						<div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
							<h3 className="text-xl font-semibold mb-3 text-neutral-900">
								Necessary Cookies (Required)
							</h3>
							<p className="mb-4 text-neutral-700">
								These cookies are essential for the website to function properly. They enable core functionality such as 
								security, authentication, and shopping cart operations. The website cannot function properly without these cookies.
							</p>
							
							<div className="space-y-4">
								<div className="bg-white rounded p-4">
									<h4 className="font-semibold text-neutral-900">session</h4>
									<p className="text-sm text-neutral-600 mt-1">
										<strong>Purpose:</strong> Maintains your login session and authentication state
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Duration:</strong> Session (expires when browser closes)
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Type:</strong> HTTP-only, Secure
									</p>
								</div>

								<div className="bg-white rounded p-4">
									<h4 className="font-semibold text-neutral-900">cartId</h4>
									<p className="text-sm text-neutral-600 mt-1">
										<strong>Purpose:</strong> Stores your shopping cart items and maintains cart state
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Duration:</strong> 30 days
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Type:</strong> First-party
									</p>
								</div>

								<div className="bg-white rounded p-4">
									<h4 className="font-semibold text-neutral-900">cookie_consent</h4>
									<p className="text-sm text-neutral-600 mt-1">
										<strong>Purpose:</strong> Remembers your cookie preferences
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Duration:</strong> 1 year
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Type:</strong> First-party
									</p>
								</div>

								<div className="bg-white rounded p-4">
									<h4 className="font-semibold text-neutral-900">cookie_preferences</h4>
									<p className="text-sm text-neutral-600 mt-1">
										<strong>Purpose:</strong> Stores your detailed cookie category preferences (functional, analytics)
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Duration:</strong> 1 year
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Type:</strong> First-party
									</p>
								</div>

								<div className="bg-white rounded p-4">
									<h4 className="font-semibold text-neutral-900">favorites</h4>
									<p className="text-sm text-neutral-600 mt-1">
										<strong>Purpose:</strong> Stores your favorite/saved products for quick access
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Duration:</strong> 1 year
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Type:</strong> First-party
									</p>
								</div>
							</div>
						</div>

						{/* Functional Cookies */}
						<div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
							<h3 className="text-xl font-semibold mb-3 text-neutral-900">
								Functional Cookies (Optional)
							</h3>
							<p className="mb-4 text-neutral-700">
								These cookies enable enhanced functionality and personalization, such as remembering your language preference 
								and customizing your experience on our website.
							</p>
							
							<div className="space-y-4">
								<div className="bg-white rounded p-4">
									<h4 className="font-semibold text-neutral-900">NEXT_LOCALE</h4>
									<p className="text-sm text-neutral-600 mt-1">
										<strong>Purpose:</strong> Remembers your preferred language (English, French, Japanese, Chinese, German)
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Duration:</strong> 1 year
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Type:</strong> First-party
									</p>
								</div>
							</div>
						</div>

						{/* Analytics Cookies */}
						<div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
							<h3 className="text-xl font-semibold mb-3 text-neutral-900">
								Analytics Cookies (Optional)
							</h3>
							<p className="mb-4 text-neutral-700">
								These cookies help us understand how visitors interact with our website by collecting and reporting information 
								anonymously. This helps us improve our website and your experience.
							</p>
							
							<div className="space-y-4">
								<div className="bg-white rounded p-4">
									<p className="text-sm text-neutral-600 italic">
										Currently, we do not use any third-party analytics cookies. If we implement analytics in the future, 
										you will be able to opt-in or opt-out via our cookie consent banner.
									</p>
								</div>
							</div>
						</div>

						{/* Payment Cookies */}
						<div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
							<h3 className="text-xl font-semibold mb-3 text-neutral-900">
								Payment & Security Cookies
							</h3>
							<p className="mb-4 text-neutral-700">
								When you make a payment, our payment processor (Stripe) may set cookies to process your transaction securely. 
								These are necessary for payment processing and fraud prevention.
							</p>
							
							<div className="space-y-4">
								<div className="bg-white rounded p-4">
									<h4 className="font-semibold text-neutral-900">Stripe Cookies</h4>
									<p className="text-sm text-neutral-600 mt-1">
										<strong>Purpose:</strong> Secure payment processing, fraud detection, and Apple Pay/Google Pay functionality
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Provider:</strong> Stripe, Inc.
									</p>
									<p className="text-sm text-neutral-600">
										<strong>Type:</strong> Third-party (necessary for payment processing)
									</p>
									<p className="text-sm text-neutral-600 mt-2">
										<Link 
											href="https://stripe.com/privacy" 
											target="_blank" 
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline"
										>
											View Stripe's Privacy Policy →
										</Link>
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">Managing Your Cookie Preferences</h2>
					<p>
						You can manage your cookie preferences at any time by clicking the cookie settings button that appears on our website. 
						You can choose to accept all cookies, reject optional cookies, or customize your preferences by category.
					</p>
					<p>
						Please note that blocking necessary cookies may affect the functionality of our website, including your ability to 
						add items to your cart or complete purchases.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">Browser Controls</h2>
					<p>
						Most web browsers allow you to control cookies through their settings. You can typically:
					</p>
					<ul className="list-disc pl-6 space-y-2">
						<li>View what cookies are stored and delete them individually</li>
						<li>Block third-party cookies</li>
						<li>Block cookies from specific websites</li>
						<li>Block all cookies from being set</li>
						<li>Delete all cookies when you close your browser</li>
					</ul>
					<p className="mt-4">
						Please note that if you choose to block all cookies, you may not be able to use all features of our website.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">Third-Party Services</h2>
					<p>
						We use the following third-party services that may set cookies:
					</p>
					<ul className="list-disc pl-6 space-y-2">
						<li>
							<strong>Stripe:</strong> For payment processing (Apple Pay, Google Pay, credit cards). 
							Stripe is PCI-DSS compliant and uses cookies for fraud prevention and secure payment processing.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">Updates to This Policy</h2>
					<p>
						We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
						operational, or regulatory reasons. We encourage you to review this policy periodically.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold mt-8">Contact Us</h2>
					<p>
						If you have any questions about our use of cookies, please contact us through our{" "}
						<Link href="/contact" className="text-blue-600 hover:underline">
							contact page
						</Link>.
					</p>
				</section>

				<div className="mt-12 p-6 bg-neutral-100 rounded-lg">
					<p className="text-sm text-neutral-600 text-center">
						By continuing to use our website, you consent to our use of cookies in accordance with this Cookie Policy.
					</p>
				</div>
			</div>
		</div>
	);
}
