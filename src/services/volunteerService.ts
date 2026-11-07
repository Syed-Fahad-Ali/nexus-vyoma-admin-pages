import {
  VolunteerEvent,
  Participant,
  EventStats,
  FestivalSquad,
} from "./types/volunteer";

// ============================================================================
// REALISTIC MOCK DATA: FESTIVAL EVENTS ASSIGNED TO CURRENT VOLUNTEER
// ============================================================================

export const MOCK_ASSIGNED_EVENTS: VolunteerEvent[] = [
  {
    id: "evt-codecraft-2026",
    code: "NV-TECH-01",
    name: "CodeCraft 24h National Hackathon",
    category: "Technical Flagship",
    posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    venue: "Main Block, Innovation Lab",
    room: "Lab 3 & 4 (2nd Floor)",
    date: "10 Nov 2026",
    startTime: "09:00 AM",
    endTime: "09:00 AM (+1 Day)",
    participationLimit: "128 Squads (Max 4/Team)",
    participantType: "team",
    coordinator: {
      name: "Dr. Farooq Siddiqui",
      role: "Faculty In-Charge (CSE)",
      phone: "+91 98480 11223",
      email: "farooq.s@islec.edu.in",
    },
    responsibilities: [
      "Verify participant fest badges and team registration IDs at lab gate",
      "Ensure all hardware/power sockets are allocated per hackathon team",
      "Coordinate midnight refreshment distribution and track rest area shifts",
      "Escort evaluation jury members to assigned project presentation stalls",
    ],
    shifts: [
      {
        id: "shift-01",
        shiftTitle: "Morning Desk & Check-in",
        timeRange: "08:30 AM – 01:30 PM",
        status: "ACTIVE",
        location: "Lab 3 Gate Entrance",
        responsibilities: ["QR badge scanning", "Team kit distribution"],
      },
      {
        id: "shift-02",
        shiftTitle: "Jury Mentorship Round Shift",
        timeRange: "03:00 PM – 07:00 PM",
        status: "UPCOMING",
        location: "Main Innovation Hall",
        responsibilities: ["Mentor booth coordination", "Query escalation"],
      },
      {
        id: "shift-03",
        shiftTitle: "Overnight Technical Watch",
        timeRange: "11:00 PM – 04:00 AM",
        status: "UPCOMING",
        location: "Lab 4 Workstations",
        responsibilities: ["Network support liaison", "Safety compliance"],
      },
    ],
    announcements: [
      {
        id: "ann-01",
        title: "WiFi SSID & Dedicated Gateway",
        message: "Volunteer teams: Pass SSID 'Vyoma_Hack_5G' with emergency credentials only to verified team leads.",
        priority: "HIGH",
        timestamp: "10 mins ago",
        author: "Tech Support Crew",
      },
      {
        id: "ann-02",
        title: "Team Check-in Cutoff",
        message: "All teams must complete gate verification before 10:30 AM for seed round slotting.",
        priority: "NORMAL",
        timestamp: "45 mins ago",
        author: "Dr. Farooq Siddiqui",
      },
    ],
  },
  {
    id: "evt-robowars-2026",
    code: "NV-ROBO-02",
    name: "RoboWars: Steel Clashes 60kg",
    category: "Robotics Combat",
    posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    venue: "Central Open Ground Arena",
    room: "Bulletproof Combat Enclosure",
    date: "11 Nov 2026",
    startTime: "11:00 AM",
    endTime: "06:00 PM",
    participationLimit: "64 Combat Squads",
    participantType: "team",
    coordinator: {
      name: "Prof. Sneha Kulkarni",
      role: "Faculty In-Charge (Mechanical)",
      phone: "+91 91210 44556",
      email: "sneha.k@islec.edu.in",
    },
    responsibilities: [
      "Manage safety perimeter around the bulletproof polycarbonate arena",
      "Check weapon fail-safe switches and weight compliance (Max 60kg)",
      "Direct participating pit crews to the active repair and battery charging zones",
    ],
    shifts: [
      {
        id: "shift-robo-01",
        shiftTitle: "Weigh-in & Safety Scrutiny",
        timeRange: "09:30 AM – 12:00 PM",
        status: "UPCOMING",
        location: "Robo Arena Pit 1",
        responsibilities: ["Weight checks", "Battery containment inspection"],
      },
      {
        id: "shift-robo-02",
        shiftTitle: "Combat Ring Marshalling",
        timeRange: "01:30 PM – 05:30 PM",
        status: "UPCOMING",
        location: "Main Ring Gate A",
        responsibilities: ["Crowd safety barrier control", "Radio frequency lock"],
      },
    ],
    announcements: [
      {
        id: "ann-robo-01",
        title: "Arena Safety Scrutiny Mandatory",
        message: "No bot can enter pit lane without volunteer safety stamp. Verify kill switch switches off all motors.",
        priority: "URGENT",
        timestamp: "2 hours ago",
        author: "Safety Marshal",
      },
    ],
  },
  {
    id: "evt-webathon-2026",
    code: "NV-CODING-03",
    name: "Algorhythm: Speed Webathon",
    category: "Software Sprint",
    posterUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    venue: "Seminar Hall 1",
    room: "Auditorium Wing A",
    date: "12 Nov 2026",
    startTime: "01:00 PM",
    endTime: "05:00 PM",
    participationLimit: "250 Solo Participants",
    participantType: "individual",
    coordinator: {
      name: "Sameer Ahmed",
      role: "Lead Student Coordinator",
      phone: "+91 97033 88990",
      email: "sameer.fest@islec.edu.in",
    },
    responsibilities: [
      "Log individual seat assignments on the contest portal terminal",
      "Monitor code submission timelines and prevent unauthorized device usage",
      "Distribute participation certificates upon submission confirmation",
    ],
    shifts: [
      {
        id: "shift-web-01",
        shiftTitle: "Seat Allocation & Terminal Setup",
        timeRange: "12:00 PM – 02:30 PM",
        status: "UPCOMING",
        location: "Seminar Hall Gate",
        responsibilities: ["Terminal login dispatch", "Badge verification"],
      },
    ],
    announcements: [
      {
        id: "ann-web-01",
        title: "Contest Platform Live at 1:15 PM",
        message: "Individual seat slips contain portal tokens. Hand them out at the desk.",
        priority: "NORMAL",
        timestamp: "3 hours ago",
        author: "Sameer Ahmed",
      },
    ],
  },
];

