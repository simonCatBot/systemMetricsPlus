"use client";

import { EChartsWrapper, GaugeChartComponent } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { GpuMetrics } from "@/types/metrics";

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

interface GpuHistory {
  usage: ChartDataPoint[];
  memoryUsage: ChartDataPoint[];
  temperature: ChartDataPoint[];
  power: ChartDataPoint[];
}

export default function GpuTab({
  gpus,
  history,
}: {
  gpus: GpuMetrics[];
  history: GpuHistory;
}) {
  if (!gpus || gpus.length === 0) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted-foreground)' }}>
        No GPU detected
      </div>
    );
  }

  const gpu = gpus[0]; // Primary GPU
  const {
    name,
    marketingName,
    vendor,
    usage,
    memory,
    temperature,
    power,
    driverVersion,
    gfxVersion,
    currentClockMHz,
  } = gpu;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              {marketingName || name}
            </h2>
            <p className="text-sm" style={{ color: colors.muted }}>
              {vendor} • Driver: {driverVersion} • GFX: {gfxVersion}
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
            {power !== null && (
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.warning }}>{power}W</p>
                <p className="text-xs" style={{ color: colors.muted }}>Power</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>{usage}%</p>
              <p className="text-xs" style={{ color: colors.muted }}>Usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={usage}
            name="GPU"
            color={colors.primary}
            size={100}
          />
        </div>
        <div className="card p-4 flex flex-col items-center">
          <GaugeChartComponent
            value={memory.total > 0 ? (memory.used / memory.total) * 100 : 0}
            name="VRAM"
            max={100}
            color={colors.info}
            size={100}
          />
          <p className="text-xs mt-2" style={{ color: colors.muted }}>
            {memory.used.toFixed(1)} / {memory.total.toFixed(1)} GB
          </p>
        </div>
        {temperature !== null && (
          <div className="card p-4 flex flex-col items-center">
            <GaugeChartComponent
              value={temperature}
              name="Temp"
              max={100}
              color={colors.warning}
              size={100}
            />
          </div>
        )}
        {power !== null && (
          <div className="card p-4 flex flex-col items-center">
            <GaugeChartComponent
              value={power}
              name="Power"
              max={300}
              color={colors.warning}
              size={100}
            />
          </div>
        )}
      </div>

      {/* GPU Usage Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>GPU Usage History</h3>
        <EChartsWrapper
          series={[
            {
              name: "GPU %",
              data: history.usage,
              color: colors.primary,
            },
          ]}
          height={180}
          showPercent
        />
      </div>

      {/* VRAM Usage Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>VRAM Usage History</h3>
        <EChartsWrapper
          series={[
            {
              name: "VRAM %",
              data: history.memoryUsage,
              color: colors.info,
            },
          ]}
          height={180}
          showPercent
        />
      </div>

      {/* Temperature & Power */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {temperature !== null && (
          <div className="card p-4">
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Temperature History</h3>
            <EChartsWrapper
              series={[
                {
                  name: "°C",
                  data: history.temperature,
                  color: colors.warning,
                },
              ]}
              height={150}
            />
          </div>
        )}
        {power !== null && (
          <div className="card p-4">
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Power History</h3>
            <EChartsWrapper
              series={[
                {
                  name: "Watts",
                  data: history.power,
                  color: colors.warning,
                },
              ]}
              height={150}
            />
          </div>
        )}
      </div>

      {/* Additional GPU Info */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>GPU Specifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>{currentClockMHz} MHz</p>
            <p className="text-xs" style={{ color: colors.muted }}>Core Clock</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>{memory.total.toFixed(1)} GB</p>
            <p className="text-xs" style={{ color: colors.muted }}>VRAM</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>{gfxVersion}</p>
            <p className="text-xs" style={{ color: colors.muted }}>GFX Version</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>{driverVersion}</p>
            <p className="text-xs" style={{ color: colors.muted }}>Driver</p>
          </div>
        </div>
      </div>
    </div>
  );
}
