import * as Location from "expo-location";
import { LocationObject } from "expo-location";
import { useEffect, useState } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  loading: boolean;
  location: LocationObject | null;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    errorMsg: null,
    loading: true,
    location: null,
  });

  useEffect(() => {
    (async () => {
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
          accuracy: Location.Accuracy.High,
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
    })();
  }, []);

  return state;
};
