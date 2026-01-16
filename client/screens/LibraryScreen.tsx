import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { getLibrary, removeFromLibrary, LibraryItem } from "@/lib/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/types/navigation";

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadLibrary = async () => {
    setIsLoading(true);
    const items = await getLibrary();
    setLibrary(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const toggleEditMode = () => {
    if (isEditMode) {
      setSelectedIds(new Set());
    }
    setIsEditMode(!isEditMode);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    Haptics.selectionAsync();
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      "삭제",
      `선택한 ${selectedIds.size}개 항목을 삭제하시겠어요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            for (const id of selectedIds) {
              await removeFromLibrary(id);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSelectedIds(new Set());
            setIsEditMode(false);
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
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl + (isEditMode ? 70 : 0),
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={library}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <ThemedText type="h4">자료실</ThemedText>
            <Pressable onPress={toggleEditMode} hitSlop={8}>
              <ThemedText
                type="defaultSemiBold"
                style={{ color: Colors.primary }}
              >
                {isEditMode ? "완료" : "편집"}
              </ThemedText>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (isEditMode) {
                toggleSelection(item.id);
              } else {
                navigation.navigate("LibraryDetail", { item });
              }
            }}
          >
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
                {isEditMode ? (
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: selectedIds.has(item.id)
                          ? Colors.primary
                          : "transparent",
                        borderColor: selectedIds.has(item.id)
                          ? Colors.primary
                          : theme.textTertiary,
                      },
                    ]}
                  >
                    {selectedIds.has(item.id) ? (
                      <Feather name="check" size={14} color="#fff" />
                    ) : null}
                  </View>
                ) : null}
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
          </Pressable>
        )}
      />

      {isEditMode ? (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.backgroundDefault,
              paddingBottom: insets.bottom + Spacing.md,
              borderTopColor: theme.border,
            },
          ]}
        >
          <Pressable
            onPress={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            style={[
              styles.deleteButton,
              {
                backgroundColor:
                  selectedIds.size > 0 ? theme.error : theme.backgroundSecondary,
              },
            ]}
          >
            <Feather
              name="trash-2"
              size={18}
              color={selectedIds.size > 0 ? "#fff" : theme.textTertiary}
            />
            <ThemedText
              type="defaultSemiBold"
              style={{
                color: selectedIds.size > 0 ? "#fff" : theme.textTertiary,
                marginLeft: Spacing.sm,
              }}
            >
              삭제 ({selectedIds.size})
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
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
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
