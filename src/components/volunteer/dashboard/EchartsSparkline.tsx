"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface EchartsSparklineProps {
  data: number[];
  color: string;
  fillColorStart: string;
  fillColorEnd?: string;
  height?: number;
}

export default function EchartsSparkline({
  data,
  color,
  fillColorStart,
  fillColorEnd = "rgba(255, 255, 255, 0.0)",
  height = 54,
}: EchartsSparklineProps) {
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

    const option: echarts.EChartsOption = {
      grid: {
        left: 2,
        right: 2,
        top: 4,
        bottom: 2,
      },
      xAxis: {
        type: "category",
        show: false,
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        show: false,
        min: "dataMin",
      },
      tooltip: {
        trigger: "axis",
        position: (point) => [point[0], "10%"],
        backgroundColor: "#0A0F1E",
        borderColor: "#0A0F1E",
        padding: [3, 6],
        textStyle: {
          color: "#FFFFFF",
          fontSize: 10,
          fontWeight: 600,
        },
        formatter: (params: unknown) => {
          const items = params as Array<{ value: number }>;
          return items && items[0] ? `${items[0].value}` : "";
        },
      },
      series: [
        {
          type: "line",
          data,
          smooth: 0.35,
          showSymbol: false,
          lineStyle: {
            width: 2.2,
            color,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: fillColorStart },
              { offset: 1, color: fillColorEnd },
            ]),
          },
        },
      ],
    };

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, color, fillColorStart, fillColorEnd]);

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
      style={{ width: "100%", height }}
      className="w-full h-full overflow-hidden"
    />
  );
}

