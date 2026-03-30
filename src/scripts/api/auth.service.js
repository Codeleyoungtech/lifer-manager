import { api } from "./client.js";

export const authService = {
  login: async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  },

  register: async (userData) => {
    return await api.post("/auth/register", userData);
  },

  getUsers: async () => {
    return await api.get("/auth/users");
  },

  updateUserAccess: async (id, payload) => {
    return await api.patch(`/auth/users/${id}/access`, payload);
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};
