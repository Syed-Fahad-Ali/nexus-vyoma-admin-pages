import React from "react";
import TeamMembersView from "@/components/volunteer/team/TeamMembersView";

export const metadata = {
  title: "Team Members — Volunteer Portal | Nexus Vyoma",
  description: "Festival volunteer crew roster, assignments, and duty status.",
};

export default function TeamMemberPage() {
  return <TeamMembersView />;
}
