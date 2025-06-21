import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const [alertDistance, setAlertDistance] = useState(100);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
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
  settingLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  settingValue: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
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
