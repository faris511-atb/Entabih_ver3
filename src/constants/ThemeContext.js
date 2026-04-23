/**
 * src/constants/ThemeContext.js
 * Converted from: constants/ThemeContext.tsx
 *
 * Changes:
 *  - TSX → JS (removed TypeScript interfaces/types)
 *  - All logic identical to original
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './theme';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const loadMode = async () => {
      const storedMode = await AsyncStorage.getItem('themeMode');
      if (storedMode === 'dark' || storedMode === 'light') {
        setMode(storedMode);
      } else {
        const systemMode = Appearance.getColorScheme() || 'light';
        setMode(systemMode);
      }
    };
    loadMode();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('❌ useTheme must be used within ThemeProvider');
  }
  return context;
};
