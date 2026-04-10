import { NextResponse } from "next/server";
import * as si from "systeminformation";

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

async function getGpuMetrics() {
  try {
    const graphics = await si.graphics();
    return graphics.controllers || [];
  } catch {
    return [];
  }
}

async function getNetworkStats() {
  try {
    return await si.networkStats();
  } catch {
    return [];
  }
}

async function getDiskMetrics() {
  try {
    return await si.fsSize();
  } catch {
    return [];
  }
}

async function getOsInfo() {
  return si.osInfo();
}

export async function GET() {
  try {
    const [{ cpu, cpuLoad, cpuSpeed, cpuTemp }, mem, gpuArray, networkStats, diskArr, osInfo] =
      await Promise.all([
        getCpuMetrics(),
        getMemoryMetrics(),
        getGpuMetrics(),
        getNetworkStats(),
        getDiskMetrics(),
        getOsInfo(),
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

    // GPU metrics
    const gpuMetrics = gpuArray.map((gpu: {
      model?: string;
      vendor?: string;
      vram?: number | null;
      utilizationGpu?: number;
      memoryTotal?: number;
      memoryUsed?: number;
      temperatureGpu?: number;
      powerDraw?: number;
      driverVersion?: string;
      clockCore?: number;
    }, index: number) => ({
      index,
      name: gpu.model || "Unknown GPU",
      marketingName: gpu.model || "Unknown GPU",
      vendor: gpu.vendor || "Unknown",
      usage: gpu.utilizationGpu !== undefined ? Math.round(gpu.utilizationGpu) : 0,
      memory: {
        total: gpu.memoryTotal !== undefined ? Math.round((gpu.memoryTotal / (1024 * 1024 * 1024)) * 100) / 100 : 0,
        used: gpu.memoryUsed !== undefined ? Math.round((gpu.memoryUsed / (1024 * 1024 * 1024)) * 100) / 100 : 0,
      },
      temperature: gpu.temperatureGpu !== undefined ? Math.round(gpu.temperatureGpu) : null,
      power: gpu.powerDraw !== undefined ? Math.round(gpu.powerDraw) : null,
      driverVersion: gpu.driverVersion || "Unknown",
      gfxVersion: "N/A",
      deviceId: "N/A",
      computeUnits: 0,
      maxClockMHz: 0,
      currentClockMHz: gpu.clockCore !== undefined ? Math.round(gpu.clockCore) : 0,
    }));

    // Network metrics
    const networkMetrics = {
      interfaces: networkStats.map((iface: {
        iface?: string;
        ip4addr?: string;
        ip6addr?: string;
        speed?: number;
        rx_sec?: number;
        tx_sec?: number;
        rx_bytes?: number;
        tx_bytes?: number;
      }) => ({
        name: iface.iface || "unknown",
        ip4: iface.ip4addr || "N/A",
        ip6: iface.ip6addr || "N/A",
        speed: iface.speed || 0,
        rxSec: iface.rx_sec || 0,
        txSec: iface.tx_sec || 0,
        rxBytes: iface.rx_bytes || 0,
        txBytes: iface.tx_bytes || 0,
      })),
      total: {
        rxSec: networkStats.reduce((sum: number, i: { rx_sec?: number }) => sum + (i.rx_sec || 0), 0),
        txSec: networkStats.reduce((sum: number, i: { tx_sec?: number }) => sum + (i.tx_sec || 0), 0),
      },
    };

    // Disk metrics
    const diskMetrics = {
      disks: diskArr.map((disk: {
        fs?: string;
        size?: number;
        used?: number;
        use?: number;
      }) => ({
        name: disk.fs || "Unknown",
        total: Math.round(((disk.size || 0) / (1024 * 1024 * 1024)) * 100) / 100,
        used: Math.round(((disk.used || 0) / (1024 * 1024 * 1024)) * 100) / 100,
        free: Math.round((((disk.size || 0) - (disk.used || 0)) / (1024 * 1024 * 1024)) * 100) / 100,
        usage: Math.round(disk.use || 0),
      })),
      total: {
        total: Math.round((diskArr.reduce((sum: number, d: { size?: number }) => sum + (d.size || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
        used: Math.round((diskArr.reduce((sum: number, d: { used?: number }) => sum + (d.used || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
        free: Math.round((diskArr.reduce((sum: number, d: { size?: number; used?: number }) => sum + ((d.size || 0) - (d.used || 0)), 0) / (1024 * 1024 * 1024)) * 100) / 100,
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

    return NextResponse.json({
      timestamp: Date.now(),
      cpu: cpuMetrics,
      memory: memoryMetrics,
      gpu: gpuMetrics,
      network: networkMetrics,
      disk: diskMetrics,
      os: osMetrics,
    });
  } catch (error) {
    console.error("Failed to collect metrics:", error);
    return NextResponse.json({ error: "Failed to collect metrics" }, { status: 500 });
  }
}
