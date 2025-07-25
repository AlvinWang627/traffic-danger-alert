import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

interface PerformanceMonitorProps {
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
}) => {
  const {
    stats,
    isLoading,
    formatUpdateInterval,
    getPerformanceStatus,
    getPerformanceStatusColor,
  } = usePerformanceMonitor();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>載入效能統計...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>效能監控</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>更新頻率</Text>
          <Text style={styles.statValue}>
            {formatUpdateInterval(stats.currentUpdateInterval)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>效能模式</Text>
          <Text
            style={[styles.statValue, { color: getPerformanceStatusColor() }]}
          >
            {getPerformanceStatus()}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>總更新次數</Text>
          <Text style={styles.statValue}>{stats.totalLocationUpdates}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>電池優化</Text>
          <Text
            style={[
              styles.statValue,
              {
                color: stats.batteryOptimizationEnabled ? "#4CAF50" : "#F44336",
              },
            ]}
          >
            {stats.batteryOptimizationEnabled ? "已啟用" : "已停用"}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>詳細資訊</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>平均更新間隔：</Text>
            <Text style={styles.detailValue}>
              {stats.averageUpdateInterval > 0
                ? formatUpdateInterval(stats.averageUpdateInterval)
                : "無資料"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>最後更新時間：</Text>
            <Text style={styles.detailValue}>
              {new Date(stats.lastUpdateTime).toLocaleTimeString()}
            </Text>
          </View>

          {stats.isNightMode && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>夜間模式：</Text>
              <Text style={[styles.detailValue, { color: "#2196F3" }]}>
                已啟用
              </Text>
            </View>
          )}

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>效能提示：</Text>
            <Text style={styles.tipText}>
              • 前景運作時每10秒更新位置，背景運作時每30秒更新
            </Text>
            <Text style={styles.tipText}>
              • 夜間模式自動降低更新頻率以節省電池
            </Text>
            <Text style={styles.tipText}>• 靜止不動時自動增加更新間隔</Text>
            <Text style={styles.tipText}>
              • 移動時自動提高更新頻率以確保安全
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  tipsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: "#1976d2",
    marginBottom: 4,
    lineHeight: 16,
  },
});
