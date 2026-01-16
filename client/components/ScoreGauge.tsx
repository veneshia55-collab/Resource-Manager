import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
}

export function ScoreGauge({
  score,
  maxScore = 100,
  size = 100,
  label,
}: ScoreGaugeProps) {
  const { theme } = useTheme();
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress >= 0.7) return theme.success;
    if (progress >= 0.4) return theme.warning;
    return theme.error;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.gaugeContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.scoreContainer}>
          <ThemedText type="h3" style={{ color: getColor() }}>
            {Math.round(score)}
          </ThemedText>
        </View>
      </View>
      {label ? (
        <ThemedText
          type="small"
          style={[styles.label, { color: theme.textSecondary }]}
        >
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  gaugeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreContainer: {
    position: "absolute",
  },
  label: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
