"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type TeamMember } from "@/lib/dummy-team-data";
import { useVolunteerEvent } from "../context/VolunteerEventContext";
import { volunteerService, VolunteerApiError } from "@/services/volunteerService";

export default function TeamMembersView() {
  const router = useRouter();
  const { selectedEvent, selectedEventId } = useVolunteerEvent();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; redirect?: boolean; redirectUrl?: string | null } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCrewData = async () => {
    if (!selectedEventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const members = await volunteerService.getCrewMembers(selectedEventId);
      setTeamMembers(members);
    } catch (err) {
      if (err instanceof VolunteerApiError && err.redirect) {
        router.replace(err.redirectUrl || "/");
        return;
      }
      console.error("Failed to load crew members:", err);
      if (err instanceof VolunteerApiError) {
        setError({
          message: err.message,
          redirect: err.redirect,
          redirectUrl: err.redirectUrl,
        });
      } else {
        setError({
          message: err instanceof Error ? err.message : "Failed to load crew members",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCrewData();
  }, [selectedEventId]);

  // Filtered members based on search (name or email)
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return teamMembers.filter((member) => {
      return (
        q === "" ||
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q)
      );
    });
  }, [teamMembers, searchQuery]);

  // Helper for initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CR";
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none pb-12">
      {/* 1. Header Section */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {selectedEvent && (
              <span className="font-mono text-xs font-bold text-[#FF6A00] bg-[#FFF4ED] border border-[#FFEDD5] px-2.5 py-0.5 rounded-md">
                {selectedEvent.code}
              </span>
            )}
            <span className="text-xs text-[#6B7280] font-medium">
              {selectedEvent ? `${selectedEvent.venue} · ${selectedEvent.room}` : "Festival Operations"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A0F1E]">
            {selectedEvent ? `${selectedEvent.name} — Crew` : "Festival Crew"}
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Event volunteer team, coordinators, and on-ground personnel directory
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <Button
            onClick={loadCrewData}
            variant="outline"
            disabled={isLoading}
            className="h-10 px-3.5 rounded-xl border-[#E5E7EB] text-[#4B5563] hover:text-[#0A0F1E] hover:bg-[#F9FAFB] text-xs font-medium flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Refresh Crew"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#FF6A00]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Total Count Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 h-10 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#0A0F1E] shadow-2xs">
            <Users className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>{teamMembers.length} Volunteers Total</span>
          </div>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search crew by name or email..."
          className="pl-10 h-11 bg-white border-[#E5E7EB] rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00] w-full"
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

      {/* 3. Error Alert */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-950">Unable to load crew members</h3>
            <p className="text-xs text-red-700 max-w-md">{error.message}</p>
          </div>
          <Button
            onClick={loadCrewData}
            className="mt-2 h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* 4. Loading State */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-[#E5E7EB]">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#6B7280]">Loading crew members...</span>
        </div>
      )}

      {/* 5. Crew Volunteers List Container */}
      {!isLoading && !error && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="px-6 py-3.5 bg-[#F8F9FA] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] tracking-wide flex items-center justify-between">
            <span>CREW / VOLUNTEER NAME</span>
            <span className="hidden sm:inline">ROLE & STATUS</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E5E7EB]">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="px-5 md:px-6 py-4 flex items-center justify-between gap-3.5 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full border border-[#D1D5DB] bg-[#FFF4ED] text-[#FF6A00] flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                      {getInitials(member.name)}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-sm font-bold text-[#0A0F1E] truncate block">
                        {member.name}
                      </span>
                      {member.email && (
                        <span className="text-xs text-[#6B7280] flex items-center gap-1 truncate mt-0.5 font-medium">
                          <Mail className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">
                      <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                      Active Crew
                    </span>
                  </div>
                </div>
              ))
            ) : teamMembers.length === 0 ? (
              /* Completely Empty State */
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#FFF4ED] border border-[#FFEDD5] flex items-center justify-center text-[#FF6A00] mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0A0F1E]">
                  No crew members assigned yet
                </h3>
                <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                  There are currently no volunteer crew members registered for this event.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCrewData}
                  className="mt-4 rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </Button>
              </div>
            ) : (
              /* No Search Match State */
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0A0F1E]">
                  No crew members match your search
                </h3>
                <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                  We couldn&apos;t find anyone matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-xl text-xs cursor-pointer"
                >
                  Reset Search
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
