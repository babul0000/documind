import React from 'react';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Premium custom Tabs component for switching views (e.g., chat vs summary vs details).
 */
export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex space-x-1 border-b border-zinc-900 p-1 bg-zinc-950/60 rounded-xl', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-250 focus:outline-none',
              isActive
                ? 'bg-zinc-900 text-white shadow-md border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
export default Tabs;
