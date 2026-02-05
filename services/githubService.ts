export const githubService = {
  testConnection: async (t) => ({ success: true, login: 'User' }),
  ensureRepoExists: async (c) => ({ success: true }),
  pushFile: async (c, p, ct, m) => true
};