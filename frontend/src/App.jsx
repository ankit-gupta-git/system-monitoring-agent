import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  Database,
  HardDrive,
  Activity,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Server,
  AlertTriangle,
  Clock,
  CheckCircle,
  Network,
  Sparkles
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:3000';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [staticInfo, setStaticInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const fetchStaticInfo = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/system/static`);
      if (!res.ok) throw new Error('Failed to fetch hardware specs');
      const data = await res.json();
      setStaticInfo(data);
    } catch (err) {
      console.error('Error fetching static system details:', err);
    }
  }, []);

  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/metrics`);
      if (!res.ok) throw new Error('Failed to fetch live monitoring metrics');
      const data = await res.json();
      setMetrics(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Unable to connect to the monitoring agent backend.');
    } finally {
      setLoading(false);
      if (isManual) {
        // Leave minor delay for smooth rotation visual effect
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  }, []);

  const fetchAiSummary = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/summary`);
      if (!res.ok) throw new Error('Failed to fetch system diagnosis summary');
      const data = await res.json();
      setAiSummary(data);
    } catch (err) {
      setAiError(err.message || 'Error generating AI summary analysis.');
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaticInfo();
    fetchMetrics();
    fetchAiSummary();
  }, [fetchStaticInfo, fetchMetrics, fetchAiSummary]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchMetrics();
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchMetrics]);

  const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec) => {
    if (bytesPerSec === undefined || bytesPerSec === null || isNaN(bytesPerSec)) return '0 B/s';
    return `${formatBytes(bytesPerSec)}`;
  };

  const formatUptime = (seconds) => {
    if (isNaN(seconds) || seconds === null) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const getProgressColor = (percentage) => {
    if (percentage > 85) return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
    if (percentage > 60) return 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
    return 'bg-gradient-to-r from-violet-500 to-indigo-600 shadow-[0_0_10px_rgba(139,92,246,0.4)]';
  };

  const getTextColor = (percentage) => {
    if (percentage > 85) return 'text-red-400';
    if (percentage > 60) return 'text-amber-400';
    return 'text-violet-400';
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans selection:bg-violet-500/20 selection:text-violet-200">
      
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                System Monitoring Dashboard
              </h1>
              <p className="text-xs text-zinc-500 hidden sm:block">Real-time lightweight performance agent</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
              <span className={`h-2.5 w-2.5 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-zinc-400 font-medium">{error ? 'Disconnected' : 'Agent Live'}</span>
            </div>

            <button
              onClick={() => fetchMetrics(true)}
              disabled={isRefreshing}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all duration-200 disabled:opacity-50"
              title="Manual Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-2xl flex gap-3 text-red-200 text-sm">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-400">Connection Error</h3>
              <p className="mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {staticInfo && (
          <div className="mb-8 p-6 bg-zinc-900/40 border border-zinc-900/80 backdrop-blur-sm rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <span className="text-xs text-zinc-500 block">Host Name</span>
                <span className="font-semibold text-sm text-zinc-300">{staticInfo.os.hostname}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cpu className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <span className="text-xs text-zinc-500 block">Processor</span>
                <span className="font-semibold text-sm text-zinc-300 line-clamp-1">{staticInfo.cpu.brand}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <span className="text-xs text-zinc-500 block">Platform OS</span>
                <span className="font-semibold text-sm text-zinc-300">{staticInfo.os.distro} ({staticInfo.os.arch})</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <span className="text-xs text-zinc-500 block">Total RAM Cap</span>
                <span className="font-semibold text-sm text-zinc-300">{formatBytes(staticInfo.memory.total)}</span>
              </div>
            </div>
          </div>
        )}

        {loading && !metrics ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
            <RefreshCw className="h-10 w-10 animate-spin text-violet-500" />
            <p className="text-sm font-medium animate-pulse">Polling host monitoring metrics...</p>
          </div>
        ) : (
          metrics && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="p-6 rounded-3xl border border-violet-500/10 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl group-hover:bg-violet-500/10 transition-all duration-500" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="font-bold text-zinc-200 flex items-center gap-2">
                        Gemini AI System Diagnosis
                        <span className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">gemini-3.5-flash</span>
                      </h2>
                      <p className="text-xs text-zinc-500">Actionable insights generated from real-time monitoring specs</p>
                    </div>
                  </div>

                  <button
                    onClick={fetchAiSummary}
                    disabled={aiLoading}
                    className="text-xs px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 active:scale-95 shadow-lg shadow-violet-600/10 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${aiLoading ? 'animate-spin' : ''}`} />
                    {aiLoading ? 'Analyzing...' : 'Re-Analyze System'}
                  </button>
                </div>

                {aiLoading ? (
                  <div className="flex items-center gap-3 text-zinc-500 py-4">
                    <RefreshCw className="h-4 w-4 animate-spin text-violet-500" />
                    <span className="text-xs animate-pulse">Gemini is analyzing your CPU load, disk usage, active memory thresholds...</span>
                  </div>
                ) : aiError ? (
                  <div className="text-xs text-red-400 py-2 flex items-center gap-2 bg-red-950/20 border border-red-900/30 p-4 rounded-2xl">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Failed to retrieve AI summary: {aiError}</span>
                  </div>
                ) : (
                  aiSummary && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                      <div className="lg:col-span-2 space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block font-sans">Analysis Summary</span>
                        <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 border border-zinc-900/80 rounded-2xl">
                          {aiSummary.explanation}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block font-sans">Advisory recommendations</span>
                        <ul className="space-y-2">
                          {aiSummary.recommendations && aiSummary.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2.5 bg-zinc-950/40 p-3 border border-zinc-900/80 rounded-xl">
                              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-zinc-900/60 border border-zinc-900 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:border-violet-500/20 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-zinc-200">CPU Load</h2>
                        <p className="text-xs text-zinc-500">Multi-core processor utilization</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-extrabold tracking-tight ${getTextColor(metrics.cpu.currentLoad)}`}>
                      {metrics.cpu.currentLoad}%
                    </span>
                  </div>

                  <div className="w-full bg-zinc-800/80 rounded-full h-3.5 mb-6 overflow-hidden p-0.5 border border-zinc-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor(metrics.cpu.currentLoad)}`}
                      style={{ width: `${Math.min(metrics.cpu.currentLoad, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center border-t border-zinc-800/50 pt-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">User</span>
                      <span className="text-xs font-semibold text-zinc-300">{metrics.cpu.currentLoadUser}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">System</span>
                      <span className="text-xs font-semibold text-zinc-300">{metrics.cpu.currentLoadSystem}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Idle</span>
                      <span className="text-xs font-semibold text-zinc-300">{metrics.cpu.currentLoadIdle}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-900 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:border-violet-500/20 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-zinc-200">RAM Capacity</h2>
                        <p className="text-xs text-zinc-500">Active working memory usage</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-extrabold tracking-tight ${getTextColor(metrics.memory.usagePercentage)}`}>
                      {metrics.memory.usagePercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-zinc-800/80 rounded-full h-3.5 mb-6 overflow-hidden p-0.5 border border-zinc-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor(metrics.memory.usagePercentage)}`}
                      style={{ width: `${metrics.memory.usagePercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/50 pt-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Used (Active)</span>
                      <span className="font-semibold text-zinc-300">{formatBytes(metrics.memory.active)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Available</span>
                      <span className="font-semibold text-zinc-300">{formatBytes(metrics.memory.available)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-900 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:border-violet-500/20 transition-all duration-300 group md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-zinc-200">System Uptime</h2>
                      <p className="text-xs text-zinc-500">Host operating system timeline</p>
                    </div>
                  </div>

                  <div className="py-2.5 mb-6">
                    <span className="text-2xl font-extrabold tracking-tight text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-2 block text-center">
                      {formatUptime(metrics.uptime)}
                    </span>
                  </div>

                  <div className="border-t border-zinc-800/50 pt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>Last Polled</span>
                    <span className="font-medium text-zinc-400">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-zinc-900/60 border border-zinc-900 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:border-violet-500/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <HardDrive className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-zinc-200">Filesystems & Disks</h2>
                      <p className="text-xs text-zinc-500">Storage capacity and free partitions space</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {metrics.filesystems.map((fsInfo, idx) => (
                      <div key={idx} className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-200">{fsInfo.mount}</span>
                            <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 uppercase">{fsInfo.type}</span>
                          </div>
                          <span className={`font-semibold text-xs ${getTextColor(fsInfo.usePercentage)}`}>
                            {fsInfo.usePercentage}% Full
                          </span>
                        </div>

                        <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(fsInfo.usePercentage)}`}
                            style={{ width: `${fsInfo.usePercentage}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Used: {formatBytes(fsInfo.used)}</span>
                          <span>Free: {formatBytes(fsInfo.available)} of {formatBytes(fsInfo.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-900 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:border-violet-500/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <Network className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-zinc-200">Network Interfaces</h2>
                      <p className="text-xs text-zinc-500">Internet connection and bandwidth stats</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {metrics.network.map((netCard, idx) => (
                      <div key={idx} className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-900">
                          <span className="font-bold text-sm text-zinc-200">{netCard.iface}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${netCard.operstate === 'up' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-red-950/50 text-red-400 border border-red-900/50'}`}>
                            {netCard.operstate}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-zinc-900/50 rounded-xl flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                              <ArrowDown className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block">Download Speed</span>
                              <span className="text-xs font-bold text-zinc-300">{formatSpeed(netCard.rxSec)}</span>
                              <span className="text-[9px] text-zinc-500 block mt-0.5">Total: {formatBytes(netCard.rxBytes)}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-zinc-900/50 rounded-xl flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                              <ArrowUp className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block">Upload Speed</span>
                              <span className="text-xs font-bold text-zinc-300">{formatSpeed(netCard.txSec)}</span>
                              <span className="text-[9px] text-zinc-500 block mt-0.5">Total: {formatBytes(netCard.txBytes)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )
        )}
      </main>

      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 System Monitoring Agent. Built with Node.js, Express, React, and Tailwind CSS.</p>
          <div className="text-[10px] uppercase tracking-widest text-zinc-700 font-semibold select-none">
            Designed & Developed by <span className="text-zinc-500 hover:text-violet-400 transition-colors duration-200">Ankit</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;