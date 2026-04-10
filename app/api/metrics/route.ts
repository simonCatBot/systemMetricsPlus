import { NextResponse } from "next/server";
import * as si from "systeminformation";
import { detectROCm } from "@/lib/system/rocm";
import type { SystemMetrics } from "@/types/metrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCpuMetrics() {
  const [cpu, cpuLoad, cpuSpeed, cpuTemp] = await Promise.all([
    si.cpu(),
    si.currentLoad(),
    si.cpuCurrentSpeed(),
    si.cpuTemperature(),
  ]);
  return { cpu, cpuLoad, cpuSpeed, cpuTemp };
}

async function getMemoryMetrics() {
  return si.mem();
}

async function getNetworkStats() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = await si.networkStats() as any[];
    return stats.map((iface) => ({
      iface: String(iface.iface || ""),
      rx_bytes: Number(iface.rx_bytes || 0),
      tx_bytes: Number(iface.tx_bytes || 0),
      rx_sec: Number(iface.rx_sec || 0),
      tx_sec: Number(iface.tx_sec || 0),
      speed: 0,
    }));
  } catch {
    return [];
  }
}

async function getDiskMetrics() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const disks = await si.fsSize() as any[];
    return disks.map((disk) => ({
      fs: String(disk.fs || ""),
      size: Number(disk.size || 0),
      used: Number(disk.used || 0),
      use: Number(disk.use || 0),
    }));
  } catch {
    return [];
  }
}

async function getOsInfo() {
  return si.osInfo();
}

interface GpuOutput {
  index: number;
  name: string;
  marketingName: string;
  vendor: string;
  usage: number;
  memory: { total: number; used: number };
  temperature: number | null;
  power: number | null;
  driverVersion: string;
  gfxVersion: string;
  deviceId: string;
  computeUnits: number;
  maxClockMHz: number;
  currentClockMHz: number;
  memoryClockMHz?: number;
  vbiosVersion?: string;
  pciBus?: string;
  isThrottling?: boolean;
}

async function getGpuMetrics(): Promise<{ gpus: GpuOutput[]; rocmDetected: boolean; rocmRuntimeVersion: string }> {
  // First try ROCm detection
  try {
    const rocData = await detectROCm();
    if (rocData.gpus && rocData.gpus.length > 0) {
      return {
        gpus: rocData.gpus.map((gpu) => ({
          index: gpu.index,
          name: gpu.name,
          marketingName: gpu.marketingName,
          vendor: gpu.vendor,
          usage: 0,
          memory: gpu.memory || { total: 0, used: 0 },
          temperature: gpu.temperature ?? null,
          power: gpu.power ?? null,
          driverVersion: gpu.driverVersion || "Unknown",
          gfxVersion: gpu.gfxVersion,
          deviceId: gpu.deviceId || "N/A",
          computeUnits: gpu.computeUnits,
          maxClockMHz: gpu.maxClockMHz,
          currentClockMHz: gpu.currentClockMHz || 0,
          memoryClockMHz: gpu.memoryClockMHz,
          vbiosVersion: gpu.vbiosVersion,
          pciBus: gpu.pciBus,
          isThrottling: gpu.temperature !== undefined && gpu.temperature > 83,
        })),
        rocmDetected: true,
        rocmRuntimeVersion: rocData.runtimeVersion || "",
      };
    }
  } catch (e) {
    console.warn("ROCm detection failed:", e);
  }

  // Fallback to systeminformation
  try {
    const graphics = await si.graphics();
    const controllers = graphics.controllers || [];
    if (controllers.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {
        gpus: controllers.map((gpu: any, index: number) => ({
          index,
          name: String(gpu.model || "Unknown GPU"),
          marketingName: String(gpu.model || "Unknown GPU"),
          vendor: String(gpu.vendor || "Unknown"),
          usage: Number(gpu.utilizationGpu ?? 0),
          memory: {
            total: Number(gpu.memoryTotal ?? 0) / (1024 * 1024 * 1024),
            used: Number(gpu.memoryUsed ?? 0) / (1024 * 1024 * 1024),
          },
          temperature: Number(gpu.temperatureGpu ?? 0) || null,
          power: Number(gpu.powerDraw ?? 0) || null,
          driverVersion: String(gpu.driverVersion || "Unknown"),
          gfxVersion: "N/A",
          deviceId: "N/A",
          computeUnits: 0,
          maxClockMHz: 0,
          currentClockMHz: Number(gpu.clockCore ?? 0),
        })),
        rocmDetected: false,
        rocmRuntimeVersion: "",
      };
    }
  } catch (e) {
    console.warn("Graphics detection failed:", e);
  }

  return { gpus: [], rocmDetected: false, rocmRuntimeVersion: "" };
}

