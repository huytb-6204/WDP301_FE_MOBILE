import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/index';
import { AuthProvider } from './context/AuthContext';
import { NotifierProvider } from './context/NotifierContext';
import { ThemeProvider } from './context/ThemeContext';
const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotifierProvider>
            <RootNavigator />
          </NotifierProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
