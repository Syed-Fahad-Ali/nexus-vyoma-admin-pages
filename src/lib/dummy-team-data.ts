export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  shiftTime: string;
  status: "Active on Duty" | "On Break" | "Standby";
  avatarUrl?: string;
}

export const FEST_DEPARTMENTS = [
  "Tech & Registration",
  "Cosplay & Stage",
  "Automobile Expo",
  "Security & Crowd Control",
  "Media & Photography",
  "Logistics & Hospitality",
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-201",
    name: "Syed Ali Quadri",
    email: "ali.quadri@islec.edu.in",
    role: "Lead Scanner & Tech Coordinator",
    department: "Tech & Registration",
    phone: "+91 98765 43210",
    shiftTime: "Morning · 08:30 AM – 02:30 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-202",
    name: "Ayesha Fatima",
    email: "ayesha.f@islec.edu.in",
    role: "Stage & Costume Lead",
    department: "Cosplay & Stage",
    phone: "+91 98765 43211",
    shiftTime: "Morning · 09:00 AM – 03:00 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-203",
    name: "Mohammed Zaid",
    email: "zaid.m@islec.edu.in",
    role: "Paddock & Vehicle In-Charge",
    department: "Automobile Expo",
    phone: "+91 98765 43212",
    shiftTime: "All Day · 09:00 AM – 06:00 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-204",
    name: "Sneha Rao",
    email: "sneha.rao@islec.edu.in",
    role: "Gate & Crowd Controller",
    department: "Security & Crowd Control",
    phone: "+91 98765 43213",
    shiftTime: "Morning · 08:00 AM – 02:00 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-205",
    name: "Rahul Verma",
    email: "rahul.v@islec.edu.in",
    role: "Audio Visual & DJ Crew",
    department: "Cosplay & Stage",
    phone: "+91 98765 43214",
    shiftTime: "Evening · 02:00 PM – 09:00 PM",
    status: "Standby",
  },
  {
    id: "tm-206",
    name: "Zainab Mir",
    email: "zainab.mir@islec.edu.in",
    role: "Desk Volunteer & Token Scanner",
    department: "Tech & Registration",
    phone: "+91 98765 43215",
    shiftTime: "Morning · 08:30 AM – 02:30 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-207",
    name: "Adnan Farooq",
    email: "adnan.f@islec.edu.in",
    role: "Arena Security Lead",
    department: "Security & Crowd Control",
    phone: "+91 98765 43216",
    shiftTime: "All Day · 08:00 AM – 06:00 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-208",
    name: "Pooja Hegde",
    email: "pooja.h@islec.edu.in",
    role: "Live Coverage & Social Media",
    department: "Media & Photography",
    phone: "+91 98765 43217",
    shiftTime: "Morning · 09:30 AM – 03:30 PM",
    status: "On Break",
  },
  {
    id: "tm-209",
    name: "Kashif Siddiqui",
    email: "kashif.s@islec.edu.in",
    role: "Guest & VIP Hospitality Lead",
    department: "Logistics & Hospitality",
    phone: "+91 98765 43218",
    shiftTime: "Morning · 09:00 AM – 04:00 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-210",
    name: "Meera Nair",
    email: "meera.n@islec.edu.in",
    role: "Exhibitor & Food Stall Manager",
    department: "Logistics & Hospitality",
    phone: "+91 98765 43219",
    shiftTime: "Morning · 09:00 AM – 03:00 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-211",
    name: "Tanveer Akhtar",
    email: "tanveer.a@islec.edu.in",
    role: "Official Fest Videographer",
    department: "Media & Photography",
    phone: "+91 98765 43220",
    shiftTime: "All Day · 10:00 AM – 07:00 PM",
    status: "Active on Duty",
  },
  {
    id: "tm-212",
    name: "Rishabh Joshi",
    email: "rishabh.j@islec.edu.in",
    role: "Hardware & Network Support",
    department: "Tech & Registration",
    phone: "+91 98765 43221",
    shiftTime: "All Day · 08:00 AM – 05:00 PM",
    status: "Active on Duty",
  },
];

