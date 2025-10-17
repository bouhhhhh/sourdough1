"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface AddToCartProps {
	variantId: string;
	quantity?: number;
	className?: string;
	children?: React.ReactNode;
	onSuccess?: () => void;
	openCartOnAdd?: boolean; // New prop to control cart opening
}

export function AddToCart({ variantId, quantity = 1, className = "", children, onSuccess, openCartOnAdd = true }: AddToCartProps) {
	const { openCart, optimisticAdd } = useCart();

	const handleAddToCart = async () => {
		try {
			await optimisticAdd(variantId, quantity);
			onSuccess?.();
			if (openCartOnAdd) {
				openCart(); // Only open cart if specified
			}
		} catch (error) {
			// Error is already logged in context, could show error toast here
		}
	};

	return (
		<button
			onClick={handleAddToCart}
			className={`flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 transition-colors ${className}`}
		>
			<Plus className="h-4 w-4" />
			{children || "Add to Cart"}
		</button>
	);
}
