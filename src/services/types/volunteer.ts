export type ParticipantType = "individual" | "team";
export type ParticipationType = "individual" | "team" | "Solo" | "Squad";

export interface VolunteerCoordinator {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface VolunteerShift {
  id: string;
  shiftTitle: string;
  timeRange: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  location: string;
  responsibilities: string[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "HIGH" | "NORMAL" | "URGENT";
  timestamp: string;
  author: string;
}

export interface Participant {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  enrolledAt: string;
  isPaid: boolean;
  participantType: ParticipantType;
  teamName?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
}

export interface TeamMemberInfo {
  name: string;
  email: string;
  phone: string;
  role: "Leader" | "Member";
  isCheckedIn: boolean;
  checkedInAt?: string;
}

export interface FestivalSquad {
  id: string;
  teamNumber: string;
  teamName: string;
  leader: {
    name: string;
    email: string;
    phone: string;
  };
  teamSize: number;
  track?: string;
  members: TeamMemberInfo[];
  isCheckedIn: boolean;
}

export interface VolunteerEvent {
  id: string;
  code: string;
  name: string;
  category: string;
  posterUrl?: string;
  venue: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  participationLimit: string;
  participantType: ParticipantType;
  defaultParticipationType?: ParticipationType;
  coordinator: VolunteerCoordinator;
  responsibilities: string[];
  shifts: VolunteerShift[];
  announcements: Announcement[];
}

export interface EventStats {
  totalParticipants: number;
  checkedInCount: number;
  pendingCount: number;
  checkInPercentage: number;
  totalTeams?: number;
  activeVolunteers: number;
  timeSeries: {
    dates: string[];
    thisPeriod: number[];
    lastPeriod: number[];
  };
}

