import React, { createContext, useContext, useState } from 'react';
import { Dimensions } from 'react-native';

interface SidebarGeom {
  /** Y (em coordenadas de janela) do sublinhado do título "Ave, user!". */
  anchorY: number;
  /** X (em coordenadas de janela) do centro do botão de menu (5% à direita do "!"). */
  buttonX: number;
}

interface SidebarContextValue extends SidebarGeom {
  setGeom: (g: Partial<SidebarGeom>) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const { width } = Dimensions.get('window');

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [geom, setGeomState] = useState<SidebarGeom>({
    anchorY: 150,
    buttonX: width * 0.4,
  });

  const setGeom = (g: Partial<SidebarGeom>) =>
    setGeomState((prev) => ({ ...prev, ...g }));

  return (
    <SidebarContext.Provider value={{ ...geom, setGeom }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider');
  return ctx;
}
