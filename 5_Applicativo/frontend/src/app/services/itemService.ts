import api from "../config/axios";

export const getItems = () => {
  return api.get("/items");
};

export const deleteItem = (id: string) => {
  return api.delete(`/items/${id}`);
};