import { api } from "../api/client.js";

const settingsService = {
  async getSettings() {
    return await api.get("/core/settings");
  },

  async updateSettings(settingsData) {
    return await api.put("/core/settings", settingsData);
  },
};

export default settingsService;
