import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  getWarehouseById as fetchWarehouseById,
  getWarehouses, 
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getShelves,
  getAisles,
  createAisle,
  createShelf,
  updateAisle,
  updateShelf,
  deleteAisle,
  deleteShelf
} 
from "../services/warehouseService";
import { useAuth } from "./AuthContext";

export interface Warehouse {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  aisles: Aisle[];
}

export interface Aisle {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  shelves: Shelf[];
}

export interface Shelf {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  shelves: Shelf[];
}


//
// 🔹 2. CONTEXT TYPE
//
interface WarehouseContextType {
  warehouses: Warehouse[];
  getWarehouseById: (id: string) => Promise<Warehouse | null>;
  addWarehouse: (data: Omit<Warehouse, "id">) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  addAisle: (warehouseId: string, data: { aisle_id: string; name: string; description?: string; is_active?: boolean }) => Promise<void>;
  addShelf: (warehouseId: string, aisleId: string, data: { shelf_id: string; name: string; description?: string; is_active?: boolean }) => Promise<void>;
  updateAisle: (warehouseId: string, aisleId: string, data: Partial<Aisle>) => Promise<void>;
  updateShelf: (warehouseId: string, aisleId: string, shelfId: string, data: Partial<Shelf>) => Promise<void>;
  deleteAisle: (warehouseId: string, aisleId: string) => Promise<void>;
  deleteShelf: (warehouseId: string, aisleId: string, shelfId: string) => Promise<void>;
  warehouseLoading: boolean;
}


//
// 🔹 3. CREATE CONTEXT
//
const WarehouseContext = createContext<WarehouseContextType | null>(null);

