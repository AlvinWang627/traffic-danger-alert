import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBackgroundService } from "../hooks/useBackgroundService";

export default function SettingsScreen() {
  const [alertDistance, setAlertDistance] = useState(100);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const {
    status,
    enableBackgroundService,
    disableBackgroundService,
    refreshStatus,
  } = useBackgroundService();
  const router = useRouter();

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

  const handleDistanceChange = async (value: number) => {
    setAlertDistance(value);
    try {
      await AsyncStorage.setItem("alertDistance", JSON.stringify(value));
    } catch (e) {
      console.error("Failed to save alert distance.", e);
    }
  };

  const handleSoundToggle = async (value: boolean) => {
    setIsSoundEnabled(value);
    try {
      await AsyncStorage.setItem("isSoundEnabled", JSON.stringify(value));
    } catch (e) {
      console.error("Failed to save sound setting.", e);
    }
  };

  const handleBackgroundToggle = async (value: boolean) => {
    try {
      if (value) {
        await enableBackgroundService();
        Alert.alert(
          "背景運作已啟用",
          "應用程式將在背景持續監控危險路段，並在需要時發送通知。\n\n注意：這可能會增加電池使用量。",
          [{ text: "確定" }]
        );
      } else {
        await disableBackgroundService();
        Alert.alert("背景運作已停用", "應用程式將不再在背景監控危險路段。", [
          { text: "確定" },
        ]);
      }
    } catch (error) {
      console.error("切換背景運作失敗:", error);
      Alert.alert("錯誤", "無法切換背景運作設定");
    }
  };

  const getBackgroundStatusText = () => {
    if (status.isLoading) return "載入中...";
    if (status.isEnabled) {
      if (status.locationTask) {
        return "已啟用 (位置監控中)";
      } else {
        return "已啟用 (等待啟動)";
      }
    }
    return "已停用";
  };

  const getBackgroundStatusColor = () => {
    if (status.isLoading) return "#999";
    if (status.isEnabled && status.locationTask) return "#4CAF50";
    if (status.isEnabled) return "#FF9800";
    return "#F44336";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.content}>
        <Text style={styles.title}>設定</Text>

        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>警示距離</Text>
          <Text style={styles.settingValue}>{alertDistance} 公尺</Text>
          <Slider
            style={styles.slider}
            minimumValue={50}
            maximumValue={500}
            step={10}
            value={alertDistance}
            onValueChange={handleDistanceChange}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#000000"
          />
        </View>

        <View style={styles.settingContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.settingLabel}>聲音提醒</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isSoundEnabled ? "#2196F3" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleSoundToggle}
              value={isSoundEnabled}
            />
          </View>
        </View>

        <View style={styles.settingContainer}>
          <View style={styles.switchRow}>
            <View style={styles.backgroundSettingContainer}>
              <Text style={styles.settingLabel}>背景運作</Text>
              <Text
                style={[
                  styles.statusText,
                  { color: getBackgroundStatusColor() },
                ]}
              >
                {getBackgroundStatusText()}
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={status.isEnabled ? "#2196F3" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleBackgroundToggle}
              value={status.isEnabled}
              disabled={status.isLoading}
            />
          </View>
          <Text style={styles.settingDescription}>
            啟用後，應用程式將在背景持續監控危險路段，即使螢幕關閉也會發送通知。
          </Text>
        </View>

        <TouchableOpacity
          style={styles.optimizationButton}
          onPress={() => router.push("/battery-optimization")}
        >
          <Text style={styles.optimizationButtonText}>電池優化設定</Text>
          <Text style={styles.optimizationButtonSubtext}>
            調整背景運作的電池使用效率
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  settingContainer: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backgroundSettingContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  settingValue: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    marginTop: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    lineHeight: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  optimizationButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  optimizationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  optimizationButtonSubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    opacity: 0.8,
  },
  backButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
