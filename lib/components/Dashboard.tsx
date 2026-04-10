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
  BrainCircuit,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import type { TabId } from "./TabContext";

const UPDATE_INTERVAL = 2000;

const allTabs: { id: TabId; label: string }[] = [
  { id: "cpu", label: "CPU" },
  { id: "gpu", label: "GPU" },
  { id: "memory", label: "Memory" },
  { id: "network", label: "Network" },
  { id: "disk", label: "Disk" },
];

function formatGB(gb: number) {
  return `${gb.toFixed(1)} GB`;
}

function formatTemp(temp: number | null) {
  return temp !== null ? `${temp}°C` : "N/A";
}

function formatSpeed(kbps: number) {
  if (kbps >= 1024) {
    return `${(kbps / 1024).toFixed(1)} MB/s`;
  }
  return `${kbps} KB/s`;
}

function formatMHz(mhz: number | null | undefined) {
  if (mhz === null || mhz === undefined) return "N/A";
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
  return `${mhz} MHz`;
}

function formatLoad(load: number): string {
  return load.toFixed(2);
}

function getProcessorLabel(name: string) {
  const parts = name.split(" ");
  if (parts[0] === "RYZEN" && parts[1]) return `AMD ${parts[1]}`;
  if (parts[0] === "AMD" && parts[1]) return `${parts[0]} ${parts[1]}`;
  if (parts[0] === "Intel" && parts[1]) return `${parts[0]} ${parts[1]}`;
  return parts[0];
}

function getVramStatus(used: number | null, total: number | null) {
  if (total === null || total === undefined || total === 0) {
    return { percent: 0, status: "OK", color: "text-foreground" };
  }
  const percent = Math.round((used || 0) / total * 100);
  if (percent > 95) return { percent, status: "CRITICAL", color: "text-red-500" };
  if (percent > 85) return { percent, status: "WARNING", color: "text-orange-500" };
  if (percent > 70) return { percent, status: "ELEVATED", color: "text-yellow-500" };
  return { percent, status: "OK", color: "text-green-500" };
}

function getTrainingStatus(gpu: SystemMetrics["gpu"][0]) {
  if (!gpu || gpu.usage === null || gpu.memory?.used === null) return null;
  const highUtil = gpu.usage > 70;
  const highVram = gpu.memory.total && (gpu.memory.used / gpu.memory.total) > 0.6;
  if (highUtil && highVram) return { label: "Training", color: "text-green-500", icon: BrainCircuit, bg: "bg-green-500/20" };
  if (highUtil) return { label: "Computing", color: "text-blue-500", icon: Activity, bg: "bg-blue-500/20" };
  if (gpu.usage > 10) return { label: "Active", color: "text-yellow-500", icon: Zap, bg: "bg-yellow-500/20" };
  return { label: "Idle", color: "text-[var(--muted-foreground)]", icon: Clock, bg: "" };
}

