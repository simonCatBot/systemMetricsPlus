"use client";

import { GaugeChartComponent, EChartsWrapper } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { DiskMetrics } from "@/types/metrics";

interface DiskHistory {
  usage: ChartDataPoint[];
}

export default function DiskTab({
  data,
  history,
}: {
  data: DiskMetrics | null;
  history: DiskHistory;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading disk metrics...
      </div>
    );
  }

  const { disks, total } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Storage</h2>
            <p className="text-sm text-gray-400">
              {disks.length} disk{disks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">
                {total.total.toFixed(1)} GB
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {total.used.toFixed(1)} GB
              </p>
              <p className="text-xs text-gray-500">Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">
                {total.free.toFixed(1)} GB
              </p>
              <p className="text-xs text-gray-500">Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disk Usage Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {disks.map((disk, i) => (
          <div
            key={disk.name}
            className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center"
          >
            <GaugeChartComponent
              value={disk.usage}
              name={disk.name.split("/").pop() || `Disk ${i}`}
              color={`hsl(${(i * 360) / disks.length + 120}, 70%, 50%)`}
              size={100}
            />
            <p className="text-xs text-gray-400 mt-2 text-center truncate">
              {disk.name}
            </p>
            <p className="text-xs text-gray-500">
              {disk.used.toFixed(1)} / {disk.total.toFixed(1)} GB
            </p>
          </div>
        ))}
      </div>

      {/* Disk Usage Chart */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Disk Activity</h3>
        <EChartsWrapper
          series={[
            {
              name: "Usage %",
              data: history.usage,
              color: "#00b894",
            },
          ]}
          height={200}
          showPercent
        />
      </div>

      {/* Individual Disk Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disks.map((disk) => (
          <div
            key={disk.name}
            className="bg-gray-900 rounded-xl p-4 border border-gray-800"
          >
            <h4 className="font-medium text-white mb-3 truncate" title={disk.name}>
              {disk.name}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="text-white">{disk.total.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Used</span>
                <span className="text-yellow-400">{disk.used.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Free</span>
                <span className="text-green-400">{disk.free.toFixed(1)} GB</span>
              </div>
              <div className="mt-3">
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${disk.usage}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">{disk.usage}% used</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
