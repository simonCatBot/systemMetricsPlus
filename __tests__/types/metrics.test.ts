import type {
  CpuMetrics,
  MemoryMetrics,
  GpuMetrics,
  NetworkMetrics,
  DiskMetrics,
  SystemMetrics,
} from '@/types/metrics';

describe('Type Definitions', () => {
  describe('CpuMetrics', () => {
    it('should have all required CPU properties', () => {
      const cpuMetrics: CpuMetrics = {
        name: 'AMD Ryzen 9 7950X',
        usage: 45,
        usageUser: 30,
        usageSystem: 15,
        physicalCores: 16,
        logicalCores: 32,
        temperature: 65,
        speed: 4500,
        currentSpeedMHz: 4500,
        maxSpeedMHz: 5700,
        minSpeedMHz: 3000,
        loadAvg: [2.5, 2.3, 2.1],
        coreLoads: [45, 50, 40, 42],
        coreSpeeds: [4.5, 4.6, 4.4, 4.5],
        cache: {
          l1d: 512,
          l1i: 512,
          l2: 8192,
          l3: 65536,
        },
        flags: 'avx512f avx512dq avx512cd avx512bw avx512vl',
        virtualization: true,
        governor: 'performance',
        topProcesses: [
          { pid: 1234, name: 'chrome', cpu: 12.5, mem: 8.2, user: 'user' },
        ],
      };

      expect(cpuMetrics).toBeDefined();
      expect(cpuMetrics.name).toBe('AMD Ryzen 9 7950X');
      expect(cpuMetrics.physicalCores).toBe(16);
      expect(cpuMetrics.logicalCores).toBe(32);
    });

    it('should handle missing optional properties', () => {
      const cpuMetrics: CpuMetrics = {
        name: 'Unknown CPU',
        usage: 0,
        usageUser: 0,
        usageSystem: 0,
        physicalCores: 4,
        logicalCores: 8,
        temperature: null,
        speed: 0,
        currentSpeedMHz: 0,
        maxSpeedMHz: 0,
        minSpeedMHz: 0,
        loadAvg: [0, 0, 0],
        coreLoads: [],
        coreSpeeds: [],
        flags: '',
        virtualization: false,
        governor: 'unknown',
      };

      expect(cpuMetrics.temperature).toBeNull();
      expect(cpuMetrics.topProcesses).toBeUndefined();
    });
  });

  describe('MemoryMetrics', () => {
    it('should calculate usage correctly', () => {
      const total = 32;
      const used = 16;
      const memory: MemoryMetrics = {
        total,
        used,
        free: total - used,
        usage: Math.round((used / total) * 100),
        swapTotal: 8,
        swapUsed: 2,
        swapFree: 6,
      };

      expect(memory.usage).toBe(50);
    });
  });

  describe('GpuMetrics', () => {
    it('should support AMD GPU with ROCm', () => {
      const gpu: GpuMetrics = {
        index: 0,
        name: 'gfx1150',
        marketingName: 'AMD Radeon 890M',
        vendor: 'AMD',
        usage: 75,
        memory: { total: 32, used: 16 },
        gttMemory: { total: 16, used: 4 },
        temperature: 45,
        temperatureHotspot: 55,
        temperatureMem: 40,
        power: 65.5,
        driverVersion: '6.3.6',
        gfxVersion: 'gfx1150',
        deviceId: '0x150e',
        computeUnits: 16,
        maxClockMHz: 2800,
        currentClockMHz: 1500,
        memoryClockMHz: 1800,
        vbiosVersion: '113-D6320101-104',
        pciBus: '0000:65:00.0',
        vramType: 'DDR5',
        vramBitWidth: 128,
        pcieWidth: 16,
        pcieSpeed: '16.0 GT/s',
        eccCorrectable: 0,
        eccUncorrectable: 0,
        isThrottling: false,
      };

      expect(gpu.marketingName).toBe('AMD Radeon 890M');
      expect(gpu.memory).toEqual({ total: 32, used: 16 });
    });

    it('should support fallback GPU from systeminformation', () => {
      const gpu: GpuMetrics = {
        index: 0,
        name: 'NVIDIA GeForce RTX 4090',
        marketingName: 'NVIDIA GeForce RTX 4090',
        vendor: 'NVIDIA',
        usage: 90,
        memory: { total: 24, used: 18 },
        driverVersion: '545.29',
        gfxVersion: 'N/A',
        deviceId: 'N/A',
        computeUnits: 0,
        maxClockMHz: 2520,
        currentClockMHz: 2000,
      };

      expect(gpu.vendor).toBe('NVIDIA');
    });
  });

  describe('NetworkMetrics', () => {
    it('should aggregate network stats', () => {
      const network: NetworkMetrics = {
        interfaces: [
          {
            name: 'eth0',
            ip4: '192.168.1.100',
            ip6: 'fe80::1',
            speed: 1000,
            rxSec: 1024,
            txSec: 512,
            rxBytes: 1073741824,
            txBytes: 536870912,
          },
        ],
        total: {
          rxSec: 1024,
          txSec: 512,
        },
      };

      expect(network.interfaces.length).toBe(1);
      expect(network.total.rxSec).toBe(1024);
    });
  });

  describe('DiskMetrics', () => {
    it('should calculate disk usage', () => {
      const disk: DiskMetrics = {
        disks: [
          { name: '/', total: 500, used: 250, free: 250, usage: 50 },
          { name: '/home', total: 1000, used: 200, free: 800, usage: 20 },
        ],
        total: {
          total: 1500,
          used: 450,
          free: 1050,
        },
      };

      const totalUsage = Math.round((disk.total.used / disk.total.total) * 100);
      expect(totalUsage).toBe(30);
    });
  });

  describe('SystemMetrics', () => {
    it('should contain all system metrics', () => {
      const metrics: SystemMetrics = {
        timestamp: Date.now(),
        cpu: {
          name: 'AMD Ryzen 9 7950X',
          usage: 45,
          usageUser: 30,
          usageSystem: 15,
          physicalCores: 16,
          logicalCores: 32,
          temperature: 65,
          speed: 4500,
          currentSpeedMHz: 4500,
          maxSpeedMHz: 5700,
          minSpeedMHz: 3000,
          loadAvg: [2.5, 2.3, 2.1],
          coreLoads: [45, 50, 40, 42],
          coreSpeeds: [4.5, 4.6, 4.4, 4.5],
          flags: 'avx512f',
          virtualization: true,
          governor: 'performance',
        },
        memory: {
          total: 32,
          used: 16,
          free: 16,
          usage: 50,
          swapTotal: 8,
          swapUsed: 2,
          swapFree: 6,
        },
        gpu: [],
        network: {
          interfaces: [],
          total: { rxSec: 0, txSec: 0 },
        },
        disk: {
          disks: [],
          total: { total: 0, used: 0, free: 0 },
        },
        os: {
          platform: 'linux',
          distro: 'Ubuntu 24.04',
          release: '24.04',
          hostname: 'workstation',
          arch: 'x64',
        },
        rocmDetected: false,
        rocmRuntimeVersion: '',
      };

      expect(metrics.timestamp).toBeGreaterThan(0);
      expect(metrics.cpu.physicalCores).toBe(16);
      expect(metrics.os.platform).toBe('linux');
    });
  });
});
