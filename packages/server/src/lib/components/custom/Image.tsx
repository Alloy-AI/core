import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "../../utils";

type Props = {
	src?: string | null;
	alt?: string | null;
	className?: string;
	fallback?: string;
	children?: ReactNode;
};

export function Image({
	src,
	alt,
	className,
	fallback = "/images/placeholder.png",
	children,
	...props
}: Props) {
	const [hasError, setHasError] = useState(false);

	if (!src || hasError) {
		return children ? (
			<div className={cn("flex items-center justify-center", className)}>
				{children}
			</div>
		) : (
			<img
				src={fallback}
				alt={alt || "default"}
				className={cn(className)}
				{...props}
			/>
		);
	}

	return (
		<img
			src={src}
			alt={alt || "default"}
			className={cn(className)}
			onError={() => setHasError(true)}
			{...props}
		/>
	);
}
