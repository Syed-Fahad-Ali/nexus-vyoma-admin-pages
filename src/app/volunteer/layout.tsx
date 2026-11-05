import React from "react";
import VolunteerLayoutShell from "@/components/volunteer/layout/VolunteerLayoutShell";

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
      <VolunteerLayoutShell>{children}</VolunteerLayoutShell>
    </div>
  );
}
