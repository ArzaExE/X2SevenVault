// import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { getWarehouses, deleteWarehouse } from "../services/WarehouseService";


// export interface Warehouse {
//   id: string;
//   name: string;
//   aisles: Aisle[];
// }

// export interface Aisle {
//   id: string;
//   name: string;
//   shelves: string[];
// }

// //
// // 🔹 2. CONTEXT TYPE
// //
// interface DataContextType {
//   deleteItem: (id: string) => Promise<void>;
//   warehouseCount: number;
//   warehouses: Warehouse[];
//   loading: boolean;
// }

// //
// // 🔹 3. CREATE CONTEXT
// //
// const DataContext = createContext<DataContextType | null>(null);

// export function DataProvider({ children }: { children: ReactNode }) {
//   const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     // loadItems();
//     // loadWarehouses();
//   }, []);



//     const loadWarehouses = async () => {
//     try {
//       const res = await getWarehouses();
//       // Assuming you have a state for warehouses
//       // setWarehouses(res.data);
//     } catch (err) {
//       console.error("Error loading warehouses:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DataContext.Provider
//       value={{
//         // items,
//         // getItemById,
//         // addItem,
//         // updateItem: editItem,
//         // deleteItem: removeItem,
//         warehouses,
//         // warehouseCount,
//         loading
//       }}
//     >
//       {children}
//     </DataContext.Provider>
//   );

// }

// export function useData(): DataContextType {
//     const context = useContext(DataContext);
//     if (!context) throw new Error('useData must be used within a DataProvider');
//     return context;
// }
