import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Alert, Linking } from "react-native";
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

interface InferenceResult {
  questions: string[];
  backgroundCards: { title: string; explanation: string }[];
  additionalLinks: { title: string; url: string }[];
  confidenceScore: number;
  sources: { title: string; snippet: string; url?: string }[];
}

export default function ModuleInferenceScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { activeContent, addRecord } = useContent();

  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const startTime = React.useRef(Date.now());

  const handleAnalyze = async () => {
    if (!interpretation.trim()) {
      Alert.alert("알림", "해석이나 추론을 입력해주세요.");
      return;
    }
    if (!activeContent) {
      Alert.alert("알림", "먼저 학습할 콘텐츠를 추가해주세요.");
      return;
    }

    setIsLoading(true);
    startTime.current = Date.now();

    try {
      const response = await apiRequest("POST", "/api/libu/inference", {
        interpretation: interpretation.trim(),
        contentTitle: activeContent.title,
        contentText: activeContent.text.substring(0, 3000),
      });
      const data = await response.json();
      setResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addRecord({
        id: generateId(),
        timestamp: new Date().toISOString(),
        tabName: "inference",
        contentTitle: activeContent.title,
        contentType: activeContent.type,
        inputs: { interpretation: interpretation.trim() },
        outputs: data,
        scores: { confidence: data.confidenceScore || 50 },
        durationSec: Math.round((Date.now() - startTime.current) / 1000),
      });
    } catch (error) {
      console.error("Inference analysis error:", error);
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
            해석/추론 입력
          </ThemedText>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            placeholder="이 콘텐츠를 보고 어떤 생각이 들었나요?"
            placeholderTextColor={theme.textTertiary}
            value={interpretation}
            onChangeText={setInterpretation}
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
              리버의 질문
            </ThemedText>
            <LiBuResponse message="네 추론을 더 깊게 생각해볼 수 있는 질문이야!">
              {result.questions.map((q, i) => (
                <View key={i} style={styles.questionItem}>
                  <View style={[styles.questionBadge, { backgroundColor: theme.link }]}>
                    <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                      {i + 1}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={styles.questionText}>
                    {q}
                  </ThemedText>
                </View>
              ))}
            </LiBuResponse>

            <ThemedText type="subheading" style={styles.sectionTitle}>
              배경지식 카드
            </ThemedText>
            {result.backgroundCards.map((card, i) => (
              <Card key={i} elevation={1} style={styles.bgCard}>
                <ThemedText type="subheading" style={{ marginBottom: Spacing.sm }}>
                  {card.title}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {card.explanation}
                </ThemedText>
              </Card>
            ))}

            <Card elevation={1} style={styles.linksCard}>
              <ThemedText type="subheading" style={styles.cardTitle}>
                추가 정보 링크
              </ThemedText>
              {result.additionalLinks.map((link, i) => (
                <View
                  key={i}
                  style={styles.linkItem}
                >
                  <Feather name="external-link" size={16} color={theme.link} />
                  <ThemedText
                    type="body"
                    style={[styles.linkText, { color: theme.link }]}
                    onPress={() => Linking.openURL(link.url)}
                  >
                    {link.title}
                  </ThemedText>
                </View>
              ))}
            </Card>

            <Card elevation={1} style={styles.scoreCard}>
              <View style={styles.scoreContent}>
                <ScoreGauge
                  score={result.confidenceScore}
                  size={100}
                  label="추론 근거 충실도"
                />
                <View style={styles.scoreText}>
                  <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    {result.confidenceScore >= 70
                      ? "추론의 근거가 충실해요!"
                      : result.confidenceScore >= 40
                        ? "조금 더 배경지식을 확인해보세요"
                        : "추론을 뒷받침할 근거가 더 필요해요"}
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
          icon="zap"
          label="분석 실행"
          onPress={handleAnalyze}
          loading={isLoading}
          disabled={!interpretation.trim()}
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
    height: 100,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  questionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.md,
  },
  questionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  questionText: {
    flex: 1,
    lineHeight: 22,
  },
  bgCard: {
    marginBottom: Spacing.md,
  },
  linksCard: {
    marginTop: Spacing.md,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  linkText: {
    marginLeft: Spacing.sm,
    textDecorationLine: "underline",
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
