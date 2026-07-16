import React, { createContext, useContext, ReactNode } from 'react';
import { colors, typography, spacing, borderRadius, iconSize } from '../theme';

interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  iconSize: typeof iconSize;
}

const ThemeContext = createContext<Theme>({
  colors,
  typography,
  spacing,
  borderRadius,
  iconSize,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors, typography, spacing, borderRadius, iconSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
