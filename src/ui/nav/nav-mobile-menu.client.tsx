"use client";

import { MenuIcon } from "lucide-react";
import { type ReactNode, useState, useId } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

export const NavMobileMenu = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const menuId = useId();
	
	return (
		<div suppressHydrationWarning>
			<Drawer open={isOpen} onOpenChange={setIsOpen}>
				<DrawerTrigger asChild>
					<button
						type="button"
						aria-label="Open navigation menu"
						aria-controls={menuId}
						aria-expanded={isOpen}
					>
						<MenuIcon />
					</button>
				</DrawerTrigger>
				<DrawerContent id={menuId}>
					<DrawerHeader>
						<DrawerTitle className="text-center">Menu</DrawerTitle>
						<DrawerDescription className="sr-only">Navigation menu</DrawerDescription>
					</DrawerHeader>
					<div
						onClick={(e) => {
							if (e.target instanceof HTMLElement && e.target.closest("a")) {
								setIsOpen(false);
							}
						}}
					>
						{children}
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
};
