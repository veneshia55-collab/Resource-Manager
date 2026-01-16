import React from "react";
import { View, StyleSheet, Image, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ContentBanner } from "@/components/ContentBanner";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/types/navigation";

const libuMascot = require("../../assets/images/libu-mascot.png");

const MODULES: {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  screen: keyof RootStackParamList;
}[] = [
  { id: "vocabulary", icon: "book", title: "어휘", screen: "ModuleVocabulary" },
  { id: "summary", icon: "file-text", title: "요약", screen: "ModuleSummary" },
  { id: "inference", icon: "zap", title: "추론", screen: "ModuleInference" },
  { id: "critical", icon: "search", title: "비판", screen: "ModuleCritical" },
  { id: "integration", icon: "git-branch", title: "통합", screen: "ModuleIntegration" },
  { id: "verification", icon: "shield", title: "검증", screen: "ModuleVerification" },
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { activeContent, isLoading } = useContent();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleAddContent = () => {
    navigation.navigate("ContentInput");
  };

  const handleModulePress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  const MascotHeader = () => (
    <View style={styles.mascotContainer}>
      <View style={styles.mascotImageWrapper}>
        <Image source={libuMascot} style={styles.mascotImage} resizeMode="contain" />
      </View>
      <View style={styles.speechBubble}>
        <ThemedText type="defaultSemiBold" style={{ color: Colors.primary, textAlign: "center" }}>
          안녕! 나는 리버야
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4, textAlign: "center" }}>
          {activeContent
            ? "함께 미디어를 분석해볼까요?"
            : "미디어 콘텐츠를 추가하고 시작해요!"}
        </ThemedText>
      </View>
    </View>
  );

  const renderModuleIcon = (item: typeof MODULES[0]) => (
    <Pressable
      key={item.id}
      style={[styles.moduleIconContainer, { backgroundColor: theme.backgroundDefault }]}
      onPress={() => handleModulePress(item.screen)}
      testID={`module-${item.id}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight }]}>
        <Feather name={item.icon} size={24} color={Colors.primary} />
      </View>
      <ThemedText type="small" style={[styles.iconLabel, { color: theme.text }]}>
        {item.title}
      </ThemedText>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight + Spacing.xl },
        ]}
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <MascotHeader />
      {activeContent ? (
        <ContentBanner content={activeContent} onPress={handleAddContent} />
      ) : (
        <Pressable
          style={[styles.addContentBanner, { backgroundColor: Colors.primaryLight }]}
          onPress={handleAddContent}
        >
          <Feather name="plus-circle" size={24} color={Colors.primary} />
          <View style={styles.addContentText}>
            <ThemedText type="defaultSemiBold" style={{ color: Colors.primary }}>
              콘텐츠 추가하기
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              미디어 콘텐츠를 추가해서 학습을 시작하세요
            </ThemedText>
          </View>
        </Pressable>
      )}
      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        학습 모듈
      </ThemedText>
      <View style={styles.moduleGrid}>
        {MODULES.map(renderModuleIcon)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBubbleContainer: {
    alignItems: "center",
  },
  emptyBubble: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing["2xl"],
    alignItems: "center",
    maxWidth: "80%",
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.primaryLight,
    marginTop: -1,
  },
  addContentBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  addContentText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  mascotContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  mascotImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  mascotImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  speechBubble: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    maxWidth: "90%",
  },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  moduleIconContainer: {
    width: "30%",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  iconLabel: {
    fontWeight: "500",
    textAlign: "center",
  },
});
