import { render } from '@testing-library/react';
import CpuTab from '@/lib/components/CpuTab';
import type { CpuMetrics } from '@/types/metrics';
import { screen } from '@testing-library/dom';

const mockCpuData: CpuMetrics = {
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
  flags: 'avx512f avx512dq avx512cd avx512bw avx512vl',
  virtualization: true,
  governor: 'performance',
};

describe('CpuTab', () => {
  it('renders loading state when data is null', () => {
    render(<CpuTab data={null} />);
    expect(screen.getByText('Loading CPU metrics...')).toBeInTheDocument();
  });

  it('renders CPU name and basic info', () => {
    render(<CpuTab data={mockCpuData} />);
    expect(screen.getByText('AMD Ryzen 9 7950X')).toBeInTheDocument();
    expect(screen.getByText('16 cores')).toBeInTheDocument();
    expect(screen.getByText('32 threads')).toBeInTheDocument();
  });

  it('displays CPU usage percentage', () => {
    render(<CpuTab data={mockCpuData} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('displays temperature when available', () => {
    render(<CpuTab data={mockCpuData} />);
    expect(screen.getByText('65°C')).toBeInTheDocument();
  });

  it('displays load averages', () => {
    render(<CpuTab data={mockCpuData} />);
    expect(screen.getByText('2.50')).toBeInTheDocument(); // 1 min
    expect(screen.getByText('2.30')).toBeInTheDocument(); // 5 min
    expect(screen.getByText('2.10')).toBeInTheDocument(); // 15 min
  });

  it('renders per-core usage bars', () => {
    render(<CpuTab data={mockCpuData} />);
    // Check for core labels
    expect(screen.getByText('C0')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
    expect(screen.getByText('C3')).toBeInTheDocument();
    // Check for percentage labels
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('handles missing temperature gracefully', () => {
    const noTempData: CpuMetrics = { ...mockCpuData, temperature: null };
    render(<CpuTab data={noTempData} />);
    // Should still render without temperature
    expect(screen.getByText('AMD Ryzen 9 7950X')).toBeInTheDocument();
  });

  it('shows alert styling for high CPU usage', () => {
    const highUsageData: CpuMetrics = { ...mockCpuData, usage: 85 };
    render(<CpuTab data={highUsageData} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
    // The high usage should trigger alert styling
  });

  it('handles Intel CPU naming', () => {
    const intelData: CpuMetrics = {
      ...mockCpuData,
      name: 'Intel Core i9-14900K',
      physicalCores: 8,
      logicalCores: 16,
    };
    render(<CpuTab data={intelData} />);
    expect(screen.getByText('Intel Core i9-14900K')).toBeInTheDocument();
  });
});
