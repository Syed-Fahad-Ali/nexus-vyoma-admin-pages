"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  UserX,
  UserCheck,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActionType = "ban" | "unban";

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageUsersModal({
  isOpen,
  onClose,
}: ManageUsersModalProps) {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Close modal on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setSelectedAction(null);
    setEmailInput("");
    setStatus("idle");
    setFeedbackMessage("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSelectMode = (action: ActionType) => {
    setSelectedAction(action);
    setStatus("idle");
    setFeedbackMessage("");
  };

  const handleBack = () => {
    setSelectedAction(null);
    setStatus("idle");
    setFeedbackMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      setFeedbackMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setFeedbackMessage("");

    try {
      const response = await fetch("/api/manage-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: trimmed,
          banBody: selectedAction,
        }),
      });

      const result = await response.json().catch(() => null);

      if (result?.redirect && result?.redirectUrl) {
        router.replace(result.redirectUrl);
        return;
      }

      if (!response.ok || !result || result.error) {
        let msg = result?.message || result?.error || "Failed to update user status.";
        if (result?.error === "SENDER_NOT_FOUND") {
          if (
            typeof result?.message === "string" &&
            result.message.toLowerCase().includes("paid ticket")
          ) {
            msg = `No paid festival ticket found for "${trimmed}".`;
          } else {
            msg = `User with email "${trimmed}" was not found in registration database.`;
          }
        } else if (result?.error === "NOT_ADMIN") {
          msg = "You do not have administrative privileges to manage attendees.";
        }
        setStatus("error");
        setFeedbackMessage(msg);
        return;
      }

      setStatus("success");
      setFeedbackMessage(
        result.message ||
          `User "${trimmed}" has been successfully ${
            selectedAction === "ban" ? "banned" : "unbanned"
          }.`
      );
    } catch (err) {
      console.error("Manage user API error:", err);
      setStatus("error");
      setFeedbackMessage(
        err instanceof Error
          ? err.message
          : "An unexpected network error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-users-title"
      >
        {/* ======================================================== */}
        {/* 1. MODAL HEADER                                          */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {selectedAction && (
              <button
                type="button"
                onClick={handleBack}
                className="w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-black/5 transition-colors cursor-pointer"
                title="Back to options"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#0A0F1E] shrink-0 shadow-2xs">
              <Shield className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="min-w-0">
              <h3
                id="manage-users-title"
                className="text-base font-bold text-[#0A0F1E] truncate"
              >
                Manage Users
              </h3>
              <p className="text-xs text-[#6B7280] truncate">
                {selectedAction === "ban"
                  ? "Restrict and ban an attendee from entry"
                  : selectedAction === "unban"
                  ? "Restore festival access and unban attendee"
                  : "Choose an action to manage attendee access"}
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
        {/* 2. MODAL BODY                                            */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* VIEW A: CHOOSE BAN OR UNBAN */}
          {!selectedAction && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-[#6B7280]">
                Select an operation to perform on a registered attendee:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Option 1: Ban User */}
                <button
                  type="button"
                  onClick={() => handleSelectMode("ban")}
                  className="group p-4 rounded-xl border border-[#FECDD3] bg-[#FFF1F2]/40 hover:bg-[#FFF1F2] hover:border-[#F43F5E] transition-all text-left flex flex-col gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#FECDD3] flex items-center justify-center text-[#E11D48] shadow-2xs group-hover:scale-105 transition-transform">
                    <UserX className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#9F1239] group-hover:text-[#881337]">
                      Ban User
                    </h4>
                    <p className="text-[11px] text-[#BE123C]/80 mt-0.5 leading-snug">
                      Block festival check-in and revoke entry pass
                    </p>
                  </div>
                </button>

                {/* Option 2: Unban User */}
                <button
                  type="button"
                  onClick={() => handleSelectMode("unban")}
                  className="group p-4 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/50 hover:bg-[#ECFDF5] hover:border-[#10B981] transition-all text-left flex flex-col gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#A7F3D0] flex items-center justify-center text-[#059669] shadow-2xs group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#065F46] group-hover:text-[#064E3B]">
                      Unban User
                    </h4>
                    <p className="text-[11px] text-[#047857]/80 mt-0.5 leading-snug">
                      Restore festival ticket validity and check-in rights
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* VIEW B: INPUT EMAIL AND CONFIRM BAN / UNBAN */}
          {selectedAction && (
            <div className="flex flex-col gap-4">
              {/* Mode indicator pill */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedAction === "ban"
                      ? "bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48]"
                      : "bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]"
                  }`}
                >
                  {selectedAction === "ban" ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Mode: Ban User</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Mode: Unban User</span>
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedAction(selectedAction === "ban" ? "unban" : "ban")
                  }
                  className="text-xs text-[#6B7280] hover:text-[#0A0F1E] underline cursor-pointer font-medium"
                >
                  Switch to {selectedAction === "ban" ? "Unban" : "Ban"}
                </button>
              </div>

              {/* Success Feedback View */}
              {status === "success" ? (
                <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#14532D]">
                        Action Completed
                      </h4>
                      <p className="text-xs text-[#15803D] mt-0.5">
                        {feedbackMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setEmailInput("");
                        setStatus("idle");
                        setFeedbackMessage("");
                      }}
                      className="h-8 px-3 rounded-lg bg-white hover:bg-[#F9FAFB] border border-[#BBF7D0] text-[#14532D] font-semibold text-xs cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      <span>{selectedAction === "ban" ? "Ban Another" : "Unban Another"}</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleClose}
                      className="h-8 px-3 rounded-lg text-xs cursor-pointer"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form Input View */
                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="user-email-input"
                      className="text-xs font-semibold text-[#0A0F1E] flex items-center justify-between"
                    >
                      <span>Attendee Email</span>
                      <span className="text-[11px] text-[#6B7280] font-normal">
                        Registered college/personal email
                      </span>
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <Input
                        id="user-email-input"
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        placeholder="attendee@example.com"
                        disabled={isSubmitting}
                        className="pl-9 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Error Alert */}
                  {status === "error" && (
                    <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#B91C1C] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#E11D48] shrink-0" />
                      <span>{feedbackMessage}</span>
                    </div>
                  )}

                  {/* Warning description for Ban */}
                  {selectedAction === "ban" && (
                    <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                      <span>
                        Banning will immediately disable this attendee&apos;s digital entry pass and block volunteer QR check-in desks.
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !emailInput.trim()}
                    className={`w-full h-10 rounded-xl font-semibold text-xs cursor-pointer shadow-sm transition-all ${
                      selectedAction === "ban"
                        ? "bg-[#E11D48] hover:bg-[#BE123C] text-white disabled:bg-[#FDA4AF]"
                        : "bg-[#059669] hover:bg-[#047857] text-white disabled:bg-[#A7F3D0]"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>
                          {selectedAction === "ban"
                            ? "Banning user..."
                            : "Unbanning user..."}
                        </span>
                      </span>
                    ) : selectedAction === "ban" ? (
                      <span className="flex items-center gap-1.5">
                        <UserX className="w-4 h-4" />
                        <span>Ban User</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        <span>Unban User</span>
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. MODAL FOOTER                                          */}
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

