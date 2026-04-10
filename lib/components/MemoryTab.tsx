"use client";

import { EChartsWrapper, GaugeChartComponent } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { MemoryMetrics } from "@/types/metrics";

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

interface MemoryHistory {
  usage: ChartDataPoint[];
  swap: ChartDataPoint[];
}

export default function MemoryTab({
  data,
  history,
}: {
  data: MemoryMetrics | null;
  history: MemoryHistory;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted-foreground)' }}>
        Loading memory metrics...
      </div>
    );
  }

  const { total, used, free, usage, swapTotal, swapUsed, swapFree } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>Memory</h2>
            <p className="text-sm" style={{ color: colors.muted }}>
              Physical RAM
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.info }}>{total.toFixed(1)} GB</p>
              <p className="text-xs" style={{ color: colors.muted }}>Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.success }}>{used.toFixed(1)} GB</p>
              <p className="text-xs" style={{ color: colors.muted }}>Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.muted }}>{free.toFixed(1)} GB</p>
              <p className="text-xs" style={{ color: colors.muted }}>Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={usage}
            name="RAM"
            color={colors.accent}
            size={100}
          />
        </div>
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={(used / total) * 100}
            name="Used"
            max={100}
            color={colors.success}
            size={100}
          />
          <p className="text-xs mt-2" style={{ color: colors.muted }}>{used.toFixed(1)} GB</p>
        </div>
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={(free / total) * 100}
            name="Free"
            max={100}
            color={colors.info}
            size={100}
          />
          <p className="text-xs mt-2" style={{ color: colors.muted }}>{free.toFixed(1)} GB</p>
        </div>
        {swapTotal > 0 && (
          <div className="card p-4 flex flex-col items-center">
            <GaugeChartComponent
              value={swapTotal > 0 ? (swapUsed / swapTotal) * 100 : 0}
              name="Swap"
              max={100}
              color={colors.purple}
              size={100}
            />
            <p className="text-xs mt-2" style={{ color: colors.muted }}>
              {swapUsed.toFixed(1)} / {swapTotal.toFixed(1)} GB
            </p>
          </div>
        )}
      </div>

      {/* Memory Usage Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Memory Usage History</h3>
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

      {/* Memory Breakdown Bar */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Memory Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: colors.muted }}>
              <span>Used</span>
              <span>{used.toFixed(1)} GB ({usage}%)</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${usage}%`, background: `linear-gradient(to right, ${colors.success}, ${colors.accent})` }}
              />
            </div>
          </div>
          {swapTotal > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: colors.muted }}>
                <span>Swap</span>
                <span>
                  {swapUsed.toFixed(1)} / {swapTotal.toFixed(1)} GB
                </span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(swapUsed / swapTotal) * 100}%`, background: colors.purple }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
