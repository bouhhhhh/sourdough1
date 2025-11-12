import { IntlMessageFormat } from "intl-messageformat";
import { env } from "@/env.mjs";
import type { IntlNamespaceKeys, NamespacedKeys } from "./types";

type En = typeof import("../../messages/en-US.json");

const SUPPORTED_LOCALES = ["en-US", "fr-CA", "de-DE", "jp-JP", "zh-CN", "zh-TW"];

export const getLocale = async (localeFromProps?: string) => {
	// Use locale from props if provided (from middleware or page params)
	if (localeFromProps && SUPPORTED_LOCALES.includes(localeFromProps)) {
		return localeFromProps;
	}
	
	// Try to read from cookies directly
	try {
		const { cookies } = await import("next/headers");
		const cookieStore = await cookies();
		const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
		
		if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie)) {
			return localeCookie;
		}
	} catch (error) {
		console.warn("Could not read cookie for locale");
	}
	
	// Try to read from headers (set by middleware)
	try {
		const { headers } = await import("next/headers");
		const headersList = await headers();
		const preferredLocale = headersList.get("x-preferred-locale");
		
		if (preferredLocale && SUPPORTED_LOCALES.includes(preferredLocale)) {
			return preferredLocale;
		}
	} catch (error) {
		// If headers can't be read, fall back to environment variable
		console.warn("Could not read headers for locale, falling back to env variable");
	}
	
	// Fall back to environment variable
	return env.NEXT_PUBLIC_LANGUAGE;
};
export const getMessages = async (locale?: string) => {
	const resolvedLocale = await getLocale(locale);
	return (
		(await import(`../../messages/${resolvedLocale}.json`)) as {
			default: En;
		}
	).default;
};

export const getTranslations = async <TNamespaceKey extends IntlNamespaceKeys = never>(
	namespaceKey: TNamespaceKey,
	locale?: string,
) => {
	const messages = await getMessages(locale);
	const resolvedLocale = await getLocale(locale);
	return getMessagesInternal(namespaceKey, resolvedLocale, messages);
};

export const getMessagesInternal = <TNamespaceKey extends IntlNamespaceKeys = never>(
	namespaceKey: TNamespaceKey,
	locale: string,
	messages: IntlMessages,
) => {
	return <TMessageKey extends NamespacedKeys<IntlMessages, TNamespaceKey> = never>(
		key: TMessageKey,
		values?: Record<string, string | number | undefined>,
	) => {
		const completeKey = namespaceKey + "." + key;
		const msg = messages[completeKey as keyof typeof messages];
		
		// Handle missing or invalid messages
		if (!msg || typeof msg !== 'string') {
			console.warn(`Missing translation for key: ${completeKey}`);
			return completeKey; // Return the key as fallback
		}
		
		try {
			const message = new IntlMessageFormat(msg, locale).format(values)?.toString() ?? "";
			return message;
		} catch (error) {
			console.warn(`Failed to format message for key: ${completeKey}`, error);
			return msg; // Return the raw message as fallback
		}
	};
};
