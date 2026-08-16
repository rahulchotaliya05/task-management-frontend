import apiClient from "./apiClient";

export const cardAPI = {
  create: (columnId, data) => apiClient.post(`/columns/${columnId}/cards`, data),
  update: (id, data) => apiClient.patch(`/cards/${id}`, data),
  delete: (id) => apiClient.delete(`/cards/${id}`),
  move: (id, data) => apiClient.post(`/cards/${id}/move`, data),
};
