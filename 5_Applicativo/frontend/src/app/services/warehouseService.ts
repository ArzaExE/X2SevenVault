import api from "../config/axios";
import { Warehouse } from "../context/WarehousesContext";

export const getWarehouses = () => {
  return api.get("/warehouses");
};

export const getWarehouseById = (id: string) => {
  return api.get(`/warehouses/${id}`);
};
  
export const createWarehouse = (data: Omit<Warehouse, "id">) => {
  return api.post("/warehouses", data);
};

export const updateWarehouse = (id: string, data: Partial<Warehouse>) => {
  return api.put(`/warehouses/${id}`, data);
};

export const deleteWarehouse = (id: string) => {
  return api.delete(`/warehouses/${id}`);
}

export const getAisles = (warehouseId: string) => {
  return api.get(`/warehouses/${warehouseId}/aisles`);
};

export const getShelves = (warehouseId: string, aisleId: string) => {
  return api.get(`/warehouses/${warehouseId}/aisles/${aisleId}/shelves`);
};

export const createAisle = (warehouseId: string, data: object) => {
  return api.post(`/warehouses/${warehouseId}/aisles`, data);
};

export const createShelf = (warehouseId: string, aisleId: string, data: object) => {
  return api.post(`/warehouses/${warehouseId}/aisles/${aisleId}/shelves`, data);
};

export const updateAisle = (warehouseId: string, aisleId: string, data: any) => {
  return api.put(`/warehouses/${warehouseId}/aisles/${aisleId}`, data);
};

export const updateShelf = (warehouseId: string, aisleId: string, shelfId: string, data: any) => {
  return api.put(`/warehouses/${warehouseId}/aisles/${aisleId}/shelves/${shelfId}`, data);
};

export const deleteAisle = (warehouseId: string, aisleId: string) => {
  return api.delete(`/warehouses/${warehouseId}/aisles/${aisleId}`);
};

export const deleteShelf = (warehouseId: string, aisleId: string, shelfId: string) => {
  return api.delete(`/warehouses/${warehouseId}/aisles/${aisleId}/shelves/${shelfId}`);
};