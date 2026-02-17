import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Photo Submission Policy · StHenri",
};

export default async function PhotoPolicyPage() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-10">
			<h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900">
				Photo Submission Policy
			</h1>

			<div className="prose prose-gray max-w-none">
				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Submitting Your Photos
					</h2>
					<p className="text-gray-700 mb-4">
						We love seeing the beautiful bread our customers create with our sourdough starters! 
						When you submit a photo through our contact form, you agree to the following terms.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						License and Usage Rights
					</h2>
					<p className="text-gray-700 mb-4">
						By submitting a photo, you grant StHenri a non-exclusive, royalty-free, worldwide license to:
					</p>
					<ul className="list-disc pl-6 text-gray-700 space-y-2">
						<li>Display your photo on our website in the customer gallery</li>
						<li>Use your photo in our marketing materials (social media, advertisements, newsletters)</li>
						<li>Modify, resize, or crop your photo as needed for display purposes</li>
						<li>Use your photo indefinitely unless you request removal</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Your Ownership and Warranties
					</h2>
					<p className="text-gray-700 mb-4">
						By submitting a photo, you confirm that:
					</p>
					<ul className="list-disc pl-6 text-gray-700 space-y-2">
						<li>You own the rights to the photo or have permission to submit it</li>
						<li>The photo doesn't violate any copyright, trademark, or other intellectual property rights</li>
						<li>The photo doesn't contain inappropriate, offensive, or illegal content</li>
						<li>You're at least 18 years old or have parental consent</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Content Moderation
					</h2>
					<p className="text-gray-700 mb-4">
						All submitted photos go through automated content moderation to ensure they meet our standards. 
						We reserve the right to reject any photo that:
					</p>
					<ul className="list-disc pl-6 text-gray-700 space-y-2">
						<li>Contains inappropriate or offensive content</li>
						<li>Is not related to bread or baking</li>
						<li>Is of poor quality or doesn't showcase your creation well</li>
						<li>Violates our community guidelines</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Photo Removal
					</h2>
					<p className="text-gray-700 mb-4">
						If you'd like your photo removed from our gallery or marketing materials, please contact us at{" "}
						<a href="mailto:contact@sthenri.com" className="text-red-600 hover:text-red-700">
							contact@sthenri.com
						</a>
						. We'll process your request within 7 business days.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Credit and Attribution
					</h2>
					<p className="text-gray-700 mb-4">
						While we're not required to provide attribution, we may include your name or social media 
						handle with your photo if you provide it. We'll never share your email address or personal 
						contact information without your explicit permission.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Privacy
					</h2>
					<p className="text-gray-700 mb-4">
						Your personal information submitted with photos (name, email, message) will be handled 
						according to our Privacy Policy. We'll never sell your data to third parties.
					</p>
				</section>

				<section className="mb-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Questions?
					</h2>
					<p className="text-gray-700">
						If you have any questions about our photo submission policy, please don't hesitate to{" "}
						<a href="/contact" className="text-red-600 hover:text-red-700 font-semibold">
							contact us
						</a>
						.
					</p>
				</section>

				<p className="text-sm text-gray-500 mt-8">
					Last updated: February 17, 2026
				</p>
			</div>
		</div>
	);
}
