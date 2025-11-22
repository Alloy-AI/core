import { Button } from "@/src/lib/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/lib/components/ui/sheet";
import Icon from "@/src/lib/components/custom/Icon";
import { Link, useLocation } from "@tanstack/react-router";
import { icons } from "lucide-react";
import { Image } from "@/src/lib/components/custom/Image";

type IconName = keyof typeof icons;

interface MenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MenuSheet({ open, onOpenChange }: MenuSheetProps) {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { label: "Home", path: "/", icon: "House" as IconName },
    { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" as IconName },
    { label: "Agents", path: "/agents", icon: "Bot" as IconName },
    { label: "Settings", path: "/settings", icon: "Settings" as IconName },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="px-0 w-[280px] border-r border-white/10 bg-black/80 backdrop-blur-xl p-4 shadow-2xl">
         {/* Glassmorphic Container */}
         <div className="h-full w-full rounded-2xl border border-white/5 bg-black/20 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] p-4 flex flex-col">
            {/* Header */}
            <div className="mb-6 px-2">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold flex items-center gap-3 text-white">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-chart-2 to-chart-4 rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500" />
                            <Image src="/static/logo.svg" alt="alloy" className="w-8 relative z-10" />
                        </div>
                        Alloy
                    </SheetTitle>
                </SheetHeader>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <Button 
                        key={item.path}
                        variant="ghost" 
                        className={`w-full justify-start gap-3 h-11 rounded-xl transition-all duration-300 ${
                            isActive(item.path) 
                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10" 
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        }`}
                        asChild
                        onClick={() => onOpenChange(false)}
                    >
                        <Link to={item.path}>
                            <Icon name={item.icon} className={`size-5 ${isActive(item.path) ? "text-primary" : ""}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive(item.path) && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                            )}
                        </Link>
                    </Button>
                ))}
            </div>

            {/* Footer / Pro Plan */}
            <div className="mt-auto pt-4">
                 <div className="rounded-xl bg-gradient-to-br from-primary/10 via-chart-2/5 to-chart-4/5 p-4 border border-white/5">
                    <h4 className="font-medium text-sm text-white mb-1">Pro Plan</h4>
                    <p className="text-xs text-muted-foreground mb-3">Upgrade for more agents</p>
                    <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white shadow-none h-8 text-xs">
                        Upgrade
                    </Button>
                 </div>
            </div>
         </div>
      </SheetContent>
    </Sheet>
  );
} 