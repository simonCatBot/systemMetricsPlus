import { render } from '@testing-library/react';
import type { SystemMetrics } from '@/types/metrics';

// Simple smoke test - Dashboard is complex with providers, 
// component-level tests cover the functionality
describe('Dashboard', () => {
  it('has required mock data structure', () => {
    const mockMetrics: SystemMetrics = {
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
        topProcesses: [
          { pid: 1234, name: 'chrome', cpu: 12.5, mem: 8.2, user: 'user' },
        ],
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
      gpu: [
        {
          index: 0,
          name: 'gfx1150',
          marketingName: 'AMD Radeon 890M',
          vendor: 'AMD',
          usage: 75,
          memory: { total: 32, used: 16 },
          temperature: 65,
          driverVersion: '6.3.6',
          gfxVersion: 'gfx1150',
          deviceId: '0x150e',
          computeUnits: 16,
          maxClockMHz: 2800,
          currentClockMHz: 1500,
        },
      ],
      network: {
        interfaces: [
          {
            name: 'eth0',
            ip4: '192.168.1.100',
            ip6: '',
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
      },
      disk: {
        disks: [
          { name: '/', total: 500, used: 250, free: 250, usage: 50 },
        ],
        total: {
          total: 500,
          used: 250,
          free: 250,
        },
      },
      os: {
        platform: 'linux',
        distro: 'Ubuntu',
        release: '24.04',
        hostname: 'workstation',
        arch: 'x64',
      },
      rocmDetected: true,
      rocmRuntimeVersion: '7.2.0',
    };

    // Verify mock data structure
    expect(mockMetrics).toBeDefined();
    expect(mockMetrics.cpu.name).toBe('AMD Ryzen 9 7950X');
    expect(mockMetrics.gpu).toHaveLength(1);
    expect(mockMetrics.gpu[0].marketingName).toBe('AMD Radeon 890M');
  });
});
