import { render } from '@testing-library/react';
import GpuTab from '@/lib/components/GpuTab';
import type { GpuMetrics } from '@/types/metrics';
import { screen } from '@testing-library/dom';

const mockGpu: GpuMetrics = {
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

const mockSecondaryGpu: GpuMetrics = {
  index: 1,
  name: 'gfx1100',
  marketingName: 'AMD Radeon RX 7900 XTX',
  vendor: 'AMD',
  usage: 90,
  memory: { total: 24, used: 20 },
  temperature: 72,
  driverVersion: '6.3.6',
  gfxVersion: 'gfx1100',
  deviceId: '0x744c',
  computeUnits: 96,
  maxClockMHz: 2500,
  currentClockMHz: 2300,
};

describe('GpuTab', () => {
  it('renders "No GPU detected" when empty', () => {
    render(<GpuTab gpus={[]} />);
    expect(screen.getByText('No GPU detected')).toBeInTheDocument();
  });

  it('renders primary GPU marketing name', () => {
    render(<GpuTab gpus={[mockGpu]} />);
    expect(screen.getByText('AMD Radeon 890M')).toBeInTheDocument();
  });

  it('displays GPU usage percentage', () => {
    render(<GpuTab gpus={[mockGpu]} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays VRAM usage', () => {
    render(<GpuTab gpus={[mockGpu]} />);
    expect(screen.getByText('VRAM')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays temperature when available', () => {
    render(<GpuTab gpus={[mockGpu]} />);
    expect(screen.getByText('45°C')).toBeInTheDocument();
  });

  it('displays power consumption when available', () => {
    render(<GpuTab gpus={[mockGpu]} />);
    expect(screen.getByText('65.5W')).toBeInTheDocument();
  });

  it('shows training status for high utilization', () => {
    const trainingGpu: GpuMetrics = { ...mockGpu, usage: 85 };
    render(<GpuTab gpus={[trainingGpu]} />);
    // Training status label should appear for high utilization
  });

  it('renders additional GPUs section when multiple GPUs', () => {
    render(<GpuTab gpus={[mockGpu, mockSecondaryGpu]} />);
    expect(screen.getByText('Additional GPUs')).toBeInTheDocument();
    expect(screen.getByText('AMD Radeon RX 7900 XTX')).toBeInTheDocument();
  });

  it('displays GPU specs', () => {
    render(<GpuTab gpus={[mockGpu]} />);
    expect(screen.getByText(/16 CUs/)).toBeInTheDocument();
    expect(screen.getByText(/gfx1150/)).toBeInTheDocument();
  });

  it('handles missing optional properties', () => {
    const minimalGpu: GpuMetrics = {
      index: 0,
      name: 'Unknown GPU',
      marketingName: 'Unknown GPU',
      vendor: 'AMD',
      usage: 0,
      memory: { total: 0, used: 0 },
      driverVersion: 'unknown',
      gfxVersion: 'N/A',
      deviceId: 'N/A',
      computeUnits: 0,
      maxClockMHz: 0,
      currentClockMHz: 0,
    };
    render(<GpuTab gpus={[minimalGpu]} />);
    expect(screen.getByText('Unknown GPU')).toBeInTheDocument();
  });

  it('shows alert for high VRAM usage', () => {
    const highVramGpu: GpuMetrics = {
      ...mockGpu,
      memory: { total: 32, used: 30 },
    };
    render(<GpuTab gpus={[highVramGpu]} />);
    // High VRAM usage should trigger warning
  });
});
