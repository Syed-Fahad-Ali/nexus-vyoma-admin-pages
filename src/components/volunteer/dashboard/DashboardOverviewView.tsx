"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Info,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EchartsParticipantAreaChart from "./EchartsParticipantAreaChart";
import EchartsSparkline from "./EchartsSparkline";

export default function DashboardOverviewView() {
  const [activeTab, setActiveTab] = useState<"CHECKED_IN" | "PENDING" | "TOTAL">("CHECKED_IN");
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 7 days");

  return (
    <div className="w-full flex flex-col gap-8 select-none pb-8">
      {/* ============================================================ */}
      {/* 1. PARTICIPANTS OVERVIEW SECTION (Apache ECharts Area Graph) */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0F1E]">
              Participants Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Live attendance progress, gate entry velocity, and verification metrics.
            </p>
          </div>

          {/* Date Range Selector Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Calendar Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#4B5563] shadow-2xs">
              <CalendarIcon className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>29/10/2026 – 04/11/2026</span>
            </div>

            {/* Dropdown Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
                className="h-8 px-3 rounded-lg border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-medium text-[#0A0F1E] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>{selectedRange}</span>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
              </Button>

              {isTimeRangeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsTimeRangeOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                    {["Today", "Last 7 days", "Last 30 days", "All Fest Days"].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setSelectedRange(r);
                          setIsTimeRangeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-[#F3F4F6] cursor-pointer ${
                          selectedRange === r ? "text-[#2563EB] font-bold bg-[#EFF6FF]" : "text-[#4B5563]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Overview Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden flex flex-col">
          {/* Segmented Top Header with 3 Participant Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#E5E7EB] divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]">
            {/* Segment 1: Checked-in Participants */}
            <button
              onClick={() => setActiveTab("CHECKED_IN")}
              className={`p-5 text-left transition-colors relative cursor-pointer ${
                activeTab === "CHECKED_IN" ? "bg-white" : "bg-[#F9FAFB]/50 hover:bg-[#F9FAFB]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#4B5563]">
                <span>Checked-in Participants</span>
                <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                  940
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-[#16A34A]">
                  ▲ 64.8%
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">Verified on-ground attendees</p>
              {/* Active Blue Bottom Underline Indicator */}
              {activeTab === "CHECKED_IN" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
              )}
            </button>

            {/* Segment 2: Pending Gate Entries */}
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`p-5 text-left transition-colors relative cursor-pointer ${
                activeTab === "PENDING" ? "bg-white" : "bg-[#F9FAFB]/50 hover:bg-[#F9FAFB]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#4B5563]">
                <span>Pending Gate Entries</span>
                <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                  510
                </span>
                <span className="text-xs text-[#D97706] font-medium">35.2%</span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">Awaiting festival check-in</p>
              {activeTab === "PENDING" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
              )}
            </button>

            {/* Segment 3: Total Enrolled Participants */}
            <button
              onClick={() => setActiveTab("TOTAL")}
              className={`p-5 text-left transition-colors relative cursor-pointer ${
                activeTab === "TOTAL" ? "bg-white" : "bg-[#F9FAFB]/50 hover:bg-[#F9FAFB]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#4B5563]">
                <span>Total Enrolled Participants</span>
                <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                  1,450
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">Total registered festival crowd</p>
              {activeTab === "TOTAL" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
              )}
            </button>
          </div>

          {/* Area Chart Section powered by Apache ECharts */}
          <div className="p-4 sm:p-6 flex flex-col">
            <EchartsParticipantAreaChart activeTab={activeTab} />

            {/* Bottom Legend and Action Link */}
            <div className="mt-2 pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4B5563]">
              {/* Legend Checkboxes matching reference design */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#2563EB] flex items-center justify-center text-white text-[9px] font-bold">
                    ✓
                  </span>
                  <span className="font-medium text-[#0A0F1E]">This Period</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-xs border border-[#CBD5E1] bg-white" />
                  <span className="text-[#94A3B8]">Last Period (Benchmark)</span>
                </div>
              </div>

              {/* View all participants link */}
              <Link
                href="/volunteer/users"
                className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                <span>View all participants</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP INSIGHTS SECTION (Apache ECharts Sparklines)          */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0F1E]">
              Top Insights
            </h2>
          </div>

          {/* Date Range Selector Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#4B5563] shadow-2xs">
              <CalendarIcon className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>29/10/2026 – 04/11/2026</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-medium text-[#0A0F1E] flex items-center gap-1.5 shadow-2xs"
            >
              <span>{selectedRange}</span>
              <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
            </Button>
          </div>
        </div>

        {/* 2x2 Grid of Insight Cards with ECharts Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Gate Scans Today */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0A0F1E]">
                  <span>Gate Scans Today</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">Live badge checks at entry gate</div>
                <div className="mt-3 text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                  980
                </div>
                <div className="mt-1 flex items-center text-xs font-bold text-[#16A34A]">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  <span>▲ Active flow</span>
                </div>
              </div>

              {/* ECharts Sparkline: Green Curve */}
              <div className="w-28 sm:w-36 h-16 rounded-xl bg-[#F0FDF4]/70 border border-[#DCFCE7] p-1 flex items-center justify-center overflow-hidden">
                <EchartsSparkline
                  data={[140, 260, 490, 720, 890, 980]}
                  color="#16A34A"
                  fillColorStart="rgba(22, 163, 74, 0.28)"
                  fillColorEnd="rgba(22, 163, 74, 0.01)"
                  height={54}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-right">
              <Link
                href="/volunteer/scan"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                <span>Open Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Registered Teams */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0A0F1E]">
                  <span>Registered Teams</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">Across 12 fest competition tracks</div>
                <div className="mt-3 text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                  128
                </div>
                <div className="mt-1 flex items-center text-xs font-bold text-[#FF6A00]">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  <span>86 Teams Checked In</span>
                </div>
              </div>

              {/* ECharts Sparkline: Orange Curve */}
              <div className="w-28 sm:w-36 h-16 rounded-xl bg-[#FFF4ED] border border-[#FFEDD5] p-1 flex items-center justify-center overflow-hidden">
                <EchartsSparkline
                  data={[18, 36, 54, 76, 110, 128]}
                  color="#FF6A00"
                  fillColorStart="rgba(255, 106, 0, 0.28)"
                  fillColorEnd="rgba(255, 106, 0, 0.01)"
                  height={54}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-right">
              <Link
                href="/volunteer/users"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                <span>View Teams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Active Volunteers on Duty */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0A0F1E]">
                  <span>Active Volunteers on Duty</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">Crew currently operating shifts</div>
                <div className="mt-3 text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                  24
                </div>
                <div className="mt-1 flex items-center text-xs font-bold text-[#2563EB]">
                  <span>85.7% crew on shift</span>
                </div>
              </div>

              {/* ECharts Sparkline: Blue Curve */}
              <div className="w-28 sm:w-36 h-16 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] p-1 flex items-center justify-center overflow-hidden">
                <EchartsSparkline
                  data={[18, 20, 22, 24, 24, 24]}
                  color="#2563EB"
                  fillColorStart="rgba(37, 99, 235, 0.28)"
                  fillColorEnd="rgba(37, 99, 235, 0.01)"
                  height={54}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-right">
              <Link
                href="/volunteer/team-member"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                <span>View Crew Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Flagged / Unverified Passes */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0A0F1E]">
                  <span>Flagged / Unverified Passes</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">Unpaid or badge desk resolution needed</div>
                <div className="mt-3 text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                  17
                </div>
                <div className="mt-1 flex items-center text-xs font-bold text-[#D97706]">
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  <span>Needs desk verification</span>
                </div>
              </div>

              {/* ECharts Sparkline: Amber Curve */}
              <div className="w-28 sm:w-36 h-16 rounded-xl bg-[#FEF3C7]/50 border border-[#FDE68A] p-1 flex items-center justify-center overflow-hidden">
                <EchartsSparkline
                  data={[45, 38, 30, 24, 19, 17]}
                  color="#D97706"
                  fillColorStart="rgba(217, 119, 6, 0.28)"
                  fillColorEnd="rgba(217, 119, 6, 0.01)"
                  height={54}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-right">
              <Link
                href="/volunteer/users"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                <span>Resolve at Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
