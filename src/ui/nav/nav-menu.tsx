import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import StoreConfig from "@/store.config";
import { NavMobileMenu } from "@/ui/nav/nav-mobile-menu.client";
import { LanguageSwitcherWrapper } from "@/components/language-switcher-wrapper";

export const NavMenu = async () => {
	const tCat = await getTranslations("Nav.category");
	const tNav = await getTranslations("Nav");
	
	const links = [
		...StoreConfig.categories.map(({ slug }) => ({
			label: slug === "products" ? tCat("products") : tCat("recipes"),
			href: `/category/${slug}`,
		})),
		{ label: tNav("link.contact"), href: "/contact" },
	];

	return (
		<>
			<div className="sm:block hidden">
				<ul className="flex flex-row items-center justify-center gap-x-1">
					{links.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden"
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
			<div className="sm:hidden flex items-center">
				<NavMobileMenu>
					<ul className="flex pb-4 flex-col items-stretch justify-center gap-x-1">
						{links.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="group inline-flex h-9 w-full items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
					<div className="border-t border-gray-200 pt-4 pb-8 px-4">
						<LanguageSwitcherWrapper />
					</div>
				</NavMobileMenu>
			</div>
		</>
	);
};
