"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ticketId: string;
  amountPaid: string;
  isPaid: boolean;
}

// Realistic dummy data: paid festival ticket holders with 0 event enrollments
const INITIAL_UNENROLLED_PAID_USERS: UnenrolledPaidUser[] = [
  {
    id: "usr-aat-01",
    name: "Mohammed Arbaaz",
    email: "arbaaz.m@islec.edu.in",
    phoneno: "+91 98480 11928",
    institution: "ISL Engineering College",
    degree: "B.Tech in Artificial Intelligence & Data Science",
    year: "3rd Year",
    ticketId: "NV26-TCK-1092",
    amountPaid: "₹250",
    isPaid: true,
  },
  {
    id: "usr-aat-02",
    name: "Sneha Reddy",
    email: "sneha.reddy@cbit.ac.in",
    phoneno: "+91 98480 34821",
    institution: "Chaitanya Bharathi Institute of Technology",
    degree: "B.Tech in Information Technology",
    year: "4th Year",
    ticketId: "NV26-TCK-2044",
    amountPaid: "₹250",
    isPaid: true,
  },
  {
    id: "usr-aat-03",
    name: "Syed Rehan Ahmed",
    email: "rehan.ahmed@mjcet.ac.in",
    phoneno: "+91 98480 77102",
    institution: "Muffakham Jah College of Engineering & Tech",
    degree: "B.Tech in Computer Science & Engineering",
    year: "2nd Year",
    ticketId: "NV26-TCK-3190",
    amountPaid: "₹250",
    isPaid: true,
  },
  {
    id: "usr-aat-04",
    name: "Ananya Deshmukh",
    email: "ananya.d@vnr.ac.in",
    phoneno: "+91 98480 55673",
    institution: "VNR Vignana Jyothi Institute of Engineering",
    degree: "B.Tech in Electronics & Communication",
    year: "3rd Year",
    ticketId: "NV26-TCK-4421",
    amountPaid: "₹250",
    isPaid: true,
  },
  {
    id: "usr-aat-05",
    name: "Faisal Siddiqui",
    email: "faisal.s@islec.edu.in",
    phoneno: "+91 98480 99312",
    institution: "ISL Engineering College",
    degree: "B.Tech in Mechanical Engineering",
    year: "4th Year",
    ticketId: "NV26-TCK-5108",
    amountPaid: "₹250",
    isPaid: true,
  },
  {
    id: "usr-aat-06",
    name: "Rhea Kulkarni",
    email: "rhea.k@vasavi.ac.in",
    phoneno: "+91 98480 44219",
    institution: "Vasavi College of Engineering",
    degree: "B.Tech in Computer Science",
    year: "1st Year",
    ticketId: "NV26-TCK-6291",
    amountPaid: "₹250",
    isPaid: true,
  },
  {
    id: "usr-aat-07",
    name: "Karthik Varma",
    email: "karthik.v@griet.ac.in",
    phoneno: "+91 98480 88234",
    institution: "Gokaraju Rangaraju Institute of Engineering",
    degree: "B.Tech in Electrical & Electronics",
    year: "2nd Year",
    ticketId: "NV26-TCK-7330",
    amountPaid: "₹250",
    isPaid: true,
  },
  {
    id: "usr-aat-08",
    name: "Zainab Fatima",
    email: "zainab.f@islec.edu.in",
    phoneno: "+91 98480 66109",
    institution: "ISL Engineering College",
    degree: "B.Tech in Civil Engineering",
    year: "3rd Year",
    ticketId: "NV26-TCK-8419",
    amountPaid: "₹250",
    isPaid: true,
  },
];

interface AatangwadiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AatangwadiModal({ isOpen, onClose }: AatangwadiModalProps) {
  const [users] = useState<UnenrolledPaidUser[]>(INITIAL_UNENROLLED_PAID_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#0A0F1E] shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>{filteredUsers.length} Users</span>
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
          {filteredUsers.length > 0 ? (
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
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0A0F1E]">No users found</h3>
              <p className="text-xs text-[#6B7280] max-w-sm">
                No users match your query &ldquo;{searchQuery}&rdquo;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs rounded-xl cursor-pointer"
              >
                Clear Search
              </Button>
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

