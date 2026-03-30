import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  getItems, 
  getItemById as fetchItemById, 
  deleteItem,
  createItem,
  updateItem
} 
from "../services/itemService";import { getWarehouses, deleteWarehouse } from "../services/WarehouseService";

//
// 🔹 1. TYPE
//
export interface Item {
  id: string;
  name: string;
  warehouse_id: string;
  aisle_id: string;
  shelf_id: string;
  is_ai: boolean;
  weight: number;
  width: number;
  height: number;
  quantity: number;
  description: string;
}

export interface Warehouse {
  id: string;
  name: string;
  aisles: Aisle[];
}

export interface Aisle {
  id: string;
  name: string;
  shelves: string[];
}

//
// 🔹 2. CONTEXT TYPE
//
interface DataContextType {
  items: Item[];
  getItemById: (id: string) => Promise<Item | null>;
  addItem: (data: Omit<Item, "id">) => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  warehouseCount: number;
  warehouses: Warehouse[];
  loading: boolean;
}

//
// 🔹 3. CREATE CONTEXT
//
const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const warehouseCount = Array.from(new Set(items.map(item => item.warehouse_id))).length;
  // 🔹 LOAD iniziale
  useEffect(() => {
    loadItems();
    loadWarehouses();
  }, []);

  const loadItems = async () => {
    try {
      const res = await getItems();
      console.log("Loaded items:", res.data);
      setItems(res.data);
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  };

    const loadWarehouses = async () => {
    try {
      const res = await getWarehouses();
      console.log("Loaded warehouses:", res.data);
      // Assuming you have a state for warehouses
      // setWarehouses(res.data);
    } catch (err) {
      console.error("Error loading warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  const getItemById = async (id: string): Promise<Item | null> => {
    try {
      const res = await fetchItemById(id);
      return res.data;
    } catch (err) {
      console.error("Error fetching item:", err);
      return null;
    }
  };

  const addItem = async (data: Omit<Item, "id">) => {
    try {
      const res = await createItem(data);
      setItems((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating item:", err);
    }
  };

  const editItem = async (id: string, data: Partial<Item>) => {
    try {
      const res = await updateItem(id, data);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };
  return (
    <DataContext.Provider
      value={{
        items,
        getItemById,
        addItem,
        updateItem: editItem,
        deleteItem: removeItem,
        warehouses,
        warehouseCount,
        loading
      }}
    >
      {children}
    </DataContext.Provider>
  );

}

export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
}
