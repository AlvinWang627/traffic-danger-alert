import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export interface BatteryOptimizationSettings {
  enableBatteryOptimization: boolean;
  locationUpdateInterval: number; // 毫秒
  distanceThreshold: number; // 公尺
  enableAdaptiveAccuracy: boolean;
  enableMotionDetection: boolean;
}

export class BatteryOptimizationService {
  private static instance: BatteryOptimizationService;
  private defaultSettings: BatteryOptimizationSettings = {
    enableBatteryOptimization: true,
    locationUpdateInterval: 5 * 60 * 1000, // 5分鐘
    distanceThreshold: 100, // 100公尺
    enableAdaptiveAccuracy: true,
    enableMotionDetection: true,
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
      timeInterval: 5 * 60 * 1000, // 5分鐘
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
      timeInterval: 2 * 60 * 1000, // 2分鐘
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

      // 檢查是否在移動中（簡單的啟發式方法）
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
        return settings.locationUpdateInterval;
      }

      // 根據時間和活動模式調整更新間隔
      const now = new Date();
      const hour = now.getHours();

      // 夜間（22:00-06:00）減少更新頻率
      if (hour >= 22 || hour < 6) {
        return Math.max(settings.locationUpdateInterval * 2, 10 * 60 * 1000); // 至少10分鐘
      }

      // 白天正常頻率
      return settings.locationUpdateInterval;
    } catch (error) {
      console.error("計算最佳更新間隔失敗:", error);
      return 5 * 60 * 1000; // 預設5分鐘
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

      // 如果最近有位置更新，可能正在移動，應該發送通知
      return timeSinceLastUpdate < 10 * 60 * 1000; // 10分鐘內
    } catch (error) {
      console.error("檢查是否發送通知失敗:", error);
      return true;
    }
  }

  getBatteryOptimizationTips(): string[] {
    return [
      "啟用電池優化可減少背景位置更新的頻率",
      "在夜間自動減少位置更新頻率以節省電池",
      "使用平衡精度而非高精度可大幅節省電池",
      "只在移動時發送通知可減少不必要的警報",
      "建議在充電時啟用高精度模式",
    ];
  }
}
