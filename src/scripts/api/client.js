import { API_URL } from "../../config.js";

const BASE_URL = API_URL;

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Auto logout on 401
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/index.html";
    }
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }

  return data;
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
      cache: "no-store",
    });
    return handleResponse(response);
  },
};
