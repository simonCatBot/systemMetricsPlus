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

  it('displays download and upload labels', () => {
    render(<NetworkTab data={mockNetwork} />);
    const { container } = render(<NetworkTab data={mockNetwork} />);
    expect(container.textContent).toContain('Download');
    expect(container.textContent).toContain('Upload');
  });

  it('displays formatted speeds', () => {
    const { container } = render(<NetworkTab data={mockNetwork} />);
    // 1024 KB/s = 1.0 MB/s
    expect(container.textContent).toContain('1.0 MB/s');
  });

  it('displays total traffic', () => {
    const { container } = render(<NetworkTab data={mockNetwork} />);
    expect(container.textContent).toContain('Total:');
    expect(container.textContent).toContain('1.00 GB');
    expect(container.textContent).toContain('512.0 MB');
  });

  it('renders aggregate traffic section', () => {
    render(<NetworkTab data={mockNetwork} />);
    expect(screen.getByText('Aggregate Traffic')).toBeInTheDocument();
  });

  it('shows interface speed in all interfaces section', () => {
    const multiInterfaceNetwork: NetworkMetrics = {
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
    const { container } = render(<NetworkTab data={multiInterfaceNetwork} />);
    // Speed is shown in All Interfaces section
    expect(container.textContent).toContain('1000 Mbps');
    expect(container.textContent).toContain('866 Mbps');
  });

  it('renders all interfaces section when multiple interfaces', () => {
    render(<NetworkTab data={mockMultipleInterfaces} />);
    expect(screen.getByText('All Interfaces')).toBeInTheDocument();
    expect(screen.getByText('wlan0')).toBeInTheDocument();
  });

  it('displays correct aggregate totals', () => {
    const { container } = render(<NetworkTab data={mockMultipleInterfaces} />);
    expect(container.textContent).toContain('1.5 MB/s');
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
    const { container } = render(<NetworkTab data={largeNetwork} />);
    expect(container.textContent).toContain('1.00 TB');
  });
});
