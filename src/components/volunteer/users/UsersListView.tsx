"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
  X,
  ChevronDown,
  MoreVertical,
  QrCode,
  UserCheck,
  Copy,
  Check,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  INITIAL_USERS,
  ALL_FESTIVAL_TEAMS,
  type UserAttendee,
} from "@/lib/dummy-users-data";

export default function UsersListView() {
  const [users] = useState<UserAttendee[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID" | "CHECKED_IN" | "NOT_CHECKED_IN">("ALL");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Total festival metrics
  const totalUsersCount = 1450;
  const totalTeamsCount = 128; // Total registered event teams
  const paidUsersCount = 1280;
  const totalCheckedInCount = 940;

  // Copy contact details helper
  const handleCopyContact = (user: UserAttendee) => {
    navigator.clipboard.writeText(`${user.name} | ${user.email} | ${user.phone}${user.teamName ? ` | Team: ${user.teamName}` : ""}`);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filtered users based on search, status filter, and team filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q) ||
        (user.teamName && user.teamName.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === "PAID") matchesStatus = user.isPaid;
      else if (statusFilter === "UNPAID") matchesStatus = !user.isPaid;
      else if (statusFilter === "CHECKED_IN") matchesStatus = !!user.isCheckedIn;
      else if (statusFilter === "NOT_CHECKED_IN") matchesStatus = !user.isCheckedIn;

      const matchesTeam = selectedTeam === "ALL" || user.teamName === selectedTeam;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [users, searchQuery, statusFilter, selectedTeam]);

  // Helper for avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case "PAID":
        return "Status: Paid";
      case "UNPAID":
        return "Status: Unpaid";
      case "CHECKED_IN":
        return "Status: Checked-in";
      case "NOT_CHECKED_IN":
        return "Status: Not Checked-in";
      default:
        return "All Statuses";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0F1E]">
            Users
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Registered attendees, competitive teams, check-in verification, and payments.
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-xs font-semibold text-[#0A0F1E] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>{totalTeamsCount} Teams &middot; {totalUsersCount.toLocaleString()} Attendees</span>
        </div>
      </div>

      {/* 2. Top Metric / Stat Cards (4 Cards including Number of Teams) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Number of Users */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Number of Users
            </span>
            <Users className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {totalUsersCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Number of Teams */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Number of Teams
            </span>
            <Trophy className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {totalTeamsCount}
            </span>
          </div>
        </div>

        {/* Card 3: Paid Registrations */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Paid Registrations
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {paidUsersCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Checked-in Attendees */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Checked-in Attendees
            </span>
            <UserCheck className="w-4 h-4 text-[#0A0F1E]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {totalCheckedInCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Filter Controls (Status + Team Filters) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or team name"
            className="pl-10 pr-10 h-11 bg-white border-[#E5E7EB] rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00] w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Team Filter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => {
              setIsTeamDropdownOpen(!isTeamDropdownOpen);
              setIsStatusDropdownOpen(false);
            }}
            className="h-11 px-4 rounded-xl border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-sm text-[#0A0F1E] font-medium flex items-center justify-between gap-2 w-full md:w-[190px] cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Trophy className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span className="truncate">
                {selectedTeam === "ALL" ? "All Teams" : selectedTeam}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 ${isTeamDropdownOpen ? "rotate-180" : ""}`} />
          </Button>

          {isTeamDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsTeamDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-full md:w-60 max-h-72 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-30 py-1.5 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedTeam("ALL");
                    setIsTeamDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F3F4F6] cursor-pointer ${
                    selectedTeam === "ALL" ? "text-[#0A0F1E] font-bold bg-[#F9FAFB]" : "text-[#4B5563]"
                  }`}
                >
                  <span>All Teams ({ALL_FESTIVAL_TEAMS.length})</span>
                  {selectedTeam === "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0F1E]" />}
                </button>
                <div className="h-px bg-[#E5E7EB] my-1" />
                {ALL_FESTIVAL_TEAMS.map((team) => (
                  <button
                    key={team}
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsTeamDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F3F4F6] cursor-pointer ${
                      selectedTeam === team ? "text-[#FF6A00] font-bold bg-[#FFF4ED]" : "text-[#4B5563]"
                    }`}
                  >
                    <span className="truncate">{team}</span>
                    {selectedTeam === team && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => {
              setIsStatusDropdownOpen(!isStatusDropdownOpen);
              setIsTeamDropdownOpen(false);
            }}
            className="h-11 px-4 rounded-xl border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-sm text-[#0A0F1E] font-medium flex items-center justify-between gap-2 w-full md:w-[190px] cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="truncate">{getStatusFilterLabel()}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
          </Button>

          {isStatusDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsStatusDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-full md:w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-30 py-1.5 overflow-hidden">
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F3F4F6] cursor-pointer ${
                    statusFilter === "ALL" ? "text-[#0A0F1E] font-bold bg-[#F9FAFB]" : "text-[#4B5563]"
                  }`}
                >
                  <span>All Statuses</span>
                  {statusFilter === "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0F1E]" />}
                </button>

                <button
                  onClick={() => {
                    setStatusFilter("CHECKED_IN");
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F3F4F6] cursor-pointer ${
                    statusFilter === "CHECKED_IN" ? "text-[#16A34A] font-bold bg-[#DCFCE7]/40" : "text-[#4B5563]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    Checked-in Only
                  </span>
                  {statusFilter === "CHECKED_IN" && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                </button>

                <button
                  onClick={() => {
                    setStatusFilter("NOT_CHECKED_IN");
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F3F4F6] cursor-pointer ${
                    statusFilter === "NOT_CHECKED_IN" ? "text-[#6B7280] font-bold bg-[#F3F4F6]" : "text-[#4B5563]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
                    Not Checked-in
                  </span>
                  {statusFilter === "NOT_CHECKED_IN" && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0F1E]" />}
                </button>

                <div className="h-px bg-[#E5E7EB] my-1" />

                <button
                  onClick={() => {
                    setStatusFilter("PAID");
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F3F4F6] cursor-pointer ${
                    statusFilter === "PAID" ? "text-[#16A34A] font-bold bg-[#DCFCE7]/40" : "text-[#4B5563]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Paid Only
                  </span>
                  {statusFilter === "PAID" && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                </button>

                <button
                  onClick={() => {
                    setStatusFilter("UNPAID");
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#F3F4F6] cursor-pointer ${
                    statusFilter === "UNPAID" ? "text-[#D97706] font-bold bg-[#FEF3C7]/40" : "text-[#4B5563]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-[#D97706]" />
                    Unpaid Only
                  </span>
                  {statusFilter === "UNPAID" && <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Users Table / List Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden flex flex-col">
        {/* Table Header (Desktop) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#F8F9FA] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] tracking-wide">
          <div className="col-span-5">USER DETAILS</div>
          <div className="col-span-2">PHONE NUMBER</div>
          <div className="col-span-2">ENROLLED WHEN?</div>
          <div className="col-span-3 text-right">PAYMENT & ACTIONS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E5E7EB]">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-5 lg:px-6 py-4 items-center hover:bg-[#F9FAFB] transition-colors"
              >
                {/* Column 1: User Details (Avatar + Name + Team Name if team event + Email) */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full border border-[#D1D5DB] bg-[#F3F4F6] flex items-center justify-center shrink-0 font-bold text-xs text-[#0A0F1E]">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-[#0A0F1E] truncate">
                        {user.name}
                      </span>
                      {/* Team Name badge shown for participants_type: team */}
                      {user.participantsType === "team" && user.teamName && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF6A00] bg-[#FFF4ED] border border-[#FFEDD5] px-2 py-0.5 rounded-md shrink-0">
                          <Trophy className="w-3 h-3 text-[#FF6A00]" />
                          <span>Team: {user.teamName}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#6B7280] truncate font-mono mt-0.5">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Column 2: Phone Number */}
                <div className="col-span-2 flex items-center gap-2 text-xs font-mono text-[#0A0F1E]">
                  <Phone className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  <span className="truncate">{user.phone}</span>
                </div>

                {/* Column 3: Enrolled When */}
                <div className="col-span-2 flex items-center gap-2 text-xs text-[#6B7280]">
                  <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  <span className="truncate">{user.enrolledAt}</span>
                </div>

                {/* Column 4: Payment Badge + Check-in Status + 3 Dots Action Menu */}
                <div className="col-span-3 flex items-center justify-between lg:justify-end gap-3">
                  <div className="flex flex-col items-start lg:items-end gap-1">
                    {/* Payment Badge */}
                    {user.isPaid ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Unpaid</span>
                      </span>
                    )}

                    {/* Check-in visual status indicator (whitespace-nowrap prevents any broken lines) */}
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          user.isCheckedIn ? "bg-[#16A34A]" : "bg-[#9CA3AF]"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-medium ${
                          user.isCheckedIn ? "text-[#16A34A]" : "text-[#9CA3AF]"
                        }`}
                      >
                        {user.isCheckedIn
                          ? `Checked-in · ${user.checkedInAt || "Verified"}`
                          : "Not Checked-in"}
                      </span>
                    </div>
                  </div>

                  {/* 3 Dots Options Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg text-[#6B7280] hover:text-[#0A0F1E] hover:bg-[#F3F4F6] cursor-pointer shrink-0"
                        title="More options"
                      >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-white border border-[#E5E7EB] shadow-lg rounded-xl p-1.5 z-40"
                      >
                        <DropdownMenuLabel className="text-[11px] font-semibold text-[#9CA3AF] uppercase px-2 py-1">
                          Attendee Actions
                        </DropdownMenuLabel>

                        {/* Rule: Check-in ONLY through scanned ticket */}
                        {!user.isPaid ? (
                          <div className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg text-[#9CA3AF] bg-[#F9FAFB] border border-[#E5E7EB] cursor-not-allowed select-none">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#D97706]" />
                            <span>Unpaid (Cannot Check-in)</span>
                          </div>
                        ) : (
                          <DropdownMenuItem
                            asChild
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] focus:bg-[#EFF6FF] rounded-lg cursor-pointer"
                          >
                            <Link href="/volunteer/scan" className="flex items-center gap-2 w-full">
                              <QrCode className="w-3.5 h-3.5 shrink-0 text-[#2563EB]" />
                              <span>Scan Ticket to Check-in</span>
                            </Link>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="my-1 bg-[#E5E7EB]" />

                        {/* Copy Contact Info Action */}
                        <DropdownMenuItem
                          onClick={() => handleCopyContact(user)}
                          className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#F3F4F6] focus:bg-[#F3F4F6] rounded-lg cursor-pointer"
                        >
                          {copiedId === user.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                              <span className="text-[#16A34A] font-semibold">Copied Details!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 shrink-0 text-[#9CA3AF]" />
                              <span>Copy Contact Info</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#0A0F1E]">
                No users found
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                No registered attendees match your current search criteria or filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setSelectedTeam("ALL");
                }}
                className="mt-4 rounded-xl text-xs cursor-pointer"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