function ProgressBar({ value, alert = false }: { value: number; alert?: boolean }) {
  const bgColor = alert ? "bg-red-500" : "var(--primary)";
  return (
    <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(value, 100)}%`, background: bgColor }}
      />
    </div>
  );
}

interface ColumnProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

function Column({ title, icon: Icon, children, className = "" }: ColumnProps) {
  return (
    <div
      className={`ui-panel p-4 h-full overflow-y-auto ${className}`}
      style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
        <Icon className="w-4 h-4 text-[var(--primary)]" />
        <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* CPU Column */
function CpuColumn({ data }: { data: SystemMetrics["cpu"] | null }) {
  if (!data) {
    return (
      <Column title="CPU" icon={Cpu}>
        <div className="flex items-center justify-center h-32" style={{ color: "var(--muted-foreground)" }}>
          Loading...
        </div>
      </Column>
    );
  }

  const { name, usage, physicalCores, logicalCores, temperature, currentSpeedMHz, loadAvg, coreLoads } = data;
  const [load1, load5, load15] = loadAvg;

  return (
    <Column title="Processor" icon={Cpu}>
      {/* CPU Info */}
      <div className="mb-3">
        <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
          {name}
        </p>
        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{getProcessorLabel(name)}</span>
          <span className="w-1 h-1 rounded-full" style={{ background: "var(--muted-foreground)" }} />
          <span>{physicalCores} cores</span>
          <span className="w-1 h-1 rounded-full" style={{ background: "var(--muted-foreground)" }} />
          <span>{logicalCores} threads</span>
        </div>
      </div>

      {/* CPU Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Usage</span>
          <span className="text-sm font-bold" style={{ color: usage > 80 ? "#ef4444" : "var(--foreground)" }}>
            {Math.round(usage)}%
          </span>
        </div>
        <ProgressBar value={usage} alert={usage > 80} />
      </div>

      {/* CPU Stats */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
        {temperature !== null && temperature > 0 && (
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            <span>{formatTemp(temperature)}</span>
          </div>
        )}
        {currentSpeedMHz > 0 && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{Math.round(currentSpeedMHz)} MHz</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span>Load: {formatLoad(load1)}</span>
        </div>
      </div>

      {/* Load Averages */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "1m", value: load1 },
          { label: "5m", value: load5 },
          { label: "15m", value: load15 },
        ].map(({ label, value }) => (
          <div key={label} className="text-center p-2 rounded" style={{ background: "var(--surface-2)" }}>
            <p className="text-lg font-bold" style={{ color: value > logicalCores ? "#ef4444" : "var(--foreground)" }}>
              {formatLoad(value)}
            </p>
            <p className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Per-Core Usage */}
      {coreLoads.length > 0 && (
        <div>
          <p className="text-[10px] uppercase mb-2" style={{ color: "var(--muted-foreground)" }}>Per-Core</p>
          <div className="grid grid-cols-4 gap-1">
            {coreLoads.slice(0, 8).map((load, i) => (
              <div key={i} className="text-center p-1 rounded" style={{ background: "var(--surface-2)" }}>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>C{i}</p>
                <p className="text-xs font-bold" style={{ color: load > 80 ? "#ef4444" : "var(--foreground)" }}>
                  {load}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Column>
  );
}

/* GPU Column */
function GpuColumn({ gpus }: { gpus: SystemMetrics["gpu"] }) {
  const primaryGpu = gpus && gpus.length > 0 ? gpus[0] : null;

  if (!primaryGpu) {
    return (
      <Column title="GPU" icon={Video}>
        <div className="flex items-center justify-center h-32" style={{ color: "var(--muted-foreground)" }}>
          No GPU detected
        </div>
      </Column>
    );
  }

  const vramStatus = getVramStatus(primaryGpu.memory?.used ?? null, primaryGpu.memory?.total ?? null);
  const trainingStatus = getTrainingStatus(primaryGpu);

  return (
    <Column title="Graphics Processor" icon={Video}>
      {/* GPU Info */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
            {primaryGpu.marketingName || primaryGpu.name}
          </p>
          <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span>{primaryGpu.vendor || "AMD"}</span>
            {primaryGpu.gfxVersion && primaryGpu.gfxVersion !== "N/A" && (
              <>
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--muted-foreground)" }} />
                <span className="font-mono">{primaryGpu.gfxVersion}</span>
              </>
            )}
          </div>
        </div>
        {trainingStatus && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: trainingStatus.bg }}>
            <trainingStatus.icon className={`w-3 h-3 ${trainingStatus.color}`} />
            <span className={`text-xs font-medium ${trainingStatus.color}`}>{trainingStatus.label}</span>
          </div>
        )}
      </div>

      {/* GPU Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>GPU Usage</span>
          <span className="text-sm font-bold" style={{ color: primaryGpu.usage > 80 ? "#ef4444" : "var(--foreground)" }}>
            {primaryGpu.usage ?? 0}%
          </span>
        </div>
        <ProgressBar value={primaryGpu.usage ?? 0} alert={(primaryGpu.usage ?? 0) > 80} />
      </div>

      {/* VRAM */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>VRAM</span>
            {vramStatus.status !== "OK" && (
              <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
            )}
          </div>
          <span className="text-sm font-bold" style={{ color: vramStatus.color }}>
            {vramStatus.percent}%
          </span>
        </div>
        <ProgressBar value={vramStatus.percent} alert={vramStatus.status !== "OK"} />
        <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          <span>{formatGB(primaryGpu.memory?.used || 0)}</span>
          <span>{formatGB(primaryGpu.memory?.total || 0)}</span>
        </div>
      </div>

      {/* GPU Stats */}
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
        {primaryGpu.temperature !== null && primaryGpu.temperature > 0 && (
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            <span>{formatTemp(primaryGpu.temperature)}</span>
          </div>
        )}
        {primaryGpu.currentClockMHz > 0 && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{formatMHz(primaryGpu.currentClockMHz)}</span>
          </div>
        )}
        {primaryGpu.power != null && primaryGpu.power > 0 && (
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>{primaryGpu.power.toFixed(1)}W</span>
          </div>
        )}
      </div>
    </Column>
  );
}

/* Memory Column */
function MemoryColumn({ data }: { data: SystemMetrics["memory"] | null }) {
  if (!data) {
    return (
      <Column title="Memory" icon={MemoryStick}>
        <div className="flex items-center justify-center h-32" style={{ color: "var(--muted-foreground)" }}>
          Loading...
        </div>
      </Column>
    );
  }

  const { total, used, free, usage, swapUsed, swapTotal } = data;

  return (
    <Column title="System Memory" icon={MemoryStick}>
      {/* Memory Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Usage</span>
          <span className="text-sm font-bold" style={{ color: usage > 80 ? "#ef4444" : "var(--foreground)" }}>
            {Math.round(usage)}%
          </span>
        </div>
        <ProgressBar value={usage} alert={usage > 80} />
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold text-green-400">{used.toFixed(1)}</p>
          <p className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Used</p>
        </div>
        <div className="text-center p-2 rounded" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold">{free.toFixed(1)}</p>
          <p className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Free</p>
        </div>
        <div className="text-center p-2 rounded" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold text-cyan-400">{swapUsed.toFixed(1)}</p>
          <p className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Swap</p>
        </div>
      </div>

      {/* Total */}
      <div className="text-center p-3 rounded" style={{ background: "var(--surface-2)" }}>
        <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{total.toFixed(1)} GB</p>
        <p className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Total</p>
      </div>
    </Column>
  );
}

/* Network Column */
function NetworkColumn({ data }: { data: SystemMetrics["network"] | null }) {
  if (!data || !data.interfaces || data.interfaces.length === 0) {
    return (
      <Column title="Network" icon={Wifi}>
        <div className="flex items-center justify-center h-32" style={{ color: "var(--muted-foreground)" }}>
          No network detected
        </div>
      </Column>
    );
  }

  const primaryInterface = data.interfaces[0];

  return (
    <Column title="Network" icon={Wifi}>
      {/* Interface Info */}
      <div className="mb-3">
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {primaryInterface.name}
        </p>
      </div>

      {/* Speed */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 rounded" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold text-green-400">
            {formatSpeed(primaryInterface.rxSec)}
          </p>
          <p className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Download</p>
        </div>
        <div className="text-center p-2 rounded" style={{ background: "var(--surface-2)" }}>
          <p className="text-lg font-bold text-blue-400">
            {formatSpeed(primaryInterface.txSec)}
          </p>
          <p className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Upload</p>
        </div>
      </div>

      {/* Total Traffic */}
      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        <div className="flex justify-between mb-1">
          <span>↓ Total</span>
          <span>{formatSpeed(primaryInterface.rxBytes)}</span>
        </div>
        <div className="flex justify-between">
          <span>↑ Total</span>
          <span>{formatSpeed(primaryInterface.txBytes)}</span>
        </div>
      </div>
    </Column>
  );
}

/* Disk Column */
function DiskColumn({ data }: { data: SystemMetrics["disk"] | null }) {
  if (!data || !data.disks || data.disks.length === 0) {
    return (
      <Column title="Disk" icon={HardDrive}>
        <div className="flex items-center justify-center h-32" style={{ color: "var(--muted-foreground)" }}>
          Loading...
        </div>
      </Column>
    );
  }

  const { disks, total } = data;
  const totalUsage = total.total > 0 ? Math.round((total.used / total.total) * 100) : 0;

  return (
    <Column title="Storage" icon={HardDrive}>
      {/* Total Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Usage</span>
          <span className="text-sm font-bold" style={{ color: totalUsage > 80 ? "#ef4444" : "var(--foreground)" }}>
            {totalUsage}%
          </span>
        </div>
        <ProgressBar value={totalUsage} alert={totalUsage > 80} />
        <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          <span>{formatGB(total.used)} used</span>
          <span>{formatGB(total.total)}</span>
        </div>
      </div>

      {/* Individual Disks */}
      <div className="space-y-2">
        {disks.map((disk) => (
          <div key={disk.name} className="p-2 rounded" style={{ background: "var(--surface-2)" }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs truncate" style={{ color: "var(--foreground)" }}>
                {disk.name.split("/").pop()}
              </span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {disk.usage}%
              </span>
            </div>
            <ProgressBar value={disk.usage} alert={disk.usage > 80} />
          </div>
        ))}
      </div>
    </Column>
  );
}

/* Main Dashboard */
function DashboardContent() {
  const { theme, toggleTheme } = useTheme();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleTabs, setVisibleTabs] = useState<Set<TabId>>(new Set(["cpu", "gpu", "memory", "network", "disk"]));
  const [showSettings, setShowSettings] = useState(false);

  const toggleTab = (id: TabId) => {
    setVisibleTabs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

  const getVisibleColumns = () => {
    const order: TabId[] = ["cpu", "gpu", "memory", "network", "disk"];
    return order.filter((id) => visibleTabs.has(id));
  };

  return (
    <ThemeProvider>
      <div
        className="min-h-screen overflow-hidden"
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
                  <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
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
                <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                  <Clock className="w-3 h-3" />
                  {lastUpdate?.toLocaleTimeString() || "--:--:--"}
                </span>
                <button onClick={() => setShowSettings(!showSettings)} className="theme-toggle" title="Toggle columns">
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={toggleTheme} className="theme-toggle">
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div
                className="mt-3 p-3 rounded-lg border"
                style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Toggle Columns
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTabs.map((tab) => {
                    const isVisible = visibleTabs.has(tab.id);
                    const Icon = tab.id === "cpu" ? Cpu : tab.id === "gpu" ? Video : tab.id === "memory" ? MemoryStick : tab.id === "network" ? Wifi : HardDrive;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => toggleTab(tab.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                          isVisible ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <Icon className="w-3 h-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columns Grid */}
        <main className="max-w-7xl mx-auto px-4 py-4 h-[calc(100vh-80px)]">
          {isLoading || !metrics ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
              {getVisibleColumns().includes("cpu") && (
                <CpuColumn data={metrics.cpu} />
              )}
              {getVisibleColumns().includes("gpu") && (
                <GpuColumn gpus={metrics.gpu} />
              )}
              {getVisibleColumns().includes("memory") && (
                <MemoryColumn data={metrics.memory} />
              )}
              {getVisibleColumns().includes("network") && (
                <NetworkColumn data={metrics.network} />
              )}
              {getVisibleColumns().includes("disk") && (
                <DiskColumn data={metrics.disk} />
              )}
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