export async function GET(): Promise<NextResponse> {
  try {
    const [{ cpu, cpuLoad, cpuSpeed, cpuTemp }, mem, networkStats, diskArr, osInfo, gpuData] =
      await Promise.all([
        getCpuMetrics(),
        getMemoryMetrics(),
        getNetworkStats(),
        getDiskMetrics(),
        getOsInfo(),
        getGpuMetrics(),
      ]);

    // CPU metrics
    const cpuMetrics = {
      name: cpu.brand || "Unknown CPU",
      usage: Math.round(cpuLoad.currentLoad),
      physicalCores: cpu.physicalCores || 0,
      logicalCores: cpu.cores || 0,
      temperature: cpuTemp.main !== null ? Math.round(cpuTemp.main) : null,
      speed: Math.round((cpu.speed || 0) * 1000),
      currentSpeedMHz: Math.round((cpuSpeed.avg || 0) * 1000),
      loadAvg: cpuLoad.avgLoad
        ? ([cpuLoad.avgLoad, cpuLoad.avgLoad * 0.9, cpuLoad.avgLoad * 0.85] as [number, number, number])
        : ([0, 0, 0] as [number, number, number]),
      coreLoads: (cpuLoad.cpus || []).map((c: { load?: number }) => Math.round(c.load || 0)),
    };

    // Memory metrics
    const memoryMetrics = {
      total: Math.round((mem.total / (1024 * 1024 * 1024)) * 100) / 100,
      used: Math.round((mem.used / (1024 * 1024 * 1024)) * 100) / 100,
      free: Math.round(((mem.free || 0) / (1024 * 1024 * 1024)) * 100) / 100,
      usage: Math.round((mem.used / mem.total) * 100),
      swapTotal: Math.round(((mem.swaptotal || 0) / (1024 * 1024 * 1024)) * 100) / 100,
      swapUsed: Math.round(((mem.swapused || 0) / (1024 * 1024 * 1024)) * 100) / 100,
      swapFree: Math.round(((mem.swaptotal || 0 - (mem.swapused || 0)) / (1024 * 1024 * 1024)) * 100) / 100,
    };

    // Network metrics
    const networkMetrics = {
      interfaces: networkStats.map((iface) => ({
        name: iface.iface || "unknown",
        ip4: "N/A",
        ip6: "N/A",
        speed: iface.speed || 0,
        rxSec: iface.rx_sec || 0,
        txSec: iface.tx_sec || 0,
        rxBytes: iface.rx_bytes || 0,
        txBytes: iface.tx_bytes || 0,
      })),
      total: {
        rxSec: networkStats.reduce((sum, i) => sum + (i.rx_sec || 0), 0),
        txSec: networkStats.reduce((sum, i) => sum + (i.tx_sec || 0), 0),
      },
    };

    // Disk metrics
    const diskMetrics = {
      disks: diskArr.map((disk) => ({
        name: disk.fs || "Unknown",
        total: Math.round(((disk.size || 0) / (1024 * 1024 * 1024)) * 100) / 100,
        used: Math.round(((disk.used || 0) / (1024 * 1024 * 1024)) * 100) / 100,
        free: Math.round((((disk.size || 0) - (disk.used || 0)) / (1024 * 1024 * 1024)) * 100) / 100,
        usage: Math.round(disk.use || 0),
      })),
      total: {
        total: Math.round((diskArr.reduce((sum, d) => sum + (d.size || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
        used: Math.round((diskArr.reduce((sum, d) => sum + (d.used || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
        free: Math.round((diskArr.reduce((sum, d) => sum + ((d.size || 0) - (d.used || 0)), 0) / (1024 * 1024 * 1024)) * 100) / 100,
      },
    };

    // OS info
    const osMetrics = {
      platform: osInfo.platform || "unknown",
      distro: osInfo.distro || "Unknown",
      release: osInfo.release || "Unknown",
      hostname: osInfo.hostname || "Unknown",
      arch: osInfo.arch || "Unknown",
    };

    const response: SystemMetrics = {
      timestamp: Date.now(),
      cpu: cpuMetrics,
      memory: memoryMetrics,
      gpu: gpuData.gpus,
      network: networkMetrics,
      disk: diskMetrics,
      os: osMetrics,
      rocmDetected: gpuData.rocmDetected,
      rocmRuntimeVersion: gpuData.rocmRuntimeVersion,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to collect metrics:", error);
    return NextResponse.json({ error: "Failed to collect metrics" }, { status: 500 });
  }
}
