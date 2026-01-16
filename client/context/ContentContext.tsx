import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ActiveContent,
  LearningRecord,
  getActiveContent,
  setActiveContent as saveActiveContent,
  getRecords,
  addRecord as saveRecord,
  clearRecords as clearStoredRecords,
} from "@/lib/storage";

interface ContentContextType {
  activeContent: ActiveContent | null;
  records: LearningRecord[];
  isLoading: boolean;
  setActiveContent: (content: ActiveContent | null) => Promise<void>;
  addRecord: (record: LearningRecord) => Promise<void>;
  clearRecords: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [activeContent, setActiveContentState] = useState<ActiveContent | null>(null);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [content, storedRecords] = await Promise.all([
        getActiveContent(),
        getRecords(),
      ]);
      setActiveContentState(content);
      setRecords(storedRecords);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const setActiveContent = async (content: ActiveContent | null) => {
    await saveActiveContent(content);
    setActiveContentState(content);
  };

  const addRecord = async (record: LearningRecord) => {
    await saveRecord(record);
    setRecords((prev) => [...prev, record]);
  };

  const clearRecords = async () => {
    await clearStoredRecords();
    setRecords([]);
  };

  return (
    <ContentContext.Provider
      value={{
        activeContent,
        records,
        isLoading,
        setActiveContent,
        addRecord,
        clearRecords,
        refreshData,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
