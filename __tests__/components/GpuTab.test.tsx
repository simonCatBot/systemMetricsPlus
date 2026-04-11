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
  temperature: 45,
  driverVersion: '6.3.6',
  gfxVersion: 'gfx1150',
  deviceId: '0x150e',
  computeUnits: 16,
  maxClockMHz: 2800,
  currentClockMHz: 1500,
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
    const { container } = render(<GpuTab gpus={[mockGpu]} />);
    expect(container.textContent).toContain('75%');
  });

  it('displays VRAM usage', () => {
    const { container } = render(<GpuTab gpus={[mockGpu]} />);
    expect(container.textContent).toContain('VRAM');
  });

  it('displays temperature when available', () => {
    const { container } = render(<GpuTab gpus={[mockGpu]} />);
    expect(container.textContent).toContain('45°C');
  });

  it('displays power consumption when available', () => {
    const { container } = render(<GpuTab gpus={[mockGpu]} />);
    expect(container.textContent).toContain('65.5W');
  });

  it('renders additional GPUs section when multiple GPUs', () => {
    render(<GpuTab gpus={[mockGpu, mockSecondaryGpu]} />);
    expect(screen.getByText('Additional GPUs')).toBeInTheDocument();
    expect(screen.getByText('AMD Radeon RX 7900 XTX')).toBeInTheDocument();
  });

  it('displays GPU specs', () => {
    const { container } = render(<GpuTab gpus={[mockGpu]} />);
    expect(container.textContent).toContain('16 CUs');
    expect(container.textContent).toContain('gfx1150');
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
});
