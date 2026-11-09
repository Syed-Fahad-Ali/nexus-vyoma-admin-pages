import React from "react";
import ScanMembersView from "@/components/volunteer/scan/ScanMembersView";

export const metadata = {
  title: "Scan — Volunteer Portal | Nexus Vyoma",
  description: "Real-time attendee pass verification and badge checking.",
};

export default function ScanPage() {
  return <ScanMembersView />;
}
