"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScanModal from "./ScanModal";
import {
  INITIAL_SCANNED_MEMBERS,
  INITIAL_VOLUNTEERS,
  type ScannedMember,
} from "@/lib/dummy-scan-data";

export default function ScanMembersView() {
  const [members, setMembers] = useState<ScannedMember[]>(INITIAL_SCANNED_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Total metrics
  const totalEventMembers = 1450;
  const totalVolunteers = 28;
  const totalScannedCount = 980 + members.length - INITIAL_SCANNED_MEMBERS.length;

  // Filtered members by search query and selected volunteer
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.ticketId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVolunteer =
        selectedVolunteer === "ALL" || member.scannedBy === selectedVolunteer;

      return matchesSearch && matchesVolunteer;
    });
  }, [members, searchQuery, selectedVolunteer]);

  // Helper to get initials
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0F1E]">
            SCAN Members
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Real-time volunteer attendee verification and badge checking.
          </p>
        </div>

        {/* Scan User Action Button */}
        <Button
          onClick={() => setIsScanModalOpen(true)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white shadow-xs font-semibold text-sm transition-all cursor-pointer active:scale-[0.98]"
        >
          <QrCode className="w-4 h-4 text-[#FF6A00]" />
          <span>Scan User</span>
        </Button>
      </div>

      {/* 2. Three Metric / Stat Cards matching wireframe */}
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
              {totalEventMembers.toLocaleString()}
            </span>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              Total registered attendees
            </p>
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
              {totalScannedCount.toLocaleString()}
            </span>
            <p className="text-[11px] text-[#16A34A] font-medium mt-0.5">
              {((totalScannedCount / totalEventMembers) * 100).toFixed(1)}% verified
            </p>
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
              {totalVolunteers}
            </span>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              Active scanners on duty
            </p>
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
            placeholder="Search username/email"
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

        {/* Volunteer Dropdown Filter */}
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
              <div className="absolute right-0 top-12 z-30 w-full sm:w-[260px] rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Filter by Scanner
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
                  <span className="text-[11px] opacity-75">{members.length}</span>
                </button>
                <div className="h-px bg-[#E5E7EB] my-1" />
                {INITIAL_VOLUNTEERS.map((vol) => {
                  const count = members.filter((m) => m.scannedBy === vol).length;
                  const isSelected = selectedVolunteer === vol;
                  return (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => {
                        setSelectedVolunteer(vol);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#0A0F1E] text-white"
                          : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0A0F1E]"
                      }`}
                    >
                      <span className="truncate">{vol}</span>
                      <span className="text-[11px] opacity-75">{count}</span>
                    </button>
                  );
                })}
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
          <div className="col-span-3">TIME STAMP</div>
          <div className="col-span-4">SCANNED BY</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E5E7EB]">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 md:px-6 py-4 items-center hover:bg-[#F9FAFB] transition-colors"
              >
                {/* Column 1: Attendee Info with Circle Avatar */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full border border-[#D1D5DB] bg-[#F3F4F6] flex items-center justify-center shrink-0 font-bold text-xs text-[#0A0F1E]">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#0A0F1E] truncate">
                      {member.name}
                    </span>
                    <span className="text-xs text-[#6B7280] truncate">
                      {member.email}
                    </span>
                  </div>
                </div>

                {/* Column 2: Timestamp */}
                <div className="col-span-3 flex items-center gap-1.5 text-xs text-[#4B5563]">
                  <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 md:hidden" />
                  <span className="font-mono text-[12px]">{member.timestamp}</span>
                </div>

                {/* Column 3: Scanned by (Volunteer Name) */}
                <div className="col-span-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#0A0F1E] truncate">
                      {member.scannedBy}
                    </span>
                    <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[#9CA3AF] hidden lg:inline-block">
                    {member.ticketId}
                  </span>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#0A0F1E]">
                No scanned attendees found
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                No attendees match your filter criteria. Try clearing your search
                or volunteer filter.
              </p>
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
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Back Camera Scanner & Scanned Feed Dialog */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={(newRecord) => {
          setMembers((prev) => [newRecord, ...prev]);
        }}
        recentScans={members}
        currentVolunteer={
          selectedVolunteer === "ALL" ? INITIAL_VOLUNTEERS[0] : selectedVolunteer
        }
      />
    </div>
  );
}

