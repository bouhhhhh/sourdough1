"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { sendContactMessage } from "@/app/(store)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n/client";

export function ContactForm() {
	const t = useTranslations("/contact.form");
	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Check file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image must be smaller than 5MB");
				return;
			}

			// Check file type
			if (!file.type.startsWith("image/")) {
				toast.error("Please upload an image file");
				return;
			}

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const clearImage = () => {
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<form
			className="space-y-4"
			onSubmit={() => setLoading(true)}
			action={async (formData) => {
				try {
					const res = await sendContactMessage(formData);
					if (res.status === 200) {
						toast.success(t("success"));
						// Clear form
						(document.getElementById("contact-form") as HTMLFormElement)?.reset();
						clearImage();
					} else {
						toast.error(t("error"));
					}
				} catch (e) {
					toast.error(t("error"));
				} finally {
					setLoading(false);
				}
			}}
			id="contact-form"
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-700">{t("name")}</label>
					<Input name="name" placeholder={t("namePlaceholder")} required />
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-700">{t("email")}</label>
					<Input type="email" name="email" placeholder={t("emailPlaceholder")} required />
				</div>
			</div>
			<div>
				<label className="mb-1 block text-sm font-medium text-gray-700">{t("message")}</label>
				<textarea
					name="message"
					placeholder={t("messagePlaceholder")}
					required
					rows={6}
					className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
				/>
			</div>

			{/* Photo Upload Section */}
			<div>
				<label className="mb-1 block text-sm font-medium text-gray-700">
					Share a photo of your creation (optional)
				</label>
				<p className="mb-2 text-xs text-gray-500">
					Upload a photo of bread you made with our sourdough starter
				</p>

				{!imagePreview ? (
					<div className="mt-2">
						<label
							htmlFor="photo-upload"
							className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-red-400 hover:bg-red-50"
						>
							<svg
								className="mb-2 h-10 w-10 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span className="text-sm font-medium text-gray-600">Click to upload image</span>
							<span className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</span>
							<input
								id="photo-upload"
								ref={fileInputRef}
								type="file"
								name="photo"
								accept="image/*"
								onChange={handleImageChange}
								className="hidden"
							/>
						</label>
					</div>
				) : (
					<div className="relative mt-2">
						<img src={imagePreview} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
						<button
							type="button"
							onClick={clearImage}
							className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white shadow-lg transition-colors hover:bg-red-700"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<input
							ref={fileInputRef}
							type="file"
							name="photo"
							accept="image/*"
							onChange={handleImageChange}
							className="hidden"
						/>
					</div>
				)}
			</div>

			{/* Photo Agreement Notice - Only show when photo is uploaded */}
			{imagePreview && (
				<p className="text-xs text-gray-600">
					{t("photoImplicitAgreement")}{" "}
					<Link
						href="/photo-policy"
						target="_blank"
						className="text-red-600 hover:text-red-700 font-medium underline"
					>
						{t("photoPolicy")}
					</Link>
					.
				</p>
			)}

			<div className="flex justify-end">
				<Button type="submit" disabled={loading} className="min-w-32">
					{loading ? t("sending") : t("send")}
				</Button>
			</div>
		</form>
	);
}
