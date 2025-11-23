import { Link, useLocation } from "@tanstack/react-router";
import { menuItems } from "@/src/lib/config";
import { Button } from "../../lib/components/ui/button";

export default function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path;

  const sidebarItems = menuItems.filter((item) => item.label !== "Home");

  return (
    <div className="fixed top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))] w-[var(--sidebar-width)] left-0 z-40 hidden sm:flex flex-col gap-4 p-4">
      {/* Glassmorphic Container */}
      <div className="h-full w-full rounded-2xl border bg-black/20 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] p-4 flex flex-col">
        <div className="flex flex-col w-full gap-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start gap-3 h-11 rounded-xl transition-all duration-300 ${
                isActive(item.path)
                  ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
              asChild
            >
              <Link to={item.path}>
                <item.icon
                  className={`size-5 ${isActive(item.path) ? "text-primary" : ""}`}
                />
                <span className="font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                )}
              </Link>
            </Button>
          ))}
        </div>

        <div className="mt-auto">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-chart-2/5 to-chart-4/5 p-4 border border-white/5">
            <h4 className="font-medium text-sm text-white mb-1">Pro Plan</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Upgrade for more agents
            </p>
            <Button
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white shadow-none h-8 text-xs"
            >
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
