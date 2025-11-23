import ThemeSwitch from "@/src/lib/components/custom/ThemeSwitch";
import Navbar from "./nav";
import Sidebar from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background [--navbar-height:5rem] sm:[--sidebar-width:16rem]">
      {/* Navbar Container - Height preserved for layout spacing */}
      <div className="h-[var(--navbar-height)] relative z-50">
        <Navbar />
      </div>

      <Sidebar />

      <div className="ml-0 sm:ml-[var(--sidebar-width)] min-h-[calc(100dvh-var(--navbar-height))] @container/main p-6">
        {children}
      </div>

      <div className="fixed right-4 bottom-4 z-50">
        <ThemeSwitch />
      </div>
    </div>
  );
}
