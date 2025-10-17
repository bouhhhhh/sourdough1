import { getTranslations } from "next-intl/server";
import { type Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("/confirmation.metadata");

	return {
		title: t("title"),
	};
}