"use client";

import type { GpuMetrics } from "@/types/metrics";
import {
  Video,
  Gauge,
  Thermometer,
  Zap,
  AlertTriangle,
  Activity,
} from "lucide-react";
import GpuEnginesPanel from "./GpuEnginesPanel";
import GpuThermalPanel from "./GpuThermalPanel";
import GpuPowerPanel from "./GpuPowerPanel";
import GpuMediaPanel from "./GpuMediaPanel";
import GpuPciePanel from "./GpuPciePanel";
import GpuEccPanel from "./GpuEccPanel";

function formatGB(gb: number) {
  return `${gb.toFixed(1)} GB`;
}

function formatTemp(temp: number | null) {
  return temp !== null ? `${temp}°C` : "N/A";
}

function formatMHz(mhz: number | null | undefined) {
  if (mhz === null || mhz === undefined) return "N/A";
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
  return `${mhz} MHz`;
}

function getVramStatus(used: number | null, total: number | null) {
  if (total === null || total === undefined || total === 0) {
    return { percent: 0, status: "OK", color: "text-foreground", bgColor: "bg-primary" };
  }
  const percent = Math.round((used || 0) / total * 100);
  if (percent > 90) return { percent, status: "CRITICAL", color: "text-red-500", bgColor: "bg-red-500" };
  if (percent > 70) return { percent, status: "WARNING", color: "text-yellow-500", bgColor: "bg-yellow-500" };
  return { percent, status: "OK", color: "text-foreground", bgColor: "bg-primary" };
}

function getTrainingStatus(gpu: GpuMetrics) {
  if (!gpu || gpu.usage === null || gpu.memory?.used === null) return null;
  const highUtil = gpu.usage > 70;
  const highVram = gpu.memory.total && (gpu.memory.used / gpu.memory.total) > 0.6;
  if (highUtil && highVram) return { label: "Training", color: "text-green-500", icon: Zap, bg: "bg-green-500/20" };
  if (highUtil) return { label: "Computing", color: "text-blue-500", icon: Activity, bg: "bg-blue-500/20" };
  if (gpu.usage > 10) return { label: "Active", color: "text-yellow-500", icon: Activity, bg: "bg-yellow-500/20" };
  return { label: "Idle", color: "text-[var(--muted-foreground)]", icon: Activity, bg: "" };
}

function ProgressBar({
  value,
  alert = false,
}: {
  value: number;
  alert?: boolean;
}) {
  const bgColor = alert ? "bg-red-500" : "var(--primary)";
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: "var(--surface-2)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: bgColor,
        }}
      />
    </div>
  );
}

interface GpuCardProps {
  gpu: GpuMetrics;
  isPrimary?: boolean;
}

function GpuCard({ gpu, isPrimary = false }: GpuCardProps) {
  const vramStatus = getVramStatus(gpu.memory?.used ?? null, gpu.memory?.total ?? null);
  const trainingStatus = getTrainingStatus(gpu);

  return (
    <div
      className="p-4 rounded-lg border"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-md" style={{ background: "rgba(255, 77, 77, 0.2)" }}>
            <Video className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              {isPrimary ? "Primary GPU" : "Additional GPU"}
            </p>
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--foreground)" }}
            >
              {gpu.marketingName || gpu.name}
            </p>
          </div>
        </div>
        {trainingStatus && !isPrimary && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{ background: trainingStatus.bg, borderColor: "var(--border)" }}
          >
            <trainingStatus.icon className={`w-3.5 h-3.5 ${trainingStatus.color}`} />
            <span className={`text-xs font-medium ${trainingStatus.color}`}>
              {trainingStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* GPU Usage */}
      {gpu.usage !== null && gpu.usage !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                GPU Usage
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24">
                <ProgressBar value={gpu.usage} alert={gpu.usage > 80} />
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: gpu.usage > 80 ? "#ef4444" : "var(--foreground)" }}
              >
                {gpu.usage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VRAM */}
      {gpu.memory && gpu.memory.total !== null && gpu.memory.total !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                VRAM
              </span>
              {vramStatus.status !== "OK" && (
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24">
                <ProgressBar value={vramStatus.percent} alert={vramStatus.status !== "OK"} />
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: vramStatus.color }}
              >
                {vramStatus.percent}%
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs px-1" style={{ color: "var(--muted-foreground)" }}>
            <span>Used: {formatGB(gpu.memory.used || 0)}</span>
            <span>Total: {formatGB(gpu.memory.total)}</span>
            {vramStatus.status !== "OK" && (
              <span className={vramStatus.color}>{vramStatus.status}</span>
            )}
          </div>
        </div>
      )}

      {/* GPU Stats */}
      <div className="flex flex-wrap gap-4">
        {gpu.temperature !== null && gpu.temperature !== undefined && gpu.temperature > 0 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Thermometer className="w-3 h-3" />
            <span>{formatTemp(gpu.temperature)}</span>
          </div>
        )}
        {gpu.currentClockMHz !== undefined && gpu.currentClockMHz > 0 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Zap className="w-3 h-3" />
            <span>{formatMHz(gpu.currentClockMHz)}</span>
          </div>
        )}
        {gpu.power != null && gpu.power > 0 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Activity className="w-3 h-3" />
            <span>{gpu.power.toFixed(1)}W</span>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {(gpu.driverVersion || gpu.gfxVersion) && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            {gpu.driverVersion && (
              <span>Driver: <span className="font-mono" style={{ color: "var(--foreground)" }}>{gpu.driverVersion}</span></span>
            )}
            {gpu.gfxVersion && gpu.gfxVersion !== "N/A" && (
              <span>GFX: <span className="font-mono" style={{ color: "var(--foreground)" }}>{gpu.gfxVersion}</span></span>
            )}
            {gpu.computeUnits > 0 && (
              <span>CUs: {gpu.computeUnits}</span>
            )}
            {gpu.maxClockMHz > 0 && (
              <span>Max: {formatMHz(gpu.maxClockMHz)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface GpuTabProps {
  gpus: GpuMetrics[];
}

export default function GpuTab({ gpus }: GpuTabProps) {
  if (!gpus || gpus.length === 0) {
    return (
      <div
        className="p-6 rounded-lg text-center"
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
    );
  }

  const primaryGpu = gpus[0];
  const additionalGpus = gpus.slice(1);

  return (
    <div className="space-y-4">
      {/* Primary GPU */}
      <div
        className="p-4 rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-md" style={{ background: "rgba(255, 77, 77, 0.2)" }}>
              <Video className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}
              >
                Graphics Processor
              </p>
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--foreground)" }}
              >
                {primaryGpu.marketingName || primaryGpu.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span>{primaryGpu.vendor || "AMD"}</span>
                {primaryGpu.gfxVersion && primaryGpu.gfxVersion !== "N/A" && (
                  <>
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--muted-foreground)" }} />
                    <span className="font-mono">{primaryGpu.gfxVersion}</span>
                  </>
                )}
                {primaryGpu.computeUnits > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--muted-foreground)" }} />
                    <span>{primaryGpu.computeUnits} CUs</span>
                  </>
                )}
                {primaryGpu.maxClockMHz > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--muted-foreground)" }} />
                    <span>{formatMHz(primaryGpu.maxClockMHz)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {(() => {
            const status = getTrainingStatus(primaryGpu);
            if (!status) return null;
            const StatusIcon = status.icon;
            return (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                style={{ background: status.bg, borderColor: "var(--border)" }}
              >
                <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                <span className={`text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
            );
          })()}
        </div>

        {/* GPU Usage */}
        {primaryGpu.usage !== null && primaryGpu.usage !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
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
          </div>
        )}

        {/* VRAM */}
        {primaryGpu.memory && primaryGpu.memory.total !== null && primaryGpu.memory.total !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  VRAM
                </span>
                {(() => {
                  const vramStatus = getVramStatus(primaryGpu.memory?.used ?? null, primaryGpu.memory?.total ?? null);
                  if (vramStatus.status === "CRITICAL") {
                    return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
                  }
                  return null;
                })()}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32">
                  {(() => {
                    const vramStatus = getVramStatus(primaryGpu.memory?.used ?? null, primaryGpu.memory?.total ?? null);
                    return <ProgressBar value={vramStatus.percent} alert={vramStatus.status !== "OK"} />;
                  })()}
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: getVramStatus(primaryGpu.memory?.used ?? null, primaryGpu.memory?.total ?? null).color }}
                >
                  {(() => {
                    const vramStatus = getVramStatus(primaryGpu.memory?.used ?? null, primaryGpu.memory?.total ?? null);
                    return `${vramStatus.percent}%`;
                  })()}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs px-1" style={{ color: "var(--muted-foreground)" }}>
              <span>Used: {formatGB(primaryGpu.memory.used || 0)}</span>
              <span>Total: {formatGB(primaryGpu.memory.total)}</span>
            </div>
          </div>
        )}

        {/* GPU Stats */}
        <div className="flex flex-wrap gap-4">
          {(primaryGpu.temperature !== null && primaryGpu.temperature !== undefined && primaryGpu.temperature > 0) ||
           (primaryGpu.currentClockMHz !== undefined && primaryGpu.currentClockMHz > 0) ? (
            <div className="flex items-center gap-3">
              {primaryGpu.temperature !== null && primaryGpu.temperature !== undefined && primaryGpu.temperature > 0 && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <Thermometer className="w-3 h-3" />
                  <span>{formatTemp(primaryGpu.temperature)}</span>
                </div>
              )}
              {primaryGpu.currentClockMHz !== undefined && primaryGpu.currentClockMHz > 0 && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <Zap className="w-3 h-3" />
                  <span>{formatMHz(primaryGpu.currentClockMHz)}</span>
                </div>
              )}
            </div>
          ) : null}
          {primaryGpu.power != null && primaryGpu.power > 0 && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <Activity className="w-3 h-3" />
              <span>{primaryGpu.power.toFixed(1)}W</span>
            </div>
          )}
        </div>

        {/* ROCm Badge */}
        {primaryGpu.gfxVersion && primaryGpu.gfxVersion !== "N/A" && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Powered by ROCm
            </span>
          </div>
        )}

        {/* Advanced Metrics Panels */}
        {(() => {
          const hasAdvancedMetrics = 
            primaryGpu.engineUtilization ||
            primaryGpu.thermal ||
            primaryGpu.powerMetrics ||
            primaryGpu.mediaEngines ||
            primaryGpu.pcieMetrics ||
            primaryGpu.xgmiMetrics ||
            primaryGpu.eccMetrics;
          
          if (!hasAdvancedMetrics) return null;
          
          return (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--foreground)" }}>
                AMD Advanced Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {primaryGpu.engineUtilization && (
                  <GpuEnginesPanel engines={primaryGpu.engineUtilization} />
                )}
                {primaryGpu.thermal && (
                  <GpuThermalPanel thermal={primaryGpu.thermal} />
                )}
                {primaryGpu.powerMetrics && (
                  <GpuPowerPanel power={primaryGpu.powerMetrics} />
                )}
                {primaryGpu.mediaEngines && (
                  <GpuMediaPanel media={primaryGpu.mediaEngines} />
                )}
                {(primaryGpu.pcieMetrics || primaryGpu.xgmiMetrics) && (
                  <GpuPciePanel pcie={primaryGpu.pcieMetrics} xgmi={primaryGpu.xgmiMetrics} />
                )}
                <GpuEccPanel ecc={primaryGpu.eccMetrics} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Additional GPUs */}
      {additionalGpus.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
              Additional GPUs
            </h3>
          </div>
          {additionalGpus.map((gpu) => (
            <GpuCard key={gpu.index} gpu={gpu} />
          ))}
        </div>
      )}
    </div>
  );
}
