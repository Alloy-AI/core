import {
	CopySimpleIcon,
	SignOutIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { Image } from "@/src/lib/components/custom/Image";
import { Button } from "@/src/lib/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/src/lib/components/ui/dropdown-menu";
import { copyToClipboard } from "@/src/lib/utils/utils";

export function UserDropdownButton() {
	const { user, logout: logoutPrivy } = usePrivy();
	const navigate = useNavigate();
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

	const handleLogout = async () => {
		try {
			await logoutPrivy();
			navigate({ to: "/" });
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	// Use userProfile data for display name, fallback to Privy data
	const displayName = "User";

	const walletAddress = user?.wallet?.address;
	const avatarUrl = "/static/logo.svg";

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -10 }}
				transition={{
					duration: 0.2,
					ease: "easeInOut",
				}}
			>
				<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
					<DropdownMenuTrigger asChild>
						<div className="relative group cursor-pointer">
							<div className="absolute -inset-0.5 bg-primary rounded-full opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-500" />
							<Image
								src={avatarUrl}
								alt="Profile"
								className="relative z-10 aspect-square size-10 cursor-pointer border border-white/10 p-1 rounded-full object-cover bg-black/40 backdrop-blur-md shadow-inner"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-full bg-white/5">
									<UserIcon className="size-4 text-white/80 group-hover:text-white transition-colors" weight="bold" />
								</div>
							</Image>
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-64 rounded-2xl mt-4 border border-border bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-2"
						align="end"
						side="bottom"
					>
						{/* Profile Section */}
						<DropdownMenuLabel className="text-muted-foreground/60 text-xs px-2 uppercase tracking-wider font-medium">
							Account
						</DropdownMenuLabel>
						<DropdownMenuItem className="gap-3 p-3 cursor-default focus:bg-white/5 rounded-xl">
							<Image
								src={avatarUrl}
								alt="Profile"
								className="aspect-square size-10 rounded-full object-cover ring-1 ring-white/10"
							>
								<div className="flex aspect-square size-10 items-center justify-center bg-gradient-to-br from-white/10 to-white/5 rounded-full">
									<UserIcon className="size-5 text-white/70" />
								</div>
							</Image>
							<div className="flex flex-col gap-0.5">
								<p className="font-medium text-sm text-white">{displayName}</p>
								<div className="flex items-center gap-1.5">
									<p className="text-xs text-muted-foreground font-mono">
										{walletAddress ? formatAddress(walletAddress) : "No wallet"}
									</p>
									{walletAddress && (
										<Button
											variant="ghost"
											size="sm"
											className="h-5 w-5 p-0 hover:bg-white/10 text-muted-foreground hover:text-white rounded-full transition-colors"
											onClick={() => copyToClipboard(walletAddress)}
										>
											<CopySimpleIcon className="h-3 w-3" />
										</Button>
									)}
								</div>
							</div>
						</DropdownMenuItem>

						<div className="my-2 h-px bg-white/5 mx-2" />

						{/* Sign Out */}
						<DropdownMenuItem
							onClick={handleLogout}
							className="gap-2 p-2 cursor-pointer text-destructive/90 focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 rounded-xl transition-colors"
						>
							<div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 group-hover:bg-destructive/20">
								<SignOutIcon className="size-4 shrink-0" />
							</div>
							<div className="font-medium text-sm">Sign out</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</motion.div>
		</AnimatePresence>
	);
}
