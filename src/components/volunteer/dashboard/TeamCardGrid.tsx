"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { FestivalSquad } from "@/services/types/volunteer";
import TeamDetailsModal from "./TeamDetailsModal";

interface TeamCardGridProps {
  squads: FestivalSquad[];
  eventName: string;
}

export default function TeamCardGrid({ squads, eventName }: TeamCardGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "CHECKED_IN" | "PENDING">("ALL");
  const [selectedSquad, setSelectedSquad] = useState<FestivalSquad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter squads based on search query and status filter
  const filteredSquads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return squads.filter((squad) => {
      const checkedInMembersCount = squad.members.filter((m) => m.isCheckedIn).length;
      const isFullyCheckedIn = checkedInMembersCount === squad.members.length;

      let matchesFilter = true;
      if (filter === "CHECKED_IN") matchesFilter = isFullyCheckedIn;
      else if (filter === "PENDING") matchesFilter = !isFullyCheckedIn;

      const matchesSearch =
        q === "" ||
        squad.teamName.toLowerCase().includes(q) ||
        squad.leader.name.toLowerCase().includes(q) ||
        squad.members.some((m) => m.name.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [squads, searchQuery, filter]);

  const handleCardClick = (squad: FestivalSquad) => {
    setSelectedSquad(squad);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Controls: Search + Filter Pills */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF6A00]" />
            <h3 className="text-base font-bold text-[#0A0F1E]">
              Registered Teams
            </h3>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Showing teams registered for {eventName} ({squads.length} total)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, leader or member"
              className="pl-9 h-10 rounded-xl text-xs bg-[#F9FAFB] border-[#E5E7EB]"
            />
          </div>

          {/* Filter Segmented Control */}
          <div className="inline-flex rounded-xl bg-[#F3F4F6] p-1 border border-[#E5E7EB] text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "ALL"
                  ? "bg-white text-[#0A0F1E] shadow-2xs font-semibold"
                  : "text-[#6B7280] hover:text-[#0A0F1E]"
              }`}
            >
              All ({squads.length})
            </button>
            <button
              onClick={() => setFilter("CHECKED_IN")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "CHECKED_IN"
                  ? "bg-white text-[#16A34A] shadow-2xs font-semibold"
                  : "text-[#6B7280] hover:text-[#0A0F1E]"
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "PENDING"
                  ? "bg-white text-[#D97706] shadow-2xs font-semibold"
                  : "text-[#6B7280] hover:text-[#0A0F1E]"
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Squad Cards Grid */}
      {filteredSquads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredSquads.map((squad) => {
            const checkedInMembers = squad.members.filter((m) => m.isCheckedIn).length;
            const isFull = checkedInMembers === squad.members.length;

            return (
              <div
                key={squad.id}
                onClick={() => handleCardClick(squad)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(squad);
                  }
                }}
                className="group relative rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs hover:border-[#FF6A00]/60 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]"
              >
                <div>
                  {/* Top Row: Check-in Badge Only (No Squad ID) */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#6B7280]">
                      Team
                    </span>

                    {/* Check-in Progress Badge */}
                    {isFull ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                        <span>All Checked In</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-[#D97706]" />
                        <span>
                          {checkedInMembers}/{squad.teamSize} Checked In
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Team Name */}
                  <h4 className="text-base font-bold text-[#0A0F1E] group-hover:text-[#FF6A00] transition-colors truncate">
                    {squad.teamName}
                  </h4>

                  {/* Team Leader Name Only (No Subtitles/Emails) */}
                  <div className="mt-3.5 pt-3 border-t border-[#F1F5F9]">
                    <div className="flex items-center gap-1.5 text-xs text-[#0A0F1E]">
                      <Shield className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                      <span className="font-semibold truncate">{squad.leader.name}</span>
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-[#4B5563] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        Team Size:
                      </span>
                      <span className="font-bold text-[#0A0F1E]">
                        {squad.teamSize} Members
                      </span>
                    </div>

                    {/* Member Name Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {squad.members.map((member, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${
                            member.isCheckedIn
                              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"
                              : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.isCheckedIn ? "bg-[#16A34A]" : "bg-[#D1D5DB]"
                            }`}
                          />
                          <span className="truncate max-w-[110px]">{member.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Hint */}
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#FF6A00] font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 text-[#FF6A00]" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-xs text-[#6B7280]">
          No teams found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      )}

      {/* Team Details Popup / Modal */}
      <TeamDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        squad={selectedSquad}
      />
    </div>
  );
}
