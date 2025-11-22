import { Button } from "../../lib/components/ui/button";
import { useLocation } from "@tanstack/react-router";
import { Image } from "../../lib/components/custom/Image";
import { ListIcon } from "@phosphor-icons/react";
import ConnectButton from "../../lib/components/app/ConnectButton";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b bg-background flex items-center justify-between px-4">
      {/* top left */}
      <div className="flex gap-2 items-center">
        <Image src="/static/logo.svg" alt="alloy" className="w-14" />
        <span className="text-2xl font-semibold">Alloy</span>
      </div>

      {/* top right */}
      <div className="flex gap-2 items-center">
        <ConnectButton />
      </div>
    </nav>
  )
}