import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PerformanceMonitor } from "../components/PerformanceMonitor";

export default function PerformanceDetailsScreen() {
  const router = useRouter();

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
          <Text style={styles.title}>效能監控</Text>
        </View>

        <View style={styles.content}>
          <PerformanceMonitor showDetails={true} />

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>效能說明</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>更新頻率策略</Text>
              <Text style={styles.infoText}>
                • 前景運作：每10秒更新一次位置，確保即時性
              </Text>
              <Text style={styles.infoText}>
                • 背景運作：每30秒更新一次位置，節省電池
              </Text>
              <Text style={styles.infoText}>
                • 夜間模式：自動降低更新頻率至1-2分鐘
              </Text>
              <Text style={styles.infoText}>
                • 靜止偵測：當檢測到靜止時，延長更新間隔
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>電池優化功能</Text>
              <Text style={styles.infoText}>
                • 自適應精度：根據移動狀態調整GPS精度
              </Text>
              <Text style={styles.infoText}>
                • 移動偵測：只在移動時發送通知
              </Text>
              <Text style={styles.infoText}>
                • 智慧間隔：根據時間和活動模式調整更新頻率
              </Text>
              <Text style={styles.infoText}>
                • 背景限制：在背景運作時使用更保守的設定
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>效能模式</Text>
              <Text style={styles.infoText}>
                • 高頻率：更新間隔 ≤ 10秒，適合行車時使用
              </Text>
              <Text style={styles.infoText}>
                • 標準：更新間隔 10-30秒，平衡效能與電池
              </Text>
              <Text style={styles.infoText}>
                • 節能模式：更新間隔 > 30秒，最大化電池壽命
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/performance-settings")}
          >
            <Text style={styles.settingsButtonText}>調整效能設定</Text>
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
  content: {
    padding: 20,
  },
  infoSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  settingsButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  settingsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 