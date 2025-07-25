import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BatteryOptimizationService,
  BatteryOptimizationSettings,
} from "../src/services/BatteryOptimizationService";

export default function PerformanceSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<BatteryOptimizationSettings>({
    enableBatteryOptimization: true,
    foregroundUpdateInterval: 10000,
    backgroundUpdateInterval: 30000,
    distanceThreshold: 100,
    enableAdaptiveAccuracy: true,
    enableMotionDetection: true,
    enableNightMode: true,
    nightModeStartHour: 22,
    nightModeEndHour: 6,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const batteryService = BatteryOptimizationService.getInstance();
      const currentSettings = await batteryService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error("載入設定失敗:", error);
      Alert.alert("錯誤", "無法載入效能設定");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const batteryService = BatteryOptimizationService.getInstance();
      await batteryService.updateSettings(settings);
      Alert.alert("成功", "效能設定已儲存");
    } catch (error) {
      console.error("儲存設定失敗:", error);
      Alert.alert("錯誤", "無法儲存效能設定");
    }
  };

  const resetToDefaults = async () => {
    Alert.alert("重設設定", "確定要將所有效能設定重設為預設值嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "重設",
        style: "destructive",
        onPress: async () => {
          try {
            const batteryService = BatteryOptimizationService.getInstance();
            await batteryService.updateSettings({});
            await loadSettings();
            Alert.alert("成功", "設定已重設為預設值");
          } catch (error) {
            console.error("重設設定失敗:", error);
            Alert.alert("錯誤", "無法重設設定");
          }
        },
      },
    ]);
  };

  const updateSetting = <K extends keyof BatteryOptimizationSettings>(
    key: K,
    value: BatteryOptimizationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>效能設定</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本設定</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>啟用電池優化</Text>
            <Switch
              value={settings.enableBatteryOptimization}
              onValueChange={(value) =>
                updateSetting("enableBatteryOptimization", value)
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>前景更新間隔 (秒)</Text>
            <TextInput
              style={styles.input}
              value={(settings.foregroundUpdateInterval / 1000).toString()}
              onChangeText={(text) => {
                const value = parseInt(text) * 1000;
                if (!isNaN(value) && value > 0) {
                  updateSetting("foregroundUpdateInterval", value);
                }
              }}
              keyboardType="numeric"
              placeholder="10"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>背景更新間隔 (秒)</Text>
            <TextInput
              style={styles.input}
              value={(settings.backgroundUpdateInterval / 1000).toString()}
              onChangeText={(text) => {
                const value = parseInt(text) * 1000;
                if (!isNaN(value) && value > 0) {
                  updateSetting("backgroundUpdateInterval", value);
                }
              }}
              keyboardType="numeric"
              placeholder="30"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>距離閾值 (公尺)</Text>
            <TextInput
              style={styles.input}
              value={settings.distanceThreshold.toString()}
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value > 0) {
                  updateSetting("distanceThreshold", value);
                }
              }}
              keyboardType="numeric"
              placeholder="100"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>智慧功能</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>自適應精度</Text>
            <Switch
              value={settings.enableAdaptiveAccuracy}
              onValueChange={(value) =>
                updateSetting("enableAdaptiveAccuracy", value)
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>移動偵測</Text>
            <Switch
              value={settings.enableMotionDetection}
              onValueChange={(value) =>
                updateSetting("enableMotionDetection", value)
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>夜間模式</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>啟用夜間模式</Text>
            <Switch
              value={settings.enableNightMode}
              onValueChange={(value) => updateSetting("enableNightMode", value)}
            />
          </View>

          {settings.enableNightMode && (
            <>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>開始時間</Text>
                <TextInput
                  style={styles.input}
                  value={settings.nightModeStartHour.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text);
                    if (!isNaN(value) && value >= 0 && value <= 23) {
                      updateSetting("nightModeStartHour", value);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="22"
                />
                <Text style={styles.timeUnit}>時</Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>結束時間</Text>
                <TextInput
                  style={styles.input}
                  value={settings.nightModeEndHour.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text);
                    if (!isNaN(value) && value >= 0 && value <= 23) {
                      updateSetting("nightModeEndHour", value);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="6"
                />
                <Text style={styles.timeUnit}>時</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>說明</Text>
          <Text style={styles.description}>
            • 前景更新間隔：App 在前景運作時的位置更新頻率
          </Text>
          <Text style={styles.description}>
            • 背景更新間隔：App 在背景運作時的位置更新頻率
          </Text>
          <Text style={styles.description}>
            • 距離閾值：觸發危險路段警報的距離範圍
          </Text>
          <Text style={styles.description}>
            • 自適應精度：根據移動狀態自動調整定位精度
          </Text>
          <Text style={styles.description}>
            • 移動偵測：只在移動時發送通知以節省電力
          </Text>
          <Text style={styles.description}>
            • 夜間模式：在指定時間自動降低更新頻率
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>儲存設定</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToDefaults}
          >
            <Text style={styles.resetButtonText}>重設為預設值</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#2196F3",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingVertical: 5,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: "center",
    fontSize: 16,
  },
  timeUnit: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
