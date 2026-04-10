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
} from "lucide-react";
import Image from "next/image";
import type { TabId } from "./TabContext";

const UPDATE_INTERVAL = 2000;

const allTabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "cpu", label: "CPU", icon: Cpu },
  { id: "gpu", label: "GPU", icon: Video },
  { id: "memory", label: "Memory", icon: MemoryStick },
  { id: "network", label: "Network", icon: Wifi },
  { id: "disk", label: "Disk", icon: HardDrive },
];

function formatGB(gb: number) {
  return `${gb.toFixed(2)} GB`;
}

function formatTemp(temp: number | null) {
  return temp !== null ? `${temp}°C` : "N/A";
}

function formatSpeed(kbps: number) {
  if (kbps >= 1024) {
    return `${(kbps / 1024).toFixed(2)} MB/s`;
  }
  return `${kbps.toFixed(2)} KB/s`;
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
    return { percent: 0, status: "OK", color: "text-foreground", bgColor: "bg-primary" };
  }
  const percent = Math.round((used || 0) / total * 100);
  if (percent > 95) return { percent, status: "CRITICAL", color: "text-red-500", bgColor: "bg-red-500" };
  if (percent > 85) return { percent, status: "WARNING", color: "text-orange-500", bgColor: "bg-orange-500" };
  if (percent > 70) return { percent, status: "ELEVATED", color: "text-yellow-500", bgColor: "bg-yellow-500" };
  return { percent, status: "OK", color: "text-green-500", bgColor: "bg-green-500" };
}

function getTrainingStatus(gpu: SystemMetrics["gpu"][0]) {
  if (!gpu || gpu.usage === null || gpu.memory?.used === null) return null;
  const highUtil = gpu.usage > 70;
  const highVram = gpu.memory.total && (gpu.memory.used / gpu.memory.total) > 0.6;
  if (highUtil && highVram) return { label: "Training", color: "text-green-500", icon: BrainCircuit, bg: "bg-green-500/20" };
  if (highUtil) return { label: "Computing", color: "text-blue-500", icon: Activity, bg: "bg-blue-500/20" };
  if (gpu.usage > 10) return { label: "Active", color: "text-yellow-500", icon: Zap, bg: "bg-yellow-500/20" };
  return { label: "Idle", color: "text-muted-foreground", icon: Clock, bg: "bg-surface-2" };
}

interface ColumnProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

function Column({ children, className = "", isActive = false, onClick }: ColumnProps) {
  return (
    <div
      onClick={onClick}
      className={`ui-panel p-4 h-full overflow-y-auto transition-all flex-1 min-w-0 ${
        isActive ? "ring-2 ring-primary/50" : ""
      } ${className}`}
      style={{
        background: "var(--panel)",
        borderColor: "var(--border)",
      }}
    >
      {children}
    </div>
  );
}

