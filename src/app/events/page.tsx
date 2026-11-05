import { Metadata } from "next";
import PermittedEventsView from "@/components/events/PermittedEventsView";

export const metadata: Metadata = {
  title: "Permitted Events — Volunteer Portal | Nexus Vyoma",
  description: "Select an assigned festival event to access real-time telemetry, pass scanning, and attendee check-ins.",
};

export default function PermittedEventsPage() {
  return <PermittedEventsView />;
}

