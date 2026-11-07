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
  const [currentEvent, setCurrentEvent] = useState<VolunteerEvent | null>(null);
  const [selectedEventId, setSelectedEventIdState] = useState<string>("");
  const [participationType, setParticipationType] = useState<ParticipationType>("team");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const storedId = typeof window !== "undefined" ? localStorage.getItem("nexus_selected_event_id") : null;

        // If a specific event is selected, fetch it directly via /api/events/:id
        if (storedId) {
          try {
            const singleEvent = await volunteerService.getEventById(storedId);
            if (singleEvent) {
              setCurrentEvent(singleEvent);
              setSelectedEventIdState(singleEvent.id);
              setParticipationType(singleEvent.participantType);
            }
          } catch (singleErr) {
            console.warn("Could not load stored event by ID, falling back to all events:", singleErr);
            if (singleErr instanceof VolunteerApiError && singleErr.redirect) {
              router.replace(singleErr.redirectUrl || "/");
              return;
            }
          }
        }

        // Also fetch all permitted events for the switcher
        const events = await volunteerService.getAssignedEvents();
        setAssignedEvents(events);

        if (!storedId && events.length > 0) {
          const activeEvent = events[0];
          setCurrentEvent(activeEvent);
          setSelectedEventIdState(activeEvent.id);
          setParticipationType(activeEvent.participantType);
          if (typeof window !== "undefined") {
            localStorage.setItem("nexus_selected_event_id", activeEvent.id);
          }
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
      setCurrentEvent(matched);
      setParticipationType(matched.participantType);
    } else {
      // Fetch directly by ID
      volunteerService.getEventById(id).then((evt) => {
        if (evt) {
          setCurrentEvent(evt);
          setParticipationType(evt.participantType);
        }
      }).catch(console.error);
    }
  };

  const selectedEvent = currentEvent || assignedEvents.find((e) => e.id === selectedEventId) || assignedEvents[0] || null;

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
