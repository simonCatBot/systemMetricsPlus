<p align="center">
  <img src="public/logo.svg" alt="System Metrics Plus" width="128" height="128"/>
</p>

<h1 align="center">System Metrics Plus</h1>

<p align="center">
  Real-time system monitoring for Linux with ROCm GPU support
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ROCm-7.2-blue" alt="ROCm 7.2"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
  <img src="https://img.shields.io/badge/Platform-Linux-blue" alt="Platform"/>
</p>

---

## Features

- **CPU Monitoring** — Usage, temperature, clock speed, per-core load
- **GPU Monitoring** — AMD GPU metrics via ROCm (temperature, VRAM, power, clocks)
- **Memory** — System RAM and swap usage
- **Network** — Interface statistics and throughput
- **Disk** — Storage usage across all mounted filesystems

### GPU Support

Powered by AMD ROCm:
- Temperature (Edge, Hotspot, Memory)
- VRAM usage
- GPU utilization
- Power consumption
- Clock frequencies
- ECC error counts

## Getting Started

### Prerequisites

- Node.js 18+
- Linux with ROCm (for AMD GPU metrics)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Architecture

- **Frontend**: Next.js 16 with React, Tailwind CSS
- **Backend**: Next.js API routes with systeminformation + ROCm integration
- **GPU Detection**: Automatic ROCm/ROCm-smi/amd-smi detection for AMD GPUs

## Tech Stack

- [Next.js](https://nextjs.org)
- [systeminformation](https://github.com/sebhildebrandt/systeminformation)
- [AMD ROCm](https://rocm.docs.amd.com/)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

## License

MIT
