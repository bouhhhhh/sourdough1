import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import { ContactForm } from "@/ui/contact/contact-form.client";

export const metadata: Metadata = {
  title: "Contact · HeirBloom",
};

export default async function ContactPage() {
  const t = await getTranslations("/contact.page");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
        {t("title")}
      </h1>
      <p className="mb-8 text-sm text-gray-600">{t("subtitle")}</p>
      <ContactForm />
    </div>
  );
}
