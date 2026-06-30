import si from 'systeminformation';
import os from 'os';

/**
 * Retrieves static system information.
 * Typically requested once on dashboard load as these hardware specs do not change.
 * @returns {Promise<Object>}
 */
export const getStaticSystemInfo = async () => {
  const [cpu, osInfo, mem, diskLayout, networkInterfaces] = await Promise.all([
    si.cpu(),
    si.osInfo(),
    si.mem(),
    si.diskLayout(),
    si.networkInterfaces(),
  ]);

  return {
    cpu: {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      speed: cpu.speed,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
    },
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      codename: osInfo.codename,
      arch: osInfo.arch,
      hostname: osInfo.hostname,
    },
    memory: {
      total: mem.total,
    },
    disks: diskLayout.map(disk => ({
      device: disk.device,
      type: disk.type,
      name: disk.name,
      size: disk.size,
    })),
    network: networkInterfaces
      .filter(net => !net.internal)
      .map(net => ({
        iface: net.iface,
        ip4: net.ip4,
        mac: net.mac,
        type: net.type,
        speed: net.speed,
      })),
  };
};

/**
 * Retrieves dynamic real-time system metrics.
 * Refreshed frequently (e.g., every 5 seconds) to track utilization.
 * @returns {Promise<Object>}
 */
export const getDynamicSystemMetrics = async () => {
  const [load, mem, fsSize, networkStats] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
  ]);

  // Handle cases where networkStats might be empty or missing properties
  const sanitizedNetwork = (networkStats || []).map(stat => ({
    iface: stat.iface,
    operstate: stat.operstate,
    rxBytes: stat.rx_bytes,
    txBytes: stat.tx_bytes,
    rxSec: stat.rx_sec >= 0 ? stat.rx_sec : 0,
    txSec: stat.tx_sec >= 0 ? stat.tx_sec : 0,
  }));

  return {
    timestamp: new Date().toISOString(),
    uptime: Math.floor(os.uptime()),
    cpu: {
      currentLoad: parseFloat(load.currentLoad.toFixed(2)),
      currentLoadUser: parseFloat(load.currentLoadUser.toFixed(2)),
      currentLoadSystem: parseFloat(load.currentLoadSystem.toFixed(2)),
      currentLoadIdle: parseFloat(load.currentLoadIdle.toFixed(2)),
      cores: load.cpus.map((core, idx) => ({
        core: idx,
        load: parseFloat(core.load.toFixed(2)),
      })),
    },
    memory: {
      total: mem.total,
      free: mem.free,
      used: mem.used,
      active: mem.active,
      available: mem.available,
      usagePercentage: parseFloat(((mem.active / mem.total) * 100).toFixed(2)),
    },
    filesystems: fsSize.map(fs => ({
      fs: fs.fs,
      type: fs.type,
      size: fs.size,
      used: fs.used,
      available: fs.available,
      usePercentage: parseFloat(fs.use.toFixed(2)),
      mount: fs.mount,
    })),
    network: sanitizedNetwork,
  };
};
