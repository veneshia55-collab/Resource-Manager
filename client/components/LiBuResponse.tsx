import React from "react";
import { StyleSheet, View, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface LiBuResponseProps {
  message: string;
  children?: React.ReactNode;
}

export function LiBuResponse({ message, children }: LiBuResponseProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/illustrations/libu-avatar.png")}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View
        style={[
          styles.bubble,
          { backgroundColor: theme.link + "10", borderColor: theme.link + "20" },
        ]}
      >
        <ThemedText type="body" style={styles.message}>
          {message}
        </ThemedText>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  bubble: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  message: {
    lineHeight: 24,
  },
});
