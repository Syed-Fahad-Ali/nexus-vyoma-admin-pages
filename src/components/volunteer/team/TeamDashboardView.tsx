"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Users,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVolunteerEvent } from "../context/VolunteerEventContext";
import { volunteerService, VolunteerApiError } from "@/services/volunteerService";
import { FestivalSquad } from "@/services/types/volunteer";
import ScanModal from "../scan/ScanModal";
import TeamCardGrid from "../dashboard/TeamCardGrid";
import { ScannedMember } from "@/lib/dummy-scan-data";

export default function TeamDashboardView() {
  const router = useRouter();
  const { selectedEvent, selectedEventId } = useVolunteerEvent();

  const [squads, setSquads] = useState<FestivalSquad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; redirect?: boolean; redirectUrl?: string | null } | null>(null);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<ScannedMember[]>([]);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (selectedEvent?.participantType === "individual") {
      router.replace("/volunteer/users");
      return;
    }
  }, [selectedEvent, router]);

  const loadTeamData = async () => {
    if (!selectedEventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedSquads = await volunteerService.getEventSquads(selectedEventId);
      setSquads(fetchedSquads);
    } catch (err) {
      if (err instanceof VolunteerApiError && err.redirect) {
        router.replace(err.redirectUrl || "/volunteer/dashboard");
        return;
      }
      console.error("Failed to load team data:", err);
      if (err instanceof VolunteerApiError) {
        setError({
          message: err.message,
          redirect: err.redirect,
          redirectUrl: err.redirectUrl,
        });
      } else {
        setError({
          message: err instanceof Error ? err.message : "Failed to load team data",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [selectedEventId]);

  const handleScanSuccess = async (member: ScannedMember) => {
    setRecentScans((prev) => [member, ...prev.slice(0, 7)]);
    setActionMessage({ text: `QR Verified: ${member.name}`, isError: false });
    setTimeout(() => setActionMessage(null), 3000);
  };

  if (!selectedEvent) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#6B7280]">Loading teams...</span>
        </div>
      </div>
    );
  }

  const fullyCheckedInSquads = squads.filter(
    (s) => s.members.length > 0 && s.members.filter((m) => m.isCheckedIn).length === s.members.length
  ).length;

  return (
    <div className="w-full flex flex-col gap-6 select-none pb-12">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border animate-in slide-in-from-top-3 ${
            actionMessage.isError
              ? "bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]"
              : "bg-[#0A0F1E] border-[#1E293B] text-white"
          }`}
        >
          {actionMessage.isError ? (
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. CLEAN TOP HEADER                                          */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Event Title & Identity */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-[#FF6A00] bg-[#FFF4ED] border border-[#FFEDD5] px-2.5 py-0.5 rounded-md">
              {selectedEvent.code}
            </span>
            <span className="text-xs text-[#6B7280] font-medium">
              {selectedEvent.venue} · {selectedEvent.room}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF6A00] shrink-0" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A0F1E] tracking-tight truncate">
              {selectedEvent.name} — Teams
            </h1>
          </div>
          <p className="text-xs text-[#6B7280]">
            Team cards, leader contact info, member rosters, and gate pass verification
          </p>
        </div>

        {/* Right: Scan Action Button & Refresh */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={loadTeamData}
            variant="outline"
            disabled={isLoading}
            className="h-11 px-3.5 rounded-xl border-[#E5E7EB] text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#F9FAFB] text-xs font-medium flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Refresh Teams"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF6A00]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={() => setIsScanModalOpen(true)}
            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#FF6A00]" />
            <span>Scan QR Pass</span>
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SIMPLE, CLEAN SQUAD SUMMARY BAR                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-2xs flex items-center justify-between">
          <span className="text-xs text-[#6B7280]">Registered Squads</span>
          <span className="text-base font-bold text-[#0A0F1E]">{squads.length} Teams</span>
        </div>

        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 shadow-2xs flex items-center justify-between">
          <span className="text-xs text-[#15803D] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            All Members Checked In
          </span>
          <span className="text-base font-bold text-[#15803D]">{fullyCheckedInSquads} Teams</span>
        </div>

        <div className="rounded-xl border border-[#FDE68A] bg-[#FEFCE8] px-4 py-3 shadow-2xs flex items-center justify-between">
          <span className="text-xs text-[#B45309] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Awaiting Verification
          </span>
          <span className="text-base font-bold text-[#B45309]">{squads.length - fullyCheckedInSquads} Teams</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ERROR ALERT STATE                                         */}
      {/* ============================================================ */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-950">Unable to load teams</h3>
            <p className="text-xs text-red-700 max-w-md">{error.message}</p>
          </div>
          <Button
            onClick={loadTeamData}
            className="mt-2 h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. LOADING STATE                                             */}
      {/* ============================================================ */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-[#E5E7EB]">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#6B7280]">Loading enrolled squads...</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. EMPTY STATE                                               */}
      {/* ============================================================ */}
      {!isLoading && !error && squads.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FFF4ED] flex items-center justify-center text-[#FF6A00]">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#0A0F1E]">No Squads Enrolled Yet</h3>
            <p className="text-xs text-[#6B7280] max-w-sm">
              No teams have enrolled for this event yet. As soon as teams register, their roster, leader contacts, and gate check-in status will appear here.
            </p>
          </div>
          <Button
            onClick={loadTeamData}
            variant="outline"
            className="mt-2 h-9 px-4 rounded-xl border-[#E5E7EB] text-[#4B5563] hover:text-[#0A0F1E] text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. SQUAD / TEAM CARDS GRID                                   */}
      {/* ============================================================ */}
      {!isLoading && !error && squads.length > 0 && (
        <TeamCardGrid squads={squads} eventName={selectedEvent.name} />
      )}

      {/* QR Camera Scanner Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={handleScanSuccess}
        recentScans={recentScans}
        currentVolunteer="YOUR_NAME"
      />
    </div>
  );
}
