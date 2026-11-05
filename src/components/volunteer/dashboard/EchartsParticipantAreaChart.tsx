"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface EchartsParticipantAreaChartProps {
  activeTab: "CHECKED_IN" | "PENDING" | "TOTAL";
  eventId?: string;
}

export default function EchartsParticipantAreaChart({
  activeTab,
  eventId = "evt-codecraft-2026",
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

    // Get event-scoped numbers
    const getEventBase = () => {
      if (eventId === "evt-robowars-2026") {
        return { total: 128, checked: 96, mult: 0.1 };
      }
      if (eventId === "evt-webathon-2026") {
        return { total: 240, checked: 180, mult: 0.2 };
      }
      return { total: 1450, checked: 940, mult: 1 };
    };

    const base = getEventBase();

    // Get series configuration based on selected metric tab
    const getConfig = () => {
      switch (activeTab) {
        case "PENDING": {
          const pending = Math.max(0, base.total - base.checked);
          return {
            primaryData: [
              Math.round(base.total * 0.95),
              Math.round(base.total * 0.82),
              Math.round(base.total * 0.55),
              pending,
            ],
            comparisonData: [
              Math.round(base.total * 0.98),
              Math.round(base.total * 0.88),
              Math.round(base.total * 0.65),
              Math.round(pending * 1.2),
            ],
            label: "Pending Entries",
            lineColor: "#D97706",
            gradStart: "rgba(217, 119, 6, 0.35)",
            gradEnd: "rgba(217, 119, 6, 0.02)",
            maxVal: Math.round(base.total * 1.05),
          };
        }
        case "TOTAL":
          return {
            primaryData: [
              Math.round(base.total * 0.82),
              Math.round(base.total * 0.9),
              Math.round(base.total * 0.97),
              base.total,
            ],
            comparisonData: [
              Math.round(base.total * 0.75),
              Math.round(base.total * 0.82),
              Math.round(base.total * 0.92),
              Math.round(base.total * 0.96),
            ],
            label: "Total Enrolled",
            lineColor: "#0A0F1E",
            gradStart: "rgba(10, 15, 30, 0.30)",
            gradEnd: "rgba(10, 15, 30, 0.02)",
            maxVal: Math.round(base.total * 1.05),
          };
        case "CHECKED_IN":
        default:
          return {
            primaryData: [
              Math.round(base.checked * 0.05),
              Math.round(base.checked * 0.22),
              Math.round(base.checked * 0.66),
              base.checked,
            ],
            comparisonData: [
              Math.round(base.checked * 0.02),
              Math.round(base.checked * 0.16),
              Math.round(base.checked * 0.45),
              Math.round(base.checked * 0.75),
            ],
            label: "Checked-in",
            lineColor: "#2563EB",
            gradStart: "rgba(37, 99, 235, 0.38)",
            gradEnd: "rgba(37, 99, 235, 0.02)",
            maxVal: Math.round(base.checked * 1.15),
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
        data: ["Day 1 Morning", "Day 1 Afternoon", "Day 2 Morning", "Live"],
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
  }, [activeTab, eventId]);

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
