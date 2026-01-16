import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import ContentInputScreen from "@/screens/ContentInputScreen";
import ModuleVocabularyScreen from "@/screens/ModuleVocabularyScreen";
import ModuleSummaryScreen from "@/screens/ModuleSummaryScreen";
import ModuleInferenceScreen from "@/screens/ModuleInferenceScreen";
import ModuleCriticalScreen from "@/screens/ModuleCriticalScreen";
import ModuleIntegrationScreen from "@/screens/ModuleIntegrationScreen";
import ModuleVerificationScreen from "@/screens/ModuleVerificationScreen";
import LibraryDetailScreen from "@/screens/LibraryDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useContent } from "@/context/ContentContext";
import { RootStackParamList } from "@/types/navigation";
import { Colors } from "@/constants/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isLoading } = useContent();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Main">
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContentInput"
        component={ContentInputScreen}
        options={({ navigation }) => ({
          headerTitle: "콘텐츠 추가",
          headerLeft: () => (
            <HeaderButton onPress={() => navigation.navigate("Main")}>
              <Feather name="home" size={22} color={Colors.primary} />
            </HeaderButton>
          ),
        })}
      />
      <Stack.Screen
        name="ModuleVocabulary"
        component={ModuleVocabularyScreen}
        options={{
          headerTitle: "어휘 지원",
        }}
      />
      <Stack.Screen
        name="ModuleSummary"
        component={ModuleSummaryScreen}
        options={{
          headerTitle: "사실·요약적 이해",
        }}
      />
      <Stack.Screen
        name="ModuleInference"
        component={ModuleInferenceScreen}
        options={{
          headerTitle: "추론적 이해",
        }}
      />
      <Stack.Screen
        name="ModuleCritical"
        component={ModuleCriticalScreen}
        options={{
          headerTitle: "비판적 이해",
        }}
      />
      <Stack.Screen
        name="ModuleIntegration"
        component={ModuleIntegrationScreen}
        options={{
          headerTitle: "통합적 이해",
        }}
      />
      <Stack.Screen
        name="ModuleVerification"
        component={ModuleVerificationScreen}
        options={{
          headerTitle: "정보 안전성 검증",
        }}
      />
      <Stack.Screen
        name="LibraryDetail"
        component={LibraryDetailScreen}
        options={{
          headerTitle: "학습 리포트",
        }}
      />
    </Stack.Navigator>
  );
}
