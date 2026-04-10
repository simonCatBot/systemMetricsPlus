"use client";

import { EChartsWrapper } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { NetworkMetrics } from "@/types/metrics";

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

interface NetworkHistory {
  download: ChartDataPoint[];
  upload: ChartDataPoint[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function NetworkTab({
  data,
  history,
}: {
  data: NetworkMetrics | null;
  history: NetworkHistory;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted-foreground)' }}>
        Loading network metrics...
      </div>
    );
  }

  const { interfaces, total } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>Network</h2>
            <p className="text-sm" style={{ color: colors.muted }}>
              {interfaces.length} interface{interfaces.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.success }}>
                {formatBytes(total.rxSec)}/s
              </p>
              <p className="text-xs" style={{ color: colors.muted }}>Download</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: colors.info }}>
                {formatBytes(total.txSec)}/s
              </p>
              <p className="text-xs" style={{ color: colors.muted }}>Upload</p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Speed Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted-foreground)' }}>Network Activity</h3>
        <EChartsWrapper
          series={[
            {
              name: "Download",
              data: history.download,
              color: colors.success,
            },
            {
              name: "Upload",
              data: history.upload,
              color: colors.info,
            },
          ]}
          height={200}
          showLegend
        />
      </div>

      {/* Interface Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interfaces.map((iface) => (
          <div
            key={iface.name}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium truncate" style={{ color: colors.text }}>{iface.name}</h4>
              {iface.speed > 0 && (
                <span className="text-xs" style={{ color: colors.muted }}>{iface.speed} Mbps</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>IPv4</span>
                <span className="font-mono" style={{ color: colors.success }}>{iface.ip4}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Download</span>
                <span className="font-mono" style={{ color: colors.success }}>
                  {formatBytes(iface.rxSec)}/s
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Upload</span>
                <span className="font-mono" style={{ color: colors.info }}>
                  {formatBytes(iface.txSec)}/s
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Total RX</span>
                <span className="font-mono" style={{ color: colors.muted }}>
                  {formatBytes(iface.rxBytes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Total TX</span>
                <span className="font-mono" style={{ color: colors.muted }}>
                  {formatBytes(iface.txBytes)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
