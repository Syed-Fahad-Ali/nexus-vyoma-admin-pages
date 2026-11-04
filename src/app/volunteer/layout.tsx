import React from "react";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import VolunteerMobileNav from "@/components/volunteer/VolunteerMobileNav";

export const metadata = {
  title: "Volunteer Portal — Nexus Vyoma",
  description: "ISLEC Nexus Vyoma Volunteer Management Portal",
};

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] p-2 sm:p-4 lg:p-6 flex items-center justify-center">
      {/* Outer Card Frame matching the wireframe */}
      <div className="w-full max-w-[1400px] h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)] bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex overflow-hidden">
        {/* Left Desktop Sidebar (hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex h-full shrink-0">
          <VolunteerSidebar />
        </div>

        {/* Content Area with Mobile Nav Bar */}
        <div className="flex-1 h-full flex flex-col overflow-hidden bg-white">
          {/* Mobile Navigation Header (visible only on mobile, hidden on lg+) */}
          <VolunteerMobileNav />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
