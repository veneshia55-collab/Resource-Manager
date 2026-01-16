import React from "react";
import { View, StyleSheet, ScrollView, Image, Pressable, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const MENU_ITEMS = [
  { id: "notifications", icon: "bell" as const, title: "알림 설정" },
  { id: "privacy", icon: "lock" as const, title: "개인정보 처리방침" },
  { id: "terms", icon: "file-text" as const, title: "이용약관" },
  { id: "help", icon: "help-circle" as const, title: "도움말" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { records, clearRecords } = useContent();

  const handleMenuPress = (id: string) => {
    Haptics.selectionAsync();
    switch (id) {
      case "notifications":
        Alert.alert("알림 설정", "알림 설정 기능은 준비중입니다.");
        break;
      case "privacy":
        Linking.openURL("https://example.com/privacy");
        break;
      case "terms":
        Linking.openURL("https://example.com/terms");
        break;
      case "help":
        Alert.alert("도움말", "리버는 중고등학생의 미디어 리터러시 역량 향상을 돕는 AI 학습 도우미예요.");
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "모든 학습 데이터가 삭제됩니다. 계속하시겠어요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "로그아웃",
          style: "destructive",
          onPress: async () => {
            await clearRecords();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

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
      <View style={styles.profileSection}>
        <Image
          source={require("../../assets/images/illustrations/libu-avatar.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
        <ThemedText type="h4" style={styles.name}>
          학습자
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          중학생
        </ThemedText>
      </View>

      <Card elevation={1} style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.link }}>
              {records.length}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              학습 활동
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.link }}>
              {new Set(records.map((r) => r.contentTitle)).size}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              분석 콘텐츠
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.link }}>
              {new Set(records.map((r) => r.tabName)).size}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              사용 모듈
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card elevation={1} style={styles.menuCard}>
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => handleMenuPress(item.id)}
            style={[
              styles.menuItem,
              index < MENU_ITEMS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              },
            ]}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.link + "10" }]}>
              <Feather name={item.icon} size={18} color={theme.link} />
            </View>
            <ThemedText type="body" style={styles.menuTitle}>
              {item.title}
            </ThemedText>
            <Feather name="chevron-right" size={18} color={theme.textTertiary} />
          </Pressable>
        ))}
      </Card>

      <Pressable
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: theme.error + "10" }]}
      >
        <Feather name="log-out" size={18} color={theme.error} />
        <ThemedText type="body" style={[styles.logoutText, { color: theme.error }]}>
          데이터 초기화
        </ThemedText>
      </Pressable>

      <ThemedText
        type="caption"
        style={[styles.version, { color: theme.textTertiary }]}
      >
        LiBu v1.0.0
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  menuCard: {
    marginBottom: Spacing.lg,
    padding: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuTitle: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  logoutText: {
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
  },
});
