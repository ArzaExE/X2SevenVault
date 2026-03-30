import api from "../config/axios";
import { Item } from "../context/DataContext";

// 🔹 GET ALL
export const getItems = () => {
  return api.get("/items");
};

// 🔹 GET BY ID
export const getItemById = (id: string) => {
  return api.get(`/items/${id}`);
};

// 🔹 CREATE (POST)
export const createItem = (data: Omit<Item, "id">) => {
  return api.post("/items", data);
};

// 🔹 UPDATE (PUT)
export const updateItem = (id: string, data: Partial<Item>) => {
  return api.put(`/items/${id}`, data);
};

// 🔹 DELETE
export const deleteItem = (id: string) => {
  return api.delete(`/items/${id}`);
};