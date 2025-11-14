"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface AddToCartWithQuantityProps {
	variantId: string;
	className?: string;
	disabled?: boolean;
}

export function AddToCartWithQuantity({ variantId, className = "", disabled = false }: AddToCartWithQuantityProps) {
	const [quantity, setQuantity] = useState(1);
	const { openCart, optimisticAdd } = useCart();

	const handleAddToCart = async () => {
		try {
			await optimisticAdd(variantId, quantity);
			openCart();
		} catch (error) {
			// Error is already logged in context
		}
	};

	const decrementQuantity = () => {
		if (quantity > 1) {
			setQuantity(quantity - 1);
		}
	};

	const incrementQuantity = () => {
		setQuantity(quantity + 1);
	};

	return (
		<div className="space-y-4">
			{/* Quantity Controls + Add to Cart Button */}
			<div className="flex items-center gap-4">
				{/* Quantity Selector */}
				<div className="flex items-center border border-neutral-300 rounded-lg">
					<button
						onClick={decrementQuantity}
						disabled={quantity <= 1 || disabled}
						className="px-4 py-3 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						aria-label="Decrease quantity"
					>
						<Minus className="h-4 w-4" />
					</button>
					<input
						type="text"
						value={quantity}
						readOnly
						className="w-16 text-center py-3 border-x border-neutral-300 focus:outline-none"
						aria-label="Quantity"
					/>
					<button
						onClick={incrementQuantity}
						disabled={disabled}
						className="px-4 py-3 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						aria-label="Increase quantity"
					>
						<Plus className="h-4 w-4" />
					</button>
				</div>

				{/* Add to Cart Button */}
				<button
					onClick={handleAddToCart}
					disabled={disabled}
					className={`flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
				>
					ADD TO CART
				</button>
			</div>

			{/* Shipping Message */}
			<div className="flex items-center gap-2 text-sm text-neutral-600">
				<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
				</svg>
				<span>
					<strong className="text-neutral-900">IN STOCK & READY TO SHIP!</strong> We ship within 24 hours
				</span>
			</div>
		</div>
	);
}
