const KEYS = { USER: 'kinetix_user', SYSTEM_CONFIG: 'kinetix_system_config' };
export const storageService = {
  getSystemConfig: () => JSON.parse(localStorage.getItem(KEYS.SYSTEM_CONFIG) || '{"enableAI":true}'),
  saveSystemConfig: (c) => localStorage.setItem(KEYS.SYSTEM_CONFIG, JSON.stringify(c)),
  getUser: () => JSON.parse(localStorage.getItem(KEYS.USER) || 'null'),
  saveUser: (u) => localStorage.setItem(KEYS.USER, JSON.stringify(u)),
  logout: () => localStorage.removeItem(KEYS.USER),
  getStorageUsage: () => ({ usedKB: 100, percentage: 2 })
};