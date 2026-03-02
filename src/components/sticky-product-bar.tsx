"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { addToCartAction } from "@/actions/cart-actions";
import { FavoriteButton } from "@/components/favorite-button";
import { Button } from "@/components/ui/button";
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
				isVisible ? "translate-y-0" : "translate-y-full"
			}`}
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
				{/* Product Info */}
				<div className="flex flex-col min-w-0 flex-1">
					<h2 className="truncate text-sm font-semibold text-foreground sm:text-base">{productName}</h2>
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
						className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-5 disabled:bg-gray-300"
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
