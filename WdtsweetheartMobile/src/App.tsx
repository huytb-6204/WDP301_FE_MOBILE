import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation';
import { AuthProvider } from './context/AuthContext';
<<<<<<< HEAD
=======
import { NotifierProvider } from './context/NotifierContext';
>>>>>>> main

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
<<<<<<< HEAD
        <RootNavigator />
=======
        <NotifierProvider>
          <RootNavigator />
        </NotifierProvider>
>>>>>>> main
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