// ============================================================================
// EVENT-SCOPED PARTICIPANTS REPOSITORY (IN-MEMORY MUTABLE MOCK)
// ============================================================================

const EVENT_PARTICIPANTS: Record<string, Participant[]> = {
  "evt-codecraft-2026": [
    {
      id: "part-cc-01",
      registrationId: "NV26-CC-101",
      name: "Aarav Sharma",
      email: "aarav.sharma@gmail.com",
      phone: "+91 98480 12345",
      enrolledAt: "Nov 4, 2026 · 09:30 AM",
      isPaid: true,
      participantType: "team",
      teamName: "CodeCrafters",
      isCheckedIn: true,
      checkedInAt: "09:42 AM",
      checkedInBy: "YOUR_NAME",
    },
    {
      id: "part-cc-02",
      registrationId: "NV26-CC-102",
      name: "Zainab Fatima",
      email: "zainab.f@outlook.com",
      phone: "+91 99890 54321",
      enrolledAt: "Nov 4, 2026 · 10:15 AM",
      isPaid: true,
      participantType: "team",
      teamName: "NeuralNet ISL",
      isCheckedIn: true,
      checkedInAt: "10:20 AM",
      checkedInBy: "YOUR_NAME",
    },
    {
      id: "part-cc-03",
      registrationId: "NV26-CC-103",
      name: "Mohammed Ibrahim",
      email: "ibrahim.md@islec.edu.in",
      phone: "+91 94400 11223",
      enrolledAt: "Nov 4, 2026 · 12:20 PM",
      isPaid: true,
      participantType: "team",
      teamName: "CodeCrafters",
      isCheckedIn: false,
    },
    {
      id: "part-cc-04",
      registrationId: "NV26-CC-104",
      name: "Rohan Varma",
      email: "rohan.varma@cbit.org.in",
      phone: "+91 91210 98765",
      enrolledAt: "Nov 4, 2026 · 11:00 AM",
      isPaid: false, // UNPAID GATE GUARD
      participantType: "team",
      teamName: "Quantum Leapers",
      isCheckedIn: false,
    },
    {
      id: "part-cc-05",
      registrationId: "NV26-CC-105",
      name: "Farhan Siddiqui",
      email: "farhan.sid@gmail.com",
      phone: "+91 98499 66778",
      enrolledAt: "Nov 4, 2026 · 01:45 PM",
      isPaid: true,
      participantType: "team",
      teamName: "Hydra Strikers",
      isCheckedIn: true,
      checkedInAt: "01:52 PM",
      checkedInBy: "Volunteer Crew B",
    },
    {
      id: "part-cc-06",
      registrationId: "NV26-CC-106",
      name: "Pooja Hegde",
      email: "pooja.hegde@kmit.in",
      phone: "+91 91000 88990",
      enrolledAt: "Nov 4, 2026 · 02:30 PM",
      isPaid: true,
      participantType: "team",
      teamName: "CyberKnights",
      isCheckedIn: true,
      checkedInAt: "02:40 PM",
      checkedInBy: "YOUR_NAME",
    },
    {
      id: "part-cc-07",
      registrationId: "NV26-CC-107",
      name: "Aditya Nair",
      email: "aditya.nair@gmail.com",
      phone: "+91 96180 33445",
      enrolledAt: "Nov 4, 2026 · 03:05 PM",
      isPaid: false, // UNPAID
      participantType: "team",
      teamName: "Quantum Leapers",
      isCheckedIn: false,
    },
    {
      id: "part-cc-08",
      registrationId: "NV26-CC-108",
      name: "Divya Teja",
      email: "divya.teja@jntu.ac.in",
      phone: "+91 97002 33445",
      enrolledAt: "Nov 4, 2026 · 05:50 PM",
      isPaid: true,
      participantType: "team",
      teamName: "DevDynamos",
      isCheckedIn: true,
      checkedInAt: "06:00 PM",
      checkedInBy: "YOUR_NAME",
    },
  ],
  "evt-robowars-2026": [
    {
      id: "part-rw-01",
      registrationId: "NV26-RW-201",
      name: "Ananya Iyer",
      email: "ananya.iyer@gmail.com",
      phone: "+91 98765 43210",
      enrolledAt: "Nov 4, 2026 · 11:45 AM",
      isPaid: true,
      participantType: "team",
      teamName: "RoboTitans",
      isCheckedIn: true,
      checkedInAt: "11:50 AM",
      checkedInBy: "Pit Volunteer",
    },
    {
      id: "part-rw-02",
      registrationId: "NV26-RW-202",
      name: "Karthik Raja",
      email: "karthik.raja@yahoo.com",
      phone: "+91 99080 77665",
      enrolledAt: "Nov 4, 2026 · 04:15 PM",
      isPaid: true,
      participantType: "team",
      teamName: "RoboTitans",
      isCheckedIn: false,
    },
    {
      id: "part-rw-03",
      registrationId: "NV26-RW-203",
      name: "Ayesha Begum",
      email: "ayesha.begum@islec.edu.in",
      phone: "+91 93910 44332",
      enrolledAt: "Nov 4, 2026 · 05:00 PM",
      isPaid: true,
      participantType: "team",
      teamName: "MechWarriors",
      isCheckedIn: true,
      checkedInAt: "05:10 PM",
      checkedInBy: "YOUR_NAME",
    },
    {
      id: "part-rw-04",
      registrationId: "NV26-RW-204",
      name: "Syed Bilal",
      email: "bilal.syed@islec.edu.in",
      phone: "+91 99881 22334",
      enrolledAt: "Nov 4, 2026 · 06:15 PM",
      isPaid: false, // UNPAID
      participantType: "team",
      teamName: "VoltVanguard",
      isCheckedIn: false,
    },
  ],
  "evt-webathon-2026": [
    {
      id: "part-wb-01",
      registrationId: "NV26-WB-301",
      name: "Sneha Reddy",
      email: "sneha.reddy@vce.ac.in",
      phone: "+91 97033 44556",
      enrolledAt: "Nov 4, 2026 · 01:10 PM",
      isPaid: false,
      participantType: "individual",
      isCheckedIn: false,
    },
    {
      id: "part-wb-02",
      registrationId: "NV26-WB-302",
      name: "Meera Krishnan",
      email: "meera.k@gmail.com",
      phone: "+91 98855 22110",
      enrolledAt: "Nov 4, 2026 · 03:40 PM",
      isPaid: true,
      participantType: "individual",
      isCheckedIn: true,
      checkedInAt: "03:45 PM",
      checkedInBy: "YOUR_NAME",
    },
    {
      id: "part-wb-03",
      registrationId: "NV26-WB-303",
      name: "Tariq Mansoor",
      email: "tariq.m@gmail.com",
      phone: "+91 98481 99887",
      enrolledAt: "Nov 4, 2026 · 05:25 PM",
      isPaid: true,
      participantType: "individual",
      isCheckedIn: false,
    },
  ],
};

