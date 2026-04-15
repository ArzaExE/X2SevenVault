import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { 
  getItems, 
  getItemById as fetchItemById, 
  deleteItem,
  createItem,
  updateItem
} 
from "../services/itemService";
import { getWarehouses, getAisles, getShelves, getCompleteWarehouses } from "../services/warehouseService";
import { useAuth } from "./AuthContext";

export interface Item {
  id: string;
  name: string;
  warehouse_id: string;
  aisle_id: string;
  shelf_id: string;
  ai_class_id?: string;
  is_ai: boolean;
  weight_value: number;
  weight_unit: string;
  width_value: number;
  width_unit: string;
  height_value: number;
  height_unit: string;
  quantity: number;
  description: string;
}

export interface Shelf {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  warehouse_id: string;
  aisle_id: string;
}

export interface Aisle {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  warehouse_id: string;
  shelves: Shelf[];
}

export interface Warehouse {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  aisles: Aisle[];
}

interface ItemContextType {
  items: Item[];
  warehouses: Warehouse[];
  completeWarehouses: Warehouse[];
  loadAisles: (warehouseId: string) => Promise<Aisle[]>;
  loadShelves: (warehouseId: string, aisleId: string) => Promise<Shelf[]>;
  loadCompleteWarehouses: () => Promise<void>;
  getItemById: (id: string) => Promise<Item | null>;
  addItem: (data: Omit<Item, "id">) => Promise<any>;
  updateItem: (id: string, data: Partial<Item>) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  warehouseCount: number;
  itemLoading: boolean;
  warehouseLoading: boolean;
}

const ItemContext = createContext<ItemContextType | null>(null);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [itemLoading, setItemLoading] = useState(true);
  const [warehouseLoading, setWarehouseLoading] = useState(true);
  const warehouseCount = Array.from(new Set(items.map(item => item.warehouse_id))).length;
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [completeWarehouses, setCompleteWarehouses] = useState<Warehouse[]>([]);
  const { user, isGuest } = useAuth();

  const loadCompleteWarehouses = async () => {
    setWarehouseLoading(true);
    try {
      const res = await getCompleteWarehouses();
      setCompleteWarehouses(res.data);
    } catch (err) {
      console.error("Error loading complete structure:", err);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const warehouseRes = await getWarehouses();
      setWarehouses(warehouseRes.data);
    } catch (err) {
      console.error("Error loading warehouses:", err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setItemLoading(true);
      setWarehouseLoading(true);
      try {
        if (user || isGuest) {
          const res = await getItems();
          setItems(res.data);
        }
        if (user && !isGuest) {
          await Promise.all([
            loadWarehouses(),
            loadCompleteWarehouses(),
          ]);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setItemLoading(false);
        setWarehouseLoading(false);
      }
    };
    loadInitialData();
  }, [user, isGuest]);

  const loadAisles = async (warehouseId: string): Promise<Aisle[]> => {
    try {
      const res = await getAisles(warehouseId);
      return res.data;
    } catch (err) {
      console.error("Error loading aisles:", err);
      return [];
    }
  };

  const loadShelves = async (warehouseId: string, aisleId: string): Promise<Shelf[]> => {
    try {
      const res = await getShelves(warehouseId, aisleId);
      return res.data;
    } catch (err) {
      console.error("Error loading shelves:", err);
      return [];
    }
  };

  const getItemById = useCallback(async (id: string): Promise<Item | null> => {
    try {
      const res = await fetchItemById(id);
      return res.data;
    } catch (err) {
      console.error("Error fetching item:", err);
      return null;
    }
  }, []);

  const addItem = async (data: Omit<Item, "id">) => {
    try {
      const res = await createItem(data);
      setItems((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      console.error("Error creating item:", err);
      throw err;
    }
  };

  const editItem = async (id: string, data: Partial<Item>) => {
    try {
      const res = await updateItem(id, data);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
      return { success: true };
    } catch (err) {
      console.error("Error updating item:", err);
      throw err;
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting item:", err);
      throw err;
    }
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        warehouses,
        completeWarehouses,
        loadCompleteWarehouses,
        loadAisles,
        loadShelves,
        getItemById,
        addItem,
        updateItem: editItem,
        deleteItem: removeItem,
        warehouseCount,
        itemLoading,
        warehouseLoading,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

export function useItems(): ItemContextType {
  const context = useContext(ItemContext);
  if (!context) throw new Error('useItems must be used within a ItemsProvider');
  return context;
}