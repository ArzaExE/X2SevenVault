import api from "../config/axios";
import { User } from "../context/UsersContext";

export const getUsers = () => {
  return api.get("/users");
};

export const getUserById = (id: string) => {
  return api.get(`/users/${id}`);
};
  
export const createUser = (data: Omit<User, "id">) => {
  return api.post("/users", data);
};

export const updateUser = (id: string, data: Partial<User>) => {
  return api.put(`/users/${id}`, data);
};

export const deleteUser = (id: string) => {
  return api.delete(`/users/${id}`);
}