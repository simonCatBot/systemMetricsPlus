"use client";

import { EChartsWrapper, GaugeChartComponent } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { DiskMetrics } from "@/types/metrics";

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

interface DiskHistory {
  usage: ChartDataPoint[];
}

export default function DiskTab({
  data,
  history,
}: {
  data: DiskMetrics | null;
  history: DiskHistory;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted-foreground)' }}>
        Loading disk metrics...
      </div>
    );
  }

  const { disks, total } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>Storage</h2>
            <p className="text-sm" style={{ color: colors.muted }}>
              {disks.length} disk{disks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.info }}>
                {total.total.toFixed(1)} GB
              </p>
              <p className="text-xs" style={{ color: colors.muted }}>Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.warning }}>
                {total.used.toFixed(1)} GB
              </p>
              <p className="text-xs" style={{ color: colors.muted }}>Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.muted }}>
                {total.free.toFixed(1)} GB
              </p>
              <p className="text-xs" style={{ color: colors.muted }}>Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disk Usage Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {disks.map((disk, i) => (
          <div
            key={disk.name}
            className="card p-4 flex flex-col items-center"
          >
            <GaugeChartComponent
              value={disk.usage}
              name={disk.name.split("/").pop() || `Disk ${i}`}
              color={`hsl(${(i * 360) / disks.length + 120}, 70%, 50%)`}
              size={100}
            />
            <p className="text-xs mt-2 text-center truncate" style={{ color: colors.muted }}>
              {disk.name}
            </p>
            <p className="text-xs" style={{ color: colors.muted }}>
              {disk.used.toFixed(1)} / {disk.total.toFixed(1)} GB
            </p>
          </div>
        ))}
      </div>

      {/* Disk Usage Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Disk Activity</h3>
        <EChartsWrapper
          series={[
            {
              name: "Usage %",
              data: history.usage,
              color: colors.accent,
            },
          ]}
          height={200}
          showPercent
        />
      </div>

      {/* Individual Disk Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disks.map((disk) => (
          <div
            key={disk.name}
            className="card p-4"
          >
            <h4 className="font-medium mb-3 truncate" style={{ color: colors.text }} title={disk.name}>
              {disk.name}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.muted }}>Total</span>
                <span style={{ color: colors.text }}>{disk.total.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.muted }}>Used</span>
                <span style={{ color: colors.warning }}>{disk.used.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.muted }}>Free</span>
                <span style={{ color: colors.success }}>{disk.free.toFixed(1)} GB</span>
              </div>
              <div className="mt-3">
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${disk.usage}%`, background: `linear-gradient(to right, ${colors.info}, ${colors.warning})` }}
                  />
                </div>
                <p className="text-xs text-right mt-1" style={{ color: colors.muted }}>{disk.usage}% used</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
