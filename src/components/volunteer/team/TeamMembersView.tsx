"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  INITIAL_TEAM_MEMBERS,
  type TeamMember,
} from "@/lib/dummy-team-data";

export default function TeamMembersView() {
  const [teamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered members based on search
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      return (
        searchQuery.trim() === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [teamMembers, searchQuery]);

  // Helper for initials
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
            Crew
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Festival volunteer crew and on-ground personnel directory
          </p>
        </div>

        {/* Total Count Pill */}
        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-xs font-semibold text-[#0A0F1E] shadow-2xs">
          <Users className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>{teamMembers.length} Volunteers Total</span>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search crew by name..."
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

      {/* 3. Crew Volunteers List Container (Names Only) */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="px-6 py-3.5 bg-[#F8F9FA] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] tracking-wide">
          CREW / VOLUNTEER NAME
        </div>

        {/* Rows: Names Only */}
        <div className="divide-y divide-[#E5E7EB]">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="px-5 md:px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="w-9 h-9 rounded-full border border-[#D1D5DB] bg-[#F3F4F6] flex items-center justify-center shrink-0 font-bold text-xs text-[#0A0F1E]">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[#0A0F1E] truncate block">
                    {member.name}
                  </span>
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
                No crew members found
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                No volunteers match your search.
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
    </div>
  );
}
