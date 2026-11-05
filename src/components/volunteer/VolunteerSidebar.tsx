"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import NexusVyomaLogo from "@/components/brand/NexusVyomaLogo";

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface VolunteerSidebarProps {
  eventId?: string;
  eventName?: string;
  participationType?: "Solo" | "Squad";
  user?: UserProfile;
  isMobile?: boolean;
  onToggle?: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/volunteer/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Team",
    href: "/volunteer/team",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/volunteer/users",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Scan",
    href: "/volunteer/scan",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </svg>
    ),
  },
  {
    label: "Crew",
    href: "/volunteer/team-member",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M15 8h2" />
        <path d="M15 12h2" />
        <path d="M7 16h10" />
      </svg>
    ),
  },
];

export default function VolunteerSidebar({
  eventId = "asdd87eqwejh2k13123kmnbk",
  eventName = "EVENT_NAME",
  participationType,
  user = {
    name: "YOUR_NAME",
    email: "YOUR_EMAIL",
    avatarUrl: "",
  },
  isMobile = false,
  onToggle,
}: VolunteerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <aside className="w-[300px] xl:w-[320px] shrink-0 h-full flex flex-col justify-between p-4 bg-[#F8F9FA] border-r border-[#E5E7EB] text-[#0A0F1E] select-none">
      {/* Top Group: Brand Card, Event Metadata, and Nav Links */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Top Box: Brand Logo on Desktop, or 3-lines toggle on Mobile */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-xs flex items-center justify-center shrink-0 min-h-[56px]">
          {isMobile ? (
            <button
              type="button"
              onClick={onToggle}
              className="w-full h-full flex items-center justify-start text-[#0A0F1E] hover:text-[#FF6A00] transition-colors cursor-pointer py-1"
              aria-label="Toggle or close sidebar"
            >
              {/* 3 horizontal lines */}
              <div className="flex flex-col gap-1 w-5 justify-center">
                <span className="h-0.5 w-5 bg-current rounded-full" />
                <span className="h-0.5 w-5 bg-current rounded-full" />
                <span className="h-0.5 w-5 bg-current rounded-full" />
              </div>
            </button>
          ) : (
            <NexusVyomaLogo showMark={false} fullWidth />
          )}
        </div>

        {/* Event Details Card */}
        <div className="px-2 py-1 text-xs text-[#6B7280] space-y-1 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] truncate text-[#4B5563]">
              <span className="font-medium text-[#0A0F1E]">Event Id:</span> {eventId}
            </span>
            <Link
              href="/events"
              className="text-[11px] font-semibold text-[#FF6A00] hover:underline shrink-0"
              title="Change active event"
            >
              Switch &rarr;
            </Link>
          </div>
          <div className="text-[12px] truncate text-[#4B5563]">
            <span className="font-medium text-[#0A0F1E]">Event name:</span> {eventName}
          </div>
          {participationType && (
            <div className="text-[12px] truncate text-[#4B5563]">
              <span className="font-medium text-[#0A0F1E]">Participation Type:</span>{" "}
              <span className="font-semibold text-[#FF6A00]">{participationType}</span>
            </div>
          )}
        </div>

        {/* Main Navigation Card - Extended to bottom of container */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-2.5 shadow-xs flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#0A0F1E] text-white shadow-xs"
                    : "text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#F3F4F6]"
                }`}
              >
                {/* Clean Icon without circular container */}
                <span className="shrink-0 flex items-center justify-center transition-colors">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile and Session Card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-xs flex items-center justify-between gap-2.5 mt-4 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar with fallback */}
          <div className="w-9 h-9 rounded-full bg-[#F3F4F6] border border-[#D1D5DB] flex items-center justify-center shrink-0 overflow-hidden relative">
            {user.avatarUrl && !imageError ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                fill
                unoptimized
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <svg
                className="w-5 h-5 text-[#9CA3AF]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          {/* Name & Email */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#0A0F1E] truncate leading-tight">
              {user.name}
            </span>
            <span className="text-[11px] text-[#6B7280] truncate leading-tight mt-0.5">
              {user.email}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] text-xs font-medium text-[#4B5563] hover:text-[#DC2626] transition-colors shrink-0 cursor-pointer"
        >
          <span>Logout</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

