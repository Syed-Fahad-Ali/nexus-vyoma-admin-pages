import React from "react";
import UsersListView from "@/components/volunteer/users/UsersListView";

export const metadata = {
  title: "Users — Volunteer Portal | Nexus Vyoma",
  description: "Attendee registration directory, phone contacts, enrollment history, and payment statuses.",
};

export default function UsersPage() {
  return <UsersListView />;
}