function ColumnHeader({
  title,
  icon: Icon,
  isActive,
  onClick,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full text-left mb-3 pb-2 border-b transition-colors ${
        isActive ? "border-primary/50" : "border-border/30"
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
      <h3 className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
        {title}
      </h3>
    </button>
  );
}

/* CPU Column */
function CpuColumn({
  data,
  isActive,
  onClick,
  showPerCore,
  setShowPerCore,
}: {
  data: SystemMetrics["cpu"] | null;
  isActive: boolean;
  onClick: () => void;
  showPerCore: boolean;
  setShowPerCore: (v: boolean) => void;
}) {
  if (!data) {
    return (
      <Column isActive={isActive} onClick={onClick}>
        <ColumnHeader title="Processor" icon={Cpu} isActive={isActive} onClick={onClick} />
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          Loading...
        </div>
      </Column>
    );
  }

  const { name, usage, usageUser, usageSystem, physicalCores, logicalCores, temperature, currentSpeedMHz, maxSpeedMHz, minSpeedMHz, loadAvg, coreLoads, coreSpeeds, cache, flags, virtualization, governor } = data;
  const [load1, load5, load15] = loadAvg;

  return (
    <Column isActive={isActive} onClick={onClick}>
      <ColumnHeader title="Processor" icon={Cpu} isActive={isActive} onClick={onClick} />

      {/* CPU Info - Prominent style */}
      <div className="mb-3 p-3 bg-surface-1 border border-border rounded-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/20 rounded-md">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Processor</p>
              <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{getProcessorLabel(name)}</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>{physicalCores} cores, {logicalCores} threads</span>
          {currentSpeedMHz > 0 && (
            <>
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span>{Math.round(currentSpeedMHz)} MHz</span>
            </>
          )}
        </div>
      </div>

      {/* CPU Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">CPU Usage</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${usage > 80 ? "bg-red-500" : "bg-primary"}`}
                style={{ width: `${Math.min(usage, 100)}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${usage > 80 ? "text-red-500" : "text-foreground"}`}>
              {Math.round(usage)}%
            </span>
          </div>
        </div>
      </div>

      {/* CPU Stats */}
      <div className="flex flex-wrap gap-4 mb-3 text-xs text-muted-foreground">
        {temperature !== null && temperature !== undefined && temperature > 0 && (
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
        {load1 > 0 && (
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Load: {formatLoad(load1)}</span>
          </div>
        )}
      </div>

      {/* Per-Core Usage - collapsible */}
      {coreLoads.length > 0 && (
        <div className="pt-2 border-t border-border/30">
          <button
            type="button"
            onClick={() => setShowPerCore(!showPerCore)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Per-Core Usage
            </span>
            <span className="text-[10px] text-muted-foreground">
              {showPerCore ? "▲" : "▼"}
            </span>
          </button>
          {showPerCore && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {coreLoads.map((load, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>C{i}</span>
                    <span className={load > 80 ? "text-red-500 font-bold" : ""}>{load}%</span>
                  </div>
                  <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        load > 80 ? "bg-red-500" : load > 50 ? "bg-yellow-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(load, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User/System Breakdown */}
      {(usageUser > 0 || usageSystem > 0) && (
        <div className="mb-3 text-xs">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Load Breakdown</span>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-1">
              <span className="text-primary">●</span>
              <span className="text-muted-foreground">User:</span>
              <span className="font-mono text-foreground">{usageUser}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">●</span>
              <span className="text-muted-foreground">System:</span>
              <span className="font-mono text-foreground">{usageSystem}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Per-Core Clock Speeds */}
      {coreSpeeds && coreSpeeds.length > 0 && (
        <div className="mb-3">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Per-Core Speeds</span>
          <div className="grid grid-cols-8 gap-1 mt-1">
            {coreSpeeds.map((speed, i) => (
              <div key={i} className="text-center">
                <span className="text-[9px] text-muted-foreground">C{i}</span>
                <p className="text-[10px] font-mono text-foreground">{(speed / 1000).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cache Info */}
      {cache && (
        <div className="mb-3">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Cache</span>
          <div className="grid grid-cols-4 gap-2 mt-1 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground">L1 Data</span>
              <span className="font-mono text-foreground">{(cache.l1d / 1024).toFixed(0)} KB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground">L1 Inst</span>
              <span className="font-mono text-foreground">{(cache.l1i / 1024).toFixed(0)} KB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground">L2</span>
              <span className="font-mono text-foreground">{(cache.l2 / 1024).toFixed(0)} KB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground">L3</span>
              <span className="font-mono text-foreground">{(cache.l3 / (1024 * 1024)).toFixed(0)} MB</span>
            </div>
          </div>
        </div>
      )}

      {/* CPU Features & Info */}
      <div className="mb-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Features</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {flags.includes("avx512f") && <span className="px-1.5 py-0.5 text-[9px] bg-primary/20 text-primary rounded">AVX-512</span>}
          {flags.includes("aes") && <span className="px-1.5 py-0.5 text-[9px] bg-green-500/20 text-green-400 rounded">AES-NI</span>}
          {flags.includes("sse4_1") && <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 rounded">SSE4.1</span>}
          {flags.includes("sse4_2") && <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 rounded">SSE4.2</span>}
          {flags.includes("fma") && <span className="px-1.5 py-0.5 text-[9px] bg-purple-500/20 text-purple-400 rounded">FMA</span>}
          {flags.includes("sha_ni") && <span className="px-1.5 py-0.5 text-[9px] bg-orange-500/20 text-orange-400 rounded">SHA-NI</span>}
          {flags.includes("rdpru") && <span className="px-1.5 py-0.5 text-[9px] bg-cyan-500/20 text-cyan-400 rounded">RAPL</span>}
          {virtualization && <span className="px-1.5 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-400 rounded">VT-x</span>}
          <span className="px-1.5 py-0.5 text-[9px] bg-surface-2 text-muted-foreground rounded capitalize">{governor}</span>
        </div>
      </div>

      {/* Clock Speed Range */}
      {(maxSpeedMHz > 0 || minSpeedMHz > 0) && (
        <div className="text-xs text-muted-foreground">
          <span>Speed: {minSpeedMHz > 0 ? (minSpeedMHz / 1000).toFixed(2) : "?"} - {(maxSpeedMHz / 1000).toFixed(2)} GHz</span>
        </div>
      )}
    </Column>
  );
}

/* GPU Column */
function GpuColumn({
  gpus,
  rocmDetected,
  rocmRuntimeVersion,
  isActive,
  onClick,
  showGpuHardware,
  setShowGpuHardware,
}: {
  gpus: SystemMetrics["gpu"];
  rocmDetected: boolean;
  rocmRuntimeVersion: string;
  isActive: boolean;
  onClick: () => void;
  showGpuHardware: boolean;
  setShowGpuHardware: (v: boolean) => void;
}) {
  const primaryGpu = gpus && gpus.length > 0 ? gpus[0] : null;

  if (!primaryGpu) {
    return (
      <Column isActive={isActive} onClick={onClick}>
        <ColumnHeader title="Graphics Processor" icon={Video} isActive={isActive} onClick={onClick} />
        <div className="flex items-center justify-center h-32 text-muted-foreground">No GPU detected</div>
      </Column>
    );
  }

  const vramStatus = getVramStatus(primaryGpu.memory?.used ?? null, primaryGpu.memory?.total ?? null);
  const trainingStatus = getTrainingStatus(primaryGpu);
  const isThrottling = primaryGpu.temperature !== null && primaryGpu.temperature !== undefined && primaryGpu.temperature > 83;

  return (
    <Column isActive={isActive} onClick={onClick}>
      <ColumnHeader title="Graphics Processor" icon={Video} isActive={isActive} onClick={onClick} />

      {/* GPU Info - Prominent style */}
      <div className="mb-3 p-3 bg-surface-1 border border-border rounded-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/20 rounded-md">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Graphics Processor</p>
              <p className="text-sm font-semibold text-foreground truncate">{primaryGpu.marketingName || primaryGpu.name}</p>
            </div>
          </div>
          {trainingStatus && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${trainingStatus.bg} border border-border/50`}>
              <trainingStatus.icon className={`w-3.5 h-3.5 ${trainingStatus.color}`} />
              <span className={`text-xs font-medium ${trainingStatus.color}`}>{trainingStatus.label}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>{primaryGpu.vendor || "AMD"}</span>
          {primaryGpu.gfxVersion && primaryGpu.gfxVersion !== "N/A" && (
            <>
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span className="font-mono">{primaryGpu.gfxVersion}</span>
            </>
          )}
          {primaryGpu.computeUnits !== undefined && primaryGpu.computeUnits > 0 && (
            <>
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span>{primaryGpu.computeUnits} CUs</span>
            </>
          )}
          {primaryGpu.maxClockMHz !== undefined && primaryGpu.maxClockMHz > 0 && (
            <>
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span>{formatMHz(primaryGpu.maxClockMHz)}</span>
            </>
          )}
        </div>
      </div>

      {/* GPU Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">GPU Usage</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${(primaryGpu.usage ?? 0) > 80 ? "bg-red-500" : "bg-primary"}`}
                style={{ width: `${Math.min(primaryGpu.usage ?? 0, 100)}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${(primaryGpu.usage ?? 0) > 80 ? "text-red-500" : "text-foreground"}`}>
              {primaryGpu.usage ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* VRAM */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <MemoryStick className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">VRAM</span>
            {vramStatus.status === "CRITICAL" && (
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${vramStatus.bgColor}`}
                style={{ width: `${Math.min(vramStatus.percent, 100)}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${vramStatus.color}`}>
              {vramStatus.percent}%
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground px-1">
          <span>Used: {formatGB(primaryGpu.memory?.used || 0)}</span>
          <span>Total: {formatGB(primaryGpu.memory?.total || 0)}</span>
          {vramStatus.status !== "OK" && (
            <span className={vramStatus.color}>{vramStatus.status}</span>
          )}
        </div>
      </div>

      {/* GPU Stats Row - Expanded */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        {primaryGpu.temperature !== null && primaryGpu.temperature !== undefined && primaryGpu.temperature > 0 && (
          <div className="flex items-center gap-1">
            <Thermometer className={`w-3 h-3 ${isThrottling ? "text-red-500" : ""}`} />
            <span className={isThrottling ? "text-red-500" : ""}>{formatTemp(primaryGpu.temperature)}</span>
            {isThrottling && <span className="text-red-500 text-[10px]">⚠</span>}
          </div>
        )}
        {primaryGpu.temperatureHotspot !== undefined && primaryGpu.temperatureHotspot !== null && primaryGpu.temperatureHotspot > 0 && (
          <div className="flex items-center gap-1">
            <Thermometer className={`w-3 h-3 ${primaryGpu.temperatureHotspot > 83 ? "text-red-500" : "text-orange-500"}`} />
            <span className={primaryGpu.temperatureHotspot > 83 ? "text-red-500" : "text-orange-500"}>
              Hot: {formatTemp(primaryGpu.temperatureHotspot)}
            </span>
          </div>
        )}
        {primaryGpu.temperatureMem !== undefined && primaryGpu.temperatureMem !== null && primaryGpu.temperatureMem > 0 && (
          <div className="flex items-center gap-1">
            <MemoryStick className="w-3 h-3 text-cyan-500" />
            <span className="text-cyan-500">Mem: {formatTemp(primaryGpu.temperatureMem)}</span>
          </div>
        )}
        {primaryGpu.currentClockMHz !== undefined && primaryGpu.currentClockMHz !== null && primaryGpu.currentClockMHz > 0 && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{formatMHz(primaryGpu.currentClockMHz)}</span>
          </div>
        )}
        {primaryGpu.power != null && primaryGpu.power > 0 && (
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>{primaryGpu.power.toFixed(2)}W</span>
          </div>
        )}
        {primaryGpu.memoryClockMHz !== undefined && primaryGpu.memoryClockMHz !== null && primaryGpu.memoryClockMHz > 0 && (
          <div className="flex items-center gap-1">
            <MemoryStick className="w-3 h-3" />
            <span>{formatMHz(primaryGpu.memoryClockMHz)}</span>
          </div>
        )}
        {(primaryGpu.pcieWidth !== undefined || primaryGpu.pcieSpeed) && (
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>
              PCIe {primaryGpu.pcieWidth ? `x${primaryGpu.pcieWidth}` : ""} {primaryGpu.pcieSpeed || ""}
            </span>
          </div>
        )}
      </div>

      {/* ECC Errors Row */}
      {(primaryGpu.eccCorrectable !== undefined || primaryGpu.eccUncorrectable !== undefined) && (
        <div className="flex flex-wrap gap-3 text-xs mb-3">
          {primaryGpu.eccCorrectable !== undefined && (
            <div className={`flex items-center gap-1 ${(primaryGpu.eccCorrectable ?? 0) > 0 ? "text-yellow-500" : "text-muted-foreground"}`}>
              <span>ECC Corr:</span>
              <span className="font-mono">{primaryGpu.eccCorrectable}</span>
            </div>
          )}
          {primaryGpu.eccUncorrectable !== undefined && (
            <div className={`flex items-center gap-1 ${(primaryGpu.eccUncorrectable ?? 0) > 0 ? "text-red-500" : "text-muted-foreground"}`}>
              <span>ECC Uncorr:</span>
              <span className="font-mono">{primaryGpu.eccUncorrectable}</span>
            </div>
          )}
        </div>
      )}

      {/* ROCm Powered By */}
      {rocmDetected && (
        <div className="flex items-center gap-2 pt-2 mt-3 border-t border-border/30">
          <Image
            src="https://avatars.githubusercontent.com/u/16900649?s=280&v=4"
            alt="AMD ROCm"
            width={80}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span className="text-xs text-muted-foreground">Powered by ROCm {rocmRuntimeVersion}</span>
        </div>
      )}

      {/* GPU Hardware Details - collapsible */}
      <div className="pt-2 mt-3 border-t border-border/30">
        <button
          type="button"
          onClick={() => setShowGpuHardware(!showGpuHardware)}
          className="flex items-center justify-between w-full text-left"
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Hardware Details
          </p>
          <span className="text-[10px] text-muted-foreground">
            {showGpuHardware ? "▲" : "▼"}
          </span>
        </button>
        {showGpuHardware && (
          <div className="space-y-1 mt-2">
            {primaryGpu.deviceId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device ID:</span>
                <span className="font-mono text-foreground">{primaryGpu.deviceId}</span>
              </div>
            )}
            {primaryGpu.driverVersion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-mono text-foreground">{primaryGpu.driverVersion}</span>
              </div>
            )}
            {primaryGpu.vbiosVersion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VBIOS:</span>
                <span className="font-mono text-foreground">{primaryGpu.vbiosVersion}</span>
              </div>
            )}
            {primaryGpu.pciBus && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">PCI Bus:</span>
                <span className="font-mono text-foreground">{primaryGpu.pciBus}</span>
              </div>
            )}
            {primaryGpu.vramType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VRAM Type:</span>
                <span className="font-mono text-foreground">{primaryGpu.vramType} {primaryGpu.vramBitWidth ? `(${primaryGpu.vramBitWidth}-bit)` : ""}</span>
              </div>
            )}
            {primaryGpu.maxClockMHz !== undefined && primaryGpu.maxClockMHz > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Clock:</span>
                <span className="font-mono text-foreground">{formatMHz(primaryGpu.maxClockMHz)}</span>
              </div>
            )}
            {primaryGpu.memoryClockMHz !== undefined && primaryGpu.memoryClockMHz !== null && primaryGpu.memoryClockMHz > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Memory Clock:</span>
                <span className="font-mono text-foreground">{formatMHz(primaryGpu.memoryClockMHz)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Column>
  );
}

/* Memory Column */
function MemoryColumn({
  data,
  isActive,
  onClick,
}: {
  data: SystemMetrics["memory"] | null;
  isActive: boolean;
  onClick: () => void;
}) {
  if (!data) {
    return (
      <Column isActive={isActive} onClick={onClick}>
        <ColumnHeader title="System Memory" icon={MemoryStick} isActive={isActive} onClick={onClick} />
        <div className="flex items-center justify-center h-32 text-muted-foreground">Loading...</div>
      </Column>
    );
  }

  const { total, used, free, usage, swapUsed, swapTotal } = data;

  return (
    <Column isActive={isActive} onClick={onClick}>
      <ColumnHeader title="System Memory" icon={MemoryStick} isActive={isActive} onClick={onClick} />

      {/* Memory Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Usage</span>
          <span className={`text-sm font-bold ${usage > 80 ? "text-red-500" : "text-foreground"}`}>
            {Math.round(usage)}%
          </span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${usage > 80 ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${Math.min(usage, 100)}%` }}
          />
        </div>
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-surface-2 rounded">
          <p className="text-lg font-bold text-green-400">{used.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Used</p>
        </div>
        <div className="text-center p-2 bg-surface-2 rounded">
          <p className="text-lg font-bold text-foreground">{free.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Free</p>
        </div>
        <div className="text-center p-2 bg-surface-2 rounded">
          <p className="text-lg font-bold text-cyan-400">{swapUsed.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Swap</p>
        </div>
      </div>

      {/* Total */}
      <div className="text-center p-3 bg-surface-2 rounded">
        <p className="text-2xl font-bold text-foreground">{total.toFixed(2)} GB</p>
        <p className="text-[10px] text-muted-foreground uppercase">Total</p>
      </div>
    </Column>
  );
}

/* Network Column */
function NetworkColumn({
  data,
  isActive,
  onClick,
}: {
  data: SystemMetrics["network"] | null;
  isActive: boolean;
  onClick: () => void;
}) {
  if (!data || !data.interfaces || data.interfaces.length === 0) {
    return (
      <Column isActive={isActive} onClick={onClick}>
        <ColumnHeader title="Network" icon={Wifi} isActive={isActive} onClick={onClick} />
        <div className="flex items-center justify-center h-32 text-muted-foreground">No network detected</div>
      </Column>
    );
  }

  const primaryInterface = data.interfaces[0];

  return (
    <Column isActive={isActive} onClick={onClick}>
      <ColumnHeader title="Network" icon={Wifi} isActive={isActive} onClick={onClick} />

      {/* Interface Info */}
      <div className="mb-3">
        <p className="text-sm font-medium text-foreground">{primaryInterface.name}</p>
      </div>

      {/* Speed */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 bg-surface-2 rounded">
          <p className="text-lg font-bold text-green-400">{formatSpeed(primaryInterface.rxSec)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Download</p>
        </div>
        <div className="text-center p-2 bg-surface-2 rounded">
          <p className="text-lg font-bold text-blue-400">{formatSpeed(primaryInterface.txSec)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Upload</p>
        </div>
      </div>

      {/* Total Traffic */}
      <div className="text-xs text-muted-foreground">
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
function DiskColumn({
  data,
  isActive,
  onClick,
}: {
  data: SystemMetrics["disk"] | null;
  isActive: boolean;
  onClick: () => void;
}) {
  if (!data || !data.disks || data.disks.length === 0) {
    return (
      <Column isActive={isActive} onClick={onClick}>
        <ColumnHeader title="Storage" icon={HardDrive} isActive={isActive} onClick={onClick} />
        <div className="flex items-center justify-center h-32 text-muted-foreground">Loading...</div>
      </Column>
    );
  }

  const { disks, total } = data;
  const totalUsage = total.total > 0 ? Math.round((total.used / total.total) * 100) : 0;

  return (
    <Column isActive={isActive} onClick={onClick}>
      <ColumnHeader title="Storage" icon={HardDrive} isActive={isActive} onClick={onClick} />

      {/* Total Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Total Usage</span>
          <span className={`text-sm font-bold ${totalUsage > 80 ? "text-red-500" : "text-foreground"}`}>
            {totalUsage}%
          </span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${totalUsage > 80 ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${Math.min(totalUsage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{formatGB(total.used)} used</span>
          <span>{formatGB(total.total)}</span>
        </div>
      </div>

      {/* Individual Disks */}
      <div className="space-y-2">
        {disks.map((disk) => (
          <div key={disk.name} className="p-2 bg-surface-2 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-foreground truncate">{disk.name.split("/").pop()}</span>
              <span className="text-xs text-muted-foreground">{disk.usage}%</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${disk.usage > 80 ? "bg-red-500" : "bg-primary"}`}
                style={{ width: `${Math.min(disk.usage, 100)}%` }}
              />
            </div>
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
  const [activeTab, setActiveTab] = useState<TabId>("cpu");
  const [showPerCore, setShowPerCore] = useState(true);
  const [showGpuHardware, setShowGpuHardware] = useState(true);

  const toggleTab = (id: TabId) => {
    setVisibleTabs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (activeTab === id) {
          const remaining = Array.from(next);
          if (remaining.length > 0) setActiveTab(remaining[0]);
        }
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

  const rocmDetected = metrics?.rocmDetected ?? metrics?.gpu.some((g) => g.gfxVersion && g.gfxVersion !== "N/A") ?? false;
  const rocmRuntimeVersion = metrics?.rocmRuntimeVersion ?? "";

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 border-b backdrop-blur-sm"
        style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <Image src="/logo.svg" alt="Logo" width={48} height={48} className="w-12 h-12 mr-3" />
            <h1 className="text-2xl font-bold text-foreground">System Metrics <span className="text-primary">Plus</span></h1>
          </div>

          {/* Tab Bar - all tabs, click to toggle visibility */}
          <div className="flex gap-1 mt-3">
            {allTabs.map((tab) => {
              const isVisible = visibleTabs.has(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => toggleTab(tab.id)}
                  className={`tab-button flex-1 ${isVisible ? "active" : ""}`}
                  title={isVisible ? "Click to hide" : "Click to show"}
                >
                  <tab.icon className="w-4 h-4 inline mr-1" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columns Row */}
      <main className="px-4 py-4">
        <div className="flex gap-4 pb-2" style={{ height: "calc(100vh - 140px)" }}>
          {isLoading || !metrics ? (
            <div className="flex items-center justify-center flex-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : (
            getVisibleColumns().map((tabId) => {
              const isActive = activeTab === tabId;
              const tab = allTabs.find((t) => t.id === tabId)!;
              switch (tabId) {
                case "cpu":
                  return <CpuColumn key={tabId} data={metrics.cpu} isActive={isActive} onClick={() => setActiveTab(tabId)} showPerCore={showPerCore} setShowPerCore={setShowPerCore} />;
                case "gpu":
                  return (
                    <GpuColumn
                      key={tabId}
                      gpus={metrics.gpu}
                      rocmDetected={rocmDetected}
                      rocmRuntimeVersion={rocmRuntimeVersion}
                      isActive={isActive}
                      onClick={() => setActiveTab(tabId)}
                      showGpuHardware={showGpuHardware}
                      setShowGpuHardware={setShowGpuHardware}
                    />
                  );
                case "memory":
                  return <MemoryColumn key={tabId} data={metrics.memory} isActive={isActive} onClick={() => setActiveTab(tabId)} />;
                case "network":
                  return <NetworkColumn key={tabId} data={metrics.network} isActive={isActive} onClick={() => setActiveTab(tabId)} />;
                case "disk":
                  return <DiskColumn key={tabId} data={metrics.disk} isActive={isActive} onClick={() => setActiveTab(tabId)} />;
                default:
                  return null;
              }
            })
          )}
        </div>
      </main>

      {/* Footer - Quick Stats */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-sm"
        style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Left: Quick GPU stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {metrics?.gpu?.[0] && (
              <>
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  GPU: {metrics.gpu[0].temperature ?? 0}°C
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {metrics.gpu[0].power ?? 0}W
                </span>
                <span className="flex items-center gap-1">
                  <MemoryStick className="w-3 h-3" />
                  VRAM: {formatGB(metrics.gpu[0].memory?.used ?? 0)} / {formatGB(metrics.gpu[0].memory?.total ?? 0)}
                </span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              CPU: {metrics?.cpu?.usage ?? 0}%
            </span>
          </div>

          {/* Right: Theme toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              {lastUpdate?.toLocaleTimeString() || "--:--:--"}
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1 rounded-md border transition-colors hover:bg-surface-2"
              style={{ borderColor: "var(--border)" }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>
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
