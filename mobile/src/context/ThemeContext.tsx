import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { lightColors, darkColors, typography, spacing, borderRadius, iconSize } from '../theme';

type Colors = typeof lightColors;

interface Theme {
  colors: Colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  iconSize: typeof iconSize;
  isDark: boolean;
}

const defaultColors: Colors = lightColors;

const ThemeContext = createContext<Theme>({
  colors: defaultColors,
  typography,
  spacing,
  borderRadius,
  iconSize,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(systemScheme);

  useEffect(() => {
    setColorScheme(systemScheme);
  }, [systemScheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      setColorScheme(newScheme);
    });
    return () => subscription.remove();
  }, []);

  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, typography, spacing, borderRadius, iconSize, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
