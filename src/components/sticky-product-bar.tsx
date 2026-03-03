"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { addToCartAction } from "@/actions/cart-actions";
import { FavoriteButton } from "@/components/favorite-button";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/utils";

type StickyProductBarProps = {
	productId: string;
	productName: string;
	price: number;
	discountedPrice?: number | null;
	currency: string;
	locale: string;
	inStock: boolean;
};

export function StickyProductBar({
	productId,
	productName,
	price,
	discountedPrice,
	currency,
	locale,
	inStock,
}: StickyProductBarProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const { isCartOpen } = useCart();

	useEffect(() => {
		const handleScroll = () => {
			// Show sticky bar when user scrolls down more than 400px
			setIsVisible(window.scrollY > 400);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleAddToCart = async () => {
		if (!inStock || isAdding) return;

		setIsAdding(true);
		try {
			await addToCartAction(productId, 1);
		} catch (error) {
			console.error("Failed to add to cart:", error);
		} finally {
			setIsAdding(false);
		}
	};

	const displayPrice = discountedPrice ?? price;
	const hasDiscount = !!discountedPrice && discountedPrice < price;

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg transition-transform duration-300 ${
				isVisible && !isCartOpen ? "translate-y-0" : "translate-y-full"
			}`}
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
				{/* Product Info */}
				<div className="flex flex-col min-w-0 flex-1">
					<h2 className="truncate text-sm font-semibold text-foreground sm:text-base">{productName}</h2>
					
					{/* Star Rating - No count */}
					<div className="flex items-center gap-2 mb-1">
						<div className="flex items-center" aria-label="5 out of 5 stars">
							{[...Array(5)].map((_, i) => (
								<svg key={i} className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
							))}
						</div>
					</div>
					
					<div className="flex items-center gap-2">
						{hasDiscount ? (
							<>
								<span className="text-base font-bold text-red-600 sm:text-lg">
									{formatMoney({
										amount: Math.round(displayPrice * 100),
										currency: currency.toUpperCase(),
										locale,
									})}
								</span>
								<span className="text-sm text-foreground/50 line-through">
									{formatMoney({
										amount: Math.round(price * 100),
										currency: currency.toUpperCase(),
										locale,
									})}
								</span>
							</>
						) : (
							<span className="text-base font-semibold text-foreground/70 sm:text-lg">
								{formatMoney({
									amount: Math.round(price * 100),
									currency: currency.toUpperCase(),
									locale,
								})}
							</span>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-3">
					{/* Favorite Button */}
					<FavoriteButton productId={productId} />

					{/* Add to Cart Button */}
					<Button
						onClick={handleAddToCart}
						disabled={!inStock || isAdding}
						className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-5 disabled:bg-gray-300 shadow-lg hover:shadow-xl transition-all"
						size="lg"
					>
						<Image 
							src="/icons/add-to-cart.png" 
							alt="Add to cart" 
							width={20} 
							height={20} 
							className="brightness-0 invert" 
						/>
						<span className="hidden sm:inline">{isAdding ? "Adding..." : "Add to Cart"}</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
