"use client";

import { useEffect, useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import type { SystemMetrics } from "@/types/metrics";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Server,
  Clock,
  Wifi,
  Video,
  Gauge,
  Thermometer,
  Zap,
} from "lucide-react";

const UPDATE_INTERVAL = 2000;
const HISTORY_LENGTH = 60;

function formatGB(gb: number) {
  return `${gb.toFixed(1)} GB`;
}

function formatTemp(temp: number | null) {
  return temp !== null ? `${temp}°C` : "N/A";
}

function formatSpeed(kbps: number) {
  return kbps > 1024 ? `${(kbps / 1024).toFixed(1)} MB/s` : `${kbps} KB/s`;
}

function formatMHz(mhz: number | null | undefined) {
  if (mhz === null || mhz === undefined) return "N/A";
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
  return `${mhz} MHz`;
}

function getProcessorLabel(name: string) {
  const parts = name.split(" ");
  if (parts[0] === "RYZEN" && parts[1]) return `AMD ${parts[1]}`;
  if (parts[0] === "AMD" && parts[1]) return `${parts[0]} ${parts[1]}`;
  if (parts[0] === "Intel" && parts[1]) return `${parts[0]} ${parts[1]}`;
  return parts[0];
}

function MetricRow({
  icon: Icon,
  label,
  value,
  subtext,
  alert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        alert ? "bg-red-500/10 border-red-500/30" : "border-[var(--border)]"
      }`}
      style={{ background: alert ? undefined : "var(--surface-1)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-md ${alert ? "bg-red-500/20" : ""}`}
          style={{ background: alert ? undefined : "var(--surface-2)" }}
        >
          <Icon className={`w-4 h-4 ${alert ? "text-red-500" : "text-[var(--primary)]"}`} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {label}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {subtext}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-lg font-bold ${alert ? "text-red-500" : ""}`}
          style={{ color: alert ? undefined : "var(--foreground)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ProminentCard({
  icon: Icon,
  title,
  name,
  subtitle,
  badge,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  name: string;
  subtitle: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="mb-4 p-4 rounded-lg"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-md"
            style={{ background: "rgba(255, 77, 77, 0.2)" }}
          >
            <Icon className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              {title}
            </p>
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--foreground)" }}
            >
              {name}
            </p>
          </div>
        </div>
        {badge && <div className="ml-2">{badge}</div>}
      </div>
      <div
        className="flex items-center gap-4 text-xs"
        style={{ color: "var(--muted-foreground)" }}
      >
        {subtitle}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({
  value,
  alert = false,
}: {
  value: number;
  alert?: boolean;
}) {
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: "var(--surface-2)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: alert ? "#ef4444" : "var(--primary)",
        }}
      />
    </div>
  );
}

function DashboardContent() {
  const { theme, toggleTheme } = useTheme();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPerCore, setShowPerCore] = useState(false);

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

  if (isLoading || !metrics) {
    return (
      <div
        className="min-h-screen p-4"
        style={{ background: "var(--background)" }}
      >
        <div
          className="ui-panel p-4 h-full flex items-center justify-center"
          style={{ minHeight: "400px" }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const primaryGpu = metrics.gpu && metrics.gpu.length > 0 ? metrics.gpu[0] : null;

  const getGpuStatus = () => {
    if (!primaryGpu) return null;
    const highUtil = primaryGpu.usage && primaryGpu.usage > 70;
    const highVram =
      primaryGpu.memory?.total &&
      primaryGpu.memory?.used &&
      primaryGpu.memory.used / primaryGpu.memory.total > 0.6;
    if (highUtil && highVram) return { label: "Training", color: "text-green-500", bg: "bg-green-500/20" };
    if (highUtil) return { label: "Computing", color: "text-blue-500", bg: "bg-blue-500/20" };
    if (primaryGpu.usage && primaryGpu.usage > 10)
      return { label: "Active", color: "text-yellow-500", bg: "bg-yellow-500/20" };
    return { label: "Idle", color: "text-[var(--muted-foreground)]", bg: "" };
  };

  const gpuStatus = getGpuStatus();

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
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {["cpu", "gpu", "memory", "network", "disk"].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${tab === "cpu" ? "active" : ""}`}
              >
                {tab === "cpu" && <Cpu className="w-4 h-4 inline mr-1" />}
                {tab === "gpu" && <Video className="w-4 h-4 inline mr-1" />}
                {tab === "memory" && <MemoryStick className="w-4 h-4 inline mr-1" />}
                {tab === "network" && <Wifi className="w-4 h-4 inline mr-1" />}
                {tab === "disk" && <HardDrive className="w-4 h-4 inline mr-1" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div
          className="ui-panel p-4"
          style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
        >
          {/* CPU Card */}
          <ProminentCard
            icon={Cpu}
            title="Processor"
            name={metrics.cpu.name}
            subtitle={
              <>
                <span>{getProcessorLabel(metrics.cpu.name)}</span>
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--muted-foreground)" }}
                />
                <span>
                  {metrics.cpu.physicalCores} cores, {metrics.cpu.logicalCores} threads
                </span>
                {metrics.cpu.speed > 0 && (
                  <>
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: "var(--muted-foreground)" }}
                    />
                    <span>{Math.round(metrics.cpu.speed)} MHz</span>
                  </>
                )}
              </>
            }
          >
            <div className="mt-3 pt-3 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {/* CPU Usage Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    CPU Usage
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <ProgressBar value={metrics.cpu.usage} alert={metrics.cpu.usage > 80} />
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: metrics.cpu.usage > 80 ? "#ef4444" : "var(--foreground)" }}
                  >
                    {Math.round(metrics.cpu.usage)}%
                  </span>
                </div>
              </div>

              {/* CPU Stats Row */}
              <div className="flex flex-wrap gap-4">
                {metrics.cpu.temperature !== null && metrics.cpu.temperature > 0 && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <Thermometer className="w-3 h-3" />
                    <span>{formatTemp(metrics.cpu.temperature)}</span>
                  </div>
                )}
                {metrics.cpu.currentSpeedMHz > 0 && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <Zap className="w-3 h-3" />
                    <span>{Math.round(metrics.cpu.currentSpeedMHz)} MHz</span>
                  </div>
                )}
                {metrics.cpu.loadAvg[0] > 0 && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <Activity className="w-3 h-3" />
                    <span>Load: {metrics.cpu.loadAvg[0].toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Per-Core Load Grid */}
              {metrics.cpu.coreLoads.length > 0 && (
                <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <button
                    type="button"
                    onClick={() => setShowPerCore((v) => !v)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Per-Core Usage
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      {showPerCore ? "▲" : "▼"}
                    </span>
                  </button>
                  {showPerCore && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {metrics.cpu.coreLoads.map((load, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div
                            className="flex items-center justify-between text-[10px]"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            <span>C{i}</span>
                            <span
                              className={load > 80 ? "text-red-500 font-bold" : ""}
                              style={load <= 80 ? { color: "var(--foreground)" } : undefined}
                            >
                              {load}%
                            </span>
                          </div>
                          <ProgressBar value={load} alert={load > 80} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ProminentCard>

          {/* Memory */}
          <MetricRow
            icon={MemoryStick}
            label="System Memory"
            value={`${Math.round(metrics.memory.usage)}%`}
            subtext={`${formatGB(metrics.memory.used)} / ${formatGB(metrics.memory.total)} • Swap: ${formatGB(metrics.memory.swapUsed)}`}
            alert={metrics.memory.usage > 80}
          />

          {/* GPU Card */}
          {primaryGpu && (
            <ProminentCard
              icon={Video}
              title="Graphics Processor"
              name={primaryGpu.marketingName || primaryGpu.name}
              subtitle={
                <>
                  <span>{primaryGpu.vendor || "AMD"}</span>
                  {primaryGpu.gfxVersion && primaryGpu.gfxVersion !== "N/A" && (
                    <>
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ background: "var(--muted-foreground)" }}
                      />
                      <span className="font-mono">{primaryGpu.gfxVersion}</span>
                    </>
                  )}
                  {primaryGpu.computeUnits !== undefined && primaryGpu.computeUnits > 0 && (
                    <>
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ background: "var(--muted-foreground)" }}
                      />
                      <span>{primaryGpu.computeUnits} CUs</span>
                    </>
                  )}
                </>
              }
              badge={
                gpuStatus && (
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border`}
                    style={{ background: gpuStatus.bg, borderColor: "var(--border)" }}
                  >
                    <Activity className={`w-3.5 h-3.5 ${gpuStatus.color}`} />
                    <span className={`text-xs font-medium ${gpuStatus.color}`}>
                      {gpuStatus.label}
                    </span>
                  </div>
                )
              }
            >
              <div className="mt-3 pt-3 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                {/* GPU Usage */}
                {primaryGpu.usage !== null && primaryGpu.usage !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        GPU Usage
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <ProgressBar value={primaryGpu.usage} alert={primaryGpu.usage > 80} />
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: primaryGpu.usage > 80 ? "#ef4444" : "var(--foreground)" }}
                      >
                        {primaryGpu.usage}%
                      </span>
                    </div>
                  </div>
                )}

                {/* VRAM */}
                {primaryGpu.memory && primaryGpu.memory.total !== undefined && primaryGpu.memory.total > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        VRAM
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <ProgressBar
                          value={
                            primaryGpu.memory.total
                              ? (primaryGpu.memory.used / primaryGpu.memory.total) * 100
                              : 0
                          }
                        />
                      </div>
                      <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                        {primaryGpu.memory.total
                          ? `${Math.round((primaryGpu.memory.used / primaryGpu.memory.total) * 100)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {/* VRAM Details */}
                {primaryGpu.memory && primaryGpu.memory.total !== undefined && (
                  <div
                    className="flex justify-between text-xs px-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <span>Used: {formatGB(primaryGpu.memory.used || 0)}</span>
                    <span>Total: {formatGB(primaryGpu.memory.total)}</span>
                  </div>
                )}

                {/* GPU Stats */}
                <div className="flex flex-wrap gap-4">
                  {primaryGpu.temperature !== null && primaryGpu.temperature > 0 && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <Thermometer className="w-3 h-3" />
                      <span>{formatTemp(primaryGpu.temperature)}</span>
                    </div>
                  )}
                  {primaryGpu.currentClockMHz > 0 && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <Zap className="w-3 h-3" />
                      <span>{formatMHz(primaryGpu.currentClockMHz)}</span>
                    </div>
                  )}
                  {primaryGpu.power !== null && primaryGpu.power > 0 && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <Activity className="w-3 h-3" />
                      <span>{primaryGpu.power.toFixed(1)}W</span>
                    </div>
                  )}
                </div>
              </div>
            </ProminentCard>
          )}

          {/* No GPU Message */}
          {!primaryGpu && (
            <div
              className="mb-4 p-4 rounded-lg text-center"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
            >
              <Video
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "var(--muted-foreground)" }}
              />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                No GPU detected
              </p>
            </div>
          )}

          {/* Disk & Network */}
          <div className="mt-4 space-y-4">
            <MetricRow
              icon={HardDrive}
              label="Disk"
              value={`${Math.round((metrics.disk.total.used / metrics.disk.total.total) * 100)}%`}
              subtext={`${formatGB(metrics.disk.total.used)} / ${formatGB(metrics.disk.total.total)}`}
              alert={(metrics.disk.total.used / metrics.disk.total.total) * 100 > 80}
            />

            <MetricRow
              icon={Wifi}
              label="Network"
              value={`${formatSpeed(metrics.network.total.rxSec + metrics.network.total.txSec)}`}
              subtext={`↓ ${formatSpeed(metrics.network.total.rxSec)} / ↑ ${formatSpeed(metrics.network.total.txSec)}`}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
        System Metrics Plus • Powered by Apache ECharts
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
