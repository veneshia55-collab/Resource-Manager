import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const PRACTICE_ITEMS = [
  {
    id: "quiz",
    icon: "help-circle" as const,
    title: "오늘의 어휘 퀴즈",
    description: "학습한 어휘를 복습해요",
    available: true,
  },
  {
    id: "fact-check",
    icon: "check-circle" as const,
    title: "팩트체크 연습",
    description: "정보의 사실 여부를 판단해요",
    available: false,
  },
  {
    id: "debate",
    icon: "message-square" as const,
    title: "토론 연습",
    description: "다양한 주제로 토론해요",
    available: false,
  },
];

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { records } = useContent();

  const vocabRecords = records.filter((r) => r.tabName === "vocabulary");
  const hasVocabData = vocabRecords.length > 0;

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
        연습 활동
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.subtitle, { color: theme.textSecondary }]}
      >
        학습한 내용을 복습하고 연습해요
      </ThemedText>

      {PRACTICE_ITEMS.map((item) => {
        const isDisabled = item.id === "quiz" ? !hasVocabData : !item.available;

        return (
          <Card
            key={item.id}
            elevation={1}
            style={[styles.card, { opacity: isDisabled ? 0.5 : 1 }]}
          >
            <View style={styles.cardContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.link + "15" },
                ]}
              >
                <Feather name={item.icon} size={24} color={theme.link} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText type="subheading">{item.title}</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {item.description}
                </ThemedText>
              </View>
              {isDisabled ? (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textTertiary }}
                  >
                    준비중
                  </ThemedText>
                </View>
              ) : (
                <Feather
                  name="chevron-right"
                  size={20}
                  color={theme.textTertiary}
                />
              )}
            </View>
          </Card>
        );
      })}

      <View style={[styles.statsContainer, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="subheading" style={styles.statsTitle}>
          학습 통계
        </ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.link }}>
              {vocabRecords.length}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              어휘 학습
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.link }}>
              {records.length}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              전체 활동
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing["2xl"],
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statsContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  statsTitle: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
});
