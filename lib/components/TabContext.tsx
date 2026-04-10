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
  visibleTabs: Set<TabId>;
  toggleTab: (id: TabId) => void;
  showTab: (id: TabId) => void;
  hideTab: (id: TabId) => void;
}

const TabContext = createContext<TabContextType | null>(null);

const allTabs: TabId[] = ["cpu", "gpu", "memory", "network", "disk"];

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("cpu");
  const [visibleTabs, setVisibleTabs] = useState<Set<TabId>>(new Set(allTabs));

  const toggleTab = (id: TabId) => {
    setVisibleTabs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // If we're hiding the active tab, switch to first visible
        if (activeTab === id) {
          const remaining = allTabs.filter((t) => next.has(t));
          if (remaining.length > 0) {
            setActiveTab(remaining[0]);
          }
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const showTab = (id: TabId) => {
    setVisibleTabs((prev) => new Set(prev).add(id));
  };

  const hideTab = (id: TabId) => {
    setVisibleTabs((prev) => {
      const next = new Set(prev);
      next.delete(id);
      // If we're hiding the active tab, switch to first visible
      if (activeTab === id) {
        const remaining = allTabs.filter((t) => next.has(t));
        if (remaining.length > 0) {
          setActiveTab(remaining[0]);
        }
      }
      return next;
    });
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, visibleTabs, toggleTab, showTab, hideTab }}>
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
