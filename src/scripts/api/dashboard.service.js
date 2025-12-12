import { api } from "./client.js";

export const dashboardService = {
  getStats: async () => {
    return await api.get("/core/dashboard/stats");
  },

  getActivities: async () => {
    return await api.get("/core/dashboard/activities");
  },

  getSettings: async () => {
    return await api.get("/core/settings");
  },

  updateSettings: async (settingsData) => {
    return await api.put("/core/settings", settingsData);
  },
};
