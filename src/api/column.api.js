import apiClient from "./apiClient";

export const columnAPI = {
  create: (boardId, data) => apiClient.post(`/boards/${boardId}/columns`, data),
  update: (id, data) => apiClient.patch(`/columns/${id}`, data),
  delete: (id) => apiClient.delete(`/columns/${id}`),
};
