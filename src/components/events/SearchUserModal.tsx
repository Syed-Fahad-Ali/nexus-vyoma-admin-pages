"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  Search,
  AlertCircle,
  Loader2,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ScannedAttendeeData } from "./ScannedUserDetailsModal";

interface SearchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserFound: (attendeeData: ScannedAttendeeData) => void;
}

export default function SearchUserModal({
  isOpen,
  onClose,
  onUserFound,
}: SearchUserModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setError(null);
    setIsSearching(false);
    onClose();
  };

  const validateEmailFormat = (val: string) => {
    return val.includes("@") && val.includes(".");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail) {
      setError("Please enter an attendee email address.");
      return;
    }

    if (!validateEmailFormat(targetEmail)) {
      setError("Please enter a valid email address (e.g. attendee@example.com).");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch("/api/search-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const result = await response.json().catch(() => null);

      if (result?.redirect && result?.redirectUrl) {
        router.replace(result.redirectUrl);
        return;
      }

      if (!response.ok || !result || result.error || !result.data?.userDetails) {
        const errorMsg =
          result?.message ||
          result?.error ||
          `Attendee not found with email: ${targetEmail}`;
        setError(errorMsg);
        return;
      }

      const { userDetails, enrolledEvents, checkedInEvents, isPaid } = result.data;

      const registeredDate = userDetails.createdAt
        ? new Date(userDetails.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Registered Attendee";

      // Map enrolled events from database
      const mappedEnrolled = (enrolledEvents || []).map((enrollment: any, idx: number) => {
        const eventDoc = enrollment.event_id || {};
        const isTeam = Boolean(enrollment.team_name || eventDoc.participants_type === "team");
        const eventCode = eventDoc.code || `NV-EVT-0${idx + 1}`;
        const isLeader = enrollment.team_leader_register_user_id === userDetails._id;

        return {
          id: String(enrollment._id || `enrolled-${idx}`),
          code: eventCode,
          name: eventDoc.title || eventDoc.name || "Festival Event",
          category: eventDoc.category || "General Event",
          participationType: (isTeam ? "team" : "individual") as "individual" | "team",
          date: eventDoc.date_time || "10–12 Nov 2026",
          venue: eventDoc.venue || "Festival Grounds",
          isPaid: Boolean(enrollment.isPaid ?? true),
          teamName: enrollment.team_name,
          isLeader,
          teamLength: enrollment.team_length,
        };
      });

      // Map checked-in events from database
      const mappedCheckedIn = (checkedInEvents || []).map((entry: any, idx: number) => {
        const eventDoc = entry.event_id || {};
        const attenderDoc = entry.attender || {};
        const checkInDate = entry.checked_in_at || entry.createdAt;
        const timeFormatted = checkInDate
          ? new Date(checkInDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Verified";

        return {
          id: String(entry._id || `chk-${idx}`),
          code: eventDoc.code || `NV-CHK-0${idx + 1}`,
          name: eventDoc.title || eventDoc.name || "Festival Arena",
          category: eventDoc.category || "General Admission",
          checkedInAt: `Checked in · ${timeFormatted}`,
          gateOrRoom: eventDoc.venue || "Gate Entrance",
          volunteerName: attenderDoc.full_name || attenderDoc.email || "Coordinator",
        };
      });

      const attendeeData: ScannedAttendeeData = {
        userId: String(userDetails._id || ""),
        userEmail: userDetails.email || targetEmail,
        user: {
          full_name: userDetails.full_name || "Festival Attendee",
          email: userDetails.email || targetEmail,
          phone_number: userDetails.phone_number || "—",
          city: userDetails.city || "Hyderabad",
          state: userDetails.state || "Telangana",
          institution: userDetails.institution || "ISL Engineering College",
          year_of_study: userDetails.year_of_study || "Undergraduate",
          degree: userDetails.degree || "B.Tech",
          is_verified: Boolean(userDetails.is_verified ?? true),
          isBanned: Boolean(userDetails.isBanned === true),
          isPaid: Boolean(isPaid === true),
          createdAt: registeredDate,
        },
        enrolledEvents: mappedEnrolled,
        checkedInEvents: mappedCheckedIn,
      };

      // Trigger details modal and close search modal
      onUserFound(attendeeData);
      handleClose();
    } catch (err) {
      console.error("Error searching attendee by email:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Network connection error. Please verify your internet and try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-user-modal-title"
      >
        {/* ======================================================== */}
        {/* 1. HEADER                                                */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-2xs shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="search-user-modal-title"
                className="text-base sm:text-lg font-extrabold text-[#0A0F1E] tracking-tight truncate"
              >
                Search User by Email
              </h2>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5 truncate">
                Look up complete attendee registration &amp; ticket details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. BODY / FORM                                           */}
        {/* ======================================================== */}
        <form onSubmit={handleSearch} className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="attendee-search-email"
              className="text-xs font-bold text-[#0A0F1E] flex items-center justify-between"
            >
              <span>Attendee Email Address</span>
              <span className="text-[11px] font-normal text-[#6B7280]">
                Registered festival email
              </span>
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                id="attendee-search-email"
                type="email"
                autoFocus
                disabled={isSearching}
                placeholder="e.g. attendee@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.toLowerCase());
                  if (error) setError(null);
                }}
                className={`pl-9.5 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-[#2563EB] ${
                  error ? "border-[#FECDD3] bg-[#FEF2F2]/30" : ""
                }`}
              />
            </div>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              Inspects personal profile, EntryTicket (<code className="font-mono text-[#2563EB]">isPaid</code>), enrolled events, and venue check-ins.
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#B91C1C] flex items-start gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            disabled={isSearching}
            className="w-full h-10 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white font-semibold text-xs cursor-pointer shadow-sm transition-all"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#60A5FA]" />
                <span>Searching Attendee Records...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#60A5FA]" />
                <span>Search Attendee</span>
              </span>
            )}
          </Button>
        </form>

        {/* ======================================================== */}
        {/* 3. FOOTER                                                */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-4.5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-[#6B7280] hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded border border-[#D1D5DB] bg-white font-mono text-[10px]">Esc</kbd> to close
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer ml-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

