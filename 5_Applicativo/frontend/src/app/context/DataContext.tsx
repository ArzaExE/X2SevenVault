import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getItems, deleteItem } from "../services/itemService";
import { getWarehouses, deleteWarehouse } from "../services/WarehouseService";

//
// 🔹 1. TYPE
//
export interface VaultObject {
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
  objects: VaultObject[];
  warehouseCount: number;
  warehouses: Warehouse[];
  deleteObject: (id: string) => void;
  loading: boolean;
}

//
// 🔹 3. CREATE CONTEXT
//
const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [objects, setObjects] = useState<VaultObject[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const warehouseCount = Array.from(new Set(objects.map(obj => obj.warehouse_id))).length;
  // 🔹 LOAD iniziale
  useEffect(() => {
    loadItems();
    loadWarehouses();
  }, []);

  const loadItems = async () => {
    try {
      const res = await getItems();
      console.log("Loaded items:", res.data);
      setObjects(res.data);
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

//   // 🔹 ADD
//   const addObject = async (data: any) => {
//     const res = await createItem(data);
//     setObjects((prev) => [...prev, res.data]);
//   };

//   // 🔹 DELETE
  const removeObject = async (id: string) => {
    await deleteItem(id);
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        objects,
        warehouses,
        warehouseCount,
        loading,
        deleteObject: removeObject
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
