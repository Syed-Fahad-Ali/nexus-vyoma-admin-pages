"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Users,
  User,
  ArrowRight,
  LogOut,
  Sparkles,
  Layers,
  Flame,
  Bot,
  Code2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  CheckCircle2,
  Send,
  X,
  QrCode,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import NexusVyomaLogo from "@/components/brand/NexusVyomaLogo";
import { volunteerService, VolunteerApiError } from "@/services/volunteerService";
import { VolunteerEvent } from "@/services/types/volunteer";
import ScanModal from "@/components/volunteer/scan/ScanModal";
import { type ScannedMember, INITIAL_SCANNED_MEMBERS } from "@/lib/dummy-scan-data";
import ScannedUserDetailsModal, { type ScannedAttendeeData } from "./ScannedUserDetailsModal";

// Helper to assign a minimal, strategic palette per track
function getEventTheme(event: VolunteerEvent) {
  const categoryLower = event.category.toLowerCase();
  if (categoryLower.includes("robotics") || categoryLower.includes("combat")) {
    return {
      accentColor: "#E11D48",
      accentBg: "bg-[#FFF1F2]",
      accentBorder: "border-[#FFE4E6]",
      accentText: "text-[#E11D48]",
      topGradient: "from-[#E11D48] via-[#F43F5E] to-[#BE123C]",
      categoryBadge: "bg-[#FFF1F2] text-[#BE123C] border-[#FFE4E6]",
      cardHoverBorder: "hover:border-[#E11D48]/40",
      ctaHoverBg: "group-hover:bg-[#E11D48] group-hover:text-white",
      icon: Bot,
    };
  }
  if (categoryLower.includes("software") || categoryLower.includes("coding") || event.participantType === "individual") {
    return {
      accentColor: "#2563EB",
      accentBg: "bg-[#EFF6FF]",
      accentBorder: "border-[#DBEAFE]",
      accentText: "text-[#2563EB]",
      topGradient: "from-[#2563EB] via-[#3B82F6] to-[#1D4ED8]",
      categoryBadge: "bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]",
      cardHoverBorder: "hover:border-[#2563EB]/40",
      ctaHoverBg: "group-hover:bg-[#2563EB] group-hover:text-white",
      icon: Code2,
    };
  }
  // Default: Flagship / Hackathon (Festival Signature Flame Orange)
  return {
    accentColor: "#FF6A00",
    accentBg: "bg-[#FFF7ED]",
    accentBorder: "border-[#FFEDD5]",
    accentText: "text-[#EA580C]",
    topGradient: "from-[#FF6A00] via-[#FB923C] to-[#C2410C]",
    categoryBadge: "bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]",
    cardHoverBorder: "hover:border-[#FF6A00]/40",
    ctaHoverBg: "group-hover:bg-[#FF6A00] group-hover:text-white",
    icon: Flame,
  };
}

