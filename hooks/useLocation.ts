import * as Location from "expo-location";
import { useEffect, useState } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  loading: boolean;
}

export const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    errorMsg: null,
    loading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        // 請求定位權限
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationState((prev) => ({
            ...prev,
            errorMsg: "定位權限被拒絕",
            loading: false,
          }));
          return;
        }

        // 獲取當前位置
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        setLocationState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          errorMsg: null,
          loading: false,
        });

        // 設置背景定位
        await Location.startLocationUpdatesAsync("background-location", {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
          foregroundService: {
            notificationTitle: "交通危險提醒",
            notificationBody: "正在追蹤您的位置以提供即時警告",
          },
        });
      } catch (error) {
        setLocationState((prev) => ({
          ...prev,
          errorMsg: "獲取位置時發生錯誤",
          loading: false,
        }));
      }
    })();

    // 清理函數
    return () => {
      Location.stopLocationUpdatesAsync("background-location");
    };
  }, []);

  return locationState;
};
