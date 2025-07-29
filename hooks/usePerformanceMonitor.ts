import { useEffect, useState } from "react";
import { BatteryOptimizationService } from "../src/services/BatteryOptimizationService";

interface PerformanceStats {
  totalLocationUpdates: number;
  averageUpdateInterval: number;
  batteryOptimizationEnabled: boolean;
  currentUpdateInterval: number;
  lastUpdateTime: number;
  isNightMode: boolean;
}

export const usePerformanceMonitor = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    totalLocationUpdates: 0,
    averageUpdateInterval: 0,
    batteryOptimizationEnabled: true,
    currentUpdateInterval: 10000,
    lastUpdateTime: Date.now(),
    isNightMode: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const batteryService = BatteryOptimizationService.getInstance();
      const performanceStats = await batteryService.getPerformanceStats();
      const settings = await batteryService.getSettings();

      // 檢查是否為夜間模式
      const now = new Date();
      const hour = now.getHours();
      const isNightMode =
        settings.enableNightMode &&
        (hour >= settings.nightModeStartHour ||
          hour < settings.nightModeEndHour);

      setStats({
        ...performanceStats,
        lastUpdateTime: Date.now(),
        isNightMode,
      });
    } catch (error) {
      console.error("載入效能統計失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    await loadStats();
  };

  const recordLocationUpdate = async () => {
    try {
      const batteryService = BatteryOptimizationService.getInstance();
      await batteryService.recordLocationUpdate();
      await loadStats(); // 重新載入統計
    } catch (error) {
      console.error("記錄位置更新失敗:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 每分鐘自動更新統計
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatUpdateInterval = (interval: number) => {
    if (interval < 1000) return `${interval}毫秒`;
    if (interval < 60000) return `${Math.round(interval / 1000)}秒`;
    return `${Math.round(interval / 60000)}分鐘`;
  };

  const getPerformanceStatus = () => {
    if (stats.currentUpdateInterval <= 10000) return "高頻率";
    if (stats.currentUpdateInterval <= 15000) return "標準";
    return "節能模式";
  };

  const getPerformanceStatusColor = () => {
    const status = getPerformanceStatus();
    switch (status) {
      case "高頻率":
        return "#4CAF50";
      case "標準":
        return "#FF9800";
      case "節能模式":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  return {
    stats,
    isLoading,
    refreshStats,
    recordLocationUpdate,
    formatUpdateInterval,
    getPerformanceStatus,
    getPerformanceStatusColor,
  };
};
