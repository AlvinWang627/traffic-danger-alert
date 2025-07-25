import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { AppState } from "react-native";

export interface BatteryOptimizationSettings {
  enableBatteryOptimization: boolean;
  foregroundUpdateInterval: number; // 前景更新間隔，毫秒
  backgroundUpdateInterval: number; // 背景更新間隔，毫秒
  distanceThreshold: number; // 公尺
  enableAdaptiveAccuracy: boolean;
  enableMotionDetection: boolean;
  enableNightMode: boolean; // 夜間模式
  nightModeStartHour: number; // 夜間模式開始時間
  nightModeEndHour: number; // 夜間模式結束時間
}

export class BatteryOptimizationService {
  private static instance: BatteryOptimizationService;
  private defaultSettings: BatteryOptimizationSettings = {
    enableBatteryOptimization: true,
    foregroundUpdateInterval: 10000, // 10秒
    backgroundUpdateInterval: 30000, // 30秒
    distanceThreshold: 100, // 100公尺
    enableAdaptiveAccuracy: true,
    enableMotionDetection: true,
    enableNightMode: true,
    nightModeStartHour: 22, // 22:00
    nightModeEndHour: 6, // 06:00
  };

  static getInstance(): BatteryOptimizationService {
    if (!BatteryOptimizationService.instance) {
      BatteryOptimizationService.instance = new BatteryOptimizationService();
    }
    return BatteryOptimizationService.instance;
  }

  async getSettings(): Promise<BatteryOptimizationSettings> {
    try {
      const settings = await AsyncStorage.getItem(
        "batteryOptimizationSettings"
      );
      if (settings) {
        return { ...this.defaultSettings, ...JSON.parse(settings) };
      }
      return this.defaultSettings;
    } catch (error) {
      console.error("獲取電池優化設定失敗:", error);
      return this.defaultSettings;
    }
  }

