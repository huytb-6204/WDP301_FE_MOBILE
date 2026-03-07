import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation';

const App = () => {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
};

export default App;
