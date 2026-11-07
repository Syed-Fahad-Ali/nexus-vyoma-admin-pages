"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VolunteerEvent, ParticipationType } from "@/services/types/volunteer";
import { volunteerService, VolunteerApiError } from "@/services/volunteerService";

interface VolunteerEventContextType {
  assignedEvents: VolunteerEvent[];
  selectedEvent: VolunteerEvent | null;
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  participationType: ParticipationType;
  setParticipationType: (type: ParticipationType) => void;
  isLoading: boolean;
}

const VolunteerEventContext = createContext<VolunteerEventContextType | undefined>(undefined);

export function VolunteerEventProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [assignedEvents, setAssignedEvents] = useState<VolunteerEvent[]>([]);
  const [selectedEventId, setSelectedEventIdState] = useState<string>("");
  const [participationType, setParticipationType] = useState<ParticipationType>("Squad");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const events = await volunteerService.getAssignedEvents();
        setAssignedEvents(events);

        if (events.length > 0) {
          // Read stored event if present in localStorage
          const storedId = typeof window !== "undefined" ? localStorage.getItem("nexus_selected_event_id") : null;
          const matched = events.find((e) => e.id === storedId);
          const activeEvent = matched || events[0];

          setSelectedEventIdState(activeEvent.id);
          const initialType: ParticipationType = activeEvent.participantType === "team" ? "Squad" : "Solo";
          setParticipationType(initialType);
        }
      } catch (err) {
        if (err instanceof VolunteerApiError && err.redirect) {
          router.replace(err.redirectUrl || "/");
          return;
        }
        console.error("Failed to load assigned events in context:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, [router]);

  const setSelectedEventId = (id: string) => {
    setSelectedEventIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_selected_event_id", id);
    }
    const matched = assignedEvents.find((e) => e.id === id);
    if (matched) {
      setParticipationType(matched.participantType === "team" ? "Squad" : "Solo");
    }
  };

  const selectedEvent =
    assignedEvents.find((e) => e.id === selectedEventId) || assignedEvents[0] || null;

  return (
    <VolunteerEventContext.Provider
      value={{
        assignedEvents,
        selectedEvent,
        selectedEventId: selectedEvent?.id || "",
        setSelectedEventId,
        participationType,
        setParticipationType,
        isLoading,
      }}
    >
      {children}
    </VolunteerEventContext.Provider>
  );
}

export function useVolunteerEvent() {
  const context = useContext(VolunteerEventContext);
  if (!context) {
    throw new Error("useVolunteerEvent must be used within a VolunteerEventProvider");
  }
  return context;
}
