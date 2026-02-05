export const storageService = {
  getSystemConfig: () => JSON.parse(localStorage.getItem('kinetix_system_config') || '{"enableAI":true}'),
  saveSystemConfig: (c) => localStorage.setItem('kinetix_system_config', JSON.stringify(c)),
  getUser: () => JSON.parse(localStorage.getItem('kinetix_user') || 'null'),
  saveUser: (u) => localStorage.setItem('kinetix_user', JSON.stringify(u)),
  logout: () => localStorage.removeItem('kinetix_user'),
  getTemplates: () => [],
  getExercises: () => [],
  getStorageUsage: () => ({ usedKB: 100, percentage: 5 })
};