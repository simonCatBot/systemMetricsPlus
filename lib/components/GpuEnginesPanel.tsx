"use client";

import type { GpuEngineUtilization } from "@/types/metrics";

interface GpuEnginesPanelProps {
  engines: GpuEngineUtilization;
}

export default function GpuEnginesPanel({ engines }: GpuEnginesPanelProps) {
  const { gfx, mem, mm } = engines;

  // Determine workload type based on engine utilization
  const getWorkloadType = () => {
    if (gfx > 70 && mem < 40) return { label: "Compute-Bound", color: "text-blue-400" };
    if (mem > 70 && gfx < 40) return { label: "Memory-Bound", color: "text-yellow-400" };
    if (mm > 50) return { label: "Video Workload", color: "text-purple-400" };
    if (gfx > 70 && mem > 70) return { label: "Balanced Load", color: "text-green-400" };
    return { label: "Light Load", color: "text-muted-foreground" };
  };

  const workload = getWorkloadType();

  return (
    <div className="p-4 rounded-lg border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: "rgba(255, 77, 77, 0.2)" }}>
          <svg className="w-5 h-5" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            GPU Engines
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            <span className={workload.color}>{workload.label}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* GFX Engine */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>GFX (Compute)</span>
            <span className="text-xs font-medium" style={{ color: gfx > 80 ? "#ef4444" : "var(--foreground)" }}>
              {Math.round(gfx)}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(gfx, 100)}%`,
                background: gfx > 80 ? "#ef4444" : gfx > 50 ? "var(--primary)" : "#60a5fa",
              }}
            />
          </div>
        </div>

        {/* MEM Engine */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>MEM (Memory)</span>
            <span className="text-xs font-medium" style={{ color: mem > 80 ? "#ef4444" : "var(--foreground)" }}>
              {Math.round(mem)}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(mem, 100)}%`,
                background: mem > 80 ? "#ef4444" : mem > 50 ? "#fbbf24" : "#60a5fa",
              }}
            />
          </div>
        </div>

        {/* MM Engine */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>MM (Multimedia)</span>
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {Math.round(mm)}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(mm, 100)}%`,
                background: mm > 50 ? "#a855f7" : "#60a5fa",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
