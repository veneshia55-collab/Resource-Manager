import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Alert, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { SourceCard } from "@/components/SourceCard";
import { LiBuResponse } from "@/components/LiBuResponse";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { generateId } from "@/lib/storage";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface MindMapNode {
  id: string;
  label: string;
  level: number;
  parent?: string;
}

interface IntegrationResult {
  nodes: MindMapNode[];
  summary: string[];
  sources: { title: string; snippet: string; url?: string }[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAP_SIZE = SCREEN_WIDTH - Spacing.lg * 2;

function MindMap({ nodes, theme }: { nodes: MindMapNode[]; theme: any }) {
  const center = { x: MAP_SIZE / 2, y: MAP_SIZE / 2 };
  const levelRadii = [0, 60, 120];

  const getNodePosition = (node: MindMapNode, index: number, total: number) => {
    if (node.level === 0) return center;

    const levelNodes = nodes.filter((n) => n.level === node.level);
    const nodeIndex = levelNodes.indexOf(node);
    const angle = (2 * Math.PI * nodeIndex) / levelNodes.length - Math.PI / 2;
    const radius = levelRadii[node.level] || 120;

    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  };

  const nodePositions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    nodePositions.set(node.id, getNodePosition(node, i, nodes.length));
  });

  return (
    <Svg width={MAP_SIZE} height={MAP_SIZE}>
      {nodes.map((node) => {
        if (node.parent) {
          const from = nodePositions.get(node.parent);
          const to = nodePositions.get(node.id);
          if (from && to) {
            return (
              <Line
                key={`line-${node.id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={theme.border}
                strokeWidth={2}
              />
            );
          }
        }
        return null;
      })}

      {nodes.map((node) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return null;

        const radius = node.level === 0 ? 30 : node.level === 1 ? 20 : 15;
        const fontSize = node.level === 0 ? 11 : node.level === 1 ? 9 : 8;

        return (
          <React.Fragment key={node.id}>
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={radius}
              fill={node.level === 0 ? theme.link : theme.link + "60"}
            />
            <SvgText
              x={pos.x}
              y={pos.y}
              fontSize={fontSize}
              fill="#FFFFFF"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {node.label.length > 6 ? node.label.substring(0, 5) + "..." : node.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function ModuleIntegrationScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { activeContent, addRecord } = useContent();

  const [keywords, setKeywords] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IntegrationResult | null>(null);
  const startTime = React.useRef(Date.now());

  const handleGenerate = async () => {
    if (!activeContent) {
      Alert.alert("알림", "먼저 학습할 콘텐츠를 추가해주세요.");
      return;
    }

    setIsLoading(true);
    startTime.current = Date.now();

    try {
      const response = await apiRequest("POST", "/api/libu/integration", {
        keywords: keywords.trim(),
        contentTitle: activeContent.title,
        contentText: activeContent.text.substring(0, 3000),
      });
      const data = await response.json();
      setResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addRecord({
        id: generateId(),
        timestamp: new Date().toISOString(),
        tabName: "integration",
        contentTitle: activeContent.title,
        contentType: activeContent.type,
        inputs: { keywords: keywords.trim() },
        outputs: data,
        scores: { nodes: data.nodes?.length || 0 },
        durationSec: Math.round((Date.now() - startTime.current) / 1000),
      });
    } catch (error) {
      console.error("Integration analysis error:", error);
      Alert.alert("오류", "분석 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: 100,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Card elevation={1} style={styles.inputCard}>
          <ThemedText type="subheading" style={styles.cardTitle}>
            강조 키워드 (선택)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            placeholder="마인드맵에 강조할 키워드 (쉼표로 구분)"
            placeholderTextColor={theme.textTertiary}
            value={keywords}
            onChangeText={setKeywords}
          />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            비워두면 자동으로 핵심 개념을 추출해요
          </ThemedText>
        </Card>

        {result ? (
          <>
            <ThemedText type="subheading" style={styles.sectionTitle}>
              검색 결과
            </ThemedText>
            {result.sources.map((source, index) => (
              <SourceCard
                key={index}
                title={source.title}
                snippet={source.snippet}
                url={source.url}
                index={index + 1}
              />
            ))}

            <ThemedText type="subheading" style={styles.sectionTitle}>
              마인드맵
            </ThemedText>
            <Card elevation={1} style={styles.mapCard}>
              <View style={styles.mapContainer}>
                <MindMap nodes={result.nodes} theme={theme} />
              </View>
            </Card>

            <ThemedText type="subheading" style={styles.sectionTitle}>
              리버의 해설
            </ThemedText>
            <LiBuResponse message="마인드맵의 핵심 내용을 정리해봤어!">
              {result.summary.map((line, i) => (
                <ThemedText key={i} type="small" style={styles.summaryItem}>
                  {i + 1}. {line}
                </ThemedText>
              ))}
            </LiBuResponse>

            <Card elevation={1} style={styles.nodesCard}>
              <ThemedText type="subheading" style={styles.cardTitle}>
                추출된 개념 ({result.nodes.length}개)
              </ThemedText>
              <View style={styles.nodesGrid}>
                {result.nodes.map((node) => (
                  <View
                    key={node.id}
                    style={[
                      styles.nodeBadge,
                      {
                        backgroundColor:
                          node.level === 0
                            ? theme.link
                            : node.level === 1
                              ? theme.link + "80"
                              : theme.link + "40",
                      },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{ color: node.level < 2 ? "#FFFFFF" : theme.text }}
                    >
                      {node.label}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.fabContainer,
          { bottom: insets.bottom + Spacing.lg },
        ]}
      >
        <FloatingActionButton
          icon="git-branch"
          label="마인드맵 생성"
          onPress={handleGenerate}
          loading={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  mapCard: {
    padding: 0,
    overflow: "hidden",
  },
  mapContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
  },
  summaryItem: {
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  nodesCard: {
    marginTop: Spacing.lg,
  },
  nodesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  nodeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    alignItems: "flex-end",
  },
});
