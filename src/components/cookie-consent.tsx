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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 pointer-events-none">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t("description")}
              </p>
            </div>
            <button
              onClick={handleRejectAll}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Detailed Settings */}
          {showDetails ? (
            <div className="space-y-3 mb-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                    {t("necessary.title")}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t("necessary.description")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {t("necessary.examples")}
                  </p>
                </div>
                <div className="ml-3">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                    {t("functional.title")}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t("functional.description")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {t("functional.examples")}
                  </p>
                </div>
                <div className="ml-3">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      setPreferences({ ...preferences, functional: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                    {t("analytics.title")}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t("analytics.description")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {t("analytics.examples")}
                  </p>
                </div>
                <div className="ml-3">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <button
                onClick={() => setShowDetails(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t("customizeSettings")}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {showDetails ? (
              <>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t("savePreferences")}
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("back")}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t("acceptAll")}
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("rejectAll")}
                </button>
              </>
            )}
          </div>

          {/* Privacy Policy Link */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            {t("privacyNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
