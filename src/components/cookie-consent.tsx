"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "@/i18n/client";

const COOKIE_CONSENT_NAME = "cookie_consent";
const COOKIE_PREFERENCES_NAME = "cookie_preferences";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const t = useTranslations("Global.cookies");

  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = getCookie(COOKIE_CONSENT_NAME);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      const savedPrefs = getCookie(COOKIE_PREFERENCES_NAME);
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs) as CookiePreferences;
          setPreferences(parsed);
        } catch (e) {
          console.error("Failed to parse cookie preferences");
        }
      }
    }
  }, []);

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match?.[2] ?? null;
  };

  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    setCookie(COOKIE_CONSENT_NAME, "true", 365);
    setCookie(COOKIE_PREFERENCES_NAME, JSON.stringify(prefs), 365);
    setShowBanner(false);
    setShowDetails(false);

    // Optionally reload to apply preferences
    // window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm pointer-events-auto">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          {/* Detailed Settings */}
          {showDetails ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded text-xs">
                  <div className="flex-1 pr-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                      {t("necessary.title")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-[10px] leading-tight">
                      {t("necessary.description")}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 shrink-0 rounded border-gray-300 opacity-50 cursor-not-allowed"
                  />
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded text-xs">
                  <div className="flex-1 pr-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                      {t("functional.title")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-[10px] leading-tight">
                      {t("functional.description")}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      setPreferences({ ...preferences, functional: e.target.checked })
                    }
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded text-xs">
                  <div className="flex-1 pr-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                      {t("analytics.title")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-[10px] leading-tight">
                      {t("analytics.description")}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Action Buttons for Details */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("back")}
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  {t("savePreferences")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              {/* Message */}
              <div className="flex-1">
                <p className="text-[11px] sm:text-xs text-gray-700 dark:text-gray-300 leading-tight">
                  {t("description")}
                  {" "}
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {t("customizeSettings")}
                  </button>
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 items-center justify-end sm:shrink-0">
                <button
                  onClick={handleRejectAll}
                  className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-2.5 py-1 sm:px-3 rounded text-[10px] sm:text-xs font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                >
                  {t("rejectAll")}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="bg-blue-600 text-white px-2.5 py-1 sm:px-3 rounded text-[10px] sm:text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {t("acceptAll")}
                </button>
                <button
                  onClick={handleRejectAll}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
