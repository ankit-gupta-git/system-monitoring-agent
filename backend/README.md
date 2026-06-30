# System Monitoring Agent Backend

A production-ready Node.js + Express backend designed to dynamically collect, cache, and serve system health and resource utilization metrics.

---

## Features

- **Dynamic Metric Collection**: Automatically polls system resources (CPU usage per core, memory, disk size and load, and network stats) every 5 seconds using `systeminformation`.
- **Single Metric File Storage**: Saves only the latest collected dynamic metrics object to the local JSON file store (`src/data/metrics.json`), minimizing disk footprint while persisting latest status. (A sliding-window history is cached in memory).
- **REST APIs**: Provides clean JSON interfaces for live status, static hardware specs, current metrics, and historical logs.
- **Production Grade Architecture**:
  - Centralized global error handling middleware.
  - Consistent logger formatting with ISO timestamps and level categorization.
  - Graceful shutdown listeners capturing system interrupt signals (SIGINT, SIGTERM, exceptions, and rejections) to clean up timers and connections.
  - Custom lightweight HTTP request logger formatting response times.
  - Standard CORS integration.

---

## Folder Structure

```text
├── src/
│   ├── app.js                   # Express application and middlewares
│   ├── index.js                 # Server bootstrapping and graceful teardown handler
│   ├── config/
│   │   └── index.js             # Configuration validation and environment loader
│   ├── data/
│   │   ├── metrics-store.js     # Persistence layer logic
│   │   └── metrics.json         # Local storage containing only the single latest collected metric
│   ├── routes/
│   │   ├── health.js            # API server health probe
│   │   ├── metrics.js           # Metric endpoints (current, history, clear)
│   │   └── system.js            # Static specs and real-time endpoints
│   ├── services/
│   │   ├── metrics-collector.js # Background collection interval manager
│   │   └── system-info.js       # Low-level metrics retrieval layer
│   └── utils/
│       ├── errorHandler.js      # Centralized error formatter
│       └── logger.js            # Console structured logger
├── .env                         # Local environment configuration file
├── .env.example                 # Default environment template
├── package.json                 # Node package configuration
└── README.md                    # Setup and reference manual
```

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. Install package dependencies:
   ```bash
   npm install
   ```

2. Create a local environment file by copying the template:
   ```bash
   cp .env.example .env
   ```

3. Customize variables inside `.env` to suit your requirements:
   ```ini
   PORT=3000
   NODE_ENV=development
   METRICS_INTERVAL_MS=5000
   METRICS_HISTORY_LIMIT=720
   ```

---

## Running the Application

### Development Mode

Runs the server and restarts automatically when code changes occur:
```bash
npm run dev
```

### Production Mode

Starts the server with node execution:
```bash
npm run start
```

---

## API Documentation

All API endpoints return JSON.

### 1. Health Probe
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Returns server liveness status, API process uptime, and the last collection timestamp.
- **Response**:
  ```json
  {
    "status": "UP",
    "lastCollectionTimestamp": "2026-06-30T20:19:03.459Z",
    "uptime": 16
  }
  ```

---

### 2. Direct Metrics Retrieval
- **URL**: `/metrics`
- **Method**: `GET`
- **Description**: Reads and returns the latest system metrics directly from the persistent JSON store file (`metrics.json`).
- **Response**: Returns a JSON object containing the latest dynamic metrics (similar to the `/api/metrics/current` details below).

---

### 3. Static System Information
- **URL**: `/api/system/static`
- **Method**: `GET`
- **Description**: Returns hardware descriptions, host properties, total memory capacity, network interfaces, and disk model info.
- **Response**:
  ```json
  {
    "cpu": {
      "manufacturer": "Intel",
      "brand": "Gen Intel Core i7-11800H",
      "speed": 2.3,
      "cores": 16,
      "physicalCores": 8
    },
    "os": {
      "platform": "Windows",
      "distro": "Microsoft Windows 11 Home",
      "release": "10.0.26220",
      "arch": "x64",
      "hostname": "MY-LAPTOP"
    },
    "memory": {
      "total": 16905814016
    },
    "disks": [
      {
        "device": "\\\\.\\PHYSICALDRIVE0",
        "type": "SSD",
        "name": "NVMe WD PC SN560",
        "size": 1024203640320
      }
    ],
    "network": [
      {
        "iface": "Wi-Fi",
        "ip4": "10.168.209.46",
        "mac": "f8:54:f6:b3:0c:2d",
        "type": "wireless",
        "speed": 72.2
      }
    ]
  }
  ```

---

### 4. Fetch Current Dynamic Metrics
- **URL**: `/api/metrics/current`
- **Method**: `GET`
- **Description**: Returns the latest collected system load, available RAM, disk consumption percentages, and interface speeds from the cache.
- **Response**:
  ```json
  {
    "timestamp": "2026-06-30T20:14:48.362Z",
    "uptime": 35736,
    "cpu": {
      "currentLoad": 10.67,
      "currentLoadUser": 5.97,
      "currentLoadSystem": 4.45,
      "currentLoadIdle": 89.33,
      "cores": [
        { "core": 0, "load": 13.03 }
      ]
    },
    "memory": {
      "total": 16905814016,
      "free": 2013868032,
      "used": 14891945984,
      "active": 14891945984,
      "available": 2013868032,
      "usagePercentage": 88.09
    },
    "filesystems": [
      {
        "fs": "C:",
        "type": "NTFS",
        "size": 367733837824,
        "used": 340674510848,
        "available": 27059326976,
        "usePercentage": 92.64,
        "mount": "C:"
      }
    ],
    "network": [
      {
        "iface": "Wi-Fi",
        "operstate": "up",
        "rxBytes": 12642270,
        "txBytes": 18936949,
        "rxSec": 3741.41,
        "txSec": 74002.39
      }
    ]
  }
  ```

---

### 5. Fetch Metrics History
- **URL**: `/api/metrics/history`
- **Method**: `GET`
- **Description**: Returns the array list of collected historical metrics.
- **Response**: Returns a JSON array containing structures identical to the `GET /api/metrics/current` response.

---

### 6. Clear Metrics History
- **URL**: `/api/metrics/history`
- **Method**: `DELETE`
- **Description**: Empties memory and storage file cache, restarting a new monitoring timeline.
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Metrics history cleared successfully."
  }
  ```
