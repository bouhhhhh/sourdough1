/**
 * Utility functions for checking cookie consent preferences
 * Use these functions to conditionally load analytics or functional cookies
 */

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_NAME = "cookie_consent";
const COOKIE_PREFERENCES_NAME = "cookie_preferences";

/**
 * Check if user has given cookie consent
 */
export function hasGivenConsent(): boolean {
  if (typeof document === "undefined") return false;
  const consent = getCookie(COOKIE_CONSENT_NAME);
  return consent === "true";
}

/**
 * Get user's cookie preferences
 */
export function getCookiePreferences(): CookiePreferences {
  const defaultPreferences: CookiePreferences = {
    necessary: true,
    functional: false,
    analytics: false,
  };

  if (typeof document === "undefined") return defaultPreferences;

  const savedPrefs = getCookie(COOKIE_PREFERENCES_NAME);
  if (!savedPrefs) return defaultPreferences;

  try {
    return JSON.parse(savedPrefs) as CookiePreferences;
  } catch (e) {
    console.error("Failed to parse cookie preferences");
    return defaultPreferences;
  }
}

/**
 * Check if analytics cookies are allowed
 */
export function canUseAnalytics(): boolean {
  if (!hasGivenConsent()) return false;
  const prefs = getCookiePreferences();
  return prefs.analytics;
}

/**
 * Check if functional cookies are allowed
 */
export function canUseFunctional(): boolean {
  if (!hasGivenConsent()) return false;
  const prefs = getCookiePreferences();
  return prefs.functional;
}

/**
 * Helper to get a cookie value
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2] ?? null;
}
