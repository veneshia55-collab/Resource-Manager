import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ACTIVE_CONTENT: "libu_active_content",
  RECORDS: "libu_records",
  LIBRARY: "libu_library",
};

export interface ActiveContent {
  id: string;
  title: string;
  type: "news" | "youtube" | "shortform" | "sns" | "community" | "ad";
  text: string;
  url?: string;
  startTime: string;
}

export interface LearningRecord {
  id: string;
  timestamp: string;
  tabName: string;
  contentTitle: string;
  contentType: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  scores: Record<string, number>;
  durationSec: number;
}

export interface LibraryItem {
  id: string;
  content: ActiveContent;
  savedAt: string;
  records: LearningRecord[];
}

export async function getActiveContent(): Promise<ActiveContent | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ACTIVE_CONTENT);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setActiveContent(content: ActiveContent | null): Promise<void> {
  try {
    if (content) {
      await AsyncStorage.setItem(KEYS.ACTIVE_CONTENT, JSON.stringify(content));
    } else {
      await AsyncStorage.removeItem(KEYS.ACTIVE_CONTENT);
    }
  } catch (error) {
    console.error("Error saving active content:", error);
  }
}

export async function getRecords(): Promise<LearningRecord[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addRecord(record: LearningRecord): Promise<void> {
  try {
    const records = await getRecords();
    records.push(record);
    await AsyncStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error("Error adding record:", error);
  }
}

export async function clearRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.RECORDS);
  } catch (error) {
    console.error("Error clearing records:", error);
  }
}

export async function getLibrary(): Promise<LibraryItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.LIBRARY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addToLibrary(item: LibraryItem): Promise<void> {
  try {
    const library = await getLibrary();
    library.unshift(item);
    await AsyncStorage.setItem(KEYS.LIBRARY, JSON.stringify(library));
  } catch (error) {
    console.error("Error adding to library:", error);
  }
}

export async function removeFromLibrary(id: string): Promise<void> {
  try {
    const library = await getLibrary();
    const filtered = library.filter((item) => item.id !== id);
    await AsyncStorage.setItem(KEYS.LIBRARY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from library:", error);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
