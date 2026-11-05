"use client";

import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

interface MuiParticipantAreaChartProps {
  activeTab: "CHECKED_IN" | "PENDING" | "TOTAL";
}

export default function MuiParticipantAreaChart({
  activeTab,
}: MuiParticipantAreaChartProps) {
  // Dynamic series based on selected metric tab
  const getSeriesConfig = () => {
    switch (activeTab) {
      case "PENDING":
        return {
          primaryData: [1405, 1240, 830, 510],
          comparisonData: [1430, 1300, 1030, 740],
          label: "Pending Entries",
          color: "#D97706",
          gradientStart: "#F59E0B",
          gradientStop: "#FEF3C7",
          maxVal: 1500,
        };
      case "TOTAL":
        return {
          primaryData: [1200, 1310, 1420, 1450],
          comparisonData: [1100, 1200, 1350, 1390],
          label: "Total Enrolled",
          color: "#0A0F1E",
          gradientStart: "#1E293B",
          gradientStop: "#F1F5F9",
          maxVal: 1500,
        };
      case "CHECKED_IN":
      default:
        return {
          primaryData: [45, 210, 620, 940],
          comparisonData: [20, 150, 420, 710],
          label: "Checked-in",
          color: "#2563EB",
          gradientStart: "#3B82F6",
          gradientStop: "#EFF6FF",
          maxVal: 1000,
        };
    }
  };

  const config = getSeriesConfig();

  return (
    <div className="w-full relative min-h-[280px]">
      {/* SVG Defs for linear gradient fill on the area */}
      <svg className="w-0 h-0 absolute overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="muiParticipantGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.gradientStart} stopOpacity={0.35} />
            <stop offset="100%" stopColor={config.gradientStop} stopOpacity={0.02} />
          </linearGradient>
        </defs>
      </svg>

      <LineChart
        xAxis={[
          {
            data: ["Nov 02", "Nov 03", "Nov 04", "Nov 05"],
            scaleType: "point",
            tickLabelStyle: {
              fontSize: 12,
              fill: "#64748B",
              fontWeight: 500,
            },
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: config.maxVal,
            tickLabelStyle: {
              fontSize: 11,
              fill: "#94A3B8",
              fontFamily: "monospace",
            },
          },
        ]}
        series={[
          {
            id: "this-period",
            data: config.primaryData,
            label: `This Period (${config.label})`,
            area: true,
            color: config.color,
            showMark: true,
            curve: "linear",
          },
          {
            id: "last-period",
            data: config.comparisonData,
            label: "Last Period",
            area: false,
            color: "#CBD5E1",
            showMark: false,
            curve: "linear",
          },
        ]}
        grid={{ horizontal: true }}
        hideLegend
        height={280}
        margin={{ top: 20, right: 20, bottom: 30, left: 55 }}
        sx={{
          "& .MuiAreaElement-series-this-period": {
            fill: "url(#muiParticipantGrad) !important",
          },
          "& .MuiLineElement-series-this-period": {
            strokeWidth: 2.5,
          },
          "& .MuiLineElement-series-last-period": {
            strokeWidth: 1.75,
            strokeDasharray: "4 4",
          },
          "& .MuiMarkElement-series-this-period": {
            stroke: config.color,
            fill: "#FFFFFF",
            strokeWidth: 2.5,
            r: 4.5,
          },
          "& .MuiChartsGrid-line": {
            stroke: "#F1F5F9",
          },
          "& .MuiChartsAxis-line": {
            stroke: "#E2E8F0",
          },
          "& .MuiChartsAxis-tick": {
            stroke: "#E2E8F0",
          },
        }}
      />
    </div>
  );
}
