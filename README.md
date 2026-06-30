# System Monitoring Agent with AI Diagnosis

A production-ready, lightweight system monitoring suite featuring a Node.js + Express backend agent and a React + Vite + Tailwind CSS dashboard. The application periodically monitors host system metrics (CPU load, memory capacity, filesystem partitions, and active network speeds) every 5 seconds and leverages the Google GenAI SDK to fetch real-time system diagnostics and optimization advisories powered by **Gemini 3.5 Flash**.

---

## Architecture Overview

The system is split into a modular backend agent and a sleek frontend dashboard:

```mermaid
graph TD
    subgraph Host System
        HW[Hardware Resource Specs]
    end
    subgraph Backend Agent (Port 3000)
        BC[Background Collector] -->|Queries every 5s| SI[systeminformation Library]
        SI -->|Returns specs| BC
        BC -->|Pushes updates| MS[Metrics Memory Cache]
        MS -->|Persists latest snapshot| MJ[metrics.json Storage]
        
        R_Health[GET /health] -->|Returns status & uptime| API[Express REST API]
        R_Metrics[GET /metrics] -->|Reads metrics.json| API
        R_Summary[GET /summary] -->|Passes stats to SDK| Gemini[Gemini 3.5 Flash]
        Gemini -->|Returns JSON Summary| R_Summary
    end
    subgraph Frontend Dashboard (Port 5173)
        React[React Client] -->|Polls every 5s| R_Metrics
        React -->|Queries on load/manual| R_Summary
        React -->|Queries once| R_Health
    end
    
    HW -->|Hardware Calls| SI
```

### Key Components

1. **Background Collector Service**: A daemon service running inside Node.js that polls the system hardware state every 5 seconds and caches utilization logs in memory.
2. **Persistence Store Layer**: To optimize disk space, only the single latest metrics snapshot is written to `src/data/metrics.json` on each poll. The sliding window historical data queue is retained inside memory for high-performance retrieval.
3. **AI Diagnosis (`/summary` Endpoint)**: On-demand diagnostic endpoint compiling host resource stats into a structured prompt, requesting a JSON formatted review and optimization recommendations from **Gemini 3.5 Flash**.
4. **React Client Dashboard**: A responsive single-page dashboard featuring progress meters, utilization color thresholds (normal, alert, critical), and interactive widgets that present hardware stats alongside AI advisory cards.

---

## Technologies Used

### Backend
- **Node.js**: Runtime environment (configured for modern ES Modules).
- **Express.js**: REST API routing framework.
- **systeminformation**: Comprehensive low-level system and hardware queries.
- **@google/genai**: Official Google Generative AI SDK to interface with Gemini.
- **dotenv**: Environment configuration manager.
- **CORS**: Handles Cross-Origin Requests.

### Frontend
- **React (v19)**: Component-driven user interface.
- **Vite (v8)**: Fast building tools and HMR (Hot Module Replacement) bundler.
- **Tailwind CSS (v4)**: Modern utility-first stylesheet layouts.
- **lucide-react**: Lightweight icon assets.

---

## Directory Structure

```text
System Monitoring Agent/
├── backend/                  # Node.js + Express Backend
│   ├── src/
│   │   ├── app.js            # Express application configurations & request logging
│   │   ├── index.js          # Bootstrapper & graceful shutdown orchestrator
│   │   ├── config/           # Configuration loader
│   │   ├── data/             # Persistent JSON cache file & database store
│   │   ├── routes/           # REST endpoints (/health, /metrics, /summary, /api/system)
│   │   ├── services/         # Metric polling daemon & systeminformation adapters
│   │   └── utils/            # Custom console formatter & centralized error handlers
│   ├── .env.example          # Environment template
│   ├── package.json          # Dependency details and start scripts
│   └── README.md             # Backend reference notes
│
├── frontend/                 # React + Vite Client
│   ├── src/
│   │   ├── App.jsx           # Main React dashboard layout
│   │   ├── index.css         # Tailwind integration
│   │   └── main.jsx          # Client entry point
│   ├── package.json          # Build scripts & client dependency list
│   └── vite.config.js        # Vite + Tailwind compiler plugins configuration
│
└── README.md                 # Universal Project documentation
```

---

## Installation & Setup

### 1. Clone & Set Up Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy the configuration template:
   ```bash
   cp .env.example .env
   ```
4. Define your environment parameters inside `.env`. Make sure to insert your Google GenAI API key:
   ```ini
   PORT=3000
   NODE_ENV=development
   METRICS_INTERVAL_MS=5000
   METRICS_HISTORY_LIMIT=720
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Launch the backend server:
   ```bash
   npm run start
   ```
   *(For watch-mode development, use `npm run dev`)*

---

### 2. Set Up Frontend

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development client:
   ```bash
   npm run dev
   ```
4. Open the displayed local host URL in your browser (typically `http://localhost:5173`).

---

## Docker Support

The backend agent and frontend dashboard can be run together in containerized environments using Docker Compose.

To build the images and run the containers, execute the following command in the root directory:

```bash
docker compose up --build
```

Once up, the services will be available at:
- **Backend API**: `http://localhost:3000`
- **Frontend Dashboard**: `http://localhost:5173`

---

## API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Liveness health status, server uptime, and last-collection timestamp. |
| **GET** | `/metrics` | Direct read of the latest metrics entry saved in `metrics.json`. |
| **GET** | `/summary` | On-demand Gemini AI performance explanation & actionable advice. |
| **GET** | `/api/system/static` | Static system properties (CPU Model, OS info, Total memory). |
| **GET** | `/api/metrics/history` | Historical collection array cached in-memory. |
| **DELETE** | `/api/metrics/history` | Wipes the dynamic metrics history logs. |

---

## Assumptions Made

1. **Single Host Scope**: The agent monitors only the host hardware it runs on.
2. **Persistent footprint optimization**: To prevent system drive saturation, only the single latest snapshot is saved in `metrics.json`, while historical queues are kept solely in memory.
3. **GenAI Availability**: The `/summary` endpoint assumes that a valid `GEMINI_API_KEY` is loaded and the host machine has outbound internet connectivity to communicate with Google's API servers.
4. **Adapter Presence**: Active network metrics are gathered based on the first operational interface returning traffic statistics via `systeminformation`.

---

## Future Improvements

1. **Visual Time-Series Graphs**: Implement charting widgets (e.g. `recharts` or `chart.js`) on the client to visualize resource changes over time.
2. **WebSocket Streaming**: Transition from short-polling (every 5 seconds) to real-time WebSockets to broadcast metrics dynamically on changes.
3. **Multi-Server Monitoring**: Extend the architecture to allow one dashboard instance to pull metrics from multiple remote agents.
4. **Security & Authentication**: Implement API key verification, CORS whitelisting, and token-based authentication (JWT) to secure access.
