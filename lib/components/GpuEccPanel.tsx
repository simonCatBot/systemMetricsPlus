"use client";

import type { GpuEcc } from "@/types/metrics";

interface GpuEccPanelProps {
  ecc?: GpuEcc;
}

export default function GpuEccPanel({ ecc }: GpuEccPanelProps) {
  if (!ecc) {
    return (
      <div className="p-4 rounded-lg border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-md" style={{ background: "rgba(107, 114, 128, 0.2)" }}>
            <svg className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              ECC Status
            </p>
          </div>
        </div>
        <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          ECC data not available
        </p>
      </div>
    );
  }

  const { correctable, uncorrectable } = ecc;
  const hasErrors = correctable > 0 || uncorrectable > 0;

  return (
    <div className="p-4 rounded-lg border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: hasErrors ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)" }}>
          <svg 
            className="w-5 h-5" 
            style={{ color: hasErrors ? "#ef4444" : "#22c55e" }} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            ECC Status
          </p>
          {hasErrors ? (
            <p className="text-sm font-semibold text-red-500">Errors Detected</p>
          ) : (
            <p className="text-sm font-semibold text-green-500">No Errors</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Correctable Errors */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Correctable</span>
            <span 
              className="text-sm font-bold" 
              style={{ color: correctable > 0 ? "#eab308" : "var(--foreground)" }}
            >
              {correctable}
            </span>
          </div>
        </div>

        {/* Uncorrectable Errors */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Uncorrectable</span>
            <span 
              className="text-sm font-bold" 
              style={{ color: uncorrectable > 0 ? "#ef4444" : "var(--foreground)" }}
            >
              {uncorrectable}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
