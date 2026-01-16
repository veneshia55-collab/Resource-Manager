import { LibraryItem } from "@/lib/storage";

export type RootStackParamList = {
  Main: undefined;
  ContentInput: undefined;
  ModuleVocabulary: undefined;
  ModuleSummary: undefined;
  ModuleInference: undefined;
  ModuleCritical: undefined;
  ModuleIntegration: undefined;
  ModuleVerification: undefined;
  LibraryDetail: { item: LibraryItem };
};

export type MainTabParamList = {
  LearnTab: undefined;
  PracticeTab: undefined;
  ReportTab: undefined;
  LibraryTab: undefined;
  ProfileTab: undefined;
};

export type LearnStackParamList = {
  LearnHome: undefined;
};

export type PracticeStackParamList = {
  PracticeHome: undefined;
};

export type ReportStackParamList = {
  ReportHome: undefined;
};

export type LibraryStackParamList = {
  LibraryHome: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
};
