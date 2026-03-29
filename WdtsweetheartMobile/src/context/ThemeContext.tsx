import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  background: '#F9FAFB',
  card: '#fff',
  text: '#111827',
  textMuted: '#637381',
  border: '#F4F6F8',
  iconBg: '#F4F6F8',
  cardBorder: '#F4F6F8',
};

export const darkTheme = {
  background: '#0A0E17',
  card: '#161C24',
  text: '#FFFFFF',
  textMuted: '#919EAB',
  border: '#212B36',
  iconBg: '#212B36',
  cardBorder: '#212B36',
};

export type ThemeType = typeof lightTheme;

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: ThemeType;
}

const ThemeContext = createContext<ThemeContextProps>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  theme: lightTheme,
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const value = await AsyncStorage.getItem('@dark_mode');
        if (value !== null) {
          setIsDarkMode(value === 'true');
        }
      } catch (e) {
        // error
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('@dark_mode', String(newValue));
    } catch (e) {
      // error
    }
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider 
      value={{ 
        isDarkMode, 
        toggleDarkMode, 
        theme: isDarkMode ? darkTheme : lightTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
