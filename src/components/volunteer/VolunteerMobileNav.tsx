"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import NexusVyomaLogo from "@/components/brand/NexusVyomaLogo";

export default function VolunteerMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close sheet on navigation when pathname changes
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB] shrink-0 select-none">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-[#E5E7EB] text-[#0A0F1E] hover:bg-[#F3F4F6]"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" hideClose className="w-[300px] sm:w-[320px] p-0 border-r border-[#E5E7EB] bg-[#F8F9FA]">
          <SheetTitle className="sr-only">Volunteer Portal Navigation</SheetTitle>
          <div className="h-full w-full">
            <VolunteerSidebar isMobile={true} onToggle={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Centered / Header Logo */}
      <div className="flex items-center">
        <NexusVyomaLogo showMark={false} wordmarkHeight={22} />
      </div>

      {/* Spacer for symmetry */}
      <div className="w-9 h-9" />
    </div>
  );
}
