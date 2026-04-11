"use client";

import type { GpuMedia } from "@/types/metrics";

interface GpuMediaPanelProps {
  media: GpuMedia;
}

export default function GpuMediaPanel({ media }: GpuMediaPanelProps) {
  const { encoder, decoder } = media;

  const formatPercent = (val: number | null) => {
    if (val === null) return "N/A";
    return `${Math.round(val)}%`;
  };

  return (
    <div className="p-4 rounded-lg border" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-md" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
          <svg className="w-5 h-5" style={{ color: "#a855f7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Media Engines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Encoder */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Encoder</span>
            <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
              {formatPercent(encoder)}
            </span>
          </div>
          {encoder !== null && (
            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(encoder, 100)}%`,
                  background: encoder > 70 ? "#a855f7" : "#60a5fa",
                }}
              />
            </div>
          )}
        </div>

        {/* Decoder */}
        <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Decoder</span>
            <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
              {formatPercent(decoder)}
            </span>
          </div>
          {decoder !== null && (
            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(decoder, 100)}%`,
                  background: decoder > 70 ? "#a855f7" : "#60a5fa",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
