import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { BackgroundService } from "../src/services/BackgroundService";

interface BackgroundStatus {
  isEnabled: boolean;
  locationTask: boolean;
  fetchTask: boolean;
  isLoading: boolean;
}

export function useBackgroundService() {
  const [status, setStatus] = useState<BackgroundStatus>({
    isEnabled: false,
    locationTask: false,
    fetchTask: false,
    isLoading: true,
  });

  const backgroundService = BackgroundService.getInstance();

  useEffect(() => {
    initializeBackgroundService();
  }, []);

  const initializeBackgroundService = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true }));

      // 初始化背景服務
      await backgroundService.initialize();

      // 載入設定
      const isBackgroundEnabled = await AsyncStorage.getItem(
        "isBackgroundEnabled"
      );
      const enabled = isBackgroundEnabled
        ? JSON.parse(isBackgroundEnabled)
        : false;

      // 獲取背景任務狀態
      const taskStatus = await backgroundService.getBackgroundStatus();

      setStatus({
        isEnabled: enabled,
        locationTask: taskStatus.locationTask,
        fetchTask: taskStatus.fetchTask,
        isLoading: false,
      });

      // 如果啟用了背景運作，啟動位置監控
      if (enabled) {
        await backgroundService.startBackgroundLocationUpdates();
      }
    } catch (error) {
      console.error("初始化背景服務失敗:", error);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const enableBackgroundService = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true }));

      // 啟動背景位置監控
      await backgroundService.startBackgroundLocationUpdates();

      // 儲存設定
      await AsyncStorage.setItem("isBackgroundEnabled", JSON.stringify(true));

      // 更新狀態
      const taskStatus = await backgroundService.getBackgroundStatus();
      setStatus({
        isEnabled: true,
        locationTask: taskStatus.locationTask,
        fetchTask: taskStatus.fetchTask,
        isLoading: false,
      });

      console.log("背景服務已啟用");
    } catch (error) {
      console.error("啟用背景服務失敗:", error);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const disableBackgroundService = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true }));

      // 停止背景位置監控
      await backgroundService.stopBackgroundLocationUpdates();

      // 儲存設定
      await AsyncStorage.setItem("isBackgroundEnabled", JSON.stringify(false));

      // 更新狀態
      const taskStatus = await backgroundService.getBackgroundStatus();
      setStatus({
        isEnabled: false,
        locationTask: taskStatus.locationTask,
        fetchTask: taskStatus.fetchTask,
        isLoading: false,
      });

      console.log("背景服務已停用");
    } catch (error) {
      console.error("停用背景服務失敗:", error);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const refreshStatus = async () => {
    try {
      const taskStatus = await backgroundService.getBackgroundStatus();
      const isBackgroundEnabled = await AsyncStorage.getItem(
        "isBackgroundEnabled"
      );
      const enabled = isBackgroundEnabled
        ? JSON.parse(isBackgroundEnabled)
        : false;

      setStatus((prev) => ({
        ...prev,
        isEnabled: enabled,
        locationTask: taskStatus.locationTask,
        fetchTask: taskStatus.fetchTask,
      }));
    } catch (error) {
      console.error("重新整理狀態失敗:", error);
    }
  };

  return {
    status,
    enableBackgroundService,
    disableBackgroundService,
    refreshStatus,
  };
}
