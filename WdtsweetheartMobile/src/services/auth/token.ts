import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  get: async () => {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  set: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  clear: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};
