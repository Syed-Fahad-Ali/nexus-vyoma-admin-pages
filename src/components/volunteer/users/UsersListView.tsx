"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  Filter,
  X,
  ChevronDown,
  MoreVertical,
  UserCheck,
  Copy,
  Check,
  AlertCircle,
  Trophy,
  RefreshCw,
  GraduationCap,
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
import { type UserAttendee } from "@/lib/dummy-users-data";
import { useVolunteerEvent } from "../context/VolunteerEventContext";
import { volunteerService, VolunteerApiError } from "@/services/volunteerService";

export default function UsersListView() {
  const router = useRouter();
  const { selectedEvent, selectedEventId } = useVolunteerEvent();

  const [users, setUsers] = useState<UserAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; redirect?: boolean; redirectUrl?: string | null } | null>(null);
  const [counts, setCounts] = useState({
    totalUsersCount: 0,
    totalTeamsCount: 0,
    totalCheckedInCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CHECKED_IN" | "NOT_CHECKED_IN">("ALL");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isIndividual = selectedEvent?.participantType === "individual";

  const loadUsers = async () => {
    if (!selectedEventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await volunteerService.getDashboardUsers(selectedEventId);
      setUsers(res.users);
      setCounts({
        totalUsersCount: res.totalUsersCount,
        totalTeamsCount: res.totalTeamsCount,
        totalCheckedInCount: res.totalCheckedInCount,
      });
    } catch (err) {
      if (err instanceof VolunteerApiError && err.redirect) {
        router.replace(err.redirectUrl || "/");
        return;
      }
      console.error("Failed to load dashboard users:", err);
      if (err instanceof VolunteerApiError) {
        setError({
          message: err.message,
          redirect: err.redirect,
          redirectUrl: err.redirectUrl,
        });
      } else {
        setError({
          message: err instanceof Error ? err.message : "Failed to load registered attendees",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedEventId]);

  // Dynamic available teams list from loaded users (if team event)
  const availableTeams = useMemo(() => {
    if (isIndividual) return [];
    const teamSet = new Set<string>();
    users.forEach((u) => {
      if (u.teamName) teamSet.add(u.teamName);
    });
    return Array.from(teamSet);
  }, [users, isIndividual]);

  // Copy contact details helper
  const handleCopyContact = (user: UserAttendee) => {
    const details = [
      user.name,
      user.email,
      user.phone,
      user.institution,
      user.degree,
      user.year_of_study ? `Year ${user.year_of_study}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    navigator.clipboard.writeText(details);
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
        (user.institution && user.institution.toLowerCase().includes(q)) ||
        (user.degree && user.degree.toLowerCase().includes(q)) ||
        (user.year_of_study && user.year_of_study.toLowerCase().includes(q)) ||
        (!isIndividual && user.teamName && user.teamName.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === "CHECKED_IN") matchesStatus = !!user.isCheckedIn;
      else if (statusFilter === "NOT_CHECKED_IN") matchesStatus = !user.isCheckedIn;

      const matchesTeam = isIndividual || selectedTeam === "ALL" || user.teamName === selectedTeam;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [users, searchQuery, statusFilter, selectedTeam, isIndividual]);

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
      case "CHECKED_IN":
        return "Status: Checked-in";
      case "NOT_CHECKED_IN":
        return "Status: Not Checked-in";
      default:
        return "All Statuses";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#6B7280]">Loading event attendees...</span>
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
            Unable to Load Event Attendees
          </h2>
          <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
            {error.message || "An error occurred while fetching attendee registrations."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              onClick={() => loadUsers()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0A0F1E] text-white hover:bg-[#1E293B] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => router.push("/volunteer/dashboard")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#F8F9FA] text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0F1E]">
            Users
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isIndividual
              ? "Registered individual attendees, check-in verification, and admissions."
              : "Registered attendees, participating teams, check-in verification, and admissions."}
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-xs font-semibold text-[#0A0F1E] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>
            {!isIndividual && `${counts.totalTeamsCount} Teams · `}
            {counts.totalUsersCount.toLocaleString()} Attendees
          </span>
        </div>
      </div>

      {/* 2. Top Metric / Stat Cards (No "Paid Registrations" card, No "Number of Teams" if individual) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isIndividual ? "lg:grid-cols-2 max-w-2xl" : "lg:grid-cols-3"} gap-4`}>
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
              {counts.totalUsersCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Number of Teams (Only shown if NOT individual event) */}
        {!isIndividual && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-medium tracking-wide">
                Number of Teams
              </span>
              <Trophy className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
                {counts.totalTeamsCount}
              </span>
            </div>
          </div>
        )}

        {/* Card 3: Checked-in Attendees */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-medium tracking-wide">
              Checked-in Attendees
            </span>
            <UserCheck className="w-4 h-4 text-[#0A0F1E]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1E] tracking-tight">
              {counts.totalCheckedInCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Filter Controls (Status + Team Filter if team event) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isIndividual ? "Search by name, email, or phone" : "Search by name, email, phone, or team name"}
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

        {/* Team Filter Dropdown (Only shown if NOT individual event) */}
        {!isIndividual && (
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
                    <span>All Teams ({availableTeams.length})</span>
                    {selectedTeam === "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0F1E]" />}
                  </button>
                  <div className="h-px bg-[#E5E7EB] my-1" />
                  {availableTeams.map((team) => (
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
        )}

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
                {/* Column 1: User Details (Avatar + Name + Email + Academic Info) */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full border border-[#D1D5DB] bg-[#F3F4F6] flex items-center justify-center shrink-0 font-bold text-xs text-[#0A0F1E]">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#0A0F1E] truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-[#6B7280] truncate font-mono mt-0.5">
                      {user.email}
                    </span>
                    {(user.institution || user.degree || user.year_of_study) && (
                      <div
                        className="flex items-center gap-1.5 text-[11px] text-[#6B7280] truncate mt-1"
                        title={[
                          user.institution,
                          user.degree,
                          user.year_of_study ? `Year: ${user.year_of_study}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                        <span className="truncate">
                          {[
                            user.institution,
                            user.degree,
                            user.year_of_study ? `Yr ${user.year_of_study}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                    )}
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

                {/* Column 4: Payment Badge (Paid for all) + Check-in Status + 3 Dots Action Menu */}
                <div className="col-span-3 flex items-center justify-between lg:justify-end gap-3">
                  <div className="flex flex-col items-start lg:items-end gap-1">
                    {/* Payment Badge: Made Paid for all users */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Paid</span>
                    </span>

                    {/* Check-in visual status indicator */}
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
                          ? `Checked-in${user.checkedInAt ? ` (${user.checkedInAt})` : ""}`
                          : "Pending Entry"}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Dropdown Menu */}
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
                className="mt-4 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
