"use client";

import type { GpuPower } from "@/types/metrics";

interface GpuPowerPanelProps {
  power: GpuPower;
}

export default function GpuPowerPanel({ power }: GpuPowerPanelProps) {
  const { instant, average, voltage } = power;

  const formatPower = (w: number | null) => {
    if (w === null) return "N/A";
    return `${w.toFixed(1)}W`;
  };

  const formatVoltage = (v: number | null) => {
    if (v === null) return "N/A";
    return `${v.toFixed(2)}V`;
  };

  return (
    <div className="p-4 rounded-lg border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: "rgba(239, 68, 68, 0.2)" }}>
          <svg className="w-5 h-5" style={{ color: "#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Power Delivery
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Instant Power */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Instant
          </p>
          <p className="text-lg font-bold" style={{ color: instant && instant > 150 ? "#ef4444" : "var(--foreground)" }}>
            {formatPower(instant)}
          </p>
        </div>

        {/* Average Power */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Average
          </p>
          <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
            {formatPower(average)}
          </p>
        </div>

        {/* Voltage */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Voltage
          </p>
          <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
            {formatVoltage(voltage)}
          </p>
        </div>
      </div>
    </div>
  );
}
