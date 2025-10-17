import { getLocale } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function LanguageSwitcherWrapper() {
  const currentLanguage = await getLocale();
  
  return <LanguageSwitcher currentLanguage={currentLanguage} />;
}