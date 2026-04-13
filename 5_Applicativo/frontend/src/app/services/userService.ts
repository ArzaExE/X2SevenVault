import api from "../config/axios";
import { User } from "../context/UsersContext";

export const getUsers = () => {
  return api.get("/users");
};

export const getMe = () => {
  return api.get("/me");
};

export const updateMe = (data: { full_name?: string; email?: string }) => {
  return api.put("/me", data);
};

export const updatePassword = (password: string, passwordConfirmation: string) => {
  return api.put("/me/password", { 
    password: password,
    password_confirmation: passwordConfirmation
  });
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