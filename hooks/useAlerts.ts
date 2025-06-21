import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  DangerSpot,
  DangerSpotService,
} from "../src/services/DangerSpotService";
import { calculateDistance } from "../src/utils/locationUtils";
import { useLocation } from "./useLocation";

const ALERT_INTERVAL = 5000; // 5 seconds

export function useAlerts({ enabled }: { enabled: boolean }) {
  const { location } = useLocation({ enabled });
  const [dangerSpots, setDangerSpots] = useState<DangerSpot[]>([]);
  const [alertDistance, setAlertDistance] = useState(100);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [nearbySpotsCount, setNearbySpotsCount] = useState(0);
  const lastAlertTimestamp = useRef<number>(0);
  const sound = useRef(new Audio.Sound());

  useEffect(() => {
    // Load settings from AsyncStorage
    const loadSettings = async () => {
      try {
        const distance = await AsyncStorage.getItem("alertDistance");
        if (distance) {
          setAlertDistance(JSON.parse(distance));
        }
        const soundEnabled = await AsyncStorage.getItem("isSoundEnabled");
        if (soundEnabled) {
          setIsSoundEnabled(JSON.parse(soundEnabled));
        }
      } catch (e) {
        console.error("Failed to load settings.", e);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Load danger spots
    const fetchDangerSpots = async () => {
      const spots = await DangerSpotService.getDangerSpots();
      setDangerSpots(spots);
    };

    if (enabled) {
      fetchDangerSpots();
    }
  }, [enabled]);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound: soundObject } = await Audio.Sound.createAsync(
          require("../assets/sounds/alert.mp3")
        );
        sound.current = soundObject;
      } catch (error) {
        console.log("error loading sound", error);
      }
    };

    if (enabled && isSoundEnabled) {
      loadSound();
    }

    return () => {
      sound.current.unloadAsync();
    };
  }, [enabled, isSoundEnabled]);

  useEffect(() => {
    if (!enabled || !location) {
      return;
    }

    const now = Date.now();
    let triggered = false;
    let nearbyCount = 0;

    for (const spot of dangerSpots) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        spot.latitude,
        spot.longitude
      );

      if (distance < alertDistance) {
        nearbyCount++;
        if (now - lastAlertTimestamp.current >= ALERT_INTERVAL) {
          triggered = true;
        }
      }
    }

    setNearbySpotsCount(nearbyCount);

    if (triggered) {
      // Vibrate
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Play sound if enabled
      if (isSoundEnabled) {
        sound.current.replayAsync().catch((error) => console.log(error));
      }

      lastAlertTimestamp.current = now;
    }
  }, [enabled, location, dangerSpots, alertDistance, isSoundEnabled]);

  return { nearbySpotsCount };
}
