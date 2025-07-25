import * as Location from "expo-location";
import { LocationObject } from "expo-location";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  loading: boolean;
  location: LocationObject | null;
}

interface UseLocationOptions {
  enabled: boolean;
  updateInterval?: number; // 毫秒，預設10秒
  backgroundUpdateInterval?: number; // 背景運作時的更新間隔，預設30秒
  accuracy?: Location.Accuracy;
}

export const useLocation = ({
  enabled,
  updateInterval = 10000, // 10秒
  backgroundUpdateInterval = 30000, // 30秒
  accuracy = Location.Accuracy.High,
}: UseLocationOptions) => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    errorMsg: null,
    loading: enabled,
    location: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setState((prev) => ({
          ...prev,
          errorMsg: "需要位置權限才能使用此功能",
          loading: false,
        }));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy,
        timeInterval: 5000, // 5秒內獲取位置
      });

      setState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        errorMsg: null,
        loading: false,
        location,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errorMsg: "無法獲取位置資訊",
        loading: false,
      }));
    }
  };

  const startLocationUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 立即獲取一次位置
    getLocation();

    // 根據當前 App 狀態決定更新間隔
    const currentInterval =
      appStateRef.current === "active"
        ? updateInterval
        : backgroundUpdateInterval;

    intervalRef.current = setInterval(getLocation, currentInterval);
  };

  const stopLocationUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (enabled && appStateRef.current !== nextAppState) {
      appStateRef.current = nextAppState;

      // 重新啟動定時器以使用新的間隔
      if (intervalRef.current) {
        startLocationUpdates();
      }
    }
  };

  useEffect(() => {
    // 監聽 App 狀態變化
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [enabled, updateInterval, backgroundUpdateInterval]);

  useEffect(() => {
    if (!enabled) {
      stopLocationUpdates();
      setState({
        latitude: null,
        longitude: null,
        errorMsg: null,
        loading: false,
        location: null,
      });
      return;
    }

    startLocationUpdates();

    return () => {
      stopLocationUpdates();
    };
  }, [enabled, updateInterval, backgroundUpdateInterval, accuracy]);

  return state;
};
