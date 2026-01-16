import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useContent } from "@/context/ContentContext";
import { generateId, addToLibrary, clearRecords } from "@/lib/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";

const CONTENT_TYPES = ["뉴스", "유튜브", "숏폼", "SNS", "커뮤니티", "광고"];
const CONTENT_TYPE_KEYS = ["news", "youtube", "shortform", "sns", "community", "ad"] as const;
const URL_ONLY_TYPES = ["youtube", "shortform", "ad"];

export default function ContentInputScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { activeContent, setActiveContent, records } = useContent();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [title, setTitle] = useState(activeContent?.title || "");
  const [typeIndex, setTypeIndex] = useState(
    activeContent ? CONTENT_TYPE_KEYS.indexOf(activeContent.type) : 0
  );
  const [text, setText] = useState(activeContent?.text || "");
  const [url, setUrl] = useState(activeContent?.url || "");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);

  const isFirstContent = !activeContent;
  const currentType = CONTENT_TYPE_KEYS[typeIndex];
  const isUrlOnlyType = URL_ONLY_TYPES.includes(currentType);

  const handleExtractUrl = async () => {
    if (!url.trim()) {
      Alert.alert("알림", "URL을 입력해주세요.");
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch(new URL("/api/libu/extract-url", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), contentType: currentType }),
      });

      if (!response.ok) {
        throw new Error("추출 실패");
      }

      const data = await response.json();
      
      if (data.success) {
        if (data.title && !title.trim()) {
          setTitle(data.title);
        }
        setText(data.text || "");
        setIsExtracted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("완료", "콘텐츠가 성공적으로 추출되었습니다!");
      } else {
        throw new Error(data.error || "추출 실패");
      }
    } catch (error) {
      console.error("Extract error:", error);
      Alert.alert("오류", "URL에서 콘텐츠를 추출하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("알림", "콘텐츠 제목을 입력해주세요.");
      return;
    }
    
    if (isUrlOnlyType) {
      if (!url.trim()) {
        Alert.alert("알림", "URL을 입력해주세요.");
        return;
      }
      if (!isExtracted && !text.trim()) {
        Alert.alert("알림", "먼저 '콘텐츠 추출' 버튼을 눌러 콘텐츠를 가져와주세요.");
        return;
      }
    } else {
      if (text.trim().length < 50) {
        Alert.alert("알림", "콘텐츠 원문을 50자 이상 입력해주세요.");
        return;
      }
    }

    if (activeContent) {
      const contentRecords = records.filter(
        (r) => r.contentTitle === activeContent.title
      );
      if (contentRecords.length > 0) {
        await addToLibrary({
          id: generateId(),
          content: activeContent,
          savedAt: new Date().toISOString(),
          records: contentRecords,
        });
      }
    }

    const newContent = {
      id: generateId(),
      title: title.trim(),
      type: CONTENT_TYPE_KEYS[typeIndex],
      text: text.trim(),
      url: url.trim() || undefined,
      startTime: new Date().toISOString(),
    };

    await setActiveContent(newContent);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isFirstContent) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } else {
      navigation.goBack();
    }
  };

  const handleTypeChange = (index: number) => {
    setTypeIndex(index);
    setIsExtracted(false);
    if (URL_ONLY_TYPES.includes(CONTENT_TYPE_KEYS[index])) {
      setText("");
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <ThemedText type="h4" style={styles.title}>
        학습할 콘텐츠
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        {isUrlOnlyType 
          ? "URL을 입력하면 AI가 자동으로 콘텐츠를 분석해요"
          : "미디어 콘텐츠를 추가하면 리버와 함께 분석하고 학습할 수 있어요"}
      </ThemedText>

      <ThemedText type="subheading" style={styles.label}>
        콘텐츠 유형
      </ThemedText>
      <SegmentedControl
        values={CONTENT_TYPES}
        selectedIndex={typeIndex}
        onChange={(event) => handleTypeChange(event.nativeEvent.selectedSegmentIndex)}
        style={styles.segmentedControl}
        tintColor={theme.link}
        fontStyle={{ color: theme.text }}
        activeFontStyle={{ color: Platform.OS === "ios" ? theme.text : "#FFFFFF" }}
      />

      {isUrlOnlyType ? (
        <>
          <ThemedText type="subheading" style={styles.label}>
            {currentType === "youtube" ? "유튜브 URL" : currentType === "shortform" ? "숏폼 URL" : "광고 URL"}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="https://www.youtube.com/watch?v=..."
            placeholderTextColor={theme.textTertiary}
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              setIsExtracted(false);
            }}
            keyboardType="url"
            autoCapitalize="none"
          />

          <Button 
            onPress={handleExtractUrl} 
            variant="secondary"
            style={styles.extractButton}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <ThemedText style={{ marginLeft: Spacing.sm, color: Colors.primary }}>
                  콘텐츠 추출 중...
                </ThemedText>
              </View>
            ) : isExtracted ? (
              "다시 추출하기"
            ) : (
              "콘텐츠 추출"
            )}
          </Button>

          {isExtracted && text ? (
            <>
              <ThemedText type="subheading" style={styles.label}>
                콘텐츠 제목
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="콘텐츠 제목"
                placeholderTextColor={theme.textTertiary}
                value={title}
                onChangeText={setTitle}
              />

              <ThemedText type="subheading" style={styles.label}>
                추출된 콘텐츠
              </ThemedText>
              <View
                style={[
                  styles.extractedContent,
                  { backgroundColor: theme.backgroundSecondary, borderColor: Colors.primary },
                ]}
              >
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {text.substring(0, 300)}{text.length > 300 ? "..." : ""}
                </ThemedText>
              </View>
            </>
          ) : null}
        </>
      ) : (
        <>
          <ThemedText type="subheading" style={styles.label}>
            콘텐츠 제목
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="예: 지브리 AI 이미지 저작권 논란"
            placeholderTextColor={theme.textTertiary}
            value={title}
            onChangeText={setTitle}
          />

          <ThemedText type="subheading" style={styles.label}>
            콘텐츠 원문
          </ThemedText>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="분석할 미디어 콘텐츠의 전체 텍스트를 붙여넣기 해주세요 (최소 50자)"
            placeholderTextColor={theme.textTertiary}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />

          <ThemedText type="subheading" style={styles.label}>
            참고 URL (선택)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="https://..."
            placeholderTextColor={theme.textTertiary}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
        </>
      )}

      <Button 
        onPress={handleSave} 
        style={styles.button}
        disabled={isUrlOnlyType && !isExtracted}
      >
        학습 시작하기
      </Button>

      <Button
        onPress={async () => {
          if (activeContent && records.length > 0) {
            const contentRecords = records.filter(
              (r) => r.contentTitle === activeContent.title
            );
            if (contentRecords.length > 0) {
              await addToLibrary({
                id: generateId(),
                content: activeContent,
                savedAt: new Date().toISOString(),
                records: contentRecords,
              });
            }
          }
          setTitle("");
          setTypeIndex(0);
          setText("");
          setUrl("");
          setIsExtracted(false);
          await clearRecords();
          await setActiveContent(null);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        variant="secondary"
        style={styles.resetButton}
      >
        콘텐츠 리셋
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    marginBottom: Spacing.xl,
  },
  textArea: {
    height: 160,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
    marginBottom: Spacing.xl,
  },
  segmentedControl: {
    marginBottom: Spacing.xl,
  },
  button: {
    marginTop: Spacing.md,
  },
  resetButton: {
    marginTop: Spacing.md,
  },
  extractButton: {
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  extractedContent: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
});
