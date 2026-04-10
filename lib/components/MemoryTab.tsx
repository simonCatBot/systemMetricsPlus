"use client";

import { GaugeChartComponent, EChartsWrapper } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { MemoryMetrics } from "@/types/metrics";

interface MemoryHistory {
  usage: ChartDataPoint[];
  swap: ChartDataPoint[];
}

export default function MemoryTab({
  data,
  history,
}: {
  data: MemoryMetrics | null;
  history: MemoryHistory;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading memory metrics...
      </div>
    );
  }

  const { total, used, free, usage, swapTotal, swapUsed, swapFree } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Memory</h2>
            <p className="text-sm text-gray-400">
              Physical RAM
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{total.toFixed(1)} GB</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{used.toFixed(1)} GB</p>
              <p className="text-xs text-gray-500">Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{free.toFixed(1)} GB</p>
              <p className="text-xs text-gray-500">Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={usage}
            name="RAM"
            color="#00b894"
            size={100}
          />
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={(used / total) * 100}
            name="Used"
            max={100}
            color="#e17055"
            size={100}
          />
          <p className="text-xs text-gray-400 mt-2">{used.toFixed(1)} GB</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={(free / total) * 100}
            name="Free"
            max={100}
            color="#0984e3"
            size={100}
          />
          <p className="text-xs text-gray-400 mt-2">{free.toFixed(1)} GB</p>
        </div>
        {swapTotal > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
            <GaugeChartComponent
              value={swapTotal > 0 ? (swapUsed / swapTotal) * 100 : 0}
              name="Swap"
              max={100}
              color="#6c5ce7"
              size={100}
            />
            <p className="text-xs text-gray-400 mt-2">
              {swapUsed.toFixed(1)} / {swapTotal.toFixed(1)} GB
            </p>
          </div>
        )}
      </div>

      {/* Memory Usage Chart */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Memory Usage History</h3>
        <EChartsWrapper
          series={[
            {
              name: "Usage %",
              data: history.usage,
              color: "#00b894",
            },
          ]}
          height={200}
          yAxisType="percent"
        />
      </div>

      {/* Memory Breakdown Bar */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Memory Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Used</span>
              <span>{used.toFixed(1)} GB ({usage}%)</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                style={{ width: `${usage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Swap</span>
              <span>
                {swapUsed.toFixed(1)} / {swapTotal.toFixed(1)} GB
              </span>
            </div>
            {swapTotal > 0 && (
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  style={{ width: `${(swapUsed / swapTotal) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
