"use client";

import type { CpuMetrics } from "@/types/metrics";
import {
  Cpu,
  Gauge,
  Thermometer,
  Zap,
  Activity,
} from "lucide-react";

function formatTemp(temp: number | null) {
  return temp !== null ? `${temp}°C` : "N/A";
}

function formatLoad(load: number): string {
  return load.toFixed(2);
}

function ProgressBar({
  value,
  alert = false,
}: {
  value: number;
  alert?: boolean;
}) {
  const bgColor = alert ? "bg-red-500" : "var(--primary)";
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: "var(--surface-2)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: bgColor,
        }}
      />
    </div>
  );
}

function getProcessorLabel(name: string) {
  const parts = name.split(" ");
  if (parts[0] === "RYZEN" && parts[1]) return `AMD ${parts[1]}`;
  if (parts[0] === "AMD" && parts[1]) return `${parts[0]} ${parts[1]}`;
  if (parts[0] === "Intel" && parts[1]) return `${parts[0]} ${parts[1]}`;
  return parts[0];
}

interface CpuTabProps {
  data: CpuMetrics | null;
}

export default function CpuTab({ data }: CpuTabProps) {
  if (!data) {
    return (
      <div
        className="p-6 rounded-lg text-center"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        <Cpu
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "var(--muted-foreground)" }}
        />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Loading CPU metrics...
        </p>
      </div>
    );
  }

  const { name, usage, physicalCores, logicalCores, temperature, currentSpeedMHz, loadAvg, coreLoads } = data;
  const [load1, load5, load15] = loadAvg;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div
        className="p-4 rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-md" style={{ background: "rgba(0, 229, 204, 0.2)" }}>
            <Cpu className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              Processor
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
          <span>{getProcessorLabel(name)}</span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "var(--muted-foreground)" }}
          />
          <span>{physicalCores} cores</span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "var(--muted-foreground)" }}
          />
          <span>{logicalCores} threads</span>
        </div>
      </div>

      {/* CPU Usage */}
      <div
        className="p-4 rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              CPU Usage
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <ProgressBar value={usage} alert={usage > 80} />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: usage > 80 ? "#ef4444" : "var(--foreground)" }}
            >
              {Math.round(usage)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          {temperature !== null && temperature !== undefined && temperature > 0 && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <Thermometer className="w-3 h-3" />
              <span>{formatTemp(temperature)}</span>
            </div>
          )}
          {currentSpeedMHz > 0 && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <Zap className="w-3 h-3" />
              <span>{Math.round(currentSpeedMHz)} MHz</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Activity className="w-3 h-3" />
            <span>Load: {formatLoad(load1)}</span>
          </div>
        </div>
      </div>

      {/* Load Averages */}
      <div
        className="p-4 rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Load Averages
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <p className="text-2xl font-bold" style={{ color: load1 > logicalCores ? "#ef4444" : "var(--foreground)" }}>
              {formatLoad(load1)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              1 min
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <p className="text-2xl font-bold" style={{ color: load5 > logicalCores ? "#ef4444" : "var(--foreground)" }}>
              {formatLoad(load5)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              5 min
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <p className="text-2xl font-bold" style={{ color: load15 > logicalCores ? "#ef4444" : "var(--foreground)" }}>
              {formatLoad(load15)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              15 min
            </p>
          </div>
        </div>
      </div>

      {/* Per-Core Usage */}
      {coreLoads.length > 0 && (
        <div
          className="p-4 rounded-lg border"
          style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Per-Core Usage
            </span>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {coreLoads.map((load, i) => (
              <div key={i} className="flex flex-col gap-1 p-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className="flex items-center justify-between text-[10px]">
                  <span style={{ color: "var(--muted-foreground)" }}>C{i}</span>
                  <span
                    className={load > 80 ? "text-red-500 font-bold" : ""}
                    style={load <= 80 ? { color: "var(--foreground)" } : undefined}
                  >
                    {load}%
                  </span>
                </div>
                <ProgressBar value={load} alert={load > 80} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
