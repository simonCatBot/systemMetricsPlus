"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { ChartDataPoint, LineSeriesConfig } from "./charts";

// Helper to convert HSL to hex for alpha blending
function hslToRgba(h: number, s: number, l: number, a: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${a})`;
}

function addAlphaToColor(color: string, alpha: number): string {
  // If it's an HSL color (starts with hsl)
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      return hslToRgba(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), alpha);
    }
  }
  // If it's hex, convert to rgba
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Fallback - just return as is
  return color;
}

interface EChartsWrapperProps {
  series: LineSeriesConfig[];
  height?: number;
  showLegend?: boolean;
  showPercent?: boolean;
}

export function EChartsWrapper({
  series,
  height = 300,
  showLegend = false,
  showPercent = false,
}: EChartsWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    async function initChart() {
      const echartsModule = await import("echarts");
      const echarts = (echartsModule as unknown as { default?: unknown }).default || echartsModule;
      if (!mounted || !chartRef.current) return;

      const instance = (echarts as { init: (el: HTMLDivElement, theme?: unknown, opts?: { renderer: string }) => unknown }).init(chartRef.current, undefined, { renderer: "canvas" });
      setChartInstance(instance);
    }

    initChart();

    return () => {
      mounted = false;
    };
  }, []);

  const buildOption = useCallback(() => {
    const timestamps = series[0]?.data.map((d) => d.timestamp) || [];
    const formattedTimes = timestamps.map((t) =>
      new Date(t).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    return {
      animation: true,
      animationDuration: 300,
      grid: {
        left: 50,
        right: 20,
        top: showLegend ? 40 : 20,
        bottom: 30,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          animation: false,
        },
        formatter: (params: unknown) => {
          const p = params as { seriesName: string; value: number; color: string; dataIndex: number }[];
          if (!Array.isArray(p) || p.length === 0) return "";
          const time = formattedTimes[p[0]?.dataIndex || 0] || "";
          const rows = p
            .map(
              (item) =>
                `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color}"></span>${item.seriesName}: <strong>${item.value.toFixed(1)}</strong>`
            )
            .join("<br/>");
          return `<div style="font-family:monospace;font-size:12px"><div style="color:#888;margin-bottom:4px">${time}</div>${rows}</div>`;
        },
      },
      legend: showLegend
        ? {
            show: true,
            top: 5,
            textStyle: { fontSize: 11 },
          }
        : undefined,
      xAxis: {
        type: "category",
        data: formattedTimes,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#333" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#666",
          fontSize: 10,
          interval: Math.max(0, Math.floor(formattedTimes.length / 6) - 1),
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: showPercent ? 0 : undefined,
        max: showPercent ? 100 : undefined,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#666",
          fontSize: 10,
          formatter: (value: number) =>
            showPercent ? `${value}%` : value.toFixed(0),
        },
        splitLine: {
          lineStyle: { color: "#222", type: "dashed" },
        },
      },
      series: series.map((s) => ({
        name: s.name,
        type: "line",
        data: s.data.map((d) => d.value),
        symbol: "none",
        smooth: true,
        lineStyle: {
          width: 2,
          color: s.color || "#5470c6",
        },
        areaStyle: s.color
          ? {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: addAlphaToColor(s.color, 0.4) },
                  { offset: 1, color: addAlphaToColor(s.color, 0.05) },
                ],
              },
            }
          : undefined,
      })),
    };
  }, [series, showLegend, showPercent]);

  useEffect(() => {
    if (chartInstance) {
      (chartInstance as { setOption: (opt: unknown, notMerge?: boolean) => void }).setOption(buildOption(), true);
    }
  }, [chartInstance, buildOption]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstance) {
        (chartInstance as { resize: () => void }).resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartInstance]);

  return <div ref={chartRef} style={{ width: "100%", height: `${height}px` }} />;
}

// Gauge chart component
interface GaugeChartProps {
  value: number;
  name: string;
  max?: number;
  unit?: string;
  color?: string;
  size?: number;
}

export function GaugeChartComponent({
  value,
  name,
  max = 100,
  unit = "%",
  color,
  size = 120,
}: GaugeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    async function initChart() {
      const echartsModule = await import("echarts");
      const echarts = (echartsModule as unknown as { default?: unknown }).default || echartsModule;
      if (!mounted || !chartRef.current) return;

      const instance = (echarts as { init: (el: HTMLDivElement, theme?: unknown, opts?: { renderer: string }) => unknown }).init(chartRef.current, undefined, { renderer: "canvas" });
      setChartInstance(instance);
    }

    initChart();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!chartInstance) return;

    const instance = chartInstance as {
      setOption: (opt: unknown) => void;
    };

    instance.setOption({
      series: [
        {
          type: "gauge",
          startAngle: 220,
          endAngle: -40,
          min: 0,
          max,
          radius: "90%",
          progress: {
            show: true,
            width: 12,
            itemStyle: {
              color: color || "#5470c6",
            },
          },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [[1, "#222"]],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          title: {
            show: true,
            offsetCenter: [0, "70%"],
            fontSize: 11,
            color: "#888",
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, "30%"],
            fontSize: 18,
            fontWeight: "bold",
            formatter: `{value}${unit}`,
            color: "#fff",
          },
          data: [{ value, name }],
        },
      ],
    });
  }, [chartInstance, value, name, max, unit, color]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstance) {
        (chartInstance as { resize: () => void }).resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartInstance]);

  return <div ref={chartRef} style={{ width: `${size}px`, height: `${size}px` }} />;
}
