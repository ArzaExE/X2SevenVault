import api from "../config/axios";

export const getWarehouses = () => {
  return api.get("/warehouses");
};

export const deleteWarehouse = (id: string) => {
  return api.delete(`/warehouses/${id}`);
};

export const getAisles = (warehouseId: string) => {
  return api.get(`/warehouses/${warehouseId}/aisles`);
};

export const getShelves = (warehouseId: string, aisleId: string) => {
  return api.get(`/warehouses/${warehouseId}/aisles/${aisleId}/shelves`);
};