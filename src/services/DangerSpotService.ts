import { LocationObject } from "expo-location";
import accidentData from "../../assets/accident_hotspots_grouped/113/taipei.json";

export interface DangerSpot {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  accidentCount: number;
}

export class DangerSpotService {
  private static DANGER_RADIUS_METERS = 100; // 預設危險半徑為 100 公尺

  /**
   * 計算兩點之間的距離（使用 Haversine 公式）
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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
  }

  /**
   * 檢查使用者是否接近任何危險地點
   */
  public static checkNearbyDangerSpots(
    userLocation: LocationObject
  ): DangerSpot[] {
    const nearbySpots: DangerSpot[] = [];

    for (const spot of accidentData) {
      const distance = this.calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        spot.latitude,
        spot.longitude
      );

      if (distance <= this.DANGER_RADIUS_METERS) {
        nearbySpots.push(spot);
      }
    }

    return nearbySpots;
  }

  /**
   * 取得所有危險地點
   */
  public static getDangerSpots(): Promise<DangerSpot[]> {
    return Promise.resolve(accidentData);
  }

  /**
   * 設定危險半徑
   */
  public static setDangerRadius(meters: number): void {
    if (meters > 0) {
      this.DANGER_RADIUS_METERS = meters;
    }
  }
}
