import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BatteryOptimizationService,
  BatteryOptimizationSettings,
} from "../src/services/BatteryOptimizationService";

export default function BatteryOptimizationScreen() {
  const [settings, setSettings] = useState<BatteryOptimizationSettings>({
    enableBatteryOptimization: true,
    locationUpdateInterval: 5 * 60 * 1000,
    distanceThreshold: 100,
    enableAdaptiveAccuracy: true,
    enableMotionDetection: true,
  });
  const [tips, setTips] = useState<string[]>([]);
  const router = useRouter();
  const batteryService = BatteryOptimizationService.getInstance();

  useEffect(() => {
    loadSettings();
    setTips(batteryService.getBatteryOptimizationTips());
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await batteryService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error("載入電池優化設定失敗:", error);
    }
  };

  const updateSetting = async (
    key: keyof BatteryOptimizationSettings,
    value: any
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await batteryService.updateSettings({ [key]: value });
    } catch (error) {
      console.error("更新設定失敗:", error);
      Alert.alert("錯誤", "無法更新設定");
    }
  };

  const formatTimeInterval = (milliseconds: number) => {
    const minutes = Math.round(milliseconds / (60 * 1000));
    return `${minutes} 分鐘`;
  };

  const resetToDefaults = async () => {
    Alert.alert("重置設定", "確定要將所有設定重置為預設值嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "確定",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("batteryOptimizationSettings");
            await loadSettings();
            Alert.alert("成功", "設定已重置為預設值");
          } catch (error) {
            console.error("重置設定失敗:", error);
            Alert.alert("錯誤", "無法重置設定");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>電池優化設定</Text>

        <View style={styles.settingContainer}>
          <View style={styles.switchRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>啟用電池優化</Text>
              <Text style={styles.settingDescription}>
                自動調整位置更新頻率和精度以節省電池
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={
                settings.enableBatteryOptimization ? "#2196F3" : "#f4f3f4"
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) =>
                updateSetting("enableBatteryOptimization", value)
              }
              value={settings.enableBatteryOptimization}
            />
          </View>
        </View>

        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>位置更新間隔</Text>
          <Text style={styles.settingValue}>
            {formatTimeInterval(settings.locationUpdateInterval)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={2 * 60 * 1000} // 2分鐘
            maximumValue={15 * 60 * 1000} // 15分鐘
            step={60 * 1000} // 1分鐘
            value={settings.locationUpdateInterval}
            onValueChange={(value) =>
              updateSetting("locationUpdateInterval", value)
            }
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#000000"
            disabled={!settings.enableBatteryOptimization}
          />
          <Text style={styles.settingDescription}>
            較長的間隔可節省電池，但可能延遲警報
          </Text>
        </View>

        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>距離閾值</Text>
          <Text style={styles.settingValue}>
            {settings.distanceThreshold} 公尺
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={50}
            maximumValue={200}
            step={10}
            value={settings.distanceThreshold}
            onValueChange={(value) => updateSetting("distanceThreshold", value)}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#000000"
            disabled={!settings.enableBatteryOptimization}
          />
          <Text style={styles.settingDescription}>
            較大的閾值可減少位置更新頻率
          </Text>
        </View>

        <View style={styles.settingContainer}>
          <View style={styles.switchRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>自適應精度</Text>
              <Text style={styles.settingDescription}>
                根據移動狀態自動調整位置精度
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={
                settings.enableAdaptiveAccuracy ? "#2196F3" : "#f4f3f4"
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) =>
                updateSetting("enableAdaptiveAccuracy", value)
              }
              value={settings.enableAdaptiveAccuracy}
              disabled={!settings.enableBatteryOptimization}
            />
          </View>
        </View>

        <View style={styles.settingContainer}>
          <View style={styles.switchRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>移動偵測</Text>
              <Text style={styles.settingDescription}>
                只在移動時發送通知以節省電池
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={
                settings.enableMotionDetection ? "#2196F3" : "#f4f3f4"
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) =>
                updateSetting("enableMotionDetection", value)
              }
              value={settings.enableMotionDetection}
              disabled={!settings.enableBatteryOptimization}
            />
          </View>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>電池優化提示</Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipText}>• {tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Text style={styles.resetButtonText}>重置為預設值</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </ScrollView>
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
  settingTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  settingValue: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    lineHeight: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  tipsContainer: {
    backgroundColor: "#e3f2fd",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1976d2",
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: "#ff9800",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
