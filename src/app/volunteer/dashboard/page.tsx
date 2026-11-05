import React from "react";
import VolunteerDashboardView from "@/components/volunteer/dashboard/VolunteerDashboardView";

export const metadata = {
  title: "Volunteer Dashboard — Nexus Vyoma",
  description: "Mobile-first volunteer operations, event-scoped check-in velocity, assignments, and participant roster.",
};

export default function DashboardPage() {
  return <VolunteerDashboardView />;
}
