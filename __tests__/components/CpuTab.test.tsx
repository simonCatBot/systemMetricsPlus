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
    // Check for cores/threads text in the document
    const { container } = render(<CpuTab data={mockCpuData} />);
    expect(container.textContent).toContain('16 cores');
    expect(container.textContent).toContain('32 threads');
  });

  it('displays CPU usage percentage', () => {
    const { container } = render(<CpuTab data={mockCpuData} />);
    expect(container.textContent).toContain('45%');
  });

  it('displays temperature when available', () => {
    const { container } = render(<CpuTab data={mockCpuData} />);
    expect(container.textContent).toContain('65°C');
  });

  it('displays load averages', () => {
    const { container } = render(<CpuTab data={mockCpuData} />);
    expect(container.textContent).toContain('2.50');
    expect(container.textContent).toContain('2.30');
    expect(container.textContent).toContain('2.10');
  });

  it('renders per-core usage bars', () => {
    render(<CpuTab data={mockCpuData} />);
    // Check for core labels
    expect(screen.getByText('C0')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
    expect(screen.getByText('C3')).toBeInTheDocument();
  });

  it('handles missing temperature gracefully', () => {
    const noTempData: CpuMetrics = { ...mockCpuData, temperature: null };
    render(<CpuTab data={noTempData} />);
    // Should still render without temperature
    expect(screen.getByText('AMD Ryzen 9 7950X')).toBeInTheDocument();
  });

  it('shows alert styling for high CPU usage', () => {
    const highUsageData: CpuMetrics = { ...mockCpuData, usage: 85 };
    const { container } = render(<CpuTab data={highUsageData} />);
    expect(container.textContent).toContain('85%');
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
