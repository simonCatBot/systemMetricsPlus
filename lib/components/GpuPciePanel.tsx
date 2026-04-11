"use client";

import type { GpuPcie, GpuXgmi } from "@/types/metrics";

interface GpuPciePanelProps {
  pcie?: GpuPcie;
  xgmi?: GpuXgmi;
}

export default function GpuPciePanel({ pcie, xgmi }: GpuPciePanelProps) {
  const formatBandwidth = (bw: number | null) => {
    if (bw === null) return "N/A";
    if (bw > 1000) return `${(bw / 1000).toFixed(1)} GB/s`;
    return `${Math.round(bw)} MB/s`;
  };

  return (
    <div className="p-4 rounded-lg border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: "rgba(34, 197, 94, 0.2)" }}>
          <svg className="w-5 h-5" style={{ color: "#22c55e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            PCIe & XGMI
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* PCIe Info */}
        {pcie && (
          <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>PCIe Link</span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                x{pcie.width || "?"} {pcie.speed || "N/A"}
              </span>
            </div>
            {pcie.bandwidth !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Bandwidth</span>
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {formatBandwidth(pcie.bandwidth)}
                </span>
              </div>
            )}
            {pcie.replayErrors !== null && pcie.replayErrors > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-yellow-500">Replay Errors</span>
                <span className="text-sm font-semibold text-yellow-500">{pcie.replayErrors}</span>
              </div>
            )}
          </div>
        )}

        {/* XGMI Info */}
        {xgmi && (
          <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>XGMI Link</span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {xgmi.linkStatus || "Inactive"}
              </span>
            </div>
            {xgmi.bandwidth !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Bandwidth</span>
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {formatBandwidth(xgmi.bandwidth)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* No data state */}
        {!pcie && !xgmi && (
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            PCIe/XGMI data not available
          </p>
        )}
      </div>
    </div>
  );
}
