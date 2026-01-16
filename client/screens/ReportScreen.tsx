import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ScoreGauge } from "@/components/ScoreGauge";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const DIMENSIONS = [
  { key: "vocabulary", label: "어휘력" },
  { key: "summary", label: "요약" },
  { key: "inference", label: "추론" },
  { key: "critical", label: "비판" },
  { key: "integration", label: "통합" },
  { key: "verification", label: "검증" },
];

function RadarChart({
  data,
  theme,
}: {
  data: number[];
  theme: any;
}) {
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = data.map((value, i) => getPoint(value, i));
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");

  const gridLevels = [25, 50, 75, 100];

  return (
    <Svg width={size} height={size}>
      {gridLevels.map((level) => {
        const gridPoints = DIMENSIONS.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (level / 100) * radius;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(" ");
        return (
          <Polygon
            key={level}
            points={gridPoints}
            fill="none"
            stroke={theme.border}
            strokeWidth={1}
          />
        );
      })}

      {DIMENSIONS.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const endX = center + radius * Math.cos(angle);
        const endY = center + radius * Math.sin(angle);
        return (
          <Line
            key={i}
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke={theme.border}
            strokeWidth={1}
          />
        );
      })}

      <Polygon
        points={pointsString}
        fill={theme.link + "30"}
        stroke={theme.link}
        strokeWidth={2}
      />

      {points.map((point, i) => (
        <Circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={4}
          fill={theme.link}
        />
      ))}

      {DIMENSIONS.map((dim, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const labelRadius = radius + 25;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        return (
          <SvgText
            key={i}
            x={x}
            y={y}
            fontSize={11}
            fill={theme.textSecondary}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {dim.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { records, clearRecords } = useContent();

  const scores = useMemo(() => {
    const scoresByModule: Record<string, number[]> = {};

    records.forEach((record) => {
      const module = record.tabName;
      if (!scoresByModule[module]) {
        scoresByModule[module] = [];
      }
      const avgScore = Object.values(record.scores).reduce((a, b) => a + b, 0) /
        Math.max(Object.keys(record.scores).length, 1);
      scoresByModule[module].push(avgScore);
    });

    return DIMENSIONS.map((dim) => {
      const moduleScores = scoresByModule[dim.key] || [];
      if (moduleScores.length === 0) return 0;
      return Math.round(
        moduleScores.reduce((a, b) => a + b, 0) / moduleScores.length
      );
    });
  }, [records]);

  const overallScore = useMemo(() => {
    const nonZeroScores = scores.filter((s) => s > 0);
    if (nonZeroScores.length === 0) return 0;
    return Math.round(
      nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length
    );
  }, [scores]);

  const handleClearRecords = () => {
    Alert.alert(
      "기록 초기화",
      "모든 학습 기록이 삭제됩니다. 계속하시겠어요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "초기화",
          style: "destructive",
          onPress: async () => {
            await clearRecords();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  if (records.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight,
            paddingBottom: tabBarHeight,
          },
        ]}
      >
        <EmptyState
          image={require("../../assets/images/illustrations/empty-records.png")}
          title="아직 학습 기록이 없어요"
          description="학습 모듈을 완료하면 여기에서 진단 리포트를 확인할 수 있어요"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <ThemedText type="h4" style={styles.title}>
        학습 진단 리포트
      </ThemedText>

      <Card elevation={1} style={styles.overallCard}>
        <View style={styles.overallContent}>
          <ScoreGauge score={overallScore} size={120} label="종합 점수" />
          <View style={styles.overallText}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              총 {records.length}개의 학습 활동을 완료했어요
            </ThemedText>
            <ThemedText
              type="subheading"
              style={{ marginTop: Spacing.sm, color: theme.link }}
            >
              {overallScore >= 70
                ? "매우 우수해요!"
                : overallScore >= 40
                  ? "잘하고 있어요!"
                  : "조금 더 연습해볼까요?"}
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card elevation={1} style={styles.radarCard}>
        <ThemedText type="subheading" style={styles.cardTitle}>
          역량별 진단
        </ThemedText>
        <View style={styles.radarContainer}>
          <RadarChart data={scores} theme={theme} />
        </View>
      </Card>

      <Card elevation={1} style={styles.detailCard}>
        <ThemedText type="subheading" style={styles.cardTitle}>
          상세 점수
        </ThemedText>
        {DIMENSIONS.map((dim, index) => (
          <View key={dim.key} style={styles.scoreRow}>
            <ThemedText type="body">{dim.label}</ThemedText>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    backgroundColor:
                      scores[index] >= 70
                        ? theme.success
                        : scores[index] >= 40
                          ? theme.warning
                          : theme.error,
                    width: `${scores[index]}%`,
                  },
                ]}
              />
            </View>
            <ThemedText
              type="body"
              style={[styles.scoreValue, { color: theme.textSecondary }]}
            >
              {scores[index]}
            </ThemedText>
          </View>
        ))}
      </Card>

      <Button onPress={handleClearRecords} style={styles.clearButton}>
        기록 초기화
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xl,
  },
  overallCard: {
    marginBottom: Spacing.lg,
  },
  overallContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  overallText: {
    flex: 1,
    marginLeft: Spacing.xl,
  },
  radarCard: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  cardTitle: {
    marginBottom: Spacing.lg,
    alignSelf: "flex-start",
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  detailCard: {
    marginBottom: Spacing.xl,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E4E7EB",
    borderRadius: 4,
    marginHorizontal: Spacing.md,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreValue: {
    width: 30,
    textAlign: "right",
  },
  clearButton: {
    backgroundColor: "#FF6B6B",
  },
});
