import { Platform } from "react-native";

const tintColorLight = "#4A5FE8";
const tintColorDark = "#6B7CF9";

export const Colors = {
  primary: "#4A5FE8",
  primaryLight: "#E8ECFF",
  primaryDark: "#3847B8",
  light: {
    text: "#1A1F36",
    textSecondary: "#697386",
    textTertiary: "#A0A8B8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#697386",
    tabIconSelected: tintColorLight,
    link: "#4A5FE8",
    linkPressed: "#3847B8",
    backgroundRoot: "#FAFBFC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F3F9",
    backgroundTertiary: "#E4E7EB",
    border: "#E4E7EB",
    success: "#51CF66",
    warning: "#FFA94D",
    error: "#FF6B6B",
    accent: "#FF6B6B",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    textTertiary: "#687076",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: "#6B7CF9",
    linkPressed: "#8B9AFA",
    backgroundRoot: "#0F1115",
    backgroundDefault: "#1A1D24",
    backgroundSecondary: "#252830",
    backgroundTertiary: "#32363F",
    border: "#32363F",
    success: "#51CF66",
    warning: "#FFA94D",
    error: "#FF6B6B",
    accent: "#FF6B6B",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
