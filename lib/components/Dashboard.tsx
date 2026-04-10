"use client";

import { useEffect, useState, useCallback } from "react";
import { TabProvider, useTabs } from "./TabContext";
import CpuTab from "./CpuTab";
import GpuTab from "./GpuTab";
import MemoryTab from "./MemoryTab";
import NetworkTab from "./NetworkTab";
import DiskTab from "./DiskTab";
import type { SystemMetrics } from "@/types/metrics";
import type { ChartDataPoint } from "./charts";

const UPDATE_INTERVAL = 2000; // 2 seconds
const HISTORY_LENGTH = 60; // Keep 60 data points

interface CpuHistory {
  usage: ChartDataPoint[];
  load1m: ChartDataPoint[];
  load5m: ChartDataPoint[];
  load15m: ChartDataPoint[];
  coreLoads: { name: string; data: ChartDataPoint[] }[];
}

interface GpuHistory {
  usage: ChartDataPoint[];
  memoryUsage: ChartDataPoint[];
  temperature: ChartDataPoint[];
  power: ChartDataPoint[];
}

interface MemoryHistory {
  usage: ChartDataPoint[];
  swap: ChartDataPoint[];
}

interface NetworkHistory {
  download: ChartDataPoint[];
  upload: ChartDataPoint[];
}

interface DiskHistory {
  usage: ChartDataPoint[];
}

function DashboardContent() {
  const { activeTab, tabs, toggleTab } = useTabs();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // History state
  const [cpuHistory, setCpuHistory] = useState<CpuHistory>({
    usage: [],
    load1m: [],
    load5m: [],
    load15m: [],
    coreLoads: [],
  });

  const [gpuHistory, setGpuHistory] = useState<GpuHistory>({
    usage: [],
    memoryUsage: [],
    temperature: [],
    power: [],
  });

  const [memoryHistory, setMemoryHistory] = useState<MemoryHistory>({
    usage: [],
    swap: [],
  });

  const [networkHistory, setNetworkHistory] = useState<NetworkHistory>({
    download: [],
    upload: [],
  });

  const [diskHistory, setDiskHistory] = useState<DiskHistory>({
    usage: [],
  });

  const addToHistory = useCallback(
    <T extends ChartDataPoint>(history: T[], newPoint: T): T[] => {
      const updated = [...history, newPoint];
      if (updated.length > HISTORY_LENGTH) {
        return updated.slice(-HISTORY_LENGTH);
      }
      return updated;
    },
    []
  );

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: SystemMetrics = await res.json();

      const now = data.timestamp;

      setMetrics(data);
      setLastUpdate(new Date(now));
      setIsLoading(false);

      // Update CPU history
      setCpuHistory((prev) => {
        const newHistory: CpuHistory = {
          usage: addToHistory(prev.usage, { timestamp: now, value: data.cpu.usage }),
          load1m: addToHistory(prev.load1m, { timestamp: now, value: data.cpu.loadAvg[0] }),
          load5m: addToHistory(prev.load5m, { timestamp: now, value: data.cpu.loadAvg[1] }),
          load15m: addToHistory(prev.load15m, { timestamp: now, value: data.cpu.loadAvg[2] }),
          coreLoads: data.cpu.coreLoads.map((load, i) => ({
            name: `Core ${i}`,
            data: addToHistory(prev.coreLoads[i]?.data || [], { timestamp: now, value: load }),
          })),
        };
        return newHistory;
      });

      // Update GPU history (for primary GPU)
      if (data.gpu.length > 0) {
        const gpu = data.gpu[0];
        setGpuHistory((prev) => ({
          usage: addToHistory(prev.usage, { timestamp: now, value: gpu.usage }),
          memoryUsage: addToHistory(prev.memoryUsage, {
            timestamp: now,
            value: gpu.memory.total > 0 ? (gpu.memory.used / gpu.memory.total) * 100 : 0,
          }),
          temperature: addToHistory(prev.temperature, {
            timestamp: now,
            value: gpu.temperature ?? 0,
          }),
          power: addToHistory(prev.power, { timestamp: now, value: gpu.power ?? 0 }),
        }));
      }

      // Update Memory history
      setMemoryHistory((prev) => ({
        usage: addToHistory(prev.usage, { timestamp: now, value: data.memory.usage }),
        swap: addToHistory(prev.swap, {
          timestamp: now,
          value: data.memory.swapTotal > 0 ? (data.memory.swapUsed / data.memory.swapTotal) * 100 : 0,
        }),
      }));

      // Update Network history
      setNetworkHistory((prev) => ({
        download: addToHistory(prev.download, {
          timestamp: now,
          value: data.network.total.rxSec / 1024, // KB/s
        }),
        upload: addToHistory(prev.upload, {
          timestamp: now,
          value: data.network.total.txSec / 1024, // KB/s
        }),
      }));

      // Update Disk history
      setDiskHistory((prev) => ({
        usage: addToHistory(prev.usage, {
          timestamp: now,
          value: data.disk.total.total > 0
            ? (data.disk.total.used / data.disk.total.total) * 100
            : 0,
        }),
      }));
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    }
  }, [addToHistory]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const renderTab = () => {
    switch (activeTab) {
      case "cpu":
        return <CpuTab data={metrics?.cpu ?? null} history={cpuHistory} />;
      case "gpu":
        return <GpuTab gpus={metrics?.gpu ?? []} history={gpuHistory} />;
      case "memory":
        return <MemoryTab data={metrics?.memory ?? null} history={memoryHistory} />;
      case "network":
        return <NetworkTab data={metrics?.network ?? null} history={networkHistory} />;
      case "disk":
        return <DiskTab data={metrics?.disk ?? null} history={diskHistory} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">System Metrics Plus</h1>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {metrics?.os.hostname || "Loading..."} • {metrics?.os.distro || ""} {metrics?.os.arch || ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {lastUpdate
                  ? `Updated: ${lastUpdate.toLocaleTimeString()}`
                  : "Connecting..."}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
                Refresh: {UPDATE_INTERVAL / 1000}s
              </p>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => toggleTab(tab.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={
                  activeTab === tab.id
                    ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                    : { background: 'var(--surface-2)', color: 'var(--muted-foreground)' }
                }
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-gray-400">Loading metrics...</span>
          </div>
        ) : (
          renderTab()
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          System Metrics Plus • Real-time monitoring with Apache ECharts
        </div>
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <TabProvider>
      <DashboardContent />
    </TabProvider>
  );
}
