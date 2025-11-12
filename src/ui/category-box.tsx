import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { deslugify } from "@/lib/utils";

export async function CategoryBox({ categorySlug, src }: { categorySlug: string; src: ImageProps["src"] }) {
	const t = await getTranslations("Global.actions");

	return (
		<Link href={`/category/${categorySlug}`} className="group relative">
			<div className="relative overflow-hidden rounded-lg aspect-[4/3]">
				<Image
					alt="Cover image"
					className="w-full h-full scale-105 object-cover transition-all group-hover:scale-100 group-hover:opacity-75"
					sizes="(max-width: 1024x) 100vw, (max-width: 1280px) 50vw, 620px"
					src={src}
					width={620}
					height={465}
				/>
			</div>
			<div className="justify-end gap-2 px-4 py-2 text-neutral-600">
				<h3 className="text-lg font-bold tracking-tight">{deslugify(categorySlug)}</h3>
				<p>{t("shopNow")}</p>
			</div>
		</Link>
	);
}
