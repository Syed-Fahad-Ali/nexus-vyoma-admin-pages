"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVolunteerEvent } from "../context/VolunteerEventContext";
import { volunteerService, VolunteerApiError } from "@/services/volunteerService";
import { EventStats } from "@/services/types/volunteer";
import EchartsParticipantAreaChart from "./EchartsParticipantAreaChart";
import ScanModal from "../scan/ScanModal";
import { ScannedMember } from "@/lib/dummy-scan-data";

export default function VolunteerDashboardView() {
  const router = useRouter();
  const { selectedEvent, selectedEventId } = useVolunteerEvent();

  // Scoped Event Analytics States
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{
    message: string;
    redirect?: boolean;
    redirectUrl?: string | null;
  } | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"CHECKED_IN" | "PENDING" | "TOTAL">("CHECKED_IN");
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<ScannedMember[]>([]);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadAnalytics = async () => {
    if (!selectedEventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedStats = await volunteerService.getEventStats(selectedEventId);
      setStats(fetchedStats);
    } catch (err) {
      if (err instanceof VolunteerApiError && err.redirect) {
        router.replace(err.redirectUrl || "/");
        return;
      }
      console.error("Failed to load dashboard analytics:", err);
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
              : "Failed to load event telemetry. Please check your network connection.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load scoped analytics stats whenever selected event changes
  useEffect(() => {
    loadAnalytics();
  }, [selectedEventId]);

  // QR Scan Callback
  const handleScanSuccess = async (member: ScannedMember) => {
    setRecentScans((prev) => [member, ...prev.slice(0, 7)]);
    setActionMessage({ text: `QR Verified: ${member.name}`, isError: false });
    setTimeout(() => setActionMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#6B7280]">Loading live event telemetry...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-md w-full bg-white border border-[#FEE2E2] rounded-2xl p-6 sm:p-8 shadow-xs text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FCA5A5]/40 flex items-center justify-center text-[#DC2626] mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#0A0F1E]">
            Unable to Load Dashboard Telemetry
          </h2>
          <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
            {error.message || "An error occurred while communicating with the analytics service."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              onClick={() => loadAnalytics()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0A0F1E] text-white hover:bg-[#1E293B] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => router.push("/events")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#F8F9FA] text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Events</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedEvent || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-md text-center p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs">
          <h2 className="text-base font-bold text-[#0A0F1E]">No Event Selected</h2>
          <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
            Please return to the events directory and select an active event to view its dashboard telemetry.
          </p>
          <div className="mt-4">
            <button
              onClick={() => router.push("/events")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0A0F1E] text-white hover:bg-[#1E293B] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Events</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      {/* 1. CLEAN TOP HEADER & SCAN ACTION BUTTON                     */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#0A0F1E] tracking-tight truncate">
          {selectedEvent.name}
        </h1>

        <div className="flex items-center shrink-0">
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
      {/* 2. FOUR PRIMARY METRIC CARDS (No Subtitles)                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Enrolled */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] sm:text-xs font-medium tracking-wide truncate">
              Total Enrolled
            </span>
            <Users className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {stats.totalParticipants.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Checked-in with Progress */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] sm:text-xs font-medium tracking-wide truncate">
              Checked-in Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                {stats.checkedInCount.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#16A34A]">
                {stats.checkInPercentage}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#16A34A] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.checkInPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Pending Gate Arrivals */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] sm:text-xs font-medium tracking-wide truncate">
              Pending Arrivals
            </span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {stats.pendingCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Active Crew */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] sm:text-xs font-medium tracking-wide truncate">
              Active Crew Coverage
            </span>
            <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {stats.activeVolunteers}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. PRIMARY ATTENDANCE VELOCITY GRAPH (Apache ECharts)        */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden flex flex-col">
        {/* Metric Segmented Tabs */}
        <div className="grid grid-cols-3 border-b border-[#E5E7EB] divide-x divide-[#E5E7EB]">
          <button
            onClick={() => setActiveChartTab("CHECKED_IN")}
            className={`p-3 sm:p-4 text-left transition-colors relative cursor-pointer ${
              activeChartTab === "CHECKED_IN" ? "bg-white" : "bg-[#F9FAFB]/50 hover:bg-[#F9FAFB]"
            }`}
          >
            <div className="text-[10px] sm:text-xs font-medium text-[#6B7280] truncate">
              Checked-in
            </div>
            <div className="text-base sm:text-2xl font-bold text-[#0A0F1E] mt-0.5">
              {stats.checkedInCount}
            </div>
            {activeChartTab === "CHECKED_IN" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
            )}
          </button>

          <button
            onClick={() => setActiveChartTab("PENDING")}
            className={`p-3 sm:p-4 text-left transition-colors relative cursor-pointer ${
              activeChartTab === "PENDING" ? "bg-white" : "bg-[#F9FAFB]/50 hover:bg-[#F9FAFB]"
            }`}
          >
            <div className="text-[10px] sm:text-xs font-medium text-[#6B7280] truncate">
              Pending
            </div>
            <div className="text-base sm:text-2xl font-bold text-[#0A0F1E] mt-0.5">
              {stats.pendingCount}
            </div>
            {activeChartTab === "PENDING" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D97706]" />
            )}
          </button>

          <button
            onClick={() => setActiveChartTab("TOTAL")}
            className={`p-3 sm:p-4 text-left transition-colors relative cursor-pointer ${
              activeChartTab === "TOTAL" ? "bg-white" : "bg-[#F9FAFB]/50 hover:bg-[#F9FAFB]"
            }`}
          >
            <div className="text-[10px] sm:text-xs font-medium text-[#6B7280] truncate">
              Total Capacity
            </div>
            <div className="text-base sm:text-2xl font-bold text-[#0A0F1E] mt-0.5">
              {stats.totalParticipants}
            </div>
            {activeChartTab === "TOTAL" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A0F1E]" />
            )}
          </button>
        </div>

        {/* ECharts Area Graph Canvas */}
        <div className="p-3 sm:p-6 flex flex-col">
          <EchartsParticipantAreaChart
            activeTab={activeChartTab}
            eventId={selectedEvent.id}
            stats={stats}
          />

          {/* Graph Legend */}
          <div className="mt-2 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#6B7280]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-[#0A0F1E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                This Event
              </span>
              <span className="flex items-center gap-1.5 text-[#9CA3AF]">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#94A3B8]" />
                Benchmark
              </span>
            </div>
          </div>
        </div>
      </div>

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
