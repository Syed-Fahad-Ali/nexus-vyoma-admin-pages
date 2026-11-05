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
// SERVICE ABSTRACTION LAYER (MOCK IMPLEMENTATION)
// ============================================================================

export const volunteerService = {
  /**
   * Retrieves all events assigned to the logged-in volunteer.
   */
  async getAssignedEvents(): Promise<VolunteerEvent[]> {
    return MOCK_ASSIGNED_EVENTS;
  },

  /**
   * Retrieves specific event by ID.
   */
  async getEventById(eventId: string): Promise<VolunteerEvent | null> {
    return MOCK_ASSIGNED_EVENTS.find((e) => e.id === eventId) || null;
  },

  /**
   * Retrieves aggregated statistics strictly scoped to the specified event.
   */
  async getEventStats(eventId: string): Promise<EventStats> {
    const participants = EVENT_PARTICIPANTS[eventId] || [];
    const totalParticipants = participants.length > 0 ? participants.length * 64 : 1450;
    const checkedInCount = participants.filter((p) => p.isCheckedIn).length * 64;
    const pendingCount = Math.max(0, totalParticipants - checkedInCount);
    const checkInPercentage = totalParticipants > 0
      ? Number(((checkedInCount / totalParticipants) * 100).toFixed(1))
      : 0;

    // Time-series based on event
    const timeSeries =
      eventId === "evt-codecraft-2026"
        ? {
            dates: ["Nov 02", "Nov 03", "Nov 04", "Nov 05"],
            thisPeriod: [45, 210, 620, checkedInCount || 940],
            lastPeriod: [20, 150, 420, 710],
          }
        : eventId === "evt-robowars-2026"
        ? {
            dates: ["Nov 02", "Nov 03", "Nov 04", "Nov 05"],
            thisPeriod: [10, 45, 90, checkedInCount || 128],
            lastPeriod: [5, 30, 70, 95],
          }
        : {
            dates: ["Nov 02", "Nov 03", "Nov 04", "Nov 05"],
            thisPeriod: [25, 80, 160, checkedInCount || 240],
            lastPeriod: [15, 60, 120, 180],
          };

    return {
      totalParticipants: totalParticipants || 1450,
      checkedInCount: checkedInCount || 940,
      pendingCount: pendingCount || 510,
      checkInPercentage: checkInPercentage || 64.8,
      totalTeams: eventId === "evt-webathon-2026" ? undefined : 128,
      activeVolunteers: 24,
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
   * Retrieves squads registered for an event
   */
  async getEventSquads(eventId: string): Promise<FestivalSquad[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return MOCK_SQUADS[eventId] || MOCK_SQUADS["default"] || [];
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
