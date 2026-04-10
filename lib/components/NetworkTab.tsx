"use client";

import type { NetworkMetrics } from "@/types/metrics";
import {
  Wifi,
  ArrowDown,
  ArrowUp,
  Activity,
} from "lucide-react";

function formatSpeed(kbps: number) {
  if (kbps >= 1024 * 1024) {
    return `${(kbps / (1024 * 1024)).toFixed(2)} GB/s`;
  }
  if (kbps >= 1024) {
    return `${(kbps / 1024).toFixed(1)} MB/s`;
  }
  return `${kbps} KB/s`;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
  }
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
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

interface NetworkTabProps {
  data: NetworkMetrics | null;
}

export default function NetworkTab({ data }: NetworkTabProps) {
  if (!data || !data.interfaces || data.interfaces.length === 0) {
    return (
      <div
        className="p-6 rounded-lg text-center"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        <Wifi
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "var(--muted-foreground)" }}
        />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          No network interfaces detected
        </p>
      </div>
    );
  }

  const { interfaces, total } = data;
  const primaryInterface = interfaces[0];

  return (
    <div className="space-y-4">
      {/* Primary Interface */}
      <div
        className="p-4 rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-md" style={{ background: "rgba(0, 229, 204, 0.2)" }}>
            <Wifi className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              Primary Interface
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {primaryInterface.name}
            </p>
          </div>
        </div>

        {/* Speed & Activity */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {formatSpeed(primaryInterface.rxSec)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {formatSpeed(primaryInterface.txSec)}
            </span>
          </div>
        </div>

        {/* Activity Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Download
              </span>
              <Activity className="w-3 h-3 text-green-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                {formatSpeed(primaryInterface.rxSec)}
              </span>
            </div>
            <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
              Total: {formatBytes(primaryInterface.rxBytes)}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Upload
              </span>
              <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                {formatSpeed(primaryInterface.txSec)}
              </span>
            </div>
            <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
              Total: {formatBytes(primaryInterface.txBytes)}
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div
        className="p-4 rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Aggregate Traffic
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <p className="text-2xl font-bold text-green-400">
              {formatSpeed(total.rxSec)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Download Speed
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
            <p className="text-2xl font-bold text-blue-400">
              {formatSpeed(total.txSec)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Upload Speed
            </p>
          </div>
        </div>
      </div>

      {/* All Interfaces */}
      {interfaces.length > 1 && (
        <div
          className="p-4 rounded-lg border"
          style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              All Interfaces
            </span>
          </div>

          <div className="space-y-3">
            {interfaces.map((iface) => (
              <div key={iface.name} className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {iface.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {iface.speed > 0 ? `${iface.speed} Mbps` : "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-green-400" />
                    <span style={{ color: "var(--muted-foreground)" }}>↓</span>
                    <span style={{ color: "var(--foreground)" }}>{formatSpeed(iface.rxSec)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-blue-400" />
                    <span style={{ color: "var(--muted-foreground)" }}>↑</span>
                    <span style={{ color: "var(--foreground)" }}>{formatSpeed(iface.txSec)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
