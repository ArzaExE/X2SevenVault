import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  getItems, 
  getItemById as fetchItemById, 
  deleteItem,
  createItem,
  updateItem
} 
from "../services/itemService";
import { getWarehouses, getAisles, getShelves } from "../services/warehouseService";
import { useAuth } from "./AuthContext";

export interface Item {
  id: string;
  name: string;
  warehouse_id: string;
  aisle_id: string;
  shelf_id: string;
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
  shelves: Shelf[]; // array di oggetti, non stringhe
}

export interface Warehouse {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  aisles: Aisle[];
}

//
// 🔹 2. CONTEXT TYPE
//
interface ItemContextType {
  items: Item[];
  warehouses: Warehouse[];
  getItemById: (id: string) => Promise<Item | null>;
  addItem: (data: Omit<Item, "id">) => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  warehouseCount: number;
  itemLoading: boolean;
  warehouseLoading: boolean;
}


//
// 🔹 3. CREATE CONTEXT
//
const ItemContext = createContext<ItemContextType | null>(null);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [itemLoading, setItemLoading] = useState(true);
  const [warehouseLoading, setWarehouseLoading] = useState(true);
  const warehouseCount = Array.from(new Set(items.map(item => item.warehouse_id))).length;
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const { user, isGuest } = useAuth();

  // 🔹 LOAD iniziale
  useEffect(() => {
    if (user || isGuest) {
        loadItems();
        loadWarehouses();
    } else {
        setItemLoading(false);
        setWarehouseLoading(false);
    }
  }, [user, isGuest]);

  const loadItems = async () => {
    try {
      const res = await getItems();
  
      setItems(res.data);
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setItemLoading(false);
    }
  };

  const loadWarehouses = async () => {
      try {
          // 1. Carica tutti i warehouse
          const warehouseRes = await getWarehouses();
          const warehouseList = warehouseRes.data;

          // 2. Per ogni warehouse carica le aisles
          const warehousesWithAisles = await Promise.all(
              warehouseList.map(async (wh: any) => {
                  const aisleRes = await getAisles(wh.id);
                  const aisles = aisleRes.data;

                  // 3. Per ogni aisle carica gli shelves
                  const aislesWithShelves = await Promise.all(
                      aisles.map(async (aisle: any) => {
                          const shelfRes = await getShelves(wh.id, aisle.id);
                          return {
                              ...aisle,
                              shelves: shelfRes.data, // array di shelf objects
                          };
                      })
                  );

                  return {
                      ...wh,
                      aisles: aislesWithShelves,
                  };
              })
          );

          setWarehouses(warehousesWithAisles);
      } catch (err) {
          console.error("Error loading warehouses:", err);
      } finally {
          setWarehouseLoading(false);
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
    <ItemContext.Provider
      value={{
        items,
        warehouses,
        getItemById,
        addItem,
        updateItem: editItem,
        deleteItem: removeItem,
        warehouseCount,
        itemLoading,
        warehouseLoading
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
