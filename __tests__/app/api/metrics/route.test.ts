import { GET } from '@/app/api/metrics/route';
import { NextRequest } from 'next/server';

// Mock systeminformation
jest.mock('systeminformation', () => ({
  cpu: jest.fn().mockResolvedValue({
    brand: 'AMD Ryzen 9 7950X',
    manufacturer: 'AMD',
    speed: 4.5,
    speedMin: 3.0,
    speedMax: 5.7,
    cores: 16,
    physicalCores: 8,
    processors: 1,
    socket: 'AM5',
    flags: 'fpu vme de pse avx avx2 avx512f',
    virtualization: true,
    governor: 'performance',
  }),
  currentLoad: jest.fn().mockResolvedValue({
    currentLoad: 45.5,
    currentLoadUser: 30.2,
    currentLoadSystem: 15.3,
    avgLoad: [2.5, 2.3, 2.1],
    cpus: [
      { load: 45 },
      { load: 50 },
      { load: 40 },
      { load: 42 },
    ],
  }),
  cpuCurrentSpeed: jest.fn().mockResolvedValue({
    avg: 4.5,
    min: 3.0,
    max: 5.7,
    cores: [4.5, 4.6, 4.4, 4.5],
  }),
  cpuTemperature: jest.fn().mockResolvedValue({
    main: 65,
    cores: [63, 67, 64, 66],
    max: 68,
  }),
  cpuCache: jest.fn().mockResolvedValue({
    l1d: 512,
    l1i: 512,
    l2: 8192,
    l3: 65536,
  }),
  mem: jest.fn().mockResolvedValue({
    total: 34359738368,
    free: 17179869184,
    used: 17179869184,
    active: 17179869184,
    available: 17179869184,
    swaptotal: 8589934592,
    swapused: 2147483648,
    swapfree: 6442450944,
  }),
  networkStats: jest.fn().mockResolvedValue([
    {
      iface: 'eth0',
      rx_bytes: 1073741824,
      tx_bytes: 536870912,
      rx_sec: 1024,
      tx_sec: 512,
      speed: 1000,
    },
  ]),
  fsSize: jest.fn().mockResolvedValue([
    {
      fs: '/dev/sda1',
      type: 'ext4',
      size: 536870912000,
      used: 268435456000,
      available: 268435456000,
      use: 50,
      mount: '/',
    },
  ]),
  osInfo: jest.fn().mockResolvedValue({
    platform: 'linux',
    distro: 'Ubuntu',
    release: '24.04',
    codename: 'noble',
    kernel: '6.8.0',
    arch: 'x64',
    hostname: 'workstation',
    fqdn: 'workstation.local',
    codepage: 'UTF-8',
    logofile: 'ubuntu',
    serial: '',
    build: '',
    servicepack: '',
    uefi: true,
  }),
  processes: jest.fn().mockResolvedValue({
    all: 450,
    running: 5,
    blocked: 0,
    sleeping: 440,
    unknown: 5,
    list: [
      { pid: 1, name: 'systemd', cpu: 0.1, mem: 0.2, priority: 20, memVsz: 102400, memRss: 51200, nice: 0, started: '10:00:00', state: 'S', tty: '?', user: 'root', command: '/sbin/init' },
      { pid: 1234, name: 'chrome', cpu: 12.5, mem: 8.2, priority: 20, memVsz: 4096000, memRss: 2048000, nice: 0, started: '11:00:00', state: 'R', tty: '?', user: 'user', command: '/usr/bin/chrome' },
      { pid: 5678, name: 'node', cpu: 8.3, mem: 4.1, priority: 20, memVsz: 2048000, memRss: 1024000, nice: 0, started: '12:00:00', state: 'R', tty: '?', user: 'user', command: '/usr/bin/node' },
    ],
  }),
  graphics: jest.fn().mockResolvedValue({
    controllers: [
      {
        vendor: 'AMD',
        model: 'AMD Radeon 890M',
        bus: 'PCI',
        vram: 32768,
        vramDynamic: false,
        main: true,
        subDeviceId: '0x150e',
        driver: 'amdgpu',
        subVendor: 'ASUS',
        pciBus: '0000:65:00.0',
        fanSpeed: 45,
        memoryTotal: 34359738368,
        memoryUsed: 17179869184,
        memoryFree: 17179869184,
        utilizationGpu: 75,
        utilizationMemory: 50,
        temperatureGpu: 65,
        powerDraw: 65.5,
        clockCore: 2800,
        clockMemory: 1800,
      },
    ],
    displays: [],
  }),
}));

// Mock ROCm detection
jest.mock('@/lib/system/rocm', () => ({
  detectROCm: jest.fn().mockResolvedValue({
    detected: true,
    runtimeVersion: '7.2.0',
    gpus: [],
  }),
}));

describe('Metrics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns system metrics successfully', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('cpu');
    expect(data).toHaveProperty('memory');
    expect(data).toHaveProperty('gpu');
    expect(data).toHaveProperty('network');
    expect(data).toHaveProperty('disk');
    expect(data).toHaveProperty('os');
    expect(data).toHaveProperty('rocmDetected');
  });

  it('includes CPU metrics', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.cpu).toMatchObject({
      name: 'AMD Ryzen 9 7950X',
      physicalCores: 8,
      logicalCores: 16,
      usage: 46,
      usageUser: 30,
      usageSystem: 15,
    });
  });

  it('includes memory metrics', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.memory).toMatchObject({
      total: expect.any(Number),
      used: expect.any(Number),
      free: expect.any(Number),
      usage: expect.any(Number),
    });

    // Check calculations (32GB total, 16GB used)
    expect(data.memory.total).toBeCloseTo(32, 0);
    expect(data.memory.usage).toBe(50);
  });

  it('includes network metrics', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.network.interfaces).toHaveLength(1);
    expect(data.network.interfaces[0].name).toBe('eth0');
    expect(data.network.total).toHaveProperty('rxSec');
    expect(data.network.total).toHaveProperty('txSec');
  });

  it('includes disk metrics', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.disk.disks).toHaveLength(1);
    expect(data.disk.disks[0].name).toBe('/dev/sda1');
    expect(data.disk.total).toHaveProperty('total');
    expect(data.disk.total).toHaveProperty('used');
    expect(data.disk.total).toHaveProperty('free');
  });

  it('includes OS information', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.os).toMatchObject({
      platform: 'linux',
      distro: 'Ubuntu',
      release: '24.04',
      hostname: 'workstation',
      arch: 'x64',
    });
  });

  it('includes top processes', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.cpu.topProcesses).toBeDefined();
    expect(data.cpu.topProcesses.length).toBeGreaterThan(0);
    expect(data.cpu.topProcesses[0]).toHaveProperty('pid');
    expect(data.cpu.topProcesses[0]).toHaveProperty('name');
    expect(data.cpu.topProcesses[0]).toHaveProperty('cpu');
    expect(data.cpu.topProcesses[0]).toHaveProperty('mem');
  });

  it('indicates ROCm detection status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.rocmDetected).toBe(true);
    expect(data.rocmRuntimeVersion).toBe('7.2.0');
  });
});