export function WarehousesProvider({ children }: { children: ReactNode }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(true);
  const { user, isGuest } = useAuth();
  // 🔹 LOAD iniziale
  useEffect(() => {
      const loadInitialData = async () => {
          setWarehouseLoading(true);
          try {
              if (user && !isGuest) {
                  const warehouseRes = await getWarehouses();
                  const warehouseList = warehouseRes.data;

                  const warehousesWithAisles = await Promise.all(
                      warehouseList.map(async (wh: Warehouse) => {
                          const aisleRes = await getAisles(wh.id);
                          const aisles = aisleRes.data;

                          const aislesWithShelves = await Promise.all(
                              aisles.map(async (aisle: Aisle) => {
                                  const shelfRes = await getShelves(wh.id, aisle.id);
                                  return {
                                      ...aisle,
                                      shelves: shelfRes.data,
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
              }
          } catch (err) {
              console.error("Initialization error:", err);
          } finally {
              setWarehouseLoading(false);
          }
      };

      loadInitialData();
  }, [user, isGuest]);


  const loadWarehouses = async () => {
    try {
      const res = await getWarehouses();
  
      setWarehouses(res.data);
    } catch (err) {
      console.error("Error loading warehouses:", err);
    }
  };

  const loadAisles = async (warehouseId: string): Promise<Aisle[]> => {
    try {
      const res = await getAisles(warehouseId);
      return res.data;
    } catch (err) {
      console.error("Error loading aisles:", err);
      return [];
    }
  };
  
  // Funzione per caricare gli scaffali di una specifica corsia
  const loadShelves = async (warehouseId: string, aisleId: string): Promise<Shelf[]> => {
    try {
      const res = await getShelves(warehouseId, aisleId);
      return res.data;
    } catch (err) {
      console.error("Error loading shelves:", err);
      return [];
    }
  };


  const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
    try {
      const res = await fetchWarehouseById(id);
      return res.data;
    } catch (err) {
      console.error("Error fetching warehouse:", err);
      return null;
    }
  };

  const addWarehouse = async (data: Omit<Warehouse, "id">) => {
    try {
      const res = await createWarehouse(data);
      setWarehouses((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating warehouse:", err);
      throw err;
    }
  };

  const addAisle = async (warehouseId: string, data: { aisle_id: string; name: string; description?: string; is_active?: boolean }) => {
    try {
        const res = await createAisle(warehouseId, data);
        const newAisle = { ...res.data, shelves: [] };

        setWarehouses(prev => prev.map(wh =>
            wh.id === warehouseId
                ? { ...wh, aisles: [...(wh.aisles ?? []), newAisle] }
                : wh
        ));
    } catch (err) {
        console.error("Error creating aisle:", err);
        throw err;
    }
  };

  const addShelf = async (warehouseId: string, aisleId: string, data: { shelf_id: string; name: string; description?: string; is_active?: boolean }) => {
    try {
        const res = await createShelf(warehouseId, aisleId, data);
        const newShelf = res.data;

        setWarehouses(prev => prev.map(wh =>
            wh.id === warehouseId
                ? {
                    ...wh,
                    aisles: wh.aisles.map(a =>
                        a.id === aisleId
                            ? { ...a, shelves: [...(a.shelves ?? []), newShelf] }
                            : a
                    )
                }
                : wh
        ));
    } catch (err) {
        console.error("Error creating shelf:", err);
        throw err;
    }
  };

  const editWarehouse = async (id: string, data: Partial<Warehouse>) => {
    try {
      const { aisles, id: _id, ...payload } = data;
      const res = await updateWarehouse(id, payload);
      setWarehouses((prev) =>
        prev.map((warehouse) => (warehouse.id === id ? { ...warehouse, ...res.data } : warehouse))
      );
    } catch (err) {
      console.error("Error updating warehouse:", err);
      throw err;
    }
  };

  const editAisle = async (warehouseId: string, aisleId: string, data: Partial<Aisle>) => {
    try {
      await updateAisle(warehouseId, aisleId, data);
      setWarehouses(prev => prev.map(wh =>
        wh.id === warehouseId
          ? {
              ...wh,
              aisles: wh.aisles.map(a =>
                a.id === aisleId
                  ? { ...a, ...data, shelves: a.shelves }
                  : a
              )
            }
          : wh
      ));
    } catch (err) {
      console.error("Error updating aisle:", err);
      throw err;
    }
  };

  const editShelf = async (warehouseId: string, aisleId: string, shelfId: string, data: Partial<Shelf>) => {
    try {
      await updateShelf(warehouseId, aisleId, shelfId, data);
      setWarehouses(prev => prev.map(wh =>
        wh.id === warehouseId
          ? {
              ...wh,
              aisles: wh.aisles.map(a =>
                a.id === aisleId
                  ? {
                      ...a,
                      shelves: a.shelves.map(s =>
                        s.id === shelfId
                          ? { ...s, ...data, shelves: s.shelves }
                          : s
                      )
                    }
                  : a
              )
            }
          : wh
      ));
    } catch (err) {
      console.error("Error updating shelf:", err);
      throw err;
    }
  };

  const removeWarehouse = async (id: string) => {
    try {
      await deleteWarehouse(id);
      setWarehouses((prev) => prev.filter((warehouse) => warehouse.id !== id));
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      throw err;
    }
  };

  const removeAisle = async (warehouseId: string, aisleId: string) => {
    try {
      await deleteAisle(warehouseId, aisleId);
      setWarehouses((prev) => prev.map((warehouse) => ({
        ...warehouse,
        aisles: warehouse.aisles.filter((aisle) => aisle.id !== aisleId)
      })));
    } catch (err) {
      console.error("Error deleting aisle:", err);
      throw err;
    }
  };

    const removeShelf = async (warehouseId: string, aisleId: string, shelfId: string) => {
    try {
      await deleteShelf(warehouseId, aisleId, shelfId);
      setWarehouses((prev) => prev.map((warehouse) => ({
        ...warehouse,
        aisles: warehouse.aisles.filter((aisle) => aisle.id !== aisleId)
      })));
    } catch (err) {
      console.error("Error deleting aisle:", err);
      throw err;
    }
  };

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        getWarehouseById,
        addWarehouse,
        updateWarehouse: editWarehouse,
        deleteWarehouse: removeWarehouse,
        deleteAisle: removeAisle,
        deleteShelf: removeShelf,
        addAisle,
        addShelf,
        updateAisle: editAisle,
        updateShelf: editShelf,
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
