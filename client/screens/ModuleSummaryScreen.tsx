import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Alert } from "react-native";
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

interface SummaryResult {
  aiSummary: string;
  keyPoints: string[];
  comparison: {
    common: string[];
    missing: string[];
    potential_issues: string[];
  };
  checkList: string[];
  gapScore: number;
  sources: { title: string; snippet: string; url?: string }[];
}

export default function ModuleSummaryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { activeContent, addRecord } = useContent();

  const [userSummary, setUserSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const startTime = React.useRef(Date.now());

  const handleAnalyze = async () => {
    if (!userSummary.trim()) {
      Alert.alert("알림", "콘텐츠 요약을 입력해주세요.");
      return;
    }
    if (!activeContent) {
      Alert.alert("알림", "먼저 학습할 콘텐츠를 추가해주세요.");
      return;
    }

    setIsLoading(true);
    startTime.current = Date.now();

    try {
      const response = await apiRequest("POST", "/api/libu/summary", {
        userSummary: userSummary.trim(),
        contentTitle: activeContent.title,
        contentText: activeContent.text.substring(0, 3000),
      });
      const data = await response.json();
      setResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addRecord({
        id: generateId(),
        timestamp: new Date().toISOString(),
        tabName: "summary",
        contentTitle: activeContent.title,
        contentType: activeContent.type,
        inputs: { userSummary: userSummary.trim() },
        outputs: data,
        scores: { gapScore: 100 - (data.gapScore || 0) },
        durationSec: Math.round((Date.now() - startTime.current) / 1000),
      });
    } catch (error) {
      console.error("Summary analysis error:", error);
      Alert.alert("오류", "분석 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
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
        <Card elevation={1} style={styles.inputCard}>
          <ThemedText type="subheading" style={styles.cardTitle}>
            콘텐츠 요약 입력
          </ThemedText>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            placeholder="이 콘텐츠의 핵심 내용을 요약해보세요..."
            placeholderTextColor={theme.textTertiary}
            value={userSummary}
            onChangeText={setUserSummary}
            multiline
            textAlignVertical="top"
          />
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

            <ThemedText type="subheading" style={styles.sectionTitle}>
              리버의 분석
            </ThemedText>
            <LiBuResponse message="너의 요약과 AI 요약을 비교해볼게!">
              <View style={styles.summaryBox}>
                <ThemedText type="small" style={{ color: theme.link, marginBottom: 4 }}>
                  AI 요약
                </ThemedText>
                <ThemedText type="body">{result.aiSummary}</ThemedText>
              </View>
            </LiBuResponse>

            <Card elevation={1} style={styles.comparisonCard}>
              <ThemedText type="subheading" style={styles.cardTitle}>
                요약 비교
              </ThemedText>

              <View style={styles.comparisonSection}>
                <ThemedText type="body" style={[styles.comparisonLabel, { color: theme.success }]}>
                  공통점
                </ThemedText>
                {result.comparison.common.map((item, i) => (
                  <ThemedText key={i} type="small" style={styles.bulletItem}>
                    {item}
                  </ThemedText>
                ))}
              </View>

              <View style={styles.comparisonSection}>
                <ThemedText type="body" style={[styles.comparisonLabel, { color: theme.warning }]}>
                  누락된 내용
                </ThemedText>
                {result.comparison.missing.map((item, i) => (
                  <ThemedText key={i} type="small" style={styles.bulletItem}>
                    {item}
                  </ThemedText>
                ))}
              </View>

              <View style={styles.comparisonSection}>
                <ThemedText type="body" style={[styles.comparisonLabel, { color: theme.error }]}>
                  왜곡 가능성
                </ThemedText>
                {result.comparison.potential_issues.map((item, i) => (
                  <ThemedText key={i} type="small" style={styles.bulletItem}>
                    {item}
                  </ThemedText>
                ))}
              </View>
            </Card>

            <Card elevation={1} style={styles.scoreCard}>
              <View style={styles.scoreContent}>
                <ScoreGauge
                  score={100 - result.gapScore}
                  size={100}
                  label="요약 정확도"
                />
                <View style={styles.checklistContainer}>
                  <ThemedText type="subheading" style={styles.cardTitle}>
                    교정 체크리스트
                  </ThemedText>
                  {result.checkList.map((item, i) => (
                    <View key={i} style={styles.checkItem}>
                      <View style={[styles.checkBox, { borderColor: theme.border }]} />
                      <ThemedText type="small" style={styles.checkText}>
                        {item}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
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
          icon="check-circle"
          label="분석 실행"
          onPress={handleAnalyze}
          loading={isLoading}
          disabled={!userSummary.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 120,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  summaryBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: BorderRadius.xs,
  },
  comparisonCard: {
    marginTop: Spacing.lg,
  },
  comparisonSection: {
    marginBottom: Spacing.md,
  },
  comparisonLabel: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  bulletItem: {
    paddingLeft: Spacing.md,
    marginBottom: Spacing.xs,
  },
  scoreCard: {
    marginTop: Spacing.lg,
  },
  scoreContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checklistContainer: {
    flex: 1,
    marginLeft: Spacing.xl,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  checkBox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  checkText: {
    flex: 1,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    alignItems: "flex-end",
  },
});
