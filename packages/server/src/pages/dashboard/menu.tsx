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
    { label: "Dashboard", path: "/dashboard", icon: "Settings" as IconName },
    { label: "Marketplace", path: "/marketplace", icon: "ShoppingCart" as IconName },
    { label: "Create", path: "/create", icon: "Plus" as IconName },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="px-0 w-[280px]">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="bg-card border-b px-6 py-6">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                <Icon name="Menu" className="h-5 w-5" />
                Menu
              </SheetTitle>
            </SheetHeader>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-12"
                  asChild
                  onClick={() => onOpenChange(false)}
                >
                  <Link to={item.path}>
                    <Icon name={item.icon} className="h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-6">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => onOpenChange(false)}
            >
              <Icon name="Settings" className="h-5 w-5" />
              Settings
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 