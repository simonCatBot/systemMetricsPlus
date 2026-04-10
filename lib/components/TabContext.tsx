"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type TabId = "cpu" | "gpu" | "memory" | "network" | "disk";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: "cpu", label: "CPU", icon: "🖥️" },
  { id: "gpu", label: "GPU", icon: "🎮" },
  { id: "memory", label: "Memory", icon: "💾" },
  { id: "network", label: "Network", icon: "🌐" },
  { id: "disk", label: "Disk", icon: "💿" },
];

interface TabContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  tabs: Tab[];
  toggleTab: (id: TabId) => void;
}

const TabContext = createContext<TabContextType | null>(null);

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("cpu");

  const toggleTab = (id: TabId) => {
    setActiveTab((current) => (current === id ? "cpu" : id));
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, tabs, toggleTab }}>
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
