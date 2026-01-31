export const storage = {
  get: async (key: string) => {
    return Promise.resolve(key);
  },
  set: async (key: string, value: string) => {
    return Promise.resolve({ key, value });
  },
};
