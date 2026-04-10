"use client";

import { EChartsWrapper } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { NetworkMetrics } from "@/types/metrics";

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
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading network metrics...
      </div>
    );
  }

  const { interfaces, total } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Network</h2>
            <p className="text-sm text-gray-400">
              {interfaces.length} interface{interfaces.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {formatBytes(total.rxSec)}/s
              </p>
              <p className="text-xs text-gray-500">Download</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {formatBytes(total.txSec)}/s
              </p>
              <p className="text-xs text-gray-500">Upload</p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Speed Chart */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Network Activity</h3>
        <EChartsWrapper
          series={[
            {
              name: "Download",
              data: history.download,
              color: "#00b894",
            },
            {
              name: "Upload",
              data: history.upload,
              color: "#0984e3",
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
            className="bg-gray-900 rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white truncate">{iface.name}</h4>
              {iface.speed > 0 && (
                <span className="text-xs text-gray-500">{iface.speed} Mbps</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">IPv4</span>
                <span className="font-mono text-green-400">{iface.ip4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Download</span>
                <span className="font-mono text-green-400">
                  {formatBytes(iface.rxSec)}/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Upload</span>
                <span className="font-mono text-blue-400">
                  {formatBytes(iface.txSec)}/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total RX</span>
                <span className="font-mono text-gray-300">
                  {formatBytes(iface.rxBytes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total TX</span>
                <span className="font-mono text-gray-300">
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
