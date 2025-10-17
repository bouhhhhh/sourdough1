import Image from "next/image";
import type { ComponentPropsWithRef } from "react";

export const MainProductImage = ({
	fill,
	width,
	height,
	...props
}: ComponentPropsWithRef<typeof Image>) => {
	if (fill) {
		return (
			<Image
				fill
				sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 700px"
				{...props}
			/>
		);
	}
	
	return (
		<Image
			// using exactly the same width, height and sizes as the main product image
			// to avoid loading the same image twice
			width={width || 700}
			height={height || 700}
			sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 700px"
			{...props}
		/>
	);
};
