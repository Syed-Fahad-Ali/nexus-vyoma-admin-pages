"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { EventStats } from "@/services/types/volunteer";

interface EchartsParticipantAreaChartProps {
  activeTab: "CHECKED_IN" | "PENDING" | "TOTAL";
  eventId?: string;
  stats?: EventStats | null;
}

export default function EchartsParticipantAreaChart({
  activeTab,
  eventId = "evt-codecraft-2026",
  stats,
}: EchartsParticipantAreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: "canvas",
      });
    }

    const chart = chartInstance.current;

    const total = stats?.totalParticipants ?? 0;
    const checked = stats?.checkedInCount ?? 0;
    const pending = stats?.pendingCount ?? Math.max(0, total - checked);

    // Get series configuration based on selected metric tab
    const getConfig = () => {
      switch (activeTab) {
        case "PENDING": {
          return {
            primaryData: [
              Math.round(total * 0.95),
              Math.round(total * 0.8),
              Math.round(total * 0.5),
              pending,
            ],
            comparisonData: [
              Math.round(total * 0.98),
              Math.round(total * 0.85),
              Math.round(total * 0.6),
              Math.round(pending * 1.15),
            ],
            label: "Pending Entries",
            lineColor: "#D97706",
            gradStart: "rgba(217, 119, 6, 0.35)",
            gradEnd: "rgba(217, 119, 6, 0.02)",
            maxVal: Math.max(10, Math.round((total || 10) * 1.05)),
          };
        }
        case "TOTAL":
          return {
            primaryData: [
              Math.round(total * 0.8),
              Math.round(total * 0.88),
              Math.round(total * 0.95),
              total,
            ],
            comparisonData: [
              Math.round(total * 0.75),
              Math.round(total * 0.82),
              Math.round(total * 0.9),
              Math.round(total * 0.96),
            ],
            label: "Total Enrolled",
            lineColor: "#0A0F1E",
            gradStart: "rgba(10, 15, 30, 0.30)",
            gradEnd: "rgba(10, 15, 30, 0.02)",
            maxVal: Math.max(10, Math.round((total || 10) * 1.05)),
          };
        case "CHECKED_IN":
        default:
          return {
            primaryData: [
              Math.round(checked * 0.1),
              Math.round(checked * 0.3),
              Math.round(checked * 0.65),
              checked,
            ],
            comparisonData: [
              Math.round(checked * 0.05),
              Math.round(checked * 0.2),
              Math.round(checked * 0.45),
              Math.round(checked * 0.75),
            ],
            label: "Checked-in",
            lineColor: "#2563EB",
            gradStart: "rgba(37, 99, 235, 0.38)",
            gradEnd: "rgba(37, 99, 235, 0.02)",
            maxVal: Math.max(10, Math.round((checked || total || 10) * 1.15)),
          };
      }
    };

    const cfg = getConfig();

    const option: echarts.EChartsOption = {
      grid: {
        left: 10,
        right: 10,
        top: 20,
        bottom: 10,
        containLabel: false,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "#CBD5E1",
            type: "dashed",
            width: 1.5,
          },
        },
        backgroundColor: "#0A0F1E",
        borderColor: "#0A0F1E",
        borderWidth: 0,
        padding: [8, 12],
        textStyle: {
          color: "#FFFFFF",
          fontSize: 12,
        },
        formatter: (params: unknown) => {
          const items = params as Array<{
            name: string;
            seriesName: string;
            value: number;
            color: string;
          }>;
          if (!items || items.length === 0) return "";
          let html = `<div style="font-weight:600;font-size:11px;color:#94A3B8;margin-bottom:4px;">${items[0].name}</div>`;
          items.forEach((item) => {
            const valFormatted = item.value.toLocaleString();
            html += `<div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-top:2px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${item.color};"></span>
              <span style="color:#E2E8F0;">${item.seriesName}:</span>
              <span style="font-weight:700;color:#FFFFFF;margin-left:auto;">${valFormatted}</span>
            </div>`;
          });
          return html;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: stats?.timeSeries?.dates || ["Day 1 Morning", "Day 1 Afternoon", "Day 2 Morning", "Live"],
        axisLine: {
          lineStyle: { color: "#E2E8F0" },
        },
        axisTick: { show: false },
        axisLabel: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: cfg.maxVal,
        splitLine: {
          lineStyle: {
            color: "#F1F5F9",
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: false,
        },
      },
      series: [
        {
          name: `This Period (${cfg.label})`,
          type: "line",
          data: cfg.primaryData,
          smooth: 0.35,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 7,
          itemStyle: {
            color: cfg.lineColor,
            borderColor: "#FFFFFF",
            borderWidth: 2,
          },
          lineStyle: {
            width: 2.75,
            color: cfg.lineColor,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: cfg.gradStart },
              { offset: 1, color: cfg.gradEnd },
            ]),
          },
          animationDuration: 500,
        },
        {
          name: "Last Period (Benchmark)",
          type: "line",
          data: cfg.comparisonData,
          smooth: 0.35,
          showSymbol: false,
          lineStyle: {
            width: 1.5,
            color: "#CBD5E1",
            type: "dashed",
          },
          animationDuration: 500,
        },
      ],
    };

    chart.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeTab, eventId, stats]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      className="w-full h-[260px] min-h-[260px]"
      style={{ width: "100%", height: 260 }}
    />
  );
}
