"use client";

import React from "react";
import { VolunteerEventProvider, useVolunteerEvent } from "../context/VolunteerEventContext";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import VolunteerMobileNav from "@/components/volunteer/VolunteerMobileNav";

function VolunteerShellContent({ children }: { children: React.ReactNode }) {
  const { selectedEvent, participationType } = useVolunteerEvent();

  return (
    <div className="w-full max-w-[1400px] h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)] bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex overflow-hidden">
      {/* Left Desktop Sidebar (hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex h-full shrink-0">
        <VolunteerSidebar
          eventId={selectedEvent ? selectedEvent.code : "asdd87eqwejh2k13123kmnbk"}
          eventName={selectedEvent ? selectedEvent.name : "EVENT_NAME"}
          participationType={participationType}
        />
      </div>

      {/* Content Area with Mobile Nav Bar */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-white">
        {/* Mobile Navigation Header */}
        <VolunteerMobileNav />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function VolunteerLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VolunteerEventProvider>
      <VolunteerShellContent>{children}</VolunteerShellContent>
    </VolunteerEventProvider>
  );
}

