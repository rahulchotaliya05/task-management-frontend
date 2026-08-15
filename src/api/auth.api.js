import apiClient from "./apiClient";

const AUTH_URL = "/auth";

export const authAPI = {
  register: (data) => apiClient.post(`${AUTH_URL}/register`, data),
  login: (data) => apiClient.post(`${AUTH_URL}/login`, data),
  logout: () => apiClient.post(`${AUTH_URL}/logout`),
  refresh: () => apiClient.post(`${AUTH_URL}/refresh`),
  getMe: () => apiClient.get(`${AUTH_URL}/me`),
};
