import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
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

interface CriticalResult {
  proArguments: { point: string; source: number }[];
  conArguments: { point: string; source: number }[];
  debate: { role: string; message: string }[];
  perspectives: { pro: string; con: string; neutral: string };
  ethicsPoints: string[];
  diversityScore: number;
  sources: { title: string; snippet: string; url?: string }[];
}

export default function ModuleCriticalScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { activeContent, addRecord } = useContent();

  const [claim, setClaim] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CriticalResult | null>(null);
  const startTime = React.useRef(Date.now());

  const handleAnalyze = async () => {
    if (!claim.trim()) {
      Alert.alert("알림", "주장을 입력해주세요.");
      return;
    }
    if (!activeContent) {
      Alert.alert("알림", "먼저 학습할 콘텐츠를 추가해주세요.");
      return;
    }

    setIsLoading(true);
    startTime.current = Date.now();

    try {
      const response = await apiRequest("POST", "/api/libu/critical", {
        claim: claim.trim(),
        contentTitle: activeContent.title,
        contentText: activeContent.text.substring(0, 3000),
      });
      const data = await response.json();
      setResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addRecord({
        id: generateId(),
        timestamp: new Date().toISOString(),
        tabName: "critical",
        contentTitle: activeContent.title,
        contentType: activeContent.type,
        inputs: { claim: claim.trim() },
        outputs: data,
        scores: { diversity: data.diversityScore || 50 },
        durationSec: Math.round((Date.now() - startTime.current) / 1000),
      });
    } catch (error) {
      console.error("Critical analysis error:", error);
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
            주장 입력
          </ThemedText>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            placeholder="예: AI가 만든 이미지는 저작권 침해가 아니다"
            placeholderTextColor={theme.textTertiary}
            value={claim}
            onChangeText={setClaim}
            multiline
            textAlignVertical="top"
          />
        </Card>

        {result ? (
          <>
            <ThemedText type="subheading" style={styles.sectionTitle}>
              찬반 근거 검색
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

            <View style={styles.argumentsRow}>
              <Card elevation={1} style={[styles.argumentCard, { marginRight: Spacing.sm }]}>
                <View style={styles.argumentHeader}>
                  <Feather name="thumbs-up" size={16} color={theme.success} />
                  <ThemedText type="subheading" style={{ marginLeft: Spacing.xs, color: theme.success }}>
                    찬성
                  </ThemedText>
                </View>
                {result.proArguments.map((arg, i) => (
                  <ThemedText key={i} type="small" style={styles.argumentItem}>
                    [{arg.source}] {arg.point}
                  </ThemedText>
                ))}
              </Card>

              <Card elevation={1} style={[styles.argumentCard, { marginLeft: Spacing.sm }]}>
                <View style={styles.argumentHeader}>
                  <Feather name="thumbs-down" size={16} color={theme.error} />
                  <ThemedText type="subheading" style={{ marginLeft: Spacing.xs, color: theme.error }}>
                    반대
                  </ThemedText>
                </View>
                {result.conArguments.map((arg, i) => (
                  <ThemedText key={i} type="small" style={styles.argumentItem}>
                    [{arg.source}] {arg.point}
                  </ThemedText>
                ))}
              </Card>
            </View>

            <ThemedText type="subheading" style={styles.sectionTitle}>
              AI 토론
            </ThemedText>
            {result.debate.map((turn, i) => (
              <LiBuResponse
                key={i}
                message={`${turn.role === "rebuttal" ? "반박:" : "재반박:"} ${turn.message}`}
              />
            ))}

            <Card elevation={1} style={styles.perspectiveCard}>
              <ThemedText type="subheading" style={styles.cardTitle}>
                관점 형성
              </ThemedText>
              <View style={styles.perspectiveItem}>
                <ThemedText type="small" style={{ color: theme.success, fontWeight: "600" }}>
                  찬성 관점
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {result.perspectives.pro}
                </ThemedText>
              </View>
              <View style={styles.perspectiveItem}>
                <ThemedText type="small" style={{ color: theme.error, fontWeight: "600" }}>
                  반대 관점
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {result.perspectives.con}
                </ThemedText>
              </View>
              <View style={styles.perspectiveItem}>
                <ThemedText type="small" style={{ color: theme.warning, fontWeight: "600" }}>
                  중립 관점
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {result.perspectives.neutral}
                </ThemedText>
              </View>
            </Card>

            <Card elevation={1} style={styles.ethicsCard}>
              <ThemedText type="subheading" style={styles.cardTitle}>
                정보 윤리 포인트
              </ThemedText>
              {result.ethicsPoints.map((point, i) => (
                <View key={i} style={styles.ethicsItem}>
                  <Feather name="alert-circle" size={14} color={theme.warning} />
                  <ThemedText type="small" style={[styles.ethicsText, { color: theme.textSecondary }]}>
                    {point}
                  </ThemedText>
                </View>
              ))}
            </Card>

            <Card elevation={1} style={styles.scoreCard}>
              <View style={styles.scoreContent}>
                <ScoreGauge
                  score={result.diversityScore}
                  size={100}
                  label="관점 다양성"
                />
                <View style={styles.scoreText}>
                  <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    {result.diversityScore >= 70
                      ? "다양한 관점을 고려했어요!"
                      : result.diversityScore >= 40
                        ? "다른 관점도 더 살펴보세요"
                        : "한쪽 관점에 치우쳐 있어요"}
                  </ThemedText>
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
          icon="message-square"
          label="토론 시작"
          onPress={handleAnalyze}
          loading={isLoading}
          disabled={!claim.trim()}
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
    height: 80,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  argumentsRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
  },
  argumentCard: {
    flex: 1,
  },
  argumentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  argumentItem: {
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  perspectiveCard: {
    marginTop: Spacing.lg,
  },
  perspectiveItem: {
    marginBottom: Spacing.md,
  },
  ethicsCard: {
    marginTop: Spacing.lg,
  },
  ethicsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  ethicsText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  scoreCard: {
    marginTop: Spacing.lg,
  },
  scoreContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    flex: 1,
    marginLeft: Spacing.xl,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    alignItems: "flex-end",
  },
});
