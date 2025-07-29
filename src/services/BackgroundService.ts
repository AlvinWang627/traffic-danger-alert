import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { calculateDistance } from "../utils/locationUtils";
import { BatteryOptimizationService } from "./BatteryOptimizationService";
import { DangerSpot, DangerSpotService } from "./DangerSpotService";

const BACKGROUND_LOCATION_TASK = "background-location-task";
const BACKGROUND_FETCH_TASK = "background-fetch-task";

// 配置通知
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class BackgroundService {
  private static instance: BackgroundService;
  private isInitialized = false;
  private lastAlertTime = 0;
  private readonly ALERT_INTERVAL = 10000; // 10秒間隔，避免過於頻繁的警報
  private batteryOptimizationService: BatteryOptimizationService;

  constructor() {
    this.batteryOptimizationService = BatteryOptimizationService.getInstance();
  }

  static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 請求通知權限
      const { status: notificationStatus } =
        await Notifications.requestPermissionsAsync();
      if (notificationStatus !== "granted") {
        console.log("通知權限被拒絕");
      }

      // 請求位置權限
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== "granted") {
        console.log("位置權限被拒絕");
        return;
      }

      // 註冊背景任務
      await this.registerBackgroundTasks();

      this.isInitialized = true;
      console.log("背景服務初始化完成");
    } catch (error) {
      console.error("背景服務初始化失敗:", error);
    }
  }

  private async registerBackgroundTasks(): Promise<void> {
    // 註冊背景位置監控任務
    TaskManager.defineTask(
      BACKGROUND_LOCATION_TASK,
      async ({ data, error }) => {
        if (error) {
          console.error("背景位置任務錯誤:", error);
          return;
        }

        try {
          const { locations } = data as {
            locations: Location.LocationObject[];
          };
          if (locations && locations.length > 0) {
            const location = locations[0];

            // 儲存最後已知位置
            await this.batteryOptimizationService.saveLastKnownLocation(
              location
            );

            // 檢查危險路段
            await this.checkDangerSpots(location);
          }
        } catch (error) {
          console.error("處理背景位置時發生錯誤:", error);
        }
      }
    );

    // 註冊背景獲取任務
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // 儲存最後已知位置
        await this.batteryOptimizationService.saveLastKnownLocation(location);

        // 檢查危險路段
        await this.checkDangerSpots(location);

        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error("背景獲取任務錯誤:", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // 註冊背景獲取
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15分鐘
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  async startBackgroundLocationUpdates(): Promise<void> {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        console.log("背景位置權限被拒絕");
        return;
      }

      // 獲取電池優化設定
      const batterySettings =
        await this.batteryOptimizationService.getSettings();

      // 根據設定選擇位置更新選項
      let locationOptions: Location.LocationTaskOptions;

      if (batterySettings.enableBatteryOptimization) {
        // 使用電池優化設定
        const shouldUseHighAccuracy =
          await this.batteryOptimizationService.shouldUseHighAccuracy();
        const optimalInterval =
          await this.batteryOptimizationService.calculateOptimalUpdateInterval();

        locationOptions = {
          accuracy: shouldUseHighAccuracy
            ? Location.Accuracy.High
            : Location.Accuracy.Balanced,
          timeInterval: optimalInterval,
          distanceInterval: batterySettings.distanceThreshold,
          foregroundService: {
            notificationTitle: "交通危險警報",
            notificationBody: shouldUseHighAccuracy
              ? "正在高精度監控附近的危險路段"
              : "正在監控附近的危險路段",
            notificationColor: "#FF6B6B",
          },
          showsBackgroundLocationIndicator: true,
        };
      } else {
        // 使用預設高精度設定
        locationOptions =
          this.batteryOptimizationService.getHighAccuracyLocationOptions();
      }

      await Location.startLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK,
        locationOptions
      );

      console.log("背景位置監控已啟動", {
        accuracy: locationOptions.accuracy,
        timeInterval: locationOptions.timeInterval,
        distanceInterval: locationOptions.distanceInterval,
      });
    } catch (error) {
      console.error("啟動背景位置監控失敗:", error);
    }
  }

  async stopBackgroundLocationUpdates(): Promise<void> {
    try {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log("背景位置監控已停止");
    } catch (error) {
      console.error("停止背景位置監控失敗:", error);
    }
  }

  private async checkDangerSpots(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      // 記錄位置更新統計
      await this.batteryOptimizationService.recordLocationUpdate();

      // 獲取設定
      const alertDistanceStr = await AsyncStorage.getItem("alertDistance");
      const alertDistance = alertDistanceStr ? parseInt(alertDistanceStr) : 200;

      // 檢查是否應該發送通知
      const shouldSend =
        await this.batteryOptimizationService.shouldSendNotification();
      if (!shouldSend) {
        console.log("根據移動狀態，跳過通知發送");
        return;
      }

      // 獲取危險路段資料
      const dangerSpotService = DangerSpotService.getInstance();
      const nearbySpots = await dangerSpotService.getNearbyDangerSpots(
        location.coords.latitude,
        location.coords.longitude,
        alertDistance
      );

      if (nearbySpots.length > 0) {
        // 檢查警報間隔
        const now = Date.now();
        if (now - this.lastAlertTime > this.ALERT_INTERVAL) {
          await this.sendNotification(nearbySpots, location);
          this.lastAlertTime = now;
        }
      }
    } catch (error) {
      console.error("檢查危險路段失敗:", error);
    }
  }

  private async sendNotification(
    nearbySpots: DangerSpot[],
    location: Location.LocationObject
  ): Promise<void> {
    try {
      const nearestSpot = nearbySpots[0];
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        nearestSpot.latitude,
        nearestSpot.longitude
      );

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ 交通危險警報",
          body: `您附近有 ${
            nearbySpots.length
          } 個危險路段，最近距離約 ${Math.round(distance)} 公尺`,
          data: {
            nearbySpots: nearbySpots.length,
            distance: Math.round(distance),
          },
          sound: "alert.mp3",
        },
        trigger: null, // 立即發送
      });

      console.log(`發送危險警報通知: ${nearbySpots.length} 個危險路段`);
    } catch (error) {
      console.error("發送通知失敗:", error);
    }
  }

  async getBackgroundStatus(): Promise<{
    locationTask: boolean;
    fetchTask: boolean;
  }> {
    try {
      const locationTask = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      );
      const fetchTask = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_FETCH_TASK
      );

      return {
        locationTask,
        fetchTask,
      };
    } catch (error) {
      console.error("獲取背景狀態失敗:", error);
      return {
        locationTask: false,
        fetchTask: false,
      };
    }
  }

  async unregisterAllTasks(): Promise<void> {
    try {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log("所有背景任務已取消註冊");
    } catch (error) {
      console.error("取消註冊背景任務失敗:", error);
    }
  }

  // 電池優化相關方法
  async getBatteryOptimizationSettings() {
    return await this.batteryOptimizationService.getSettings();
  }

  async updateBatteryOptimizationSettings(settings: any) {
    await this.batteryOptimizationService.updateSettings(settings);
  }

  getBatteryOptimizationTips() {
    return this.batteryOptimizationService.getBatteryOptimizationTips();
  }
}
