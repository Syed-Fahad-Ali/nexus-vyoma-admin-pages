"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  Tag,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ScannedAttendeeData {
  userId: string;
  userEmail: string;
  // Tab 1: RegisterUser Schema fields
  user: {
    full_name: string;
    email: string;
    phone_number: string;
    city: string;
    state: string;
    institution: string;
    year_of_study: string;
    degree: string;
    is_verified: boolean;
    createdAt?: string;
  };
  // Tab 2: Enrolled Events
  enrolledEvents: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    participationType: "individual" | "team";
    date: string;
    venue: string;
    isPaid: boolean;
    teamName?: string;
    isLeader?: boolean;
    teamLength?: number;
  }>;
  // Tab 3: Checked-in Events
  checkedInEvents: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    checkedInAt: string;
    gateOrRoom: string;
    volunteerName: string;
  }>;
}

interface ScannedUserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: ScannedAttendeeData | null;
}

export default function ScannedUserDetailsModal({
  isOpen,
  onClose,
  attendee,
}: ScannedUserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"user" | "enrolled" | "checked_in">("user");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !attendee) return null;

  const copyText = (text: string, fieldName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AT";
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        className="w-full max-w-2xl h-[580px] max-h-[90vh] bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanned-user-modal-title"
      >
        {/* ======================================================== */}
        {/* 1. MODAL HEADER                                          */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full border border-[#FFEDD5] bg-[#FFF4ED] text-[#FF6A00] flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs">
              {getInitials(attendee.user.full_name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="scanned-user-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[#0A0F1E] truncate"
                >
                  {attendee.user.full_name}
                </h2>
                {attendee.user.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">
                    <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                    Verified Attendee
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] truncate mt-0.5 font-medium">
                {attendee.user.email} · ID: {attendee.userId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. TAB NAVIGATION                                        */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 pt-2 border-b border-[#E5E7EB] bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("user")}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "user"
                ? "border-[#FF6A00] text-[#FF6A00]"
                : "border-transparent text-[#6B7280] hover:text-[#0A0F1E]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. User Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("enrolled")}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "enrolled"
                ? "border-[#FF6A00] text-[#FF6A00]"
                : "border-transparent text-[#6B7280] hover:text-[#0A0F1E]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Enrolled Events</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#F3F4F6] text-[10px] font-bold text-[#4B5563]">
              {attendee.enrolledEvents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("checked_in")}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "checked_in"
                ? "border-[#FF6A00] text-[#FF6A00]"
                : "border-transparent text-[#6B7280] hover:text-[#0A0F1E]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Checked-in Events</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#F0FDF4] text-[10px] font-bold text-[#15803D]">
              {attendee.checkedInEvents.length}
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 3. TAB PANELS CONTENT                                    */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* ---------------------------------------------------- */}
          {/* TAB 1: User Details (RegisterUser Schema)            */}
          {/* ---------------------------------------------------- */}
          {activeTab === "user" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              {/* Personal Section */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4 flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Personal & Contact Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Full Name</span>
                    <span className="font-semibold text-[#0A0F1E]">{attendee.user.full_name}</span>
                  </div>

                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Email Address</span>
                    <div className="flex items-center gap-1.5 font-semibold text-[#0A0F1E] truncate">
                      <Mail className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span className="truncate">{attendee.user.email}</span>
                      <button
                        type="button"
                        onClick={() => copyText(attendee.user.email, "email")}
                        className="text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer"
                        title="Copy email"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-3 h-3 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Phone Number</span>
                    <div className="flex items-center gap-1.5 font-semibold text-[#0A0F1E]">
                      <Phone className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span>{attendee.user.phone_number}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Location</span>
                    <div className="flex items-center gap-1.5 font-semibold text-[#0A0F1E]">
                      <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span>{attendee.user.city}, {attendee.user.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic & Professional Section */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4 flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Academic & Institution Profile
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-[#6B7280] block text-[11px]">College / Institution</span>
                    <div className="flex items-center gap-1.5 font-semibold text-[#0A0F1E]">
                      <Building className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span>{attendee.user.institution}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Degree / Program</span>
                    <div className="flex items-center gap-1.5 font-semibold text-[#0A0F1E]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span>{attendee.user.degree}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Year of Study</span>
                    <span className="font-semibold text-[#0A0F1E]">{attendee.user.year_of_study}</span>
                  </div>

                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Account Status</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A]">
                      <CheckCircle2 className="w-3 h-3" />
                      {attendee.user.is_verified ? "Verified Student" : "Pending Verification"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Registered On</span>
                    <span className="font-semibold text-[#0A0F1E]">
                      {attendee.user.createdAt || "08 Nov 2026"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 2: Enrolled Events                              */}
          {/* ---------------------------------------------------- */}
          {activeTab === "enrolled" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              {attendee.enrolledEvents.length > 0 ? (
                attendee.enrolledEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#FF6A00]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] font-bold text-[#FF6A00] bg-[#FFF4ED] border border-[#FFEDD5] px-2 py-0.5 rounded-md">
                          {evt.code}
                        </span>
                        <span className="text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
                          {evt.category}
                        </span>
                        <span className="text-[11px] font-medium text-[#6B7280]">
                          {evt.participationType === "team" ? "Team Format" : "Individual Format"}
                        </span>
                        {evt.teamName && (
                          <span className="text-[11px] font-semibold text-[#FF6A00] bg-[#FFF7ED] px-2 py-0.5 rounded-md border border-[#FFEDD5]">
                            Squad: {evt.teamName} {evt.isLeader ? "(Leader)" : ""}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#0A0F1E] truncate">{evt.name}</h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {evt.venue} · {evt.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">
                        <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                        {evt.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  No enrolled events registered for this attendee.
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 3: Checked-in Events                            */}
          {/* ---------------------------------------------------- */}
          {activeTab === "checked_in" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              {attendee.checkedInEvents.length > 0 ? (
                attendee.checkedInEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] font-bold text-[#15803D] bg-white border border-[#BBF7D0] px-2 py-0.5 rounded-md">
                          {evt.code}
                        </span>
                        <span className="text-[11px] font-semibold text-[#15803D] bg-white px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                          {evt.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0A0F1E] truncate">{evt.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#4B5563] mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-[#16A34A]" />
                          {evt.checkedInAt}
                        </span>
                        <span>·</span>
                        <span>{evt.gateOrRoom}</span>
                        <span>·</span>
                        <span className="text-[#6B7280]">Verified by {evt.volunteerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#15803D] text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Checked-In
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  This attendee has not checked in to any event sessions yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. MODAL FOOTER                                          */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-[#6B7280] hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded border border-[#D1D5DB] bg-white font-mono text-[10px]">Esc</kbd> to close
          </span>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto h-9 px-5 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white font-semibold text-xs cursor-pointer shadow-sm ml-auto"
          >
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}

