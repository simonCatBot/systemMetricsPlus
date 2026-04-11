"use client";

import type { MemoryMetrics, DiskMetrics } from "@/types/metrics";
import {
  MemoryStick,
  HardDrive,
  Gauge,
  Activity,
} from "lucide-react";

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

interface SystemMemorySectionProps {
  data: MemoryMetrics;
}

function SystemMemorySection({ data }: SystemMemorySectionProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { total, used, free, usage, swapTotal, swapUsed, swapFree: _swapFree } = data;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: "rgba(0, 229, 204, 0.2)" }}>
          <MemoryStick className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            System Memory
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {total.toFixed(1)} GB Total
          </p>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Memory Usage
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
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center p-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold text-green-400">{used.toFixed(1)} GB</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Used
          </p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{free.toFixed(1)} GB</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Free
          </p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold text-cyan-400">{swapUsed.toFixed(1)} GB</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Swap
          </p>
        </div>
      </div>

      {/* Swap Bar */}
      {swapTotal > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Swap Usage
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {Math.round((swapUsed / swapTotal) * 100)}%
            </span>
          </div>
          <ProgressBar value={(swapUsed / swapTotal) * 100} alert={(swapUsed / swapTotal) * 100 > 50} />
          <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            <span>{swapUsed.toFixed(1)} GB used</span>
            <span>{swapTotal.toFixed(1)} GB total</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface DiskSectionProps {
  data: DiskMetrics;
}

function DiskSection({ data }: DiskSectionProps) {
  const { disks, total } = data;
  const totalUsage = total.total > 0 ? Math.round((total.used / total.total) * 100) : 0;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: "rgba(255, 77, 77, 0.2)" }}>
          <HardDrive className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            Storage
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {disks.length} disk{disks.length !== 1 ? "s" : ""} • {total.total.toFixed(1)} GB
          </p>
        </div>
      </div>

      {/* Total Disk Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Disk Usage
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <ProgressBar value={totalUsage} alert={totalUsage > 80} />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: totalUsage > 80 ? "#ef4444" : "var(--foreground)" }}
            >
              {totalUsage}%
            </span>
          </div>
        </div>
      </div>

      {/* Individual Disks */}
      <div className="space-y-3">
        {disks.map((disk) => (
          <div key={disk.name} className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                  {disk.name}
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                {disk.usage}%
              </span>
            </div>
            <ProgressBar value={disk.usage} alert={disk.usage > 80} />
            <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              <span>{disk.used.toFixed(1)} GB used</span>
              <span>{disk.total.toFixed(1)} GB</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MemoryTabProps {
  memory: MemoryMetrics | null;
  disk: DiskMetrics | null;
}

export default function MemoryTab({ memory, disk }: MemoryTabProps) {
  if (!memory && !disk) {
    return (
      <div
        className="p-6 rounded-lg text-center"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        <MemoryStick
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "var(--muted-foreground)" }}
        />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Loading memory metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memory && <SystemMemorySection data={memory} />}
      {disk && <DiskSection data={disk} />}
    </div>
  );
}
