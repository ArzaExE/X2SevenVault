import api from "../config/axios";

export const getWarehouses = () => {
  return api.get("/warehouses");
};

export const deleteWarehouse = (id: string) => {
  return api.delete(`/warehouses/${id}`);
};