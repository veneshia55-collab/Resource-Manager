import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { SourceCard } from "@/components/SourceCard";
import { LiBuResponse } from "@/components/LiBuResponse";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { generateId } from "@/lib/storage";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface VocabResult {
  word: string;
  synonyms: string[];
  definition: string;
  easyExplanation: string;
  difficulty: number;
  sources: { title: string; snippet: string; url?: string }[];
  quiz: { question: string; answer: boolean; explanation: string };
}

export default function ModuleVocabularyScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { activeContent, addRecord } = useContent();
  const navigation = useNavigation();

  const [words, setWords] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VocabResult | null>(null);
  const startTime = React.useRef(Date.now());

  const handleSearch = async () => {
    if (!words.trim()) {
      Alert.alert("알림", "분석할 단어를 입력해주세요.");
      return;
    }
    if (!activeContent) {
      Alert.alert("알림", "먼저 학습할 콘텐츠를 추가해주세요.");
      return;
    }

    setIsLoading(true);
    startTime.current = Date.now();

    try {
      const response = await apiRequest("POST", "/api/libu/vocabulary", {
        words: words.trim(),
        contentTitle: activeContent.title,
        contentText: activeContent.text.substring(0, 2000),
      });
      const data = await response.json();
      setResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addRecord({
        id: generateId(),
        timestamp: new Date().toISOString(),
        tabName: "vocabulary",
        contentTitle: activeContent.title,
        contentType: activeContent.type,
        inputs: { words: words.trim() },
        outputs: data,
        scores: { difficulty: data.difficulty || 50 },
        durationSec: Math.round((Date.now() - startTime.current) / 1000),
      });
    } catch (error) {
      console.error("Vocabulary search error:", error);
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
            어려운 단어 입력
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            placeholder="예: 인고, 저작권, 미학적"
            placeholderTextColor={theme.textTertiary}
            value={words}
            onChangeText={setWords}
          />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            쉼표로 구분하여 여러 단어를 입력할 수 있어요
          </ThemedText>
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
              리버의 답변
            </ThemedText>
            <LiBuResponse
              message={`"${result.word}"에 대해 알려줄게!`}
            >
              <View style={styles.stepContainer}>
                <View style={[styles.stepBadge, { backgroundColor: theme.link }]}>
                  <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                    STEP 1
                  </ThemedText>
                </View>
                <ThemedText type="body" style={styles.stepContent}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    동의어 힌트:{" "}
                  </ThemedText>
                  {result.synonyms.join(", ")}
                </ThemedText>
              </View>

              <View style={styles.stepContainer}>
                <View style={[styles.stepBadge, { backgroundColor: theme.link }]}>
                  <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                    STEP 2
                  </ThemedText>
                </View>
                <ThemedText type="body" style={styles.stepContent}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    사전적 의미:{" "}
                  </ThemedText>
                  {result.definition}
                </ThemedText>
              </View>

              <View style={styles.stepContainer}>
                <View style={[styles.stepBadge, { backgroundColor: theme.link }]}>
                  <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                    STEP 3
                  </ThemedText>
                </View>
                <ThemedText type="body" style={styles.stepContent}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    쉬운 문장:{" "}
                  </ThemedText>
                  {result.easyExplanation}
                </ThemedText>
              </View>
            </LiBuResponse>

            <Card elevation={1} style={styles.quizCard}>
              <ThemedText type="subheading" style={styles.cardTitle}>
                오늘의 단어 OX 퀴즈
              </ThemedText>
              <ThemedText type="body" style={styles.quizQuestion}>
                {result.quiz.question}
              </ThemedText>
              <View style={styles.quizAnswer}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  정답: {result.quiz.answer ? "O" : "X"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {result.quiz.explanation}
                </ThemedText>
              </View>
            </Card>

            <Card elevation={1} style={styles.difficultyCard}>
              <ThemedText type="subheading" style={styles.cardTitle}>
                단어 난이도
              </ThemedText>
              <View style={styles.difficultyBar}>
                <View
                  style={[
                    styles.difficultyFill,
                    {
                      backgroundColor:
                        result.difficulty >= 70
                          ? theme.error
                          : result.difficulty >= 40
                            ? theme.warning
                            : theme.success,
                      width: `${result.difficulty}%`,
                    },
                  ]}
                />
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {result.difficulty >= 70
                  ? "어려운 단어예요"
                  : result.difficulty >= 40
                    ? "중간 난이도 단어예요"
                    : "쉬운 단어예요"}
              </ThemedText>
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
          icon="search"
          label="검색 실행"
          onPress={handleSearch}
          loading={isLoading}
          disabled={!words.trim()}
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
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stepContainer: {
    marginTop: Spacing.md,
  },
  stepBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  stepContent: {
    lineHeight: 24,
  },
  quizCard: {
    marginTop: Spacing.lg,
  },
  quizQuestion: {
    marginBottom: Spacing.md,
    fontWeight: "500",
  },
  quizAnswer: {
    padding: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: BorderRadius.xs,
  },
  difficultyCard: {
    marginTop: Spacing.lg,
  },
  difficultyBar: {
    height: 8,
    backgroundColor: "#E4E7EB",
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  difficultyFill: {
    height: "100%",
    borderRadius: 4,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    alignItems: "flex-end",
  },
});
