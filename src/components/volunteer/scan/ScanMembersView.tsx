"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  QrCode,
  Search,
  Users,
  CheckCircle2,
  Filter,
  UserCheck,
  Calendar,
  X,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScanModal from "./ScanModal";
import { type ScannedMember } from "@/lib/dummy-scan-data";
import ScannedUserDetailsModal, {
  type ScannedAttendeeData,
} from "@/components/events/ScannedUserDetailsModal";
import { useVolunteerEvent } from "../context/VolunteerEventContext";
import { volunteerService, VolunteerApiError } from "@/services/volunteerService";

interface CheckedInEntry {
  _id: string;
  checked_in_at?: string;
  createdAt?: string;
  attendee?: {
    _id?: string;
    full_name?: string;
    name?: string;
    email?: string;
    phone_number?: string;
    institution?: string;
    degree?: string;
    year_of_study?: string;
    isBanned?: boolean;
    is_verified?: boolean;
  };
  attender?: {
    _id?: string;
    full_name?: string;
    email?: string;
    role?: string;
  };
}

interface VolunteerTeamMemberItem {
  _id: string;
  full_name?: string;
  email: string;
  role?: string;
}

export default function ScanMembersView() {
  const router = useRouter();
  const { user } = useUser();
  const { selectedEvent, selectedEventId } = useVolunteerEvent();

  const currentVolunteerName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Volunteer Coordinator";

  // Data states
  const [checkedInEntries, setCheckedInEntries] = useState<CheckedInEntry[]>([]);
  const [volunteersList, setVolunteersList] = useState<VolunteerTeamMemberItem[]>([]);
  const [totalEventUsers, setTotalEventUsers] = useState<number>(0);
  const [noOfCheckedInUsers, setNoOfCheckedInUsers] = useState<number>(0);

  // Status & loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modals
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [scannedAttendee, setScannedAttendee] = useState<ScannedAttendeeData | null>(null);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);

  // Fetch live check-in data from /api/dashboard/scan-user and total enrolled attendees
  const loadCheckInData = useCallback(async (isSilent = false) => {
    if (!selectedEventId) {
      setIsLoading(false);
      return;
    }

    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);

    try {
      // 1. Fetch live check-ins and volunteer team from /api/dashboard/scan-user
      const scanData = await volunteerService.getDashboardScanUser(selectedEventId);
      setCheckedInEntries(scanData.checkedInUsers || []);
      setNoOfCheckedInUsers(Number(scanData.noOfCheckedInUsers || (scanData.checkedInUsers || []).length));
      setVolunteersList(scanData.volunteer || []);

      // 2. Fetch total event participants count from /api/dashboard/users
      try {
        const usersData = await volunteerService.getDashboardUsers(selectedEventId);
        setTotalEventUsers(usersData.totalUsersCount || 0);
      } catch (userErr) {
        console.warn("Could not load total event users count:", userErr);
      }
    } catch (err) {
      console.error("Failed to load event scan-user data:", err);
      if (err instanceof VolunteerApiError && err.redirect && err.redirectUrl) {
        router.replace(err.redirectUrl);
        return;
      }
      setFetchError(
        err instanceof Error ? err.message : "Failed to load live check-in telemetry."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedEventId, router]);

  useEffect(() => {
    loadCheckInData();
  }, [loadCheckInData]);

  // Handle live QR Scan without closing camera modal (continuous scanning)
  const handleScanSuccess = async (member: ScannedMember) => {
    setScanError(null);
    setSuccessBanner(null);
    setIsCheckingIn(true);

    const scannedUserId = member.userId || member.ticketId || member.id;
    const scannedUserEmail = member.email || "";

    if (!selectedEventId) {
      const msg = "No active event selected. Please select an event before scanning.";
      setScanError(msg);
      setIsCheckingIn(false);
      return { success: false, message: msg, email: scannedUserEmail };
    }

    try {
      // 1. Check in attendee via POST /api/dashboard/scan-user
      await volunteerService.checkInDashboardUser(
        selectedEventId,
        scannedUserId,
        scannedUserEmail
      );

      const successText = `${scannedUserEmail} has been checked in`;
      setSuccessBanner(`✓ ${successText}`);
      setTimeout(() => setSuccessBanner(null), 5000);

      // 2. Refetch live list & stats in background without closing modal
      await loadCheckInData(true);

      return {
        success: true,
        message: successText,
        email: scannedUserEmail,
      };
    } catch (err) {
      console.error("Check-in error:", err);
      if (err instanceof VolunteerApiError && err.redirect && err.redirectUrl) {
        router.replace(err.redirectUrl);
        return { success: false, message: "Redirecting...", email: scannedUserEmail };
      }
      const errorMsg =
        err instanceof Error
          ? err.message
          : `${scannedUserEmail} check-in failed`;
      setScanError(errorMsg);
      setTimeout(() => setScanError(null), 5000);
      return {
        success: false,
        message: errorMsg,
        email: scannedUserEmail,
      };
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Inspect any attendee row on click
  const handleInspectRow = async (entry: CheckedInEntry) => {
    if (!entry.attendee?._id && !entry.attendee?.email) return;
    try {
      const detailRes = await fetch("/api/scan-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: entry.attendee._id,
          userEmail: entry.attendee.email,
        }),
      });

      const detailJson = await detailRes.json().catch(() => null);

      if (detailRes.ok && detailJson?.data?.userDetails) {
        const { userDetails, enrolledEvents, checkedInEvents, isPaid } = detailJson.data;

        const registeredDate = userDetails.createdAt
          ? new Date(userDetails.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Registered Attendee";

        const mappedEnrolled = (enrolledEvents || []).map((enrollment: any, idx: number) => {
          const eventDoc = enrollment.event_id || {};
          const isTeam = Boolean(enrollment.team_name || eventDoc.participants_type === "team");
          return {
            id: String(enrollment._id || `enrolled-${idx}`),
            code: eventDoc.code || `NV-EVT-0${idx + 1}`,
            name: eventDoc.title || eventDoc.name || "Festival Event",
            category: eventDoc.category || "General Event",
            participationType: (isTeam ? "team" : "individual") as "individual" | "team",
            date: eventDoc.date_time || "10–12 Nov 2026",
            venue: eventDoc.venue || "Festival Grounds",
            isPaid: Boolean(enrollment.isPaid ?? true),
            teamName: enrollment.team_name,
            isLeader: enrollment.team_leader_register_user_id === userDetails._id,
            teamLength: enrollment.team_length,
          };
        });

        const mappedCheckedIn = (checkedInEvents || []).map((e: any, idx: number) => {
          const eventDoc = e.event_id || {};
          const attenderDoc = e.attender || {};
          const checkInDate = e.checked_in_at || e.createdAt;
          const timeFormatted = checkInDate
            ? new Date(checkInDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Verified";

          return {
            id: String(e._id || `chk-${idx}`),
            code: eventDoc.code || `NV-CHK-0${idx + 1}`,
            name: eventDoc.title || eventDoc.name || "Festival Arena",
            category: eventDoc.category || "General Admission",
            checkedInAt: `Checked in · ${timeFormatted}`,
            gateOrRoom: eventDoc.venue || "Gate Entrance",
            volunteerName: attenderDoc.full_name || attenderDoc.email || currentVolunteerName,
          };
        });

        setScannedAttendee({
          userId: String(userDetails._id || entry.attendee._id),
          userEmail: userDetails.email || entry.attendee.email || "",
          user: {
            full_name: userDetails.full_name || entry.attendee.full_name || "Festival Attendee",
            email: userDetails.email || entry.attendee.email || "",
            phone_number: userDetails.phone_number || "—",
            city: userDetails.city || "Hyderabad",
            state: userDetails.state || "Telangana",
            institution: userDetails.institution || "ISL Engineering College",
            year_of_study: userDetails.year_of_study || "Undergraduate",
            degree: userDetails.degree || "B.Tech",
            is_verified: Boolean(userDetails.is_verified ?? true),
            isBanned: Boolean(userDetails.isBanned === true),
            isPaid: Boolean(isPaid ?? userDetails.isPaid ?? true),
            createdAt: registeredDate,
          },
          enrolledEvents: mappedEnrolled,
          checkedInEvents: mappedCheckedIn,
        });

        setIsUserDetailsModalOpen(true);
      }
    } catch (err) {
      console.warn("Could not load attendee row inspection:", err);
    }
  };

  // Filtered members by search query and selected volunteer
  const filteredEntries = useMemo(() => {
    return checkedInEntries.filter((entry) => {
      const q = searchQuery.trim().toLowerCase();
      const attendeeName = (entry.attendee?.full_name || entry.attendee?.name || "").toLowerCase();
      const attendeeEmail = (entry.attendee?.email || "").toLowerCase();
      const attendeePhone = (entry.attendee?.phone_number || "").toLowerCase();
      const attendeeId = (entry.attendee?._id || "").toLowerCase();

      const matchesSearch =
        q === "" ||
        attendeeName.includes(q) ||
        attendeeEmail.includes(q) ||
        attendeePhone.includes(q) ||
        attendeeId.includes(q);

      const attenderEmail = (entry.attender?.email || "").toLowerCase();
      const attenderName = (entry.attender?.full_name || "").toLowerCase();
      const volunteerFilterLower = selectedVolunteer.toLowerCase();

      const matchesVolunteer =
        selectedVolunteer === "ALL" ||
        attenderEmail === volunteerFilterLower ||
        attenderName === volunteerFilterLower;

      return matchesSearch && matchesVolunteer;
    });
  }, [checkedInEntries, searchQuery, selectedVolunteer]);

  // Helper for avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0F1E]">
              Scan
            </h1>
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-[#FF6A00] animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Real-time event attendee verification and entry ticket checking.
            {selectedEvent ? ` Track: ${selectedEvent.name}.` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadCheckInData(true)}
            disabled={isLoading || isRefreshing}
            className="h-11 w-11 rounded-xl border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer"
            title="Refresh check-in telemetry"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          {/* Scan User Action Button */}
          <Button
            onClick={() => setIsScanModalOpen(true)}
            disabled={isCheckingIn || isLoading}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white shadow-xs font-semibold text-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
          >
            {isCheckingIn ? (
              <Loader2 className="w-4 h-4 text-[#FF6A00] animate-spin" />
            ) : (
              <QrCode className="w-4 h-4 text-[#FF6A00]" />
            )}
            <span>{isCheckingIn ? "Checking In..." : "Scan User"}</span>
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#15803D] flex items-center justify-between gap-2 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scan Error Banner */}
      {scanError && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#B91C1C] flex items-center justify-between gap-2 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
            <span className="font-semibold">{scanError}</span>
          </div>
          <button
            onClick={() => setScanError(null)}
            className="text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#B91C1C] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadCheckInData()}
            className="h-7 text-xs rounded-lg"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 2. Three Metric / Stat Cards matching live backend data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Event Members */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Number of Event members
            </span>
            <Users className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {isLoading ? "—" : totalEventUsers.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Scanned Members */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Number of Scanned members
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {isLoading ? "—" : noOfCheckedInUsers.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Volunteer Members */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Number of Volenters members
            </span>
            <UserCheck className="w-4 h-4 text-[#3B49DF]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {isLoading ? "—" : volunteersList.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search username/email */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attendee by name, email, or phone"
            className="pl-10 h-11 bg-white border-[#E5E7EB] rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0A0F1E]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Volunteer Dropdown Filter (Populated dynamically from backend volunteers) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-[240px] h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#0A0F1E] flex items-center justify-between hover:border-[#D1D5DB] transition-all shadow-xs cursor-pointer"
            aria-label="Filter by volunteer"
          >
            <div className="flex items-center gap-2 truncate">
              <Filter className="w-4 h-4 text-[#6B7280] shrink-0" />
              <span className="truncate">
                {selectedVolunteer === "ALL"
                  ? "All Volunteers"
                  : selectedVolunteer}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-12 z-30 w-full sm:w-[260px] rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 max-h-64 overflow-y-auto">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Filter by Scanner ({volunteersList.length})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVolunteer("ALL");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedVolunteer === "ALL"
                      ? "bg-[#0A0F1E] text-white"
                      : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0A0F1E]"
                  }`}
                >
                  <span>All Volunteers</span>
                  <span className="text-[11px] opacity-75">{checkedInEntries.length}</span>
                </button>
                <div className="h-px bg-[#E5E7EB] my-1" />
                {volunteersList.length > 0 ? (
                  volunteersList.map((vol) => {
                    const volName = vol.full_name || vol.email;
                    const count = checkedInEntries.filter(
                      (m) =>
                        m.attender?.email?.toLowerCase() === vol.email.toLowerCase() ||
                        m.attender?.full_name?.toLowerCase() === (vol.full_name || "").toLowerCase()
                    ).length;
                    const isSelected =
                      selectedVolunteer.toLowerCase() === vol.email.toLowerCase() ||
                      selectedVolunteer.toLowerCase() === (vol.full_name || "").toLowerCase();

                    return (
                      <button
                        key={vol._id || vol.email}
                        type="button"
                        onClick={() => {
                          setSelectedVolunteer(vol.full_name || vol.email);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#0A0F1E] text-white"
                            : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0A0F1E]"
                        }`}
                      >
                        <span className="truncate">{volName}</span>
                        <span className="text-[11px] opacity-75">{count}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-2.5 py-2 text-xs text-[#9CA3AF] text-center">
                    No assigned volunteers
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Scanned Members Table / List Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden flex flex-col">
        {/* Table Header (Desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#F8F9FA] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] tracking-wide">
          <div className="col-span-5">ATTENDEE</div>
          <div className="col-span-3">CHECKED IN TIME</div>
          <div className="col-span-4">SCANNED BY</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E5E7EB]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-[#FF6A00] animate-spin" />
              <span className="text-xs text-[#6B7280] font-medium">
                Loading checked-in attendees...
              </span>
            </div>
          ) : filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => {
              const attendeeName =
                entry.attendee?.full_name || entry.attendee?.name || "Attendee";
              const attendeeEmail = entry.attendee?.email || "—";
              const attenderName =
                entry.attender?.full_name || entry.attender?.email || "Volunteer Coordinator";

              const checkInTime = entry.checked_in_at || entry.createdAt;
              const formattedTime = checkInTime
                ? new Date(checkInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) +
                  " · " +
                  new Date(checkInTime).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })
                : "Verified";

              return (
                <div
                  key={entry._id}
                  onClick={() => handleInspectRow(entry)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 md:px-6 py-4 items-center hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  title="Click to inspect attendee details"
                >
                  {/* Column 1: Attendee Info with Circle Avatar */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full border border-[#D1D5DB] bg-[#F3F4F6] flex items-center justify-center shrink-0 font-bold text-xs text-[#0A0F1E]">
                      {getInitials(attendeeName)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[#0A0F1E] truncate">
                        {attendeeName}
                      </span>
                      <span className="text-xs text-[#6B7280] truncate font-mono">
                        {attendeeEmail}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Timestamp */}
                  <div className="col-span-3 flex items-center gap-1.5 text-xs text-[#4B5563]">
                    <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 md:hidden" />
                    <span className="font-mono text-[12px]">{formattedTime}</span>
                  </div>

                  {/* Column 3: Scanned by (Volunteer Name) */}
                  <div className="col-span-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-[#0A0F1E] truncate">
                        {attenderName}
                      </span>
                      <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full shrink-0">
                        Verified
                      </span>
                    </div>

                    {entry.attendee?._id && (
                      <span className="text-[10px] font-mono text-[#9CA3AF] hidden lg:inline-block truncate max-w-[100px]">
                        {entry.attendee._id.slice(-6)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#0A0F1E]">
                {searchQuery || selectedVolunteer !== "ALL"
                  ? "No matching scanned attendees found"
                  : "No attendees scanned yet"}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                {searchQuery || selectedVolunteer !== "ALL"
                  ? "Try clearing your search or filter criteria."
                  : "Click 'Scan User' above to verify tickets and check in attendees for this event."}
              </p>
              {(searchQuery || selectedVolunteer !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedVolunteer("ALL");
                  }}
                  className="mt-4 rounded-xl text-xs"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Back Camera Scanner & Feed Dialog */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={handleScanSuccess}
        currentVolunteer={currentVolunteerName}
      />

      {/* 6. Comprehensive 3-Tab Scanned User Details Modal */}
      <ScannedUserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        attendee={scannedAttendee}
      />
    </div>
  );
}