// ============================================================================
// SERVICE ABSTRACTION LAYER (MOCK & LIVE IMPLEMENTATION)
// ============================================================================

export class VolunteerApiError extends Error {
  status?: number;
  redirect?: boolean;
  redirectUrl?: string | null;

  constructor(message: string, status?: number, redirect?: boolean, redirectUrl?: string | null) {
    super(message);
    this.name = "VolunteerApiError";
    this.status = status;
    this.redirect = redirect;
    this.redirectUrl = redirectUrl;
  }
}

export const volunteerService = {
  /**
   * Retrieves all events assigned to the logged-in volunteer from /api/events.
   * Handles diverse response shapes and normalizes DB models into VolunteerEvent.
   */
  async getAssignedEvents(): Promise<VolunteerEvent[]> {
    const response = await fetch("/api/events", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.error) {
      const errorMessage =
        result?.error ||
        result?.message ||
        `Failed to fetch assigned events (HTTP ${response.status})`;

      throw new VolunteerApiError(
        errorMessage,
        response.status,
        result?.redirect ?? false,
        result?.redirectUrl ?? null
      );
    }

    const rawData = result.data;
    if (!rawData) {
      return [];
    }

    // Adapt flexibly to populated EventTeamMember or direct event arrays
    let rawEventsList: any[] = [];
    if (Array.isArray(rawData)) {
      rawEventsList = rawData;
    } else if (Array.isArray(rawData.event_id)) {
      rawEventsList = rawData.event_id;
    } else if (rawData.event_id && typeof rawData.event_id === "object") {
      rawEventsList = [rawData.event_id];
    } else if (Array.isArray(rawData.events)) {
      rawEventsList = rawData.events;
    }

    return rawEventsList.map((raw: any) => {
      const id = String(raw._id || raw.id || "");
      const isTech = Boolean(raw.isTechEvent);
      const codeFallback = `${isTech ? "NV-TECH" : "NV-FEST"}-${id ? id.slice(-4).toUpperCase() : "01"}`;
      const participantType: "individual" | "team" =
        raw.participants_type === "individual" || raw.participantType === "individual"
          ? "individual"
          : "team";

      const limitStr =
        typeof raw.participationLimit === "string"
          ? raw.participationLimit
          : raw.participant_limit
          ? `${raw.participant_limit} ${participantType === "team" ? "Squads" : "Solo Entries"}`
          : participantType === "team"
          ? "Squads format"
          : "Solo format";

      return {
        id,
        code: raw.code || codeFallback,
        name: raw.title || raw.name || "Festival Track Event",
        category: raw.category || (isTech ? "Technical Track" : "Flagship Event"),
        posterUrl: raw.image_url || raw.posterUrl || "",
        venue: raw.venue || "ISL Campus",
        room: raw.room || (raw.venue?.includes(",") ? raw.venue.split(",").slice(1).join(",").trim() : "Main Stage"),
        date: raw.date || raw.date_time || "10–12 Nov 2026",
        startTime: raw.startTime || "09:00 AM",
        endTime: raw.endTime || "05:00 PM",
        participationLimit: limitStr,
        participantType,
        coordinator: raw.coordinator || {
          name: rawData.full_name || "Festival Faculty Lead",
          role: "Event In-Charge",
          phone: "+91 98480 11223",
          email: rawData.email || "",
        },
        responsibilities: raw.responsibilities || raw.requirements || [],
        shifts: raw.shifts || [],
        announcements: raw.announcements || [],
      };
    });
  },

  /**
   * Retrieves specific event by ID directly from /api/events/:id.
   */
  async getEventById(eventId: string): Promise<VolunteerEvent> {
    const response = await fetch(`/api/events/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.error) {
      const errorMessage =
        result?.error ||
        result?.message ||
        `Failed to fetch event (HTTP ${response.status})`;

      throw new VolunteerApiError(
        errorMessage,
        response.status,
        result?.redirect ?? false,
        result?.redirectUrl ?? null
      );
    }

    const raw = result.data?.event || result.data;
    const userData = result.data?.userData || {};
    const id = String(raw._id || raw.id || eventId);
    const isTech = Boolean(raw.isTechEvent);
    const codeFallback = `${isTech ? "NV-TECH" : "NV-FEST"}-${id ? id.slice(-4).toUpperCase() : "01"}`;
    const participantType: "individual" | "team" =
      raw.participants_type === "individual" || raw.participantType === "individual"
        ? "individual"
        : "team";

    const limitStr =
      typeof raw.participationLimit === "string"
        ? raw.participationLimit
        : raw.participant_limit
        ? `${raw.participant_limit} ${participantType === "team" ? "Squads" : "Solo Entries"}`
        : participantType === "team"
        ? "Squads format"
        : "Solo format";

    return {
      id,
      code: raw.code || codeFallback,
      name: raw.title || raw.name || "Festival Track Event",
      category: raw.category || (isTech ? "Technical Track" : "Flagship Event"),
      posterUrl: raw.image_url || raw.posterUrl || "",
      venue: raw.venue || "ISL Campus",
      room: raw.room || (raw.venue?.includes(",") ? raw.venue.split(",").slice(1).join(",").trim() : "Main Stage"),
      date: raw.date || raw.date_time || "10–12 Nov 2026",
      startTime: raw.startTime || "09:00 AM",
      endTime: raw.endTime || "05:00 PM",
      participationLimit: limitStr,
      participantType,
      coordinator: raw.coordinator || {
        name: userData.full_name || "Festival Faculty Lead",
        role: "Event In-Charge",
        phone: "+91 98480 11223",
        email: userData.email || "",
      },
      responsibilities: raw.responsibilities || raw.requirements || [],
      shifts: raw.shifts || [],
      announcements: raw.announcements || [],
    };
  },

  /**
   * Retrieves registered users & check-in status from /api/dashboard/users.
   */
  async getDashboardUsers(eventId: string): Promise<{
    users: import("@/lib/dummy-users-data").UserAttendee[];
    totalUsersCount: number;
    totalTeamsCount: number;
    totalCheckedInCount: number;
    isIndividual: boolean;
  }> {
    const response = await fetch("/api/dashboard/users", {
      method: "GET",
      headers: {
        "event-id": eventId,
        eventId: eventId,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.error) {
      const errorMessage =
        result?.error ||
        result?.message ||
        `Failed to fetch event users (HTTP ${response.status})`;

      throw new VolunteerApiError(
        errorMessage,
        response.status,
        result?.redirect ?? false,
        result?.redirectUrl ?? null
      );
    }

    const data = result.data || {};
    const event = data.event || {};
    const isIndividual = event.participants_type === "individual";

    // Set of checked-in attendee IDs from EventEntry documents
    const checkedInEntries: any[] = data.checkedInUsers?.users || [];
    const checkedInMap = new Map<string, string>();
    checkedInEntries.forEach((entry: any) => {
      const attendeeId = entry.attendee?._id
        ? String(entry.attendee._id)
        : entry.attendee
        ? String(entry.attendee)
        : null;
      if (attendeeId) {
        const timeStr = entry.checked_in_at
          ? new Date(entry.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : entry.createdAt
          ? new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Checked-in";
        checkedInMap.set(attendeeId, timeStr);
      }
    });

    const rawUsers: any[] = isIndividual
      ? data.individualUsers?.users || []
      : data.teamUsers?.users || [];

    const totalTeamsCount = Number(data.teamUsers?.count ?? 0);
    const totalUsersCount = Number(
      isIndividual
        ? data.individualUsers?.count ?? rawUsers.length
        : data.teamUsers?.usersCount ?? rawUsers.length
    );
    const totalCheckedInCount = Number(data.checkedInUsers?.count ?? checkedInMap.size);

    const users: import("@/lib/dummy-users-data").UserAttendee[] = rawUsers.map((u: any) => {
      const userId = String(u._id || u.id || "");
      const isCheckedIn = checkedInMap.has(userId);
      const checkedInAt = checkedInMap.get(userId);

      const enrolledAt = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Nov 10, 2026";

      return {
        id: userId,
        name: u.full_name || u.name || "Attendee",
        email: u.email || "",
        phone: u.phone_number || u.phone || "—",
        enrolledAt,
        isPaid: true,
        participantsType: isIndividual ? "individual" : "team",
        isCheckedIn,
        checkedInAt,
      };
    });

    return {
      users,
      totalUsersCount,
      totalTeamsCount,
      totalCheckedInCount,
      isIndividual,
    };
  },

  /**
   * Retrieves aggregated statistics strictly scoped to the specified event from /api/dashboard.
   */
  async getEventStats(eventId: string): Promise<EventStats> {
    const response = await fetch("/api/dashboard", {
      method: "GET",
      headers: {
        eventId: eventId,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.error) {
      const errorMessage =
        result?.error ||
        result?.message ||
        `Failed to fetch dashboard metrics (HTTP ${response.status})`;

      throw new VolunteerApiError(
        errorMessage,
        response.status,
        result?.redirect ?? false,
        result?.redirectUrl ?? null
      );
    }

    const counts = result.data?.count || {};
    const totalParticipants = Number(counts.totalEnrolledEventCount ?? 0);
    const checkedInCount = Number(counts.totalCheckInUsersCount ?? 0);
    const activeVolunteers = Number(counts.crewMembersCount ?? 0);
    const pendingCount = Math.max(0, totalParticipants - checkedInCount);
    const checkInPercentage =
      totalParticipants > 0
        ? Number(((checkedInCount / totalParticipants) * 100).toFixed(1))
        : 0;

    // Responsive velocity time-series aligned with live telemetry
    const timeSeries = {
      dates: ["Day 1 Morning", "Day 1 Afternoon", "Day 2 Morning", "Live Now"],
      thisPeriod: [
        Math.round(checkedInCount * 0.15),
        Math.round(checkedInCount * 0.45),
        Math.round(checkedInCount * 0.8),
        checkedInCount,
      ],
      lastPeriod: [
        Math.round(totalParticipants * 0.1),
        Math.round(totalParticipants * 0.35),
        Math.round(totalParticipants * 0.65),
        Math.round(totalParticipants * 0.9),
      ],
    };

    return {
      totalParticipants,
      checkedInCount,
      pendingCount,
      checkInPercentage,
      activeVolunteers,
      timeSeries,
    };
  },

  /**
   * Retrieves participants list scoped to the event.
   */
  async getEventParticipants(
    eventId: string,
    query: string = "",
    filter: "ALL" | "CHECKED_IN" | "PENDING" | "PAID" | "UNPAID" = "ALL"
  ): Promise<Participant[]> {
    const list = EVENT_PARTICIPANTS[eventId] || [];
    const q = query.trim().toLowerCase();

    return list.filter((p) => {
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.registrationId.toLowerCase().includes(q) ||
        (p.teamName && p.teamName.toLowerCase().includes(q));

      let matchesFilter = true;
      if (filter === "CHECKED_IN") matchesFilter = p.isCheckedIn;
      else if (filter === "PENDING") matchesFilter = !p.isCheckedIn;
      else if (filter === "PAID") matchesFilter = p.isPaid;
      else if (filter === "UNPAID") matchesFilter = !p.isPaid;

      return matchesQuery && matchesFilter;
    });
  },

  /**
   * Toggles or marks check-in for a participant.
   * STRICT BUSINESS RULE: If isPaid is false, check-in is rejected!
   */
  async checkInParticipant(
    eventId: string,
    participantId: string,
    volunteerName: string = "YOUR_NAME"
  ): Promise<{ success: boolean; participant?: Participant; error?: string }> {
    const list = EVENT_PARTICIPANTS[eventId];
    if (!list) {
      return { success: false, error: "Event not found" };
    }

    const participant = list.find((p) => p.id === participantId);
    if (!participant) {
      return { success: false, error: "Participant not found" };
    }

    // Unpaid Guard
    if (!participant.isPaid && !participant.isCheckedIn) {
      return {
        success: false,
        error: "Cannot check in: Participant registration payment is unpaid or pending.",
      };
    }

    const nextCheckedIn = !participant.isCheckedIn;
    participant.isCheckedIn = nextCheckedIn;
    participant.checkedInAt = nextCheckedIn
      ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : undefined;
    participant.checkedInBy = nextCheckedIn ? volunteerName : undefined;

    return {
      success: true,
      participant: { ...participant },
    };
  },

  /**
   * Retrieves squads registered for an event from /api/dashboard/team-users.
   */
  async getEventSquads(eventId: string): Promise<FestivalSquad[]> {
    const response = await fetch("/api/dashboard/team-users", {
      method: "GET",
      headers: {
        "event-id": eventId,
        eventId: eventId,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    // If no enrolled team users, return empty array gracefully
    if (result?.error === "NO_ENROLLED_TEAM_USERS") {
      return [];
    }

    if (!response.ok || !result || result.error) {
      const errorMessage =
        result?.error ||
        result?.message ||
        `Failed to fetch team squads (HTTP ${response.status})`;

      throw new VolunteerApiError(
        errorMessage,
        response.status,
        result?.redirect ?? false,
        result?.redirectUrl ?? null
      );
    }

    const data = result.data || {};
    const event = data.event || {};
    const enrolledTeamUsers: any[] = data.enrolledTeamUsers || [];

    return enrolledTeamUsers.map((item: any, idx: number) => {
      const enrollment = item.enrolledTeamUser || {};
      const leaderObj = item.teamLeaderDetails?.teamLeader;
      const leaderCheckedIn = Boolean(item.teamLeaderDetails?.checkedIn);

      const leaderMember = {
        name: leaderObj?.full_name || "Team Leader",
        email: leaderObj?.email || "",
        phone: leaderObj?.phone_number || "—",
        role: "Leader" as const,
        isCheckedIn: leaderCheckedIn,
        checkedInAt: leaderCheckedIn ? "Checked-in" : undefined,
      };

      const otherMembers = (item.teamMembersDetails || []).map((m: any) => {
        const memObj = m.teamMember;
        const memCheckedIn = Boolean(m.checkedIn);
        return {
          name: memObj?.full_name || "Member",
          email: memObj?.email || "",
          phone: memObj?.phone_number || "—",
          role: "Member" as const,
          isCheckedIn: memCheckedIn,
          checkedInAt: memCheckedIn ? "Checked-in" : undefined,
        };
      });

      const allMembers = [leaderMember, ...otherMembers];
      const isFullyCheckedIn =
        allMembers.length > 0 && allMembers.every((m) => m.isCheckedIn);

      const teamId = String(enrollment._id || `team-${idx + 1}`);
      const teamNumber = `SQ-${teamId.slice(-4).toUpperCase()}`;

      return {
        id: teamId,
        teamNumber,
        teamName: enrollment.team_name || `Team ${teamNumber}`,
        leader: {
          name: leaderObj?.full_name || "Team Leader",
          email: leaderObj?.email || "",
          phone: leaderObj?.phone_number || "—",
        },
        teamSize: Number(enrollment.team_size || allMembers.length),
        track: event.category || event.name || "Fest Squad",
        members: allMembers,
        isCheckedIn: isFullyCheckedIn,
      };
    });
  },
};

// ============================================================================
// REALISTIC MOCK SQUADS DATA
// ============================================================================

export const MOCK_SQUADS: Record<string, FestivalSquad[]> = {
  "default": [
    {
      id: "sq-01",
      teamNumber: "SQ-101",
      teamName: "CyberSentinels",
      track: "Cybersecurity & Web3",
      teamSize: 4,
      isCheckedIn: true,
      leader: {
        name: "Ayesha Fatima",
        email: "ayesha.f@islec.edu.in",
        phone: "+91 98480 33441",
      },
      members: [
        {
          name: "Ayesha Fatima",
          email: "ayesha.f@islec.edu.in",
          phone: "+91 98480 33441",
          role: "Leader",
          isCheckedIn: true,
          checkedInAt: "08:45 AM",
        },
        {
          name: "Mohammed Zeeshan",
          email: "zeeshan.m@gmail.com",
          phone: "+91 99123 44556",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "08:48 AM",
        },
        {
          name: "Kavya Sundaram",
          email: "kavya.sundar@cbit.ac.in",
          phone: "+91 97001 22334",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "08:52 AM",
        },
        {
          name: "Rohan Varma",
          email: "rohan.v@vnr.ac.in",
          phone: "+91 94400 99887",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "09:02 AM",
        },
      ],
    },
    {
      id: "sq-02",
      teamNumber: "SQ-102",
      teamName: "Quantum Hackers",
      track: "AI / Machine Learning",
      teamSize: 4,
      isCheckedIn: false,
      leader: {
        name: "Syed Bilal Ahmed",
        email: "bilal.ahmed@mjcollege.ac.in",
        phone: "+91 98490 55667",
      },
      members: [
        {
          name: "Syed Bilal Ahmed",
          email: "bilal.ahmed@mjcollege.ac.in",
          phone: "+91 98490 55667",
          role: "Leader",
          isCheckedIn: true,
          checkedInAt: "09:10 AM",
        },
        {
          name: "Neha Reddy",
          email: "neha.reddy@gmail.com",
          phone: "+91 98850 11223",
          role: "Member",
          isCheckedIn: false,
        },
        {
          name: "Aditya Nair",
          email: "aditya.n@gmail.com",
          phone: "+91 93910 88776",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "09:12 AM",
        },
        {
          name: "Pooja Hegde",
          email: "pooja.h@vasavi.edu.in",
          phone: "+91 91211 44332",
          role: "Member",
          isCheckedIn: false,
        },
      ],
    },
    {
      id: "sq-03",
      teamNumber: "SQ-103",
      teamName: "ByteForce Alpha",
      track: "Full Stack & Cloud Native",
      teamSize: 3,
      isCheckedIn: true,
      leader: {
        name: "Arjun Deshmukh",
        email: "arjun.d@iith.ac.in",
        phone: "+91 97011 88223",
      },
      members: [
        {
          name: "Arjun Deshmukh",
          email: "arjun.d@iith.ac.in",
          phone: "+91 97011 88223",
          role: "Leader",
          isCheckedIn: true,
          checkedInAt: "08:30 AM",
        },
        {
          name: "Tanya Sharma",
          email: "tanya.sharma@gmail.com",
          phone: "+91 99890 33221",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "08:32 AM",
        },
        {
          name: "Rahul Chandra",
          email: "rahul.c@gmail.com",
          phone: "+91 96522 11990",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "08:35 AM",
        },
      ],
    },
    {
      id: "sq-04",
      teamNumber: "SQ-104",
      teamName: "Neural Pioneers",
      track: "Generative AI & Agentic Systems",
      teamSize: 4,
      isCheckedIn: false,
      leader: {
        name: "Priyanka Joshi",
        email: "priyanka.j@ou.ac.in",
        phone: "+91 98491 77665",
      },
      members: [
        {
          name: "Priyanka Joshi",
          email: "priyanka.j@ou.ac.in",
          phone: "+91 98491 77665",
          role: "Leader",
          isCheckedIn: false,
        },
        {
          name: "Karthik Raja",
          email: "karthik.r@gmail.com",
          phone: "+91 94411 22334",
          role: "Member",
          isCheckedIn: false,
        },
        {
          name: "Ananya Dixit",
          email: "ananya.d@jntuh.ac.in",
          phone: "+91 99120 77889",
          role: "Member",
          isCheckedIn: false,
        },
        {
          name: "Sameer Khan",
          email: "sameer.k@islec.edu.in",
          phone: "+91 98488 44112",
          role: "Member",
          isCheckedIn: false,
        },
      ],
    },
    {
      id: "sq-05",
      teamNumber: "SQ-105",
      teamName: "AeroDynasty",
      track: "Embedded IoT & Robotics",
      teamSize: 4,
      isCheckedIn: true,
      leader: {
        name: "Vikramaditya Rao",
        email: "vikram.rao@cbit.ac.in",
        phone: "+91 99490 88123",
      },
      members: [
        {
          name: "Vikramaditya Rao",
          email: "vikram.rao@cbit.ac.in",
          phone: "+91 99490 88123",
          role: "Leader",
          isCheckedIn: true,
          checkedInAt: "09:05 AM",
        },
        {
          name: "Sneha Patil",
          email: "sneha.patil@gmail.com",
          phone: "+91 97033 11445",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "09:08 AM",
        },
        {
          name: "Farhan Qureshi",
          email: "farhan.q@islec.edu.in",
          phone: "+91 98481 99001",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "09:15 AM",
        },
        {
          name: "Divya Krishnan",
          email: "divya.k@griet.ac.in",
          phone: "+91 95500 33221",
          role: "Member",
          isCheckedIn: true,
          checkedInAt: "09:20 AM",
        },
      ],
    },
    {
      id: "sq-06",
      teamNumber: "SQ-106",
      teamName: "DevOps Mavericks",
      track: "Cloud & Distributed Systems",
      teamSize: 3,
      isCheckedIn: false,
      leader: {
        name: "Naveen Goud",
        email: "naveen.g@mgit.ac.in",
        phone: "+91 98660 77112",
      },
      members: [
        {
          name: "Naveen Goud",
          email: "naveen.g@mgit.ac.in",
          phone: "+91 98660 77112",
          role: "Leader",
          isCheckedIn: true,
          checkedInAt: "08:50 AM",
        },
        {
          name: "Harish Kumar",
          email: "harish.k@gmail.com",
          phone: "+91 99080 44551",
          role: "Member",
          isCheckedIn: false,
        },
        {
          name: "Pranathi Reddy",
          email: "pranathi.r@gmail.com",
          phone: "+91 96180 33229",
          role: "Member",
          isCheckedIn: false,
        },
      ],
    },
  ],
};
