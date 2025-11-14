"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/context/favorites-context";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({ productId, className = "", showText = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(productId);

  return (
    <button
      onClick={() => toggleFavorite(productId)}
      className={`inline-flex items-center gap-2 transition-all ${className}`}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-6 w-6 transition-colors ${
          favorite
            ? "fill-red-600 text-red-600"
            : "fill-none text-neutral-400 hover:text-red-600"
        }`}
      />
      {showText && (
        <span className="text-sm font-medium text-neutral-700">
          {favorite ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
