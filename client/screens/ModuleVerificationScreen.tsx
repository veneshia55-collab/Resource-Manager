import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { SourceCard } from "@/components/SourceCard";
import { LiBuResponse } from "@/components/LiBuResponse";
import { ScoreGauge } from "@/components/ScoreGauge";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { generateId } from "@/lib/storage";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface VerificationResult {
  scores: {
    sourceClarity: number;
    expertise: number;
    accuracy: number;
    expandability: number;
  };
  explanations: {
    sourceClarity: string;
    expertise: string;
    accuracy: string;
    expandability: string;
  };
  totalScore: number;
  improvements: string[];
  sources: { title: string; snippet: string; url?: string }[];
}

const SCORE_LABELS = {
  sourceClarity: "출처 명확성",
  expertise: "전문성",
  accuracy: "정보 정확성",
  expandability: "확장 가능성",
};

export default function ModuleVerificationScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { activeContent, addRecord } = useContent();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const startTime = React.useRef(Date.now());

  const handleVerify = async () => {
    if (!activeContent) {
      Alert.alert("알림", "먼저 학습할 콘텐츠를 추가해주세요.");
      return;
    }

    setIsLoading(true);
    startTime.current = Date.now();

    try {
      const response = await apiRequest("POST", "/api/libu/verification", {
        contentTitle: activeContent.title,
        contentText: activeContent.text.substring(0, 3000),
        contentUrl: activeContent.url,
      });
      const data = await response.json();
      setResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addRecord({
        id: generateId(),
        timestamp: new Date().toISOString(),
        tabName: "verification",
        contentTitle: activeContent.title,
        contentType: activeContent.type,
        inputs: {},
        outputs: data,
        scores: { total: data.totalScore, ...data.scores },
        durationSec: Math.round((Date.now() - startTime.current) / 1000),
      });
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("오류", "검증 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return theme.success;
    if (score >= 40) return theme.warning;
    return theme.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: 100,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Card elevation={1} style={styles.infoCard}>
          <ThemedText type="subheading" style={styles.cardTitle}>
            평가 대상
          </ThemedText>
          <ThemedText type="body">
            {activeContent?.title || "콘텐츠가 선택되지 않았어요"}
          </ThemedText>
          {activeContent?.url ? (
            <ThemedText type="small" style={{ color: theme.link, marginTop: Spacing.xs }}>
              {activeContent.url}
            </ThemedText>
          ) : null}
        </Card>

        {result ? (
          <>
            <ThemedText type="subheading" style={styles.sectionTitle}>
              검색 결과
            </ThemedText>
            {result.sources.map((source, index) => (
              <SourceCard
                key={index}
                title={source.title}
                snippet={source.snippet}
                url={source.url}
                index={index + 1}
              />
            ))}

            <Card elevation={1} style={styles.totalCard}>
              <View style={styles.totalContent}>
                <ScoreGauge
                  score={result.totalScore}
                  size={120}
                  label="정보 안전성 점수"
                />
                <View style={styles.totalText}>
                  <ThemedText type="h4" style={{ color: getScoreColor(result.totalScore) }}>
                    {result.totalScore >= 70
                      ? "신뢰할 수 있어요"
                      : result.totalScore >= 40
                        ? "주의가 필요해요"
                        : "신뢰도가 낮아요"}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                    더 자세한 항목별 분석을 확인해보세요
                  </ThemedText>
                </View>
              </View>
            </Card>

            <ThemedText type="subheading" style={styles.sectionTitle}>
              항목별 점수
            </ThemedText>
            {(Object.keys(result.scores) as (keyof typeof result.scores)[]).map((key) => (
              <Card key={key} elevation={1} style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {SCORE_LABELS[key]}
                  </ThemedText>
                  <ThemedText
                    type="body"
                    style={{ color: getScoreColor(result.scores[key]), fontWeight: "600" }}
                  >
                    {result.scores[key]}점
                  </ThemedText>
                </View>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      {
                        backgroundColor: getScoreColor(result.scores[key]),
                        width: `${result.scores[key]}%`,
                      },
                    ]}
                  />
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {result.explanations[key]}
                </ThemedText>
              </Card>
            ))}

            <ThemedText type="subheading" style={styles.sectionTitle}>
              리버의 가이드
            </ThemedText>
            <LiBuResponse message="정보의 신뢰도를 높이려면 이렇게 해봐!">
              {result.improvements.map((item, i) => (
                <View key={i} style={styles.improvementItem}>
                  <View style={[styles.improvementBadge, { backgroundColor: theme.link }]}>
                    <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                      {i + 1}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={styles.improvementText}>
                    {item}
                  </ThemedText>
                </View>
              ))}
            </LiBuResponse>
          </>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.fabContainer,
          { bottom: insets.bottom + Spacing.lg },
        ]}
      >
        <FloatingActionButton
          icon="shield"
          label="검증 실행"
          onPress={handleVerify}
          loading={isLoading}
          disabled={!activeContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  totalCard: {
    marginTop: Spacing.lg,
  },
  totalContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalText: {
    flex: 1,
    marginLeft: Spacing.xl,
  },
  scoreCard: {
    marginBottom: Spacing.md,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  scoreBar: {
    height: 8,
    backgroundColor: "#E4E7EB",
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  improvementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.md,
  },
  improvementBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  improvementText: {
    flex: 1,
    lineHeight: 20,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    alignItems: "flex-end",
  },
});
