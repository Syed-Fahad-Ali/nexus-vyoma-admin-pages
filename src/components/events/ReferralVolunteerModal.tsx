"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReferralVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralVolunteerModal({
  isOpen,
  onClose,
}: ReferralVolunteerModalProps) {
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [referral1, setReferral1] = useState("");
  const [referral2, setReferral2] = useState("");
  const [referral3, setReferral3] = useState("");

  const [isChecking, setIsChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setError(null);
    setIsChecking(false);
    onClose();
  };

  const handleReset = () => {
    setVolunteerEmail("");
    setReferral1("");
    setReferral2("");
    setReferral3("");
    setError(null);
    setIsChecking(false);
    setIsSuccess(false);
  };

  const fillSampleData = () => {
    setVolunteerEmail("imran.s@islec.edu.in");
    setReferral1("arbaaz.m@islec.edu.in");
    setReferral2("sneha.reddy@cbit.ac.in");
    setReferral3("rehan.ahmed@mjcet.ac.in");
    setError(null);
  };

  const validateEmail = (email: string) => {
    return email.trim().includes("@") && email.trim().includes(".");
  };

  const handleCheckReferrals = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const vEmail = volunteerEmail.trim().toLowerCase();
    const r1 = referral1.trim().toLowerCase();
    const r2 = referral2.trim().toLowerCase();
    const r3 = referral3.trim().toLowerCase();

    if (!vEmail) {
      setError("Please enter the volunteer's email address.");
      return;
    }
    if (!validateEmail(vEmail)) {
      setError("Please enter a valid email for the volunteer.");
      return;
    }

    if (!r1 || !r2 || !r3) {
      setError("All 3 referral emails are required to verify the milestone.");
      return;
    }

    if (!validateEmail(r1) || !validateEmail(r2) || !validateEmail(r3)) {
      setError("One or more referral email addresses are invalid.");
      return;
    }

    // Check duplicates
    const referrals = [r1, r2, r3];
    if (referrals.includes(vEmail)) {
      setError("Referral email cannot be the same as the volunteer's own email.");
      return;
    }

    const uniqueReferrals = new Set(referrals);
    if (uniqueReferrals.size !== 3) {
      setError("All 3 referral emails must be distinct attendees.");
      return;
    }

    setIsChecking(true);

    // Simulate verification
    setTimeout(() => {
      setIsChecking(false);
      setIsSuccess(true);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-modal-title"
      >
        {/* ======================================================== */}
        {/* 1. HEADER                                                */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center text-[#FF6A00] shadow-2xs shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="referral-modal-title"
                className="text-base sm:text-lg font-extrabold text-[#0A0F1E] tracking-tight truncate"
              >
                Referral Volunteer
              </h2>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5 truncate">
                Verify volunteer referral milestone with 3 referred emails
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. BODY CONTENT                                          */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* SUCCESS VIEW */}
          {isSuccess ? (
            <div className="flex flex-col gap-4 animate-in fade-in zoom-in-98 duration-150">
              {/* Celebratory Banner */}
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#14532D]">
                      Referral Milestone Verified!
                    </h3>
                    <p className="text-xs text-[#15803D]">
                      All 3 referred attendee accounts are valid and ticket-confirmed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Volunteer Summary Card */}
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                    Volunteer Account
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#16A34A]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Eligible for Milestone</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#0A0F1E]">
                  <Mail className="w-4 h-4 text-[#FF6A00]" />
                  <span>{volunteerEmail}</span>
                </div>
              </div>

              {/* 3 Verified Referral Cards */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#374151]">
                  <span>Verified Referred Attendees (3/3)</span>
                  <span className="text-[#16A34A] font-bold">100% Validated</span>
                </div>

                {[referral1, referral2, referral3].map((email, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-medium text-[#0A0F1E] truncate">
                        {email}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] shrink-0 bg-[#F0FDF4] px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                      <span>Paid Ticket</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 h-9 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Check Another</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-9 rounded-xl bg-[#0A0F1E] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleCheckReferrals} className="flex flex-col gap-4">
              {/* Helper Bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#374151]">
                  Enter volunteer &amp; referral emails
                </span>
                <button
                  type="button"
                  onClick={fillSampleData}
                  className="text-xs text-[#FF6A00] hover:text-[#E55F00] font-semibold underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fill Sample Data</span>
                </button>
              </div>

              {/* Volunteer Email Input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="volunteer-email-input"
                  className="text-xs font-bold text-[#0A0F1E] flex items-center justify-between"
                >
                  <span>Volunteer Email</span>
                  <span className="text-[11px] font-normal text-[#6B7280]">
                    Duty coordinator / student volunteer
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <Input
                    id="volunteer-email-input"
                    type="email"
                    placeholder="e.g. volunteer@islec.edu.in"
                    value={volunteerEmail}
                    onChange={(e) => {
                      setVolunteerEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="pl-9 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                    autoFocus
                  />
                </div>
              </div>

              {/* 3 Referral Emails Section */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0A0F1E] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>3 Referral Emails</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                    Required for milestone
                  </span>
                </div>

                {/* Referral 1 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#4B5563]">
                    Referral #1
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                    <Input
                      type="email"
                      placeholder="attendee.one@example.com"
                      value={referral1}
                      onChange={(e) => {
                        setReferral1(e.target.value);
                        if (error) setError(null);
                      }}
                      className="pl-8.5 h-9 bg-white border-[#E5E7EB] rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                    />
                  </div>
                </div>

                {/* Referral 2 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#4B5563]">
                    Referral #2
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                    <Input
                      type="email"
                      placeholder="attendee.two@example.com"
                      value={referral2}
                      onChange={(e) => {
                        setReferral2(e.target.value);
                        if (error) setError(null);
                      }}
                      className="pl-8.5 h-9 bg-white border-[#E5E7EB] rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                    />
                  </div>
                </div>

                {/* Referral 3 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#4B5563]">
                    Referral #3
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                    <Input
                      type="email"
                      placeholder="attendee.three@example.com"
                      value={referral3}
                      onChange={(e) => {
                        setReferral3(e.target.value);
                        if (error) setError(null);
                      }}
                      className="pl-8.5 h-9 bg-white border-[#E5E7EB] rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#B91C1C] flex items-center gap-2 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Check Referrals Submit Button */}
              <Button
                type="submit"
                disabled={isChecking}
                className="w-full h-10 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-semibold text-xs cursor-pointer shadow-sm transition-all"
              >
                {isChecking ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking Referrals...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Check Referrals</span>
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. FOOTER                                                */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-[#6B7280] hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded border border-[#D1D5DB] bg-white font-mono text-[10px]">Esc</kbd> to close
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto h-9 px-5 rounded-xl text-xs font-semibold cursor-pointer ml-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

