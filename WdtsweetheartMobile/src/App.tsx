import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation';
import { AuthProvider } from './context/AuthContext';
import { NotifierProvider } from './context/NotifierContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotifierProvider>
          <RootNavigator />
        </NotifierProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
