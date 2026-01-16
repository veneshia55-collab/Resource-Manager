import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ActiveContent } from "@/lib/storage";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  news: "뉴스",
  youtube: "유튜브",
  shortform: "숏폼",
  sns: "SNS",
  community: "커뮤니티",
  ad: "광고",
};

interface ContentBannerProps {
  content: ActiveContent;
  onPress?: () => void;
}

export function ContentBanner({ content, onPress }: ContentBannerProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.banner,
        { backgroundColor: theme.link + "10", borderColor: theme.link + "30" },
      ]}
    >
      <View style={styles.iconContainer}>
        <Feather name="file-text" size={20} color={theme.link} />
      </View>
      <View style={styles.content}>
        <ThemedText type="small" style={{ color: theme.link }}>
          {CONTENT_TYPE_LABELS[content.type] || content.type}
        </ThemedText>
        <ThemedText type="body" numberOfLines={1} style={styles.title}>
          {content.title}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={18} color={theme.link} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    marginTop: Spacing.xs,
  },
});
