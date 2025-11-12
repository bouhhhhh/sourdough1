"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/i18n/client";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "fr-CA", name: "Français", flag: "🇨🇦" }
];

interface LanguageSwitcherProps {
  currentLanguage?: string;
}

function getClientLanguage(): string {
  // Get language from cookie
  if (typeof document !== "undefined") {
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    if (cookieMatch && cookieMatch[1]) {
      const cookieLanguage = cookieMatch[1];
      if (LANGUAGES.find(lang => lang.code === cookieLanguage)) {
        return cookieLanguage;
      }
    }
  }
  return "en-US"; // Default fallback
}

export function LanguageSwitcher({ currentLanguage }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientLanguage, setClientLanguage] = useState(currentLanguage || "en-US");
  const t = useTranslations("Global.footer");

  // Update client language when component mounts
  useEffect(() => {
    setClientLanguage(getClientLanguage());
  }, []);

  const currentLang = LANGUAGES.find(lang => lang.code === clientLanguage) ?? LANGUAGES[0];
  
  // Ensure currentLang is never undefined
  if (!currentLang) {
    throw new Error("Invalid language configuration");
  }

  const handleLanguageChange = (languageCode: string) => {
    // Set the language preference in a cookie
    document.cookie = `NEXT_LOCALE=${languageCode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    
    // Update local state
    setClientLanguage(languageCode);
    
    // Close the dropdown
    setIsOpen(false);
    
    // Refresh the page to apply the new language
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Label */}
      <div className="mb-1 hidden text-xs font-medium text-neutral-600 sm:block">
        {t("languageSwitch")}
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 hover:border-neutral-300"
        aria-label={`${t("languageSwitch")}: ${currentLang.name}`}
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute bottom-full right-0 z-20 mb-2 w-52 rounded-lg border border-neutral-200 bg-white py-2 shadow-xl">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              {t("languageSwitch")}
            </div>
            <hr className="border-neutral-100" />
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-50 ${
                  language.code === clientLanguage 
                    ? "bg-blue-50 text-blue-900 border-r-2 border-blue-500" 
                    : "text-neutral-700"
                }`}
              >
                <span className="text-xl">{language.flag}</span>
                <span className="flex-1 font-medium">{language.name}</span>
                {language.code === clientLanguage && (
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}