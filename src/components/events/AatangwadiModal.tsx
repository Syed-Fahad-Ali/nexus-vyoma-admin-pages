"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Mail,
  Phone,
  Building,
  GraduationCap,
  AlertCircle,
  Copy,
  Check,
  CheckCircle2,
  Users,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface UnenrolledPaidUser {
  id: string;
  name: string;
  email: string;
  phoneno: string;
  institution: string;
  degree: string;
  year: string;
  ticketId?: string;
  amountPaid?: string;
  isPaid?: boolean;
}

interface RegisterUserApiItem {
  _id: string;
  full_name: string;
  email: string;
  phone_number: string;
  city?: string;
  state?: string;
  institution: string;
  year_of_study: string;
  degree: string;
  is_verified?: boolean;
}

interface AatangwadiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AatangwadiModal({ isOpen, onClose }: AatangwadiModalProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UnenrolledPaidUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch users from /api/aatangwadi
  const fetchUnenrolledUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/aatangwadi", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const result = await response.json().catch(() => null);

      // If backend returns redirect for unauthorized or unassigned session
      if (result?.redirect && result?.redirectUrl && result?.error !== "No user data found") {
        router.replace(result.redirectUrl);
        return;
      }

      // If status is 403 with "No user data found", entryTickets was empty (0 users found)
      if (response.status === 403 && result?.message === "No user data found") {
        setUsers([]);
        return;
      }

      if (!response.ok || !result || result.error) {
        throw new Error(result?.message || result?.error || "Failed to fetch unenrolled paid attendees.");
      }

      const rawUsers: RegisterUserApiItem[] = result.data?.users || [];
      const mappedUsers: UnenrolledPaidUser[] = rawUsers.map((u) => ({
        id: u._id,
        name: u.full_name || "Unknown",
        email: u.email || "",
        phoneno: u.phone_number || "",
        institution: u.institution || "Institution N/A",
        degree: u.degree || "Degree N/A",
        year: u.year_of_study || "",
        ticketId: u._id,
        isPaid: true,
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching Aatangwadi users:", err);
      setError(err instanceof Error ? err.message : "Failed to load unenrolled attendees.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Fetch whenever modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUnenrolledUsers();
    } else {
      setSearchQuery("");
      setError(null);
    }
  }, [isOpen, fetchUnenrolledUsers]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      return (
        q === "" ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phoneno.toLowerCase().includes(q) ||
        u.institution.toLowerCase().includes(q) ||
        u.degree.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery]);

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "AT"
    );
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        className="w-full max-w-2xl h-[600px] max-h-[90vh] bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aatangwadi-modal-title"
      >
        {/* ======================================================== */}
        {/* 1. MODAL HEADER                                          */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#FFF1F2]/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="aatangwadi-modal-title"
                className="text-base sm:text-lg font-extrabold text-[#0A0F1E] tracking-tight"
              >
                Aatangwadi
              </h2>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5 truncate">
                users who does not enroll any event but paid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchUnenrolledUsers()}
              disabled={isLoading}
              title="Refresh list"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#E11D48]" : ""}`} />
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#0A0F1E] shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>{isLoading ? "Loading..." : `${filteredUsers.length} Users`}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SEARCH BAR                                            */}
        {/* ======================================================== */}
        <div className="p-3 sm:px-5 sm:py-3 border-b border-[#E5E7EB] bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or institution..."
              className="pl-9 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-[#E11D48]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. USER CARDS DIRECTORY LIST (SCROLLABLE)                */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-[#E11D48] animate-spin" />
              <p className="text-xs text-[#6B7280] font-medium">
                Fetching paid attendees without event enrollments...
              </p>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECDD3] flex items-center justify-center text-[#E11D48]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#0A0F1E]">Unable to load attendees</h4>
              <p className="text-xs text-[#6B7280] max-w-sm">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchUnenrolledUsers()}
                className="mt-2 text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </Button>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#E11D48]/40 hover:shadow-xs transition-all flex flex-col gap-3"
              >
                {/* Top Row: Avatar, Name, Email, Phone */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full border border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[#0A0F1E] truncate">
                      {user.name}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-medium truncate">
                        <Mail className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(user.email, `${user.id}-email`)}
                        className="text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer"
                        title="Copy email"
                      >
                        {copiedKey === `${user.id}-email` ? (
                          <Check className="w-3 h-3 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                        <span>{user.phoneno}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(user.phoneno, `${user.id}-phone`)}
                        className="text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer"
                        title="Copy phone number"
                      >
                        {copiedKey === `${user.id}-phone` ? (
                          <Check className="w-3 h-3 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Institution & (below this) Degree and Year */}
                <div className="pt-2.5 border-t border-[#F3F4F6] flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[#0A0F1E] font-semibold">
                    <Building className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                    <span>{user.institution}</span>
                  </div>

                  {/* Below Institution: Degree and Year */}
                  <div className="flex items-center gap-1.5 text-[#6B7280] pl-5 font-medium flex-wrap">
                    <GraduationCap className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                    <span>{user.degree}</span>
                    <span>·</span>
                    <span className="text-[#0A0F1E] font-semibold">{user.year}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                {searchQuery ? <Users className="w-5 h-5 text-[#9CA3AF]" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <h3 className="text-sm font-bold text-[#0A0F1E]">
                {searchQuery ? "No users found" : "No unenrolled attendees"}
              </h3>
              <p className="text-xs text-[#6B7280] max-w-sm">
                {searchQuery
                  ? `No attendees match your query "${searchQuery}".`
                  : "All paid ticket holders are currently registered for at least one festival event."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs rounded-xl cursor-pointer"
                >
                  Clear Search
                </Button>
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
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

