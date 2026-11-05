export interface ParticipantChartPoint {
  date: string;
  label: string;
  checkedIn: number;
  totalEnrolled: number;
}

export const PARTICIPANT_CHART_DATA: ParticipantChartPoint[] = [
  {
    date: "2026-11-02",
    label: "Nov 02",
    checkedIn: 45,
    totalEnrolled: 1450,
  },
  {
    date: "2026-11-03",
    label: "Nov 03",
    checkedIn: 210,
    totalEnrolled: 1450,
  },
  {
    date: "2026-11-04",
    label: "Nov 04",
    checkedIn: 620,
    totalEnrolled: 1450,
  },
  {
    date: "2026-11-05",
    label: "Nov 05",
    checkedIn: 940,
    totalEnrolled: 1450,
  },
];
