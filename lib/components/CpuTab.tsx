"use client";

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

// Color palette from CSS variables
const colors = {
  primary: '#FF4D4D',     // Coral Red
  accent: '#00e5cc',      // Teal
  warning: '#f59e0b',     // Amber
  info: '#3b82f6',        // Blue
  purple: '#8b5cf6',     // Purple
  success: '#22c55e',    // Green
  text: '#ededed',
  muted: '#737373',
};

export default function CpuTab({
  data,
  history,
}: {
  data: CpuMetrics | null;
  history: CpuHistory;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted-foreground)' }}>
        Loading CPU metrics...
      </div>
    );
  }

  const { name, usage, physicalCores, logicalCores, temperature, loadAvg } = data;
  const [load1, load5, load15] = loadAvg;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>{name}</h2>
            <p className="text-sm" style={{ color: colors.muted }}>
              {physicalCores} cores, {logicalCores} threads
            </p>
          </div>
          <div className="flex items-center gap-6">
            {temperature !== null && (
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.warning }}>
                  {temperature}°C
                </p>
                <p className="text-xs" style={{ color: colors.muted }}>Temperature</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.accent }}>{usage}%</p>
              <p className="text-xs" style={{ color: colors.muted }}>Usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gauges row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={usage}
            name="CPU"
            color={colors.accent}
            size={100}
          />
        </div>
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={Math.min(load1 * 100 / logicalCores, 100)}
            name="Load 1m"
            max={100}
            color={colors.info}
            size={100}
          />
          <p className="text-xs mt-2 font-mono" style={{ color: colors.muted }}>
            {formatLoad(load1)}
          </p>
        </div>
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={Math.min(load5 * 100 / logicalCores, 100)}
            name="Load 5m"
            max={100}
            color={colors.purple}
            size={100}
          />
          <p className="text-xs mt-2 font-mono" style={{ color: colors.muted }}>
            {formatLoad(load5)}
          </p>
        </div>
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={Math.min(load15 * 100 / logicalCores, 100)}
            name="Load 15m"
            max={100}
            color={colors.warning}
            size={100}
          />
          <p className="text-xs mt-2 font-mono" style={{ color: colors.muted }}>
            {formatLoad(load15)}
          </p>
        </div>
      </div>

      {/* CPU Usage Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>CPU Usage History</h3>
        <EChartsWrapper
          series={[
            {
              name: "CPU Usage %",
              data: history.usage,
              color: colors.accent,
            },
          ]}
          height={200}
          showPercent
        />
      </div>

      {/* Load Average Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Load Average</h3>
        <EChartsWrapper
          series={[
            {
              name: "1 min",
              data: history.load1m,
              color: colors.info,
            },
            {
              name: "5 min",
              data: history.load5m,
              color: colors.purple,
            },
            {
              name: "15 min",
              data: history.load15m,
              color: colors.warning,
            },
          ]}
          height={180}
          showLegend
        />
      </div>

      {/* Per-Core Usage */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Per-Core Usage</h3>
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
