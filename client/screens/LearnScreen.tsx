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
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/types/navigation";

const libuAvatar = require("../../assets/images/illustrations/libu-avatar.png");

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
      <Image source={libuAvatar} style={styles.mascotImage} resizeMode="contain" />
      <View style={styles.speechBubble}>
        <ThemedText type="defaultSemiBold" style={{ color: Colors.primary }}>
          안녕! 나는 리버야
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
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
        <MascotHeader />
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
      <ContentBanner content={activeContent} onPress={handleAddContent} />
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
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  mascotContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  mascotImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  speechBubble: {
    flex: 1,
    marginLeft: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: Spacing.md,
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
