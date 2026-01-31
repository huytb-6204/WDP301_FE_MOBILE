export const apiClient = {
  get: async (path: string) => {
    return Promise.resolve({ path });
  },
};
