export interface CpuMetrics {
  name: string;
  usage: number;
  physicalCores: number;
  logicalCores: number;
  temperature: number | null;
  speed: number;
  currentSpeedMHz: number;
  loadAvg: [number, number, number];
  coreLoads: number[];
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  usage: number;
  swapTotal: number;
  swapUsed: number;
  swapFree: number;
}

export interface GpuMetrics {
  index: number;
  name: string;
  marketingName: string;
  vendor: string;
  usage: number;
  memory: {
    total: number;
    used: number;
  };
  temperature: number | null;
  power: number | null;
  driverVersion: string;
  gfxVersion: string;
  deviceId: string;
  computeUnits: number;
  maxClockMHz: number;
  currentClockMHz: number;
}

export interface NetworkMetrics {
  interfaces: {
    name: string;
    ip4: string;
    ip6: string;
    speed: number;
    rxSec: number;
    txSec: number;
    rxBytes: number;
    txBytes: number;
  }[];
  total: {
    rxSec: number;
    txSec: number;
  };
}

export interface DiskMetrics {
  disks: {
    name: string;
    total: number;
    used: number;
    free: number;
    usage: number;
  }[];
  total: {
    total: number;
    used: number;
    free: number;
  };
}

export interface SystemMetrics {
  timestamp: number;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  gpu: GpuMetrics[];
  network: NetworkMetrics;
  disk: DiskMetrics;
  os: {
    platform: string;
    distro: string;
    release: string;
    hostname: string;
    arch: string;
  };
}
