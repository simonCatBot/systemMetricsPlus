"use client";

import { useEffect, useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { TabProvider, useTabs } from "./TabContext";
import type { SystemMetrics } from "@/types/metrics";
import CpuTab from "./CpuTab";
import GpuTab from "./GpuTab";
import MemoryTab from "./MemoryTab";
import NetworkTab from "./NetworkTab";
import type { TabId } from "./TabContext";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Server,
  Clock,
  Wifi,
  Video,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

const UPDATE_INTERVAL = 2000;

const tabConfig: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "cpu", label: "CPU", icon: Cpu },
  { id: "gpu", label: "GPU", icon: Video },
  { id: "memory", label: "Memory", icon: MemoryStick },
  { id: "network", label: "Network", icon: Wifi },
  { id: "disk", label: "Disk", icon: HardDrive },
];

function DashboardContent() {
  const { theme, toggleTheme } = useTheme();
  const { activeTab, setActiveTab, visibleTabs, toggleTab } = useTabs();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTabSettings, setShowTabSettings] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: SystemMetrics = await res.json();
      setMetrics(data);
      setLastUpdate(new Date(data.timestamp));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const renderTab = () => {
    switch (activeTab) {
      case "cpu":
        return <CpuTab data={metrics?.cpu ?? null} />;
      case "gpu":
        return <GpuTab gpus={metrics?.gpu ?? []} />;
      case "memory":
        return <MemoryTab memory={metrics?.memory ?? null} disk={metrics?.disk ?? null} />;
      case "network":
        return <NetworkTab data={metrics?.network ?? null} />;
      case "disk":
        return <MemoryTab memory={metrics?.memory ?? null} disk={metrics?.disk ?? null} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 border-b backdrop-blur-sm"
        style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[var(--primary)]" />
                <h1
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  System Metrics
                </h1>
              </div>
              <span
                className="px-2 py-0.5 text-[10px] rounded-full"
                style={{
                  background: "rgba(34, 197, 94, 0.2)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                }}
              >
                Local
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Clock className="w-3 h-3" />
                {lastUpdate?.toLocaleTimeString() || "--:--:--"}
              </span>
              <button
                onClick={() => setShowTabSettings(!showTabSettings)}
                className="theme-toggle"
                title="Toggle tab visibility"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* Tab Settings Dropdown */}
          {showTabSettings && (
            <div
              className="mt-3 p-3 rounded-lg border"
              style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Toggle Tabs
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabConfig.map((tab) => {
                  const isVisible = visibleTabs.has(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => toggleTab(tab.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                        isVisible
                          ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                          : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {isVisible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Bar */}
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {tabConfig.map((tab) => {
              if (!visibleTabs.has(tab.id)) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                >
                  <tab.icon className="w-4 h-4 inline mr-1" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div
          className="ui-panel p-4"
          style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
        >
          {isLoading || !metrics ? (
            <div
              className="flex items-center justify-center"
              style={{ minHeight: "300px" }}
            >
              <div
                className="flex items-center gap-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : (
            renderTab()
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
        System Metrics Plus
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <TabProvider>
        <DashboardContent />
      </TabProvider>
    </ThemeProvider>
  );
}
