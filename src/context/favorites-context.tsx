"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_COOKIE_NAME = "favorites";

function getFavoritesFromCookie(): string[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.match(new RegExp(`(^| )${FAVORITES_COOKIE_NAME}=([^;]+)`));
  if (match?.[2]) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[2])) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function saveFavoritesToCookie(favorites: string[]) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
  document.cookie = `${FAVORITES_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(favorites))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoritesFromCookie());
  }, []);

  const addFavorite = (productId: string) => {
    if (!favorites.includes(productId)) {
      const newFavorites = [...favorites, productId];
      setFavorites(newFavorites);
      saveFavoritesToCookie(newFavorites);
    }
  };

  const removeFavorite = (productId: string) => {
    const newFavorites = favorites.filter((id) => id !== productId);
    setFavorites(newFavorites);
    saveFavoritesToCookie(newFavorites);
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const toggleFavorite = (productId: string) => {
    if (isFavorite(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
