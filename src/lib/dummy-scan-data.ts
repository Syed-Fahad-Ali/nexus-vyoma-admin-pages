export interface ScannedMember {
  id: string;
  name: string;
  email: string;
  timestamp: string;
  scannedBy: string;
  eventName: string;
  ticketId: string;
  status: "Checked In" | "Verified";
  avatarUrl?: string;
}

export const INITIAL_VOLUNTEERS = [
  "Syed Ali Quadri",
  "Ayesha Fatima",
  "Mohammed Zaid",
  "Sneha Rao",
  "Rahul Verma",
];

export const INITIAL_SCANNED_MEMBERS: ScannedMember[] = [
  {
    id: "sc-101",
    name: "Farhan Siddiqui",
    email: "farhan.siddiqui@islec.edu.in",
    timestamp: "Today, 11:42 AM",
    scannedBy: "Syed Ali Quadri",
    eventName: "Tech Battles — Hackathon",
    ticketId: "NV26-TCK-9041",
    status: "Checked In",
  },
  {
    id: "sc-102",
    name: "Ananya Sharma",
    email: "ananya.sharma@cbit.ac.in",
    timestamp: "Today, 11:38 AM",
    scannedBy: "Ayesha Fatima",
    eventName: "Cosplay Showcase",
    ticketId: "NV26-TCK-8824",
    status: "Checked In",
  },
  {
    id: "sc-103",
    name: "Mirza Rayyan",
    email: "mirza.rayyan@mjcet.ac.in",
    timestamp: "Today, 11:25 AM",
    scannedBy: "Syed Ali Quadri",
    eventName: "Automobile Expo",
    ticketId: "NV26-TCK-7712",
    status: "Checked In",
  },
  {
    id: "sc-104",
    name: "Zainab Begum",
    email: "zainab.begum@islec.edu.in",
    timestamp: "Today, 11:14 AM",
    scannedBy: "Mohammed Zaid",
    eventName: "Qawwali Night",
    ticketId: "NV26-TCK-6540",
    status: "Checked In",
  },
  {
    id: "sc-105",
    name: "Karthik Reddy",
    email: "karthik.reddy@vnr.ac.in",
    timestamp: "Today, 10:58 AM",
    scannedBy: "Sneha Rao",
    eventName: "Tech Battles — Coding Arena",
    ticketId: "NV26-TCK-5421",
    status: "Checked In",
  },
  {
    id: "sc-106",
    name: "Fatima Noor",
    email: "fatima.noor@islec.edu.in",
    timestamp: "Today, 10:45 AM",
    scannedBy: "Syed Ali Quadri",
    eventName: "Food Fest Exhibition",
    ticketId: "NV26-TCK-4932",
    status: "Checked In",
  },
  {
    id: "sc-107",
    name: "Rohan Nair",
    email: "rohan.nair@ou.ac.in",
    timestamp: "Today, 10:30 AM",
    scannedBy: "Rahul Verma",
    eventName: "DJ Night — EDM Blast",
    ticketId: "NV26-TCK-3819",
    status: "Checked In",
  },
  {
    id: "sc-108",
    name: "Sameera Khan",
    email: "sameera.khan@deccan.ac.in",
    timestamp: "Today, 10:15 AM",
    scannedBy: "Ayesha Fatima",
    eventName: "Cosplay Showcase",
    ticketId: "NV26-TCK-2940",
    status: "Checked In",
  },
  {
    id: "sc-109",
    name: "Adnan Mohiuddin",
    email: "adnan.m@islec.edu.in",
    timestamp: "Today, 09:55 AM",
    scannedBy: "Mohammed Zaid",
    eventName: "Automobile Expo",
    ticketId: "NV26-TCK-1823",
    status: "Checked In",
  },
  {
    id: "sc-110",
    name: "Pooja Hegde",
    email: "pooja.hegde@jntuh.ac.in",
    timestamp: "Today, 09:40 AM",
    scannedBy: "Sneha Rao",
    eventName: "Qawwali Night",
    ticketId: "NV26-TCK-1104",
    status: "Checked In",
  },
];

