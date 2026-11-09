"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Plus,
  Trash2,
  Mail,
  UserCheck,
  Check,
  Copy,
  Users,
  AlertCircle,
  Tag,
  Loader2,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FestivalVolunteer {
  id: string;
  name: string;
  email: string;
  events: string[];
}

export interface EventOption {
  id: string;
  title: string;
}

const DEFAULT_EVENT_OPTIONS: EventOption[] = [
  { id: "evt-01", title: "RoboWars Combat" },
  { id: "evt-02", title: "CodeSprint 2026" },
  { id: "evt-03", title: "HackNexus Hackathon" },
  { id: "evt-04", title: "CyberQuest CTF" },
  { id: "evt-05", title: "Line Follower Robot" },
  { id: "evt-06", title: "Aeromodelling Drone Prix" },
  { id: "evt-07", title: "WebCraft UI/UX" },
  { id: "evt-08", title: "Esports BGMI Championship" },
];

interface ManageVolunteersModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableEvents?: string[];
}

export default function ManageVolunteersModal({
  isOpen,
  onClose,
  availableEvents,
}: ManageVolunteersModalProps) {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<FestivalVolunteer[]>([]);
  const [eventsList, setEventsList] = useState<EventOption[]>(DEFAULT_EVENT_OPTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedVolunteers, setExpandedVolunteers] = useState<Set<string>>(new Set());

  const toggleVolunteerExpand = (id: string) => {
    setExpandedVolunteers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Loading & status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Add Volunteer form states
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Fetch volunteers and real events from /api/manage-volunteer
  const fetchVolunteersAndEvents = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/manage-volunteer", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const result = await res.json().catch(() => null);

      if (result?.redirect && result?.redirectUrl) {
        router.replace(result.redirectUrl);
        return;
      }

      // 404 NO_VOLUNTEER_DATA is an expected valid festival state (0 volunteers registered yet)
      if (res.status === 404 && result?.error === "NO_VOLUNTEER_DATA") {
        setVolunteers([]);
        return;
      }

      if (!res.ok || !result || result.error) {
        throw new Error(result?.message || result?.error || "Failed to load volunteers.");
      }

      const rawVolunteers = result.data?.volunteerData || [];
      const mappedVolunteers: FestivalVolunteer[] = rawVolunteers.map((v: any) => ({
        id: String(v._id),
        name: v.full_name || v.email,
        email: v.email,
        events: (v.event_id || []).map(
          (e: any) => e?.title || e?.name || "Assigned Track"
        ),
      }));
      setVolunteers(mappedVolunteers);

      if (Array.isArray(result.data?.events) && result.data.events.length > 0) {
        const mappedEvents: EventOption[] = result.data.events.map((e: any) => ({
          id: String(e._id),
          title: e.title || e.name || "Festival Track",
        }));
        setEventsList(mappedEvents);
      }
    } catch (err) {
      console.error("Failed to load volunteers:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to load volunteers.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Fetch whenever modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVolunteersAndEvents();
    } else {
      setIsAddFormOpen(false);
      setNewName("");
      setNewEmail("");
      setSelectedEventIds([]);
      setFormError(null);
      setFormSuccessMessage(null);
      setSuccessBanner(null);
      setSearchQuery("");
      setFetchError(null);
      setExpandedVolunteers(new Set());
    }
  }, [isOpen, fetchVolunteersAndEvents]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const copyEmail = (email: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
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
        .toUpperCase() || "VO"
    );
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
    if (formError) setFormError(null);
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedName) {
      setFormError("Please enter the volunteer's full name.");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (selectedEventIds.length === 0) {
      setFormError("Please assign at least one event to this volunteer.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/manage-volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: trimmedName,
          volunteerEmail: trimmedEmail,
          eventId: selectedEventIds.join(","),
        }),
      });

      const result = await res.json().catch(() => null);

      if (result?.redirect && result?.redirectUrl) {
        router.replace(result.redirectUrl);
        return;
      }

      if (!res.ok || !result || result.error) {
        let msg = result?.message || result?.error || "Failed to create new volunteer.";
        if (result?.error === "VOLUNTEER_EXISTS") {
          msg = "A volunteer with this email already exists.";
        } else if (result?.error === "NOT_ADMIN") {
          msg = "You do not have administrative privileges to add volunteers.";
        }
        setFormError(msg);
        return;
      }

      // Success: show message and clear all inputs
      setSuccessBanner("Added volunteer successfully");
      setFormSuccessMessage("Added volunteer successfully");
      setTimeout(() => {
        setSuccessBanner(null);
        setFormSuccessMessage(null);
      }, 4000);
      setNewName("");
      setNewEmail("");
      setSelectedEventIds([]);
      setFormError(null);

      // Refresh directory list
      await fetchVolunteersAndEvents();
    } catch (err) {
      console.error("Failed to add volunteer:", err);
      setFormError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/manage-volunteer", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: id }),
      });

      const result = await res.json().catch(() => null);

      if (result?.redirect && result?.redirectUrl) {
        router.replace(result.redirectUrl);
        return;
      }

      if (!res.ok || !result || result.error) {
        throw new Error(result?.message || result?.error || "Failed to delete volunteer.");
      }

      setSuccessBanner(result.message || "Volunteer removed successfully.");
      setTimeout(() => setSuccessBanner(null), 3500);
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Delete volunteer error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete volunteer.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVolunteers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return volunteers.filter((vol) => {
      if (!q) return true;
      const matchesName = vol.name.toLowerCase().includes(q);
      const matchesEmail = vol.email.toLowerCase().includes(q);
      const matchesEvent = vol.events.some((ev) => ev.toLowerCase().includes(q));
      return matchesName || matchesEmail || matchesEvent;
    });
  }, [volunteers, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        className="w-full max-w-2xl h-[620px] max-h-[90vh] bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-volunteers-title"
      >
        {/* ======================================================== */}
        {/* 1. HEADER                                                */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#FF6A00] shadow-2xs shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="manage-volunteers-title"
                className="text-base sm:text-lg font-extrabold text-[#0A0F1E] tracking-tight truncate"
              >
                Manage Volunteers
              </h2>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5 truncate">
                Directory and duty track assignments for coordinators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchVolunteersAndEvents()}
              disabled={isLoading}
              title="Refresh volunteer directory"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#FF6A00]" : ""}`} />
            </button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsAddFormOpen((prev) => !prev);
                setFormError(null);
              }}
              className={`h-8 px-3 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-all ${
                isAddFormOpen
                  ? "bg-[#0A0F1E] text-white"
                  : "bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#0A0F1E]"
              }`}
            >
              <Plus className={`w-3.5 h-3.5 mr-1 transition-transform ${isAddFormOpen ? "rotate-45" : ""}`} />
              <span>{isAddFormOpen ? "Close Form" : "Add Volunteer"}</span>
            </Button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#0A0F1E] shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>{isLoading ? "Loading..." : `${volunteers.length} Volunteers`}</span>
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

        {/* Success Alert Banner (e.g. after adding a volunteer) */}
        {successBanner && (
          <div className="p-3 bg-[#F0FDF4] border-b border-[#BBF7D0] text-xs text-[#15803D] flex items-center gap-2 animate-in fade-in duration-150 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. INLINE ADD VOLUNTEER FORM (COLLAPSIBLE)               */}
        {/* ======================================================== */}
        {isAddFormOpen && (
          <form
            onSubmit={handleAddVolunteer}
            className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F8FAFC] flex flex-col gap-3.5 animate-in slide-in-from-top-2 duration-150 shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0A0F1E] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Add Festival Volunteer</span>
              </span>
              <span className="text-[11px] text-[#6B7280]">
                Sends Clerk invitation &amp; assigns events
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#374151]">Full Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Zaid Khan"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  disabled={isSubmitting}
                  className="h-9 text-xs bg-white rounded-xl border-[#E5E7EB] focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#374151]">College Email</label>
                <Input
                  type="email"
                  placeholder="e.g. zaid.k@islec.edu.in"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value.toLowerCase());
                    if (formError) setFormError(null);
                  }}
                  disabled={isSubmitting}
                  className="h-9 text-xs bg-white rounded-xl border-[#E5E7EB] focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                />
              </div>
            </div>

            {/* Events Selection (Multi-select pills) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#374151]">
                  Assigned Events ({selectedEventIds.length} of {eventsList.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedEventIds.length === eventsList.length) {
                      setSelectedEventIds([]);
                    } else {
                      setSelectedEventIds(eventsList.map((e) => e.id));
                    }
                    if (formError) setFormError(null);
                  }}
                  className="text-[11px] text-[#FF6A00] hover:text-[#E55F00] font-semibold underline cursor-pointer"
                >
                  {selectedEventIds.length === eventsList.length
                    ? "Deselect All"
                    : "Select All Events"}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-white rounded-xl border border-[#E5E7EB]">
                {eventsList.map((event) => {
                  const isSelected = selectedEventIds.includes(event.id);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => toggleEventSelection(event.id)}
                      disabled={isSubmitting}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#FFF4ED] border-[#FF6A00] text-[#FF6A00] font-semibold shadow-2xs"
                          : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-[#FF6A00]" />}
                      <span>{event.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Success Alert */}
            {formSuccessMessage && (
              <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#15803D] flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-semibold">{formSuccessMessage}</span>
              </div>
            )}

            {/* Form Error Alert */}
            {formError && (
              <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#B91C1C] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddFormOpen(false);
                  setFormError(null);
                }}
                disabled={isSubmitting}
                className="h-8 px-3 text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 px-4 text-xs rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-semibold cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span>Save Volunteer</span>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 3. SEARCH BAR                                            */}
        {/* ======================================================== */}
        <div className="p-3 sm:px-5 sm:py-3 border-b border-[#E5E7EB] bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteers by name, email, or assigned event..."
              className="pl-9 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
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
        {/* 4. VOLUNTEER LIST (SCROLLABLE)                           */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
              <p className="text-xs text-[#6B7280] font-medium">
                Loading festival volunteer directory...
              </p>
            </div>
          ) : fetchError ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECDD3] flex items-center justify-center text-[#E11D48]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#0A0F1E]">Unable to load volunteers</h4>
              <p className="text-xs text-[#6B7280] max-w-sm">{fetchError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchVolunteersAndEvents()}
                className="mt-2 text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </Button>
            </div>
          ) : filteredVolunteers.length > 0 ? (
            filteredVolunteers.map((vol) => (
              <div
                key={vol.id}
                className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#FF6A00]/40 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                {/* Volunteer Details: Avatar, Name, Email, Events */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full border border-[#FED7AA] bg-[#FFF7ED] text-[#FF6A00] flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs mt-0.5">
                    {getInitials(vol.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0A0F1E] truncate">
                        {vol.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563] shrink-0">
                        {vol.events.length} {vol.events.length === 1 ? "Event" : "Events"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-0.5 flex-wrap">
                      <Mail className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                      <span className="truncate">{vol.email}</span>
                      <button
                        type="button"
                        onClick={() => copyEmail(vol.email, vol.id)}
                        className="text-[#9CA3AF] hover:text-[#0A0F1E] cursor-pointer ml-0.5"
                        title="Copy email"
                      >
                        {copiedId === vol.id ? (
                          <Check className="w-3 h-3 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Assigned Events Badges (Truncate to 5 if > 5 with expand/collapse arrow toggle) */}
                    {(() => {
                      const isOverLimit = vol.events.length > 5;
                      const isExpanded = expandedVolunteers.has(vol.id);
                      const displayedEvents =
                        isOverLimit && !isExpanded ? vol.events.slice(0, 5) : vol.events;

                      return (
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                          {displayedEvents.map((eventName) => (
                            <span
                              key={eventName}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-medium text-[#334155]"
                            >
                              <Tag className="w-2.5 h-2.5 text-[#FF6A00]" />
                              <span>{eventName}</span>
                            </span>
                          ))}

                          {isOverLimit && (
                            <button
                              type="button"
                              onClick={() => toggleVolunteerExpand(vol.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                              title={isExpanded ? "Show fewer events" : "Show all events"}
                            >
                              <span>
                                {isExpanded ? "Show less" : `+${vol.events.length - 5} more`}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 text-[#FF6A00]" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-[#FF6A00]" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Actions: Delete Button */}
                <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3F4F6]">
                  <button
                    type="button"
                    onClick={() => handleDeleteVolunteer(vol.id)}
                    disabled={deletingId === vol.id}
                    className="h-8 px-2.5 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2]/50 hover:bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title={`Delete volunteer ${vol.name}`}
                  >
                    {deletingId === vol.id ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#DC2626] animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    )}
                    <span className="sm:hidden lg:inline">
                      {deletingId === vol.id ? "Deleting..." : "Delete"}
                    </span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0A0F1E]">No volunteers found</h3>
              <p className="text-xs text-[#6B7280] max-w-sm">
                {searchQuery
                  ? `No volunteers match "${searchQuery}".`
                  : "No volunteers registered in database yet."}
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs rounded-xl cursor-pointer"
                >
                  Clear Search
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsAddFormOpen(true)}
                  className="mt-2 text-xs rounded-xl bg-[#FF6A00] text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add First Volunteer</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 5. FOOTER                                                */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-[#6B7280] hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded border border-[#D1D5DB] bg-white font-mono text-[10px]">Esc</kbd> to close
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto h-9 px-5 rounded-xl text-xs font-semibold cursor-pointer ml-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