export default function PermittedEventsView() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    redirect?: boolean;
    redirectUrl?: string | null;
  } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Email pass dialog state (purely dummy data, no API calls)
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState<number | null>(null);
  const [isTotalUsersLoading, setIsTotalUsersLoading] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [sentEmailAddress, setSentEmailAddress] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  // Scanner & Scanned User Details Modal State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [scannedAttendee, setScannedAttendee] = useState<ScannedAttendeeData | null>(null);
  const [recentScans, setRecentScans] = useState<ScannedMember[]>(INITIAL_SCANNED_MEMBERS.slice(0, 5));

  const handleScanSuccess = (member: ScannedMember) => {
    setRecentScans((prev) => [member, ...prev.slice(0, 9)]);
    setIsScanModalOpen(false);

    const scannedUserId = member.userId || `usr_${member.id.replace(/\D/g, "") || "9041"}`;
    const scannedUserEmail = member.email || "attendee@islec.edu.in";
    const scannedUserName = member.name || "Festival Attendee";

    setScannedAttendee({
      userId: scannedUserId,
      userEmail: scannedUserEmail,
      user: {
        full_name: scannedUserName,
        email: scannedUserEmail,
        phone_number: "+91 98480 77123",
        city: "Hyderabad",
        state: "Telangana",
        institution: "ISL Engineering College",
        year_of_study: "3rd Year",
        degree: "B.Tech in Computer Science",
        is_verified: true,
        createdAt: "05 Nov 2026",
      },
      enrolledEvents: [
        {
          id: "evt-01",
          code: "NV-TECH-01",
          name: "CodeCraft 24h National Hackathon",
          category: "Technical Flagship",
          participationType: "team",
          date: "10 Nov 2026",
          venue: "Innovation Lab (2nd Floor)",
          isPaid: true,
        },
        {
          id: "evt-02",
          code: "NV-ROBO-02",
          name: "RoboWars: Clash of Metal",
          category: "Robotics Arena",
          participationType: "team",
          date: "11 Nov 2026",
          venue: "Central Open Grounds Pit 1",
          isPaid: true,
        },
        {
          id: "evt-03",
          code: "NV-CODING-03",
          name: "Algorhythm: Speed Webathon",
          category: "Software Sprint",
          participationType: "individual",
          date: "12 Nov 2026",
          venue: "Seminar Hall 1",
          isPaid: true,
        },
      ],
      checkedInEvents: [
        {
          id: "chk-01",
          code: "NV-TECH-01",
          name: "CodeCraft 24h National Hackathon",
          category: "Technical Flagship",
          checkedInAt: "10 Nov 2026 · 09:15 AM",
          gateOrRoom: "Lab 3 Gate A",
          volunteerName: displayName,
        },
      ],
    });

    setIsUserDetailsModalOpen(true);
  };

  // Fetch live total users count from /api/total-user
  useEffect(() => {
    let isMounted = true;
    async function fetchTotalUsers() {
      try {
        const res = await fetch("/api/total-user", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (json?.redirect && json?.redirectUrl) {
          router.replace(json.redirectUrl);
          return;
        }
        if (isMounted && json?.data?.totalUsersCount !== undefined) {
          setTotalUsersCount(Number(json.data.totalUsersCount));
        }
      } catch (err) {
        console.error("Failed to load total users count:", err);
      } finally {
        if (isMounted) setIsTotalUsersLoading(false);
      }
    }
    fetchTotalUsers();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Check admin status from /api/is-admin
  useEffect(() => {
    let isMounted = true;
    async function checkAdminStatus() {
      try {
        const res = await fetch("/api/is-admin", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (isMounted) {
          setIsAdmin(json?.data?.isAdmin === true);
        }
      } catch {
        if (isMounted) setIsAdmin(false);
      }
    }
    checkAdminStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!isEmailModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEmailModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEmailModalOpen]);

  const loadPermittedEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await volunteerService.getAssignedEvents();
      setEvents(data);
    } catch (err) {
      if (err instanceof VolunteerApiError && err.redirect) {
        router.replace(err.redirectUrl || "/");
        return;
      }
      console.error("Failed to load permitted events:", err);
      if (err instanceof VolunteerApiError) {
        setError({
          message: err.message,
          redirect: err.redirect,
          redirectUrl: err.redirectUrl,
        });
      } else {
        setError({
          message:
            err instanceof Error
              ? err.message
              : "Failed to load events. Please check your network connection.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPermittedEvents();
  }, []);

  const handleSelectEvent = (event: VolunteerEvent) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_selected_event_id", event.id);
    }
    router.push("/volunteer/dashboard");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("nexus_selected_event_id");
    }
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  const displayName =
    isUserLoaded && user
      ? user.fullName ?? user.firstName ?? "Volunteer"
      : "Loading…";

  return (
    <div className="relative min-h-screen w-full bg-[#FAFAFC] text-[#0A0F1E] flex flex-col antialiased selection:bg-[#FF6A00]/10 selection:text-[#0A0F1E] overflow-x-hidden">
      {/* Subtle Ambient Top Festival Glow (Warmth without clutter) */}
      <div
        className="absolute top-0 inset-x-0 h-80 pointer-events-none opacity-40 blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255, 106, 0, 0.12) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 100%)",
        }}
      />

      {/* ======================================================== */}
      {/* Top Navigation Bar                                       */}
      {/* ======================================================== */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <NexusVyomaLogo showMark={false} wordmarkHeight={26} />
            <span className="hidden sm:inline-block h-4 w-[1px] bg-[#E5E7EB]" />
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FFF7ED] border border-[#FFEDD5] text-[11px] font-semibold text-[#EA580C]">
              <span>Volunteer Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#4B5563] bg-[#F8F9FA] px-3 py-1.5 rounded-lg border border-[#E5E7EB]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
              </span>
              <span>Signed in as <strong className="text-[#0A0F1E]">{displayName}</strong></span>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#DC2626] bg-white hover:bg-[#FEF2F2] px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#FEE2E2] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sign Out"
            >
              {isSigningOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isSigningOut ? "Signing out…" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* Main Content Area                                        */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Permitted Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0F1E] tracking-tight">
              Assigned Events
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Select an event below to manage registrations, view live telemetry, and verify attendee passes.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
            {/* Total Users Count Pill (Live Data from /api/total-user) */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#0A0F1E] shadow-2xs">
              <Users className="w-4 h-4 text-[#FF6A00]" />
              <span>
                {totalUsersCount !== null
                  ? `${totalUsersCount.toLocaleString()} Total Users`
                  : isTotalUsersLoading
                  ? "Loading..."
                  : "0 Total Users"}
              </span>
            </div>

            {/* Events Active Pill */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#4B5563] shadow-2xs">
              <Layers className="w-4 h-4 text-[#FF6A00]" />
              <span>{events.length} {events.length === 1 ? "Event Active" : "Events Active"}</span>
            </span>

            {/* Scan QR Action Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => setIsScanModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#FF6A00]" />
                <span>Scan QR</span>
              </button>
            )}

            {/* Send Email Action Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setIsEmailModalOpen(true);
                  setEmailStatus("idle");
                  setEmailErrorMessage("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#0A0F1E] text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#FF6A00]" />
                <span>Send Email</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-[#6B7280]">Loading permitted events...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="max-w-md w-full bg-white border border-[#FEE2E2] rounded-2xl p-6 sm:p-8 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FCA5A5]/40 flex items-center justify-center text-[#DC2626] mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#0A0F1E]">
                Unable to Load Assigned Events
              </h2>
              <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                {error.message || "An unexpected error occurred while fetching your assigned festival events."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
                <button
                  onClick={() => loadPermittedEvents()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0A0F1E] text-white hover:bg-[#1E293B] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                {error.redirect && error.redirectUrl && (
                  <button
                    onClick={() => router.push(error.redirectUrl || "/")}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#F8F9FA] text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Back to Home</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="max-w-md text-center p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs">
              <h2 className="text-base font-bold text-[#0A0F1E]">No Assigned Events Found</h2>
              <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                Your account is currently not assigned to any active festival track. Please contact the festival coordinator to assign your duty track.
              </p>
            </div>
          </div>
        )}

        {/* Event Containers (Single or Multiple) */}
        {!isLoading && !error && events.length > 0 && (
          <div
            className={`grid gap-6 ${events.length === 1
              ? "grid-cols-1 max-w-2xl mx-auto w-full"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
          >
            {events.map((evt) => {
              const isSquad = evt.participantType === "team";
              const theme = getEventTheme(evt);
              const TrackIcon = theme.icon;

              return (
                <div
                  key={evt.id}
                  onClick={() => handleSelectEvent(evt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectEvent(evt);
                    }
                  }}
                  className={`group bg-white rounded-2xl border border-[#E5E7EB] ${theme.cardHoverBorder} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 relative`}
                >
                  {/* Strategic Color Accent Strip at Card Top */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${theme.topGradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                  />

                  {/* Poster Image Banner */}
                  <div className="relative w-full h-44 sm:h-48 bg-[#0A0F1E] overflow-hidden">
                    {evt.posterUrl ? (
                      <Image
                        src={evt.posterUrl}
                        alt={evt.name}
                        fill
                        unoptimized
                        priority
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0A0F1E] to-[#1E293B] flex items-center justify-center text-white/50 text-xs font-mono">
                        NEXUS VYOMA 2026
                      </div>
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    {/* Category & Participant Format Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      {/* Category Pill with Track Icon */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 backdrop-blur-md text-[#0A0F1E] shadow-xs">
                        <TrackIcon className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>{evt.category}</span>
                      </span>

                      {/* Participant Type Badge (Solo vs Squad with minimal distinct hues) */}
                      {isSquad ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-[#FF6A00] text-white shadow-xs">
                          <Users className="w-3 h-3 text-white" />
                          <span>Squad</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-[#2563EB] text-white shadow-xs">
                          <User className="w-3 h-3 text-white" />
                          <span>Solo</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Tag over Image: Event Code */}
                    <div className="absolute bottom-2.5 left-3">
                      <span className="font-mono text-[11px] font-medium text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs border border-white/10">
                        {evt.code}
                      </span>
                    </div>
                  </div>

                  {/* Event Details Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Event Name */}
                      <h2 className="text-lg font-bold text-[#0A0F1E] group-hover:text-[#FF6A00] transition-colors leading-snug">
                        {evt.name}
                      </h2>

                      {/* Metadata Rows with Micro-Colorized Semantic Capsules */}
                      <div className="mt-4 space-y-2.5 text-xs text-[#4B5563]">
                        {/* Venue (Rose/Coral Capsule) */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                          </div>
                          <span className="leading-tight truncate">
                            <strong className="text-[#0A0F1E] font-medium">{evt.venue}</strong>
                            {evt.room && <span className="text-[#6B7280]"> &middot; {evt.room}</span>}
                          </span>
                        </div>

                        {/* Time (Azure/Indigo Capsule) */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                          </div>
                          <span className="leading-tight truncate">
                            <strong className="text-[#0A0F1E] font-medium">{evt.date}</strong>
                            {evt.startTime && (
                              <span className="text-[#6B7280]"> &middot; {evt.startTime}{evt.endTime ? ` – ${evt.endTime}` : ""}</span>
                            )}
                          </span>
                        </div>

                        {/* Participation Limit (Mint/Emerald Capsule) */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                            <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                          </div>
                          <span className="leading-tight truncate">
                            <span className="text-[#6B7280]">Limit: </span>
                            <strong className="text-[#0A0F1E] font-semibold">{evt.participationLimit}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#6B7280]">
                        {isSquad ? "Team format" : "Individual format"}
                      </span>

                      {/* Interactive Minimal CTA */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-transparent transition-all duration-150 ${theme.accentText} bg-[#F8F9FA] group-hover:bg-[#0A0F1E] group-hover:text-white`}
                      >
                        <span>Enter Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#E5E7EB] py-4 text-center text-xs text-[#9CA3AF]">
        Nexus Vyoma 2026 &middot; ISL Engineering College &middot; Hyderabad
      </footer>

      {/* ======================================================== */}
      {/* Send Email Dialog Modal (Dummy Data)                     */}
      {/* ======================================================== */}
      {isEmailModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEmailModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-modal-title"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF4ED] border border-[#FFEDD5] flex items-center justify-center text-[#FF6A00] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="email-modal-title" className="text-base font-bold text-[#0A0F1E]">
                    Send Festival Pass
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Enter email to deliver attendee festival entry credentials
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-4">
              {emailStatus === "sent" ? (
                <div className="flex flex-col items-center text-center py-3 gap-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[#0A0F1E]">
                      Pass Dispatch Confirmed
                    </h4>
                    <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-xs font-semibold text-[#15803D]">
                      send festival pass on {sentEmailAddress}
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      The attendee credentials and event schedule have been queued.
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailStatus("idle");
                        setEmailInput("");
                      }}
                      className="flex-1 h-10 px-4 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    >
                      Send Another
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="flex-1 h-10 px-4 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const trimmed = emailInput.trim();
                    if (!trimmed) {
                      setEmailErrorMessage("Please enter an email address.");
                      return;
                    }
                    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
                      setEmailErrorMessage("Please enter a valid email address.");
                      return;
                    }
                    setEmailErrorMessage("");
                    setEmailStatus("sending");

                    try {
                      const response = await fetch("/api/send-email", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ senderEmail: trimmed }),
                      });

                      const result = await response.json().catch(() => null);

                      if (result?.redirect && result?.redirectUrl) {
                        router.replace(result.redirectUrl);
                        return;
                      }

                      if (!response.ok || !result || result.error) {
                        const errorMsg =
                          result?.message ||
                          result?.error ||
                          `Failed to send festival pass (HTTP ${response.status})`;
                        setEmailErrorMessage(errorMsg);
                        setEmailStatus("idle");
                        return;
                      }

                      setSentEmailAddress(trimmed);
                      setEmailStatus("sent");
                    } catch (err) {
                      console.error("Failed to send festival pass:", err);
                      setEmailErrorMessage(
                        err instanceof Error
                          ? err.message
                          : "A network error occurred while sending the email."
                      );
                      setEmailStatus("idle");
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="enter-email-input" className="text-xs font-semibold text-[#0A0F1E]">
                      Enter Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <input
                        id="enter-email-input"
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (emailErrorMessage) setEmailErrorMessage("");
                        }}
                        placeholder="Enter email..."
                        autoFocus
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#0A0F1E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition-all"
                      />
                    </div>
                    {emailErrorMessage && (
                      <span className="text-xs font-medium text-[#DC2626]">
                        {emailErrorMessage}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#6B7280]">
                    Recipient will receive entry QR pass, reporting schedule, and college ID verification rules.
                  </p>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="h-10 px-4 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={emailStatus === "sending"}
                      className="h-10 px-5 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                      {emailStatus === "sending" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#FF6A00]" />
                          <span>Send Festival Pass</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* QR Camera Scanner Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={handleScanSuccess}
        recentScans={recentScans}
        currentVolunteer={displayName}
      />

      {/* 3-Tab Scanned User Details Modal */}
      <ScannedUserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        attendee={scannedAttendee}
      />
    </div>
  );
}
