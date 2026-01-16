import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { getLibrary, removeFromLibrary, LibraryItem } from "@/lib/storage";
import { Spacing, BorderRadius } from "@/constants/theme";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  news: "뉴스",
  youtube: "유튜브",
  shortform: "숏폼",
  sns: "SNS",
  community: "커뮤니티",
  ad: "광고",
};

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLibrary = async () => {
    setIsLoading(true);
    const items = await getLibrary();
    setLibrary(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleDelete = (item: LibraryItem) => {
    Alert.alert(
      "삭제",
      `"${item.content.title}"을(를) 삭제하시겠어요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            await removeFromLibrary(item.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadLibrary();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isLoading && library.length === 0) {
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
          title="저장된 콘텐츠가 없어요"
          description="학습을 완료한 콘텐츠가 여기에 저장됩니다"
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
      data={library}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ThemedText type="h4" style={styles.title}>
          자료실
        </ThemedText>
      }
      renderItem={({ item }) => (
        <Card elevation={1} style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: theme.link + "15" },
              ]}
            >
              <ThemedText type="caption" style={{ color: theme.link }}>
                {CONTENT_TYPE_LABELS[item.content.type] || item.content.type}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => handleDelete(item)}
              hitSlop={8}
              style={[styles.deleteButton, { backgroundColor: theme.error + "15" }]}
            >
              <Feather name="trash-2" size={18} color={theme.error} />
            </Pressable>
          </View>
          <ThemedText type="subheading" style={styles.cardTitle}>
            {item.content.title}
          </ThemedText>
          <ThemedText
            type="small"
            numberOfLines={2}
            style={[styles.preview, { color: theme.textSecondary }]}
          >
            {item.content.text.substring(0, 100)}...
          </ThemedText>
          <View style={styles.cardFooter}>
            <ThemedText type="caption" style={{ color: theme.textTertiary }}>
              {formatDate(item.savedAt)}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textTertiary }}>
              {item.records.length}개 활동
            </ThemedText>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  preview: {
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
