"use client";

import React, { useEffect } from "react";
import { X, Users, Mail, Phone, Hash, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { FestivalSquad } from "@/services/types/volunteer";

interface TeamDetailsModalProps {
  squad: FestivalSquad | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamDetailsModal({
  squad,
  isOpen,
  onClose,
}: TeamDetailsModalProps) {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !squad) return null;

  const checkedInCount = squad.members.filter((m) => m.isCheckedIn).length;
  const isFullyCheckedIn = checkedInCount === squad.members.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      {/* Modal Container */}
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#FF6A00] bg-[#FFF4ED] border border-[#FFEDD5] px-2 py-0.5 rounded-md">
                {squad.teamNumber}
              </span>
              {squad.track && (
                <span className="text-[11px] font-medium text-[#4B5563] bg-[#E5E7EB]/60 px-2 py-0.5 rounded-md truncate">
                  {squad.track}
                </span>
              )}
            </div>
            <h2
              id="team-modal-title"
              className="text-lg sm:text-xl font-extrabold text-[#0A0F1E] mt-1.5 truncate"
            >
              {squad.teamName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-[#E5E7EB] transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Team Leader Details Box */}
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FF6A00] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" />
                Team Leader
              </span>
              <span className="text-[11px] text-[#6B7280]">Primary Contact</span>
            </div>

            <div className="mt-2.5">
              <h3 className="text-sm sm:text-base font-bold text-[#0A0F1E]">
                {squad.leader.name}
              </h3>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Email */}
                <a
                  href={`mailto:${squad.leader.email}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#0A0F1E] transition-colors truncate border border-[#E5E7EB]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  <span className="truncate">{squad.leader.email}</span>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${squad.leader.phone}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#0A0F1E] transition-colors truncate border border-[#E5E7EB]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span className="truncate font-mono">{squad.leader.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Team Roster / Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0A0F1E] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#4B5563]" />
                Complete Team Members ({squad.members.length})
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isFullyCheckedIn
                    ? "bg-[#DCFCE7] text-[#16A34A]"
                    : "bg-[#FEF3C7] text-[#D97706]"
                }`}
              >
                {checkedInCount} / {squad.members.length} Checked-in
              </span>
            </div>

            <div className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
              {squad.members.map((member, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#F3F4F6] border border-[#D1D5DB] flex items-center justify-center font-bold text-xs text-[#0A0F1E] shrink-0">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-[#0A0F1E] truncate">
                          {member.name}
                        </span>
                        {member.role === "Leader" && (
                          <span className="text-[10px] font-bold text-[#FF6A00] bg-[#FFF4ED] px-1.5 py-0.2 rounded border border-[#FFEDD5]">
                            Leader
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B7280] font-mono mt-0.5 truncate">
                        <span>{member.phone}</span>
                        <span>·</span>
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Member Gate Verification Status */}
                  <div className="self-end sm:self-auto shrink-0">
                    {member.isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                        <span>Checked-in{member.checkedInAt ? ` · ${member.checkedInAt}` : ""}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-[#9CA3AF]" />
                        <span>Awaiting QR Scan</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Footer Note */}
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[11px] text-[#6B7280] flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
            <span>
              Squad registration is synchronized live. Ticket barcodes must be scanned individually at the gate entrance.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

