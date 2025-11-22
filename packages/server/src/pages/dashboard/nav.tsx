import { Image } from "../../lib/components/custom/Image";
import { UserDropdownButton } from "@/src/lib/components/app/UserDropdownButton";
import { ListIcon } from "@phosphor-icons/react";
import { Button } from "@/src/lib/components/ui/button";
import MenuSheet from "./menu";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[var(--navbar-height)] w-full z-50 border-b bg-black/40 backdrop-blur-xl flex items-center justify-between px-6">
      {/* top left */}
      <div className="flex gap-3 items-center">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-chart-2 to-chart-4 rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500" />
          <Image src="/static/logo.svg" alt="alloy" className="w-10 relative z-10" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Alloy</span>
      </div>

      {/* top right */}
      <div className="flex gap-4 items-center">
        <UserDropdownButton />
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-white hover:bg-white/10 rounded-full">
            <ListIcon className="size-5" />
          </Button>
        </div>
      </div>

      <MenuSheet open={open} onOpenChange={setOpen} />
    </nav>
  )
}