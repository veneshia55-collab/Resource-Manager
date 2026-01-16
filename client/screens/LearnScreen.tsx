import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ModuleCard } from "@/components/ModuleCard";
import { ContentBanner } from "@/components/ContentBanner";
import { EmptyState } from "@/components/EmptyState";
import { ModuleCardSkeleton } from "@/components/LoadingSkeleton";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/types/navigation";

const MODULES = [
  {
    id: "vocabulary",
    icon: "book" as const,
    title: "어휘 지원",
    description: "어려운 단어의 뜻과 쉬운 문장 번역을 제공합니다",
    screen: "ModuleVocabulary" as const,
  },
  {
    id: "summary",
    icon: "file-text" as const,
    title: "사실·요약적 이해",
    description: "콘텐츠를 요약하고 핵심 사실을 확인합니다",
    screen: "ModuleSummary" as const,
  },
  {
    id: "inference",
    icon: "zap" as const,
    title: "추론적 이해",
    description: "배경지식을 탐색하고 추론을 연습합니다",
    screen: "ModuleInference" as const,
  },
  {
    id: "critical",
    icon: "search" as const,
    title: "비판적 이해",
    description: "다양한 관점에서 토론하고 논박합니다",
    screen: "ModuleCritical" as const,
  },
  {
    id: "integration",
    icon: "git-branch" as const,
    title: "통합적 이해",
    description: "마인드맵으로 개념을 연결하고 정리합니다",
    screen: "ModuleIntegration" as const,
  },
  {
    id: "verification",
    icon: "shield" as const,
    title: "정보 안전성 검증",
    description: "정보의 신뢰도와 출처를 평가합니다",
    screen: "ModuleVerification" as const,
  },
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { activeContent, isLoading, records } = useContent();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const getModuleProgress = (moduleId: string) => {
    if (!activeContent) return 0;
    const moduleRecords = records.filter(
      (r) => r.tabName === moduleId && r.contentTitle === activeContent.title
    );
    return moduleRecords.length > 0 ? 100 : 0;
  };

  const handleAddContent = () => {
    navigation.navigate("ContentInput");
  };

  const handleModulePress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing.xl,
          },
        ]}
      >
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ paddingHorizontal: Spacing.lg }}>
            <ModuleCardSkeleton />
          </View>
        ))}
      </View>
    );
  }

  if (!activeContent) {
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
          image={require("../../assets/images/illustrations/empty-content.png")}
          title="학습할 콘텐츠가 없어요"
          description="미디어 콘텐츠를 추가하면 리버와 함께 미디어 리터러시를 학습할 수 있어요"
          actionLabel="콘텐츠 추가하기"
          onAction={handleAddContent}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={MODULES}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <ContentBanner content={activeContent} onPress={handleAddContent} />
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            학습 모듈
          </ThemedText>
        </>
      }
      renderItem={({ item }) => (
        <ModuleCard
          icon={item.icon}
          title={item.title}
          description={item.description}
          progress={getModuleProgress(item.id)}
          onPress={() => handleModulePress(item.screen)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
});
