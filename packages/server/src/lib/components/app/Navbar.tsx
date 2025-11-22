import { Button } from "../ui/button";
import { useLocation } from "@tanstack/react-router";
import { Image } from "../custom/Image";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 gap-2 h-(--navbar-height) w-full z-50 border-b bg-background flex items-center justify-between px-4">
      {/* top left */}
      <div className="flex gap-2 items-center">
        <Image src="/static/logo.svg" alt="alloy" className="w-14" />
        <span className="text-2xl font-semibold">Alloy</span>
      </div>

      {/* top right */}
      <div className="flex gap-2 items-center">
        <Button variant="outline" size="icon">
        </Button>
      </div>
    </nav>
  )
}