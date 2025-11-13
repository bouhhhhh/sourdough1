"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendContactMessage } from "@/app/(store)/contact/actions";

export function ContactForm() {
  const t = useTranslations("/contact.form");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={() => setLoading(true)}
      action={async (formData) => {
        try {
          const res = await sendContactMessage(formData);
          if (res.status === 200) {
            toast.success(t("success"));
          } else {
            toast.error(t("error"));
          }
        } catch (e) {
          toast.error(t("error"));
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t("name")}
          </label>
          <Input name="name" placeholder={t("namePlaceholder")} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t("email")}
          </label>
          <Input type="email" name="email" placeholder={t("emailPlaceholder")} required />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("message")}
        </label>
        <textarea
          name="message"
          placeholder={t("messagePlaceholder")}
          required
          rows={6}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? t("sending") : t("send")}
        </Button>
      </div>
    </form>
  );
}
