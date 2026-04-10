"use client";

import { GaugeChartComponent, EChartsWrapper } from "./EChartsWrapper";
import type { ChartDataPoint } from "./charts";
import type { GpuMetrics } from "@/types/metrics";

interface GpuHistory {
  usage: ChartDataPoint[];
  memoryUsage: ChartDataPoint[];
  temperature: ChartDataPoint[];
  power: ChartDataPoint[];
}

export default function GpuTab({
  gpus,
  history,
}: {
  gpus: GpuMetrics[];
  history: GpuHistory;
}) {
  if (!gpus || gpus.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No GPU detected
      </div>
    );
  }

  const gpu = gpus[0]; // Primary GPU
  const {
    name,
    marketingName,
    vendor,
    usage,
    memory,
    temperature,
    power,
    driverVersion,
    gfxVersion,
    currentClockMHz,
  } = gpu;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {marketingName || name}
            </h2>
            <p className="text-sm text-gray-400">
              {vendor} • Driver: {driverVersion} • GFX: {gfxVersion}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {temperature !== null && (
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">
                  {temperature}°C
                </p>
                <p className="text-xs text-gray-500">Temperature</p>
              </div>
            )}
            {power !== null && (
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{power}W</p>
                <p className="text-xs text-gray-500">Power</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{usage}%</p>
              <p className="text-xs text-gray-500">Usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={usage}
            name="GPU"
            color="#e17055"
            size={100}
          />
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
          <GaugeChartComponent
            value={memory.total > 0 ? (memory.used / memory.total) * 100 : 0}
            name="VRAM"
            max={memory.total || 100}
            color="#0984e3"
            size={100}
          />
          <p className="text-xs text-gray-400 mt-2">
            {memory.used.toFixed(1)} / {memory.total.toFixed(1)} GB
          </p>
        </div>
        {temperature !== null && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
            <GaugeChartComponent
              value={temperature}
              name="Temp"
              max={100}
              color="#ff7675"
              size={100}
            />
          </div>
        )}
        {power !== null && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center">
            <GaugeChartComponent
              value={power}
              name="Power"
              max={300}
              color="#fdcb6e"
              size={100}
            />
          </div>
        )}
      </div>

      {/* GPU Usage Chart */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">GPU Usage History</h3>
        <EChartsWrapper
          series={[
            {
              name: "GPU %",
              data: history.usage,
              color: "#e17055",
            },
          ]}
          height={180}
          showPercent
        />
      </div>

      {/* VRAM Usage Chart */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">VRAM Usage History</h3>
        <EChartsWrapper
          series={[
            {
              name: "VRAM %",
              data: history.memoryUsage,
              color: "#0984e3",
            },
          ]}
          height={180}
          showPercent
        />
      </div>

      {/* Temperature & Power */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {temperature !== null && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Temperature History</h3>
            <EChartsWrapper
              series={[
                {
                  name: "°C",
                  data: history.temperature,
                  color: "#ff7675",
                },
              ]}
              height={150}
            />
          </div>
        )}
        {power !== null && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Power History</h3>
            <EChartsWrapper
              series={[
                {
                  name: "Watts",
                  data: history.power,
                  color: "#fdcb6e",
                },
              ]}
              height={150}
            />
          </div>
        )}
      </div>

      {/* Additional GPU Info */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">GPU Specifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-white">{currentClockMHz} MHz</p>
            <p className="text-xs text-gray-500">Core Clock</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{memory.total.toFixed(1)} GB</p>
            <p className="text-xs text-gray-500">VRAM</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{gfxVersion}</p>
            <p className="text-xs text-gray-500">GFX Version</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{driverVersion}</p>
            <p className="text-xs text-gray-500">Driver</p>
          </div>
        </div>
      </div>
    </div>
  );
}
