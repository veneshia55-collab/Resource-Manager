import React from "react";
import { StyleSheet, View, Pressable, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SourceCardProps {
  title: string;
  snippet: string;
  url?: string;
  index: number;
}

export function SourceCard({ title, snippet, url, index }: SourceCardProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <Pressable
      onPress={url ? handlePress : undefined}
      style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
    >
      <View style={[styles.indexBadge, { backgroundColor: theme.link }]}>
        <ThemedText type="small" style={{ color: "#FFFFFF" }}>
          {index}
        </ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText type="body" numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText
          type="small"
          numberOfLines={2}
          style={[styles.snippet, { color: theme.textSecondary }]}
        >
          {snippet}
        </ThemedText>
      </View>
      {url ? (
        <Feather name="external-link" size={16} color={theme.link} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  snippet: {},
});
