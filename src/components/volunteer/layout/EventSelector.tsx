"use client";

import React, { useState } from "react";
import { ChevronDown, Check, MapPin, Calendar, Layers } from "lucide-react";
import { useVolunteerEvent } from "../context/VolunteerEventContext";
import { Button } from "@/components/ui/button";

export default function EventSelector() {
  const { assignedEvents, selectedEvent, selectedEventId, setSelectedEventId } =
    useVolunteerEvent();
  const [isOpen, setIsOpen] = useState(false);

  if (!selectedEvent) return null;

  const hasMultiple = assignedEvents.length > 1;

  return (
    <div className="relative w-full sm:w-auto">
      {/* Selector Trigger Button */}
      <Button
        variant="outline"
        onClick={() => hasMultiple && setIsOpen(!isOpen)}
        className={`w-full sm:w-auto h-auto py-2 px-3.5 rounded-xl border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-left flex items-center justify-between gap-3 shadow-2xs transition-all ${
          hasMultiple ? "cursor-pointer active:scale-[0.99]" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FFF4ED] border border-[#FFEDD5] flex items-center justify-center shrink-0 text-[#FF6A00]">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#FF6A00] tracking-wider uppercase">
                {selectedEvent.code}
              </span>
              <span className="text-[10px] text-[#9CA3AF]">·</span>
              <span className="text-[11px] text-[#6B7280] font-medium truncate">
                {selectedEvent.category}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#0A0F1E] truncate max-w-[220px] sm:max-w-[280px]">
              {selectedEvent.name}
            </span>
          </div>
        </div>

        {hasMultiple && (
          <ChevronDown
            className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </Button>

      {/* Dropdown Popover */}
      {isOpen && hasMultiple && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-full sm:w-[340px] bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-40 p-2 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
              Assigned Volunteer Events ({assignedEvents.length})
            </div>
            <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto">
              {assignedEvents.map((event) => {
                const isSelected = event.id === selectedEventId;
                return (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-colors flex items-start justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#FFF4ED] border border-[#FFEDD5]"
                        : "hover:bg-[#F3F4F6] border border-transparent"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#FF6A00]">
                          {event.code}
                        </span>
                        <span className="text-xs font-bold text-[#0A0F1E] truncate">
                          {event.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mt-1">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                          {event.venue}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3 text-[#9CA3AF]" />
                          {event.date}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

