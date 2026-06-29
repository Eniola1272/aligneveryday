import { createContext, type PropsWithChildren, useContext } from 'react';

interface TabActionsContextValue {
  openAddCourse: () => void;
}

const TabActionsContext = createContext<TabActionsContextValue | null>(null);

export function TabActionsProvider({
  children,
  openAddCourse,
}: PropsWithChildren<TabActionsContextValue>) {
  return (
    <TabActionsContext.Provider value={{ openAddCourse }}>
      {children}
    </TabActionsContext.Provider>
  );
}

export function useTabActions() {
  const context = useContext(TabActionsContext);
  if (!context) throw new Error('useTabActions must be used inside TabActionsProvider.');
  return context;
}
