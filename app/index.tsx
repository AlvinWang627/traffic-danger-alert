import { LocationObject } from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useLocation } from "../hooks/useLocation";
import { DangerSpotService } from "../src/services/DangerSpotService";

export default function HomeScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [nearbySpots, setNearbySpots] = useState<any[]>([]);
  const router = useRouter();
  const { latitude, longitude, errorMsg, loading, location } = useLocation();

  useEffect(() => {
    if (errorMsg) {
      Alert.alert("定位錯誤", errorMsg);
    }
  }, [errorMsg]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isMonitoring && location) {
      // 立即檢查一次
      checkDangerSpots(location);

      // 設定定期檢查（每 10 秒）
      intervalId = setInterval(() => {
        checkDangerSpots(location);
      }, 10000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, location]);

  const checkDangerSpots = (currentLocation: LocationObject) => {
    const spots = DangerSpotService.checkNearbyDangerSpots(currentLocation);
    if (spots.length > 0) {
      setNearbySpots(spots);
      // 觸發震動提醒
      Vibration.vibrate([0, 500, 200, 500]);
      Alert.alert(
        "危險警示",
        `您正在接近 ${spots.length} 個危險路段，請小心駕駛！`
      );
    } else {
      setNearbySpots([]);
    }
  };

  const toggleMonitoring = () => {
    if (!isMonitoring && !latitude && !longitude) {
      Alert.alert("無法開始偵測", "請等待位置資訊載入完成");
      return;
    }
    setIsMonitoring(!isMonitoring);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.content}>
        <Text style={styles.title}>交通危險警示</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            目前狀態：{isMonitoring ? "偵測中" : "已停止"}
          </Text>
          {isMonitoring && latitude && longitude && (
            <Text style={styles.locationText}>
              位置：{latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          )}
          {loading && <Text style={styles.loadingText}>正在獲取位置...</Text>}
          {nearbySpots.length > 0 && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                警告：附近有 {nearbySpots.length} 個危險路段！
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isMonitoring ? styles.stopButton : styles.startButton,
          ]}
          onPress={toggleMonitoring}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {isMonitoring ? "停止偵測" : "開始偵測"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.settingsButtonText}>設定</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  loadingText: {
    fontSize: 14,
    color: "#2196F3",
    marginTop: 5,
  },
  warningContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ffebee",
    borderRadius: 5,
    width: "100%",
  },
  warningText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 15,
  },
  settingsButtonText: {
    color: "#2196F3",
    fontSize: 16,
  },
});
