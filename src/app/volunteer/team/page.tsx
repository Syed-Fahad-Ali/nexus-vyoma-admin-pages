import React from "react";
import TeamDashboardView from "@/components/volunteer/team/TeamDashboardView";

export const metadata = {
  title: "Participating Teams & Squads — Volunteer Portal | Nexus Vyoma",
  description: "Festival participating squad cards, leader contacts, member rosters, and gate verification telemetry.",
};

export default function VolunteerTeamPage() {
  return <TeamDashboardView />;
}
