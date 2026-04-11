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
    const { container } = render(<MemoryTab memory={mockMemory} disk={null} />);
    expect(container.textContent).toContain('16.0 GB');
    expect(container.textContent).toContain('2.0 GB');
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
    // Check for disk usage percentages in document
    const { container } = render(<MemoryTab memory={null} disk={mockDisk} />);
    expect(container.textContent).toContain('50%');
    expect(container.textContent).toContain('20%');
  });

  it('calculates total disk usage correctly', () => {
    const { container } = render(<MemoryTab memory={null} disk={mockDisk} />);
    const totalUsage = Math.round((mockDisk.total.used / mockDisk.total.total) * 100);
    expect(container.textContent).toContain(`${totalUsage}%`);
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
    const { container } = render(<MemoryTab memory={highMemory} disk={null} />);
    expect(container.textContent).toContain('87%');
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
    const { container } = render(<MemoryTab memory={null} disk={highDisk} />);
    expect(container.textContent).toContain('90%');
  });

  it('handles swap usage', () => {
    const { container } = render(<MemoryTab memory={mockMemory} disk={null} />);
    // Swap bar should be rendered with percentage
    const swapUsage = Math.round((mockMemory.swapUsed / mockMemory.swapTotal) * 100);
    expect(container.textContent).toContain(`${swapUsage}%`);
  });
});
