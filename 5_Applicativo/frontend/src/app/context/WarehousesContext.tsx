import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  deleteWarehouse,
  getWarehouses, 
} 
from "../services/warehouseService";

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

export interface Shelf {
  id: string;
  name: string;
  shelves: string[];
}


//
// 🔹 2. CONTEXT TYPE
//
interface WarehouseContextType {
  warehouses: Warehouse[];
  // getWarehouseById: (id: string) => Promise<Warehouse | null>;
  // addWarehouse: (data: Omit<Warehouse, "id">) => Promise<void>;
  // updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  // deleteWarehouse: (id: string) => Promise<void>;
  // warehouseCount: number;
  warehouseLoading: boolean;
}


//
// 🔹 3. CREATE CONTEXT
//
const WarehouseContext = createContext<WarehouseContextType | null>(null);

export function WarehousesProvider({ children }: { children: ReactNode }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(true);
  // 🔹 LOAD iniziale
  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const res = await getWarehouses();
  
      setWarehouses(res.data);
    } catch (err) {
      console.error("Error loading warehouses:", err);
    } finally {
      setWarehouseLoading(false);
    }
  };

  // const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
  //   try {
  //     const res = await fetchWarehouseById(id);
  //     return res.data;
  //   } catch (err) {
  //     console.error("Error fetching warehouse:", err);
  //     return null;
  //   }
  // };

  // const addWarehouse = async (data: Omit<Warehouse, "id">) => {
  //   try {
  //     const res = await createWarehouse(data);
  //     setWarehouses((prev) => [...prev, res.data]);
  //   } catch (err) {
  //     console.error("Error creating warehouse:", err);
  //   }
  // };

  // const editWarehouse = async (id: string, data: Partial<Warehouse>) => {
  //   try {
  //     const res = await updateWarehouse(id, data);
  //     setWarehouses((prev) =>
  //       prev.map((warehouse) => (warehouse.id === id ? res.data : warehouse))
  //     );
  //   } catch (err) {
  //     console.error("Error updating warehouse:", err);
  //   }
  // };

  // const removeWarehouse = async (id: string) => {
  //   try {
  //     await deleteWarehouse(id);
  //     setWarehouses((prev) => prev.filter((warehouse) => warehouse.id !== id));
  //   } catch (err) {
  //     console.error("Error deleting warehouse:", err);
  //   }
  // };

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        // getWarehouseById,
        // addWarehouse,
        // updateWarehouse: editWarehouse,
        // deleteWarehouse: removeWarehouse,
        // warehouseCount,
        warehouseLoading
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );

}

export function useWarehouses(): WarehouseContextType {
    const context = useContext(WarehouseContext);
    if (!context) throw new Error('useWarehouses must be used within a WarehousesProvider');
    return context;
}
