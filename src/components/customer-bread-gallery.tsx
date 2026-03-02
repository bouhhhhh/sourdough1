"use client";

import Image from "next/image";
import Link from "next/link";

// Customer bread photos - replace these URLs with your actual customer photos
const customerPhotos = [
	{
		id: 1,
		src: "/images/customer-bread/bread-1.png",
		alt: "Customer sourdough bread 1",
	},
	{
		id: 2,
		src: "/images/customer-bread/bread-2.png",
		alt: "Customer sourdough bread 2",
	},
	{
		id: 3,
		src: "/images/customer-bread/bread-3.png",
		alt: "Customer sourdough bread 3",
	},
	{
		id: 4,
		src: "/images/customer-bread/bread-4.png",
		alt: "Customer sourdough bread 4",
	},
	{
		id: 5,
		src: "/images/customer-bread/bread-5.png",
		alt: "Customer sourdough bread 5",
	},
];

export function CustomerBreadGallery() {
	return (
		<section className="py-12 bg-gradient-to-b from-amber-50 to-white overflow-hidden">
			<div className="container mx-auto px-4 mb-8">
				<h2 className="text-3xl font-bold text-center text-neutral-900 mb-2">Made by This Sourdough</h2>
				<p className="text-center text-neutral-600 max-w-2xl mx-auto mb-4">
					See the beautiful bread our customers have created with our sourdough starter
				</p>
				<div className="text-center">
					<Link
						href="/contact"
						className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors group"
					>
						<span>Send us your creation</span>
						<svg
							className="w-5 h-5 transition-transform group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</Link>
				</div>
			</div>

			<div className="relative">
				{/* Gradient overlays for fade effect - hidden on mobile */}
				<div className="hidden md:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
				<div className="hidden md:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

				{/* Scrolling container - manual scroll on mobile, auto-scroll on desktop */}
				<div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory md:overflow-x-visible px-4 md:px-0">
					<div className="flex gap-3 sm:gap-4 md:gap-6 md:[animation:scroll-infinite_40s_linear_infinite] md:hover:[animation-play-state:paused]">
						{customerPhotos.map((photo) => (
							<div
								key={photo.id}
								className="flex-shrink-0 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group snap-center"
							>
								<Image
									src={photo.src}
									alt={photo.alt}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-500"
									sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, 288px"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
						))}
						{/* Duplicate photos only for desktop animation */}
						<div className="hidden md:flex gap-6">
							{customerPhotos.map((photo) => (
								<div
									key={`duplicate-${photo.id}`}
									className="flex-shrink-0 w-72 h-72 relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
								>
									<Image
										src={photo.src}
										alt={photo.alt}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-500"
										sizes="288px"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
