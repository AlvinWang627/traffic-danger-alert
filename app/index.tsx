import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAlerts } from "../hooks/useAlerts";
import { useLocation } from "../hooks/useLocation";

export default function HomeScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const router = useRouter();
  const { latitude, longitude, errorMsg, loading } = useLocation({
    enabled: isMonitoring,
  });
  const { nearbySpotsCount } = useAlerts({ enabled: isMonitoring });

  useEffect(() => {
    if (errorMsg) {
      Alert.alert("定位錯誤", errorMsg);
    }
  }, [errorMsg]);

  const toggleMonitoring = () => {
    if (!isMonitoring && loading) {
      Alert.alert("無法開始偵測", "正在等待位置資訊，請稍候...");
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
          {isMonitoring && nearbySpotsCount > 0 && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                警告：附近有 {nearbySpotsCount} 個危險路段！
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
          disabled={loading && !isMonitoring}
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
