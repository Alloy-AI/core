import { Image } from "../../lib/components/custom/Image";
import { UserDropdownButton } from "@/src/lib/components/app/UserDropdownButton";
import { ListIcon } from "@phosphor-icons/react";
import { Button } from "@/src/lib/components/ui/button";
import MenuSheet from "./menu";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b bg-background flex items-center justify-between px-4">
      {/* top left */}
      <div className="flex gap-2 items-center">
        <Image src="/static/logo.svg" alt="alloy" className="w-14" />
        <span className="text-2xl font-semibold">Alloy</span>
      </div>

      {/* top right */}
      <div className="flex gap-4 items-center">
        <UserDropdownButton />
        <Button onClick={() => setOpen(true)}>
          <ListIcon className="size-5" />
        </Button>
      </div>

      <MenuSheet open={open} onOpenChange={setOpen} />
    </nav>
  )
}