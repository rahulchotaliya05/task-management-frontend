import apiClient from "./apiClient";

const BOARD_URL = "/boards";

export const boardAPI = {
  getAll: (params = {}) => apiClient.get(BOARD_URL, { params }),
  getById: (id, params = {}) => apiClient.get(`${BOARD_URL}/${id}`, { params }),
  create: (data) => apiClient.post(BOARD_URL, data),
  update: (id, data) => apiClient.patch(`${BOARD_URL}/${id}`, data),
  delete: (id) => apiClient.delete(`${BOARD_URL}/${id}`),
  addMember: (boardId, data) => apiClient.post(`${BOARD_URL}/${boardId}/members`, data),
  removeMember: (boardId, userId) => apiClient.delete(`${BOARD_URL}/${boardId}/members/${userId}`),
};
