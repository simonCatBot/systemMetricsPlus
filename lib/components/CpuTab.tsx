"use client";

import { useEffect, useState, useCallback } from "react";
import { EChartsWrapper, GaugeChartComponent } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { CpuMetrics } from "@/types/metrics";

const HISTORY_LENGTH = 60; // Keep 60 data points

interface CpuHistory {
  usage: ChartDataPoint[];
  load1m: ChartDataPoint[];
  load5m: ChartDataPoint[];
  load15m: ChartDataPoint[];
  coreLoads: { name: string; data: ChartDataPoint[] }[];
}

function formatLoad(load: number): string {
  return load.toFixed(2);
}

export default function CpuTab({
  data,
  history,
}: {
  data: CpuMetrics | null;
  history: CpuHistory;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading CPU metrics...
      </div>
    );
  }

  const { name, usage, physicalCores, logicalCores, temperature, loadAvg } = data;
  const [load1, load5, load15] = loadAvg;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{name}</h2>
            <p className="text-sm text-gray-400">
              {physicalCores} cores, {logicalCores} threads
            </p>
          </div>
          <div className="flex items-center gap-6">
            {temperature !== null && (
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">
                  {temperature}°C
                </p>
                <p className="text-xs text-gray-500">Temperature</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{usage}%</p>
              <p className="text-xs text-gray-500">Usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gauges row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={usage}
            name="CPU"
            color="#00b894"
            size={100}
          />
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={Math.min(load1 * 100 / logicalCores, 100)}
            name="Load 1m"
            max={100}
            color="#0984e3"
            size={100}
          />
          <p className="text-xs text-gray-400 mt-2 font-mono">
            {formatLoad(load1)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={Math.min(load5 * 100 / logicalCores, 100)}
            name="Load 5m"
            max={100}
            color="#6c5ce7"
            size={100}
          />
          <p className="text-xs text-gray-400 mt-2 font-mono">
            {formatLoad(load5)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={Math.min(load15 * 100 / logicalCores, 100)}
            name="Load 15m"
            max={100}
            color="#fdcb6e"
            size={100}
          />
          <p className="text-xs text-gray-400 mt-2 font-mono">
            {formatLoad(load15)}
          </p>
        </div>
      </div>

      {/* CPU Usage Chart */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">CPU Usage History</h3>
        <EChartsWrapper
          series={[
            {
              name: "CPU Usage %",
              data: history.usage,
              color: "#00b894",
            },
          ]}
          height={200}
          showPercent
        />
      </div>

      {/* Load Average Chart */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Load Average</h3>
        <EChartsWrapper
          series={[
            {
              name: "1 min",
              data: history.load1m,
              color: "#0984e3",
            },
            {
              name: "5 min",
              data: history.load5m,
              color: "#6c5ce7",
            },
            {
              name: "15 min",
              data: history.load15m,
              color: "#fdcb6e",
            },
          ]}
          height={180}
          showLegend
        />
      </div>

      {/* Per-Core Usage */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Per-Core Usage</h3>
        <EChartsWrapper
          series={history.coreLoads.map((core, i) => ({
            name: `Core ${i}`,
            data: core.data,
            color: `hsl(${(i * 360) / history.coreLoads.length}, 70%, 50%)`,
          }))}
          height={200}
          showLegend
          showPercent
        />
      </div>
    </div>
  );
}
