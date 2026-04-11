import { render } from '@testing-library/react';
import NetworkTab from '@/lib/components/NetworkTab';
import type { NetworkMetrics } from '@/types/metrics';
import { screen } from '@testing-library/dom';

const mockNetwork: NetworkMetrics = {
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

const mockMultipleInterfaces: NetworkMetrics = {
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
    {
      name: 'wlan0',
      ip4: '192.168.1.101',
      ip6: '',
      speed: 866,
      rxSec: 512,
      txSec: 256,
      rxBytes: 268435456,
      txBytes: 134217728,
    },
  ],
  total: {
    rxSec: 1536,
    txSec: 768,
  },
};

describe('NetworkTab', () => {
  it('renders "No network interfaces detected" when empty', () => {
    render(<NetworkTab data={null} />);
    expect(screen.getByText('No network interfaces detected')).toBeInTheDocument();
  });

  it('renders primary interface name', () => {
    render(<NetworkTab data={mockNetwork} />);
    expect(screen.getByText('eth0')).toBeInTheDocument();
  });

  it('displays download and upload speeds', () => {
    render(<NetworkTab data={mockNetwork} />);
    // Check for download/upload labels
    expect(screen.getAllByText('Download').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Upload').length).toBeGreaterThan(0);
  });

  it('displays formatted speeds', () => {
    render(<NetworkTab data={mockNetwork} />);
    // 1024 KB/s = 1.0 MB/s
    expect(screen.getByText('1.0 MB/s')).toBeInTheDocument();
  });

  it('displays total traffic', () => {
    render(<NetworkTab data={mockNetwork} />);
    // 1073741824 bytes = 1.00 GB
    expect(screen.getByText('Total: 1.00 GB')).toBeInTheDocument();
    expect(screen.getByText('Total: 512.00 MB')).toBeInTheDocument();
  });

  it('renders aggregate traffic section', () => {
    render(<NetworkTab data={mockNetwork} />);
    expect(screen.getByText('Aggregate Traffic')).toBeInTheDocument();
  });

  it('shows interface speed when available', () => {
    render(<NetworkTab data={mockNetwork} />);
    expect(screen.getByText('1000 Mbps')).toBeInTheDocument();
  });

  it('renders all interfaces section when multiple interfaces', () => {
    render(<NetworkTab data={mockMultipleInterfaces} />);
    expect(screen.getByText('All Interfaces')).toBeInTheDocument();
    expect(screen.getByText('wlan0')).toBeInTheDocument();
  });

  it('displays correct aggregate totals', () => {
    render(<NetworkTab data={mockMultipleInterfaces} />);
    // Aggregate: 1536 KB/s = 1.5 MB/s
    expect(screen.getByText('1.5 MB/s')).toBeInTheDocument();
    // Aggregate upload: 768 KB/s = 0.75 MB/s
    expect(screen.getByText('0.8 MB/s')).toBeInTheDocument();
  });

  it('handles zero speeds', () => {
    const zeroNetwork: NetworkMetrics = {
      interfaces: [
        {
          name: 'eth0',
          ip4: '192.168.1.100',
          ip6: '',
          speed: 1000,
          rxSec: 0,
          txSec: 0,
          rxBytes: 0,
          txBytes: 0,
        },
      ],
      total: {
        rxSec: 0,
        txSec: 0,
      },
    };
    render(<NetworkTab data={zeroNetwork} />);
    expect(screen.getByText('eth0')).toBeInTheDocument();
  });

  it('handles large byte counts', () => {
    const largeNetwork: NetworkMetrics = {
      interfaces: [
        {
          name: 'eth0',
          ip4: '192.168.1.100',
          ip6: '',
          speed: 10000,
          rxSec: 1024,
          txSec: 512,
          rxBytes: 1099511627776, // 1 TB
          txBytes: 549755813888, // 512 GB
        },
      ],
      total: {
        rxSec: 1024,
        txSec: 512,
      },
    };
    render(<NetworkTab data={largeNetwork} />);
    expect(screen.getByText('Total: 1.00 TB')).toBeInTheDocument();
    expect(screen.getByText('10000 Mbps')).toBeInTheDocument();
  });
});
