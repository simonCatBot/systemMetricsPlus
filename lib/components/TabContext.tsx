"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type TabId = "cpu" | "gpu" | "memory" | "network" | "disk";

interface Tab {
  id: TabId;
  label: string;
}

interface TabContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const TabContext = createContext<TabContextType | null>(null);

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("cpu");

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabProvider");
  }
  return context;
}