  async updateSettings(
    settings: Partial<BatteryOptimizationSettings>
  ): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(
        "batteryOptimizationSettings",
        JSON.stringify(newSettings)
      );
    } catch (error) {
      console.error("更新電池優化設定失敗:", error);
    }
  }

  getOptimizedLocationOptions(): Location.LocationTaskOptions {
    return {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000, // 30秒
      distanceInterval: 100, // 100公尺
      foregroundService: {
        notificationTitle: "交通危險警報",
        notificationBody: "正在監控附近的危險路段",
        notificationColor: "#FF6B6B",
      },
      showsBackgroundLocationIndicator: true,
    };
  }

  getHighAccuracyLocationOptions(): Location.LocationTaskOptions {
    return {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // 10秒
      distanceInterval: 50, // 50公尺
      foregroundService: {
        notificationTitle: "交通危險警報",
        notificationBody: "正在高精度監控附近的危險路段",
        notificationColor: "#FF6B6B",
      },
      showsBackgroundLocationIndicator: true,
    };
  }

  async shouldUseHighAccuracy(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings.enableAdaptiveAccuracy) {
        return false;
      }

      // 檢查是否在移動中
      const lastLocation = await AsyncStorage.getItem("lastKnownLocation");
      if (lastLocation) {
        const locationData = JSON.parse(lastLocation);
        const timeSinceLastUpdate = Date.now() - locationData.timestamp;

        // 如果最近有位置更新，可能正在移動
        if (timeSinceLastUpdate < 5 * 60 * 1000) {
          // 5分鐘內
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("檢查是否使用高精度失敗:", error);
      return false;
    }
  }

  async saveLastKnownLocation(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
        speed: location.coords.speed || 0,
        heading: location.coords.heading || 0,
      };
      await AsyncStorage.setItem(
        "lastKnownLocation",
        JSON.stringify(locationData)
      );
    } catch (error) {
      console.error("儲存最後已知位置失敗:", error);
    }
  }

  async getLastKnownLocation(): Promise<{
    latitude: number;
    longitude: number;
    timestamp: number;
    speed: number;
    heading: number;
  } | null> {
    try {
      const locationData = await AsyncStorage.getItem("lastKnownLocation");
      if (locationData) {
        return JSON.parse(locationData);
      }
      return null;
    } catch (error) {
      console.error("獲取最後已知位置失敗:", error);
      return null;
    }
  }

  async calculateOptimalUpdateInterval(): Promise<number> {
    try {
      const settings = await this.getSettings();
      if (!settings.enableBatteryOptimization) {
        return settings.foregroundUpdateInterval;
      }

      const appState = AppState.currentState;
      let baseInterval =
        appState === "active"
          ? settings.foregroundUpdateInterval
          : settings.backgroundUpdateInterval;

      // 夜間模式檢查
      if (settings.enableNightMode && this.isNightTime(settings)) {
        baseInterval = Math.max(baseInterval * 2, 60 * 1000); // 至少1分鐘
      }

      // 根據移動狀態調整
      const lastLocation = await this.getLastKnownLocation();
      if (lastLocation) {
        const timeSinceLastUpdate = Date.now() - lastLocation.timestamp;

        // 如果靜止不動，增加間隔
        if (lastLocation.speed < 1) {
          // 速度小於1 m/s
          baseInterval = Math.max(baseInterval * 1.5, 30 * 1000);
        }

        // 如果最近有更新，可能正在移動，保持較短間隔
        if (timeSinceLastUpdate < 2 * 60 * 1000) {
          baseInterval = Math.min(baseInterval, 20 * 1000);
        }
      }

      return Math.round(baseInterval);
    } catch (error) {
      console.error("計算最佳更新間隔失敗:", error);
      return 30000; // 預設30秒
    }
  }

  private isNightTime(settings: BatteryOptimizationSettings): boolean {
    const now = new Date();
    const hour = now.getHours();

    if (settings.nightModeStartHour > settings.nightModeEndHour) {
      // 跨夜情況 (例如 22:00 - 06:00)
      return (
        hour >= settings.nightModeStartHour || hour < settings.nightModeEndHour
      );
    } else {
      // 同一天內 (例如 06:00 - 22:00)
      return (
        hour >= settings.nightModeStartHour && hour < settings.nightModeEndHour
      );
    }
  }

  async shouldSendNotification(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings.enableMotionDetection) {
        return true;
      }

      // 檢查是否在移動中
      const lastLocation = await this.getLastKnownLocation();
      if (!lastLocation) {
        return true;
      }

      const timeSinceLastUpdate = Date.now() - lastLocation.timestamp;

      // 如果最近有位置更新且速度大於0，可能正在移動
      if (timeSinceLastUpdate < 10 * 60 * 1000 && lastLocation.speed > 0.5) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("檢查是否發送通知失敗:", error);
      return true;
    }
  }

  getBatteryOptimizationTips(): string[] {
    return [
      "前景運作時每10秒更新位置，背景運作時每30秒更新",
      "啟用電池優化可根據時間和移動狀態自動調整更新頻率",
      "夜間模式（22:00-06:00）自動降低更新頻率以節省電池",
      "靜止不動時自動增加更新間隔",
      "使用平衡精度而非高精度可大幅節省電池",
      "背景運作時使用較長的更新間隔以減少電力消耗",
    ];
  }

  async getPerformanceStats(): Promise<{
    totalLocationUpdates: number;
    averageUpdateInterval: number;
    batteryOptimizationEnabled: boolean;
    currentUpdateInterval: number;
  }> {
    try {
      const settings = await this.getSettings();
      const currentInterval = await this.calculateOptimalUpdateInterval();

      const statsStr = await AsyncStorage.getItem("locationUpdateStats");
      const stats = statsStr
        ? JSON.parse(statsStr)
        : {
            totalUpdates: 0,
            totalTime: 0,
            lastUpdate: Date.now(),
          };

      return {
        totalLocationUpdates: stats.totalUpdates || 0,
        averageUpdateInterval:
          stats.totalTime > 0 ? stats.totalTime / stats.totalUpdates : 0,
        batteryOptimizationEnabled: settings.enableBatteryOptimization,
        currentUpdateInterval: currentInterval,
      };
    } catch (error) {
      console.error("獲取效能統計失敗:", error);
      return {
        totalLocationUpdates: 0,
        averageUpdateInterval: 0,
        batteryOptimizationEnabled: true,
        currentUpdateInterval: 30000,
      };
    }
  }

  async recordLocationUpdate(): Promise<void> {
    try {
      const statsStr = await AsyncStorage.getItem("locationUpdateStats");
      const stats = statsStr
        ? JSON.parse(statsStr)
        : {
            totalUpdates: 0,
            totalTime: 0,
            lastUpdate: Date.now(),
          };

      const now = Date.now();
      const timeSinceLastUpdate = now - stats.lastUpdate;

      stats.totalUpdates += 1;
      stats.totalTime += timeSinceLastUpdate;
      stats.lastUpdate = now;

      await AsyncStorage.setItem("locationUpdateStats", JSON.stringify(stats));
    } catch (error) {
      console.error("記錄位置更新統計失敗:", error);
    }
  }
}
