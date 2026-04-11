import { render } from '@testing-library/react';
import MemoryTab from '@/lib/components/MemoryTab';
import type { MemoryMetrics, DiskMetrics } from '@/types/metrics';
import { screen } from '@testing-library/dom';

const mockMemory: MemoryMetrics = {
  total: 32,
  used: 16,
  free: 16,
  usage: 50,
  swapTotal: 8,
  swapUsed: 2,
  swapFree: 6,
};

const mockDisk: DiskMetrics = {
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

describe('MemoryTab', () => {
  it('renders loading state when no data', () => {
    render(<MemoryTab memory={null} disk={null} />);
    expect(screen.getByText('Loading memory metrics...')).toBeInTheDocument();
  });

  it('renders memory information', () => {
    render(<MemoryTab memory={mockMemory} disk={null} />);
    expect(screen.getByText('System Memory')).toBeInTheDocument();
    expect(screen.getByText('32.0 GB Total')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays memory stats correctly', () => {
    render(<MemoryTab memory={mockMemory} disk={null} />);
    expect(screen.getByText('16.0 GB')).toBeInTheDocument(); // Used
    expect(screen.getByText('16.0 GB')).toBeInTheDocument(); // Free
    expect(screen.getByText('2.0 GB')).toBeInTheDocument(); // Swap used
  });

  it('renders disk information when available', () => {
    render(<MemoryTab memory={null} disk={mockDisk} />);
    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByText('2 disks • 1500.0 GB')).toBeInTheDocument();
  });

  it('displays individual disk usage', () => {
    render(<MemoryTab memory={null} disk={mockDisk} />);
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('/home')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('calculates total disk usage correctly', () => {
    render(<MemoryTab memory={null} disk={mockDisk} />);
    const totalUsage = Math.round((mockDisk.total.used / mockDisk.total.total) * 100);
    expect(screen.getByText(`${totalUsage}%`)).toBeInTheDocument();
  });

  it('renders both memory and disk when both available', () => {
    render(<MemoryTab memory={mockMemory} disk={mockDisk} />);
    expect(screen.getByText('System Memory')).toBeInTheDocument();
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });

  it('handles high memory usage', () => {
    const highMemory: MemoryMetrics = {
      ...mockMemory,
      used: 28,
      free: 4,
      usage: 87,
    };
    render(<MemoryTab memory={highMemory} disk={null} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('handles high disk usage', () => {
    const highDisk: DiskMetrics = {
      ...mockDisk,
      disks: [
        { name: '/', total: 500, used: 450, free: 50, usage: 90 },
      ],
      total: {
        total: 500,
        used: 450,
        free: 50,
      },
    };
    render(<MemoryTab memory={null} disk={highDisk} />);
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('handles swap usage', () => {
    render(<MemoryTab memory={mockMemory} disk={null} />);
    // Swap bar should be rendered with percentage
    const swapUsage = Math.round((mockMemory.swapUsed / mockMemory.swapTotal) * 100);
    expect(screen.getByText(`${swapUsage}%`)).toBeInTheDocument();
  });
});
