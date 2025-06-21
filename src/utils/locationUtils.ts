import { LocationObject } from "expo-location";

/**
 * 將經緯度轉換為度分秒格式
 */
export const convertToDMS = (decimal: number): string => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  return `${degrees}° ${minutes}' ${seconds}" ${decimal >= 0 ? "N" : "S"}`;
};

/**
 * 格式化位置資訊為易讀字串
 */
export const formatLocation = (location: LocationObject): string => {
  const { latitude, longitude } = location.coords;
  return `緯度：${convertToDMS(latitude)}\n經度：${convertToDMS(longitude)}`;
};

/**
 * 計算兩點之間的距離（公尺）
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // 地球半徑（公尺）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
