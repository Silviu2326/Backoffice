import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ defaultValue, children, className, onValueChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn('flex flex-row border-b border-white/10 bg-transparent w-full', className)}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within a Tabs provider');

  const isActive = context.activeTab === value;

  return (
    <button
      disabled={disabled}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'px-4 py-3 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'text-white border-b-2 border-brand-orange'
          : 'text-text-secondary hover:text-white border-b-2 border-transparent',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within a Tabs provider');

  if (context.activeTab !== value) return null;

  return (
    <div className={cn('pt-4 animate-[fadeIn_0.3s_ease-out]', className)}>
      {children}
    </div>
  );
}
