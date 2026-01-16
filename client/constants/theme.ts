import { Platform } from "react-native";

const tintColorLight = "#5EC4A8";
const tintColorDark = "#7DD8BE";

export const Colors = {
  primary: "#5EC4A8",
  primaryLight: "#E5F6F1",
  primaryDark: "#3DA88A",
  light: {
    text: "#1A2F36",
    textSecondary: "#5A7076",
    textTertiary: "#8FA8A8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#5A7076",
    tabIconSelected: tintColorLight,
    link: "#5EC4A8",
    linkPressed: "#3DA88A",
    backgroundRoot: "#F8FCFB",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#EEF6F4",
    backgroundTertiary: "#E0EDEA",
    border: "#D8E8E4",
    success: "#51CF66",
    warning: "#FFA94D",
    error: "#FF6B6B",
    accent: "#FF8A7A",
  },
  dark: {
    text: "#E8F0EE",
    textSecondary: "#9BACA8",
    textTertiary: "#687876",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BACA8",
    tabIconSelected: tintColorDark,
    link: "#7DD8BE",
    linkPressed: "#9DE8CE",
    backgroundRoot: "#0D1514",
    backgroundDefault: "#182220",
    backgroundSecondary: "#232E2C",
    backgroundTertiary: "#2E3A38",
    border: "#2E3A38",
    success: "#51CF66",
    warning: "#FFA94D",
    error: "#FF6B6B",
    accent: "#FF8A7A",
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
