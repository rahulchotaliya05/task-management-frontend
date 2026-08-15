import apiClient from "./apiClient";

const USER_URL = "/users";

export const userAPI = {
  getAll: () => apiClient.get(USER_URL),
};
