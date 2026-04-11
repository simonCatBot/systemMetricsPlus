"use client";

import type { GpuThermal } from "@/types/metrics";

interface GpuThermalPanelProps {
  thermal: GpuThermal;
}

export default function GpuThermalPanel({ thermal }: GpuThermalPanelProps) {
  const { edge, junction, memory, isThrottling, throttleReason } = thermal;

  const formatTemp = (temp: number | null) => {
    if (temp === null) return "N/A";
    return `${Math.round(temp)}°C`;
  };

  const getTempColor = (temp: number | null, threshold: number) => {
    if (temp === null) return "text-muted-foreground";
    if (temp > threshold) return "text-red-500";
    if (temp > threshold * 0.85) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="p-4 rounded-lg border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: "rgba(255, 77, 77, 0.2)" }}>
          <svg className="w-5 h-5" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Thermal Sensors
          </p>
          {isThrottling && (
            <p className="text-sm font-semibold text-red-500">
              ⚠️ Throttling Active
              {throttleReason && <span className="text-xs ml-1">({throttleReason})</span>}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Edge Temp */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Edge
          </p>
          <p className={`text-lg font-bold ${getTempColor(edge, 80)}`}>
            {formatTemp(edge)}
          </p>
        </div>

        {/* Junction Temp */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Junction
          </p>
          <p className={`text-lg font-bold ${getTempColor(junction, 100)}`}>
            {formatTemp(junction)}
          </p>
        </div>

        {/* Memory Temp */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Memory
          </p>
          <p className={`text-lg font-bold ${getTempColor(memory, 90)}`}>
            {formatTemp(memory)}
          </p>
        </div>
      </div>
    </div>
  );
}
