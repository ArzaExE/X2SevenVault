import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "../config/axios";

export interface VaultObject {
  id: string;
  name: string;
  warehouse: string;
  aisle: string;
  shelf: string;
  ai: boolean;
  weight: number; // in kg
  width: number; // in cm
  height: number; // in cm
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Operator";
  status: "Active" | "Inactive";
}

interface DataContextType {
  objects: VaultObject[];
  warehouses: Warehouse[];
  users: User[];
  addObject: (object: Omit<VaultObject, "id">) => void;
  updateObject: (id: string, object: Partial<VaultObject>) => void;
  deleteObject: (id: string) => void;
  getObject: (id: string) => VaultObject | undefined;
  addWarehouse: (warehouse: Omit<Warehouse, "id">) => void;
  updateWarehouse: (id: string, warehouse: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;
  addAisle: (warehouseId: string, aisle: Omit<Aisle, "id">) => void;
  deleteAisle: (warehouseId: string, aisleId: string) => void;
  addShelf: (warehouseId: string, aisleId: string, shelf: string) => void;
  deleteShelf: (warehouseId: string, aisleId: string, shelf: string) => void;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Converte il formato API Laravel nel formato locale
function mapApiUserToLocal(apiUser: any): User {
    const role = apiUser.role.charAt(0).toUpperCase() + apiUser.role.slice(1) as "Admin" | "Operator";
    const status = apiUser.is_active ? "Active" : "Inactive" as "Active" | "Inactive";
    return {
        id:     apiUser.id,
        name:   apiUser.name,
        email:  apiUser.email,
        role,
        status,
    };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [objects, setObjects] = useState<VaultObject[]>([
    {
      id: "1",
      name: "Server Rack A1",
      warehouse: "Warehouse North",
      aisle: "A",
      shelf: "01",
      ai: true,
      weight: 850,
      width: 60,
      height: 200,
      quantity: 1,
      description: "Main server rack containing production servers and network equipment.",
    },
    {
      id: "2",
      name: "Network Switch",
      warehouse: "Warehouse North",
      aisle: "B",
      shelf: "03",
      ai: false,
      weight: 12,
      width: 45,
      height: 5,
      quantity: 1,
      description: "48-port gigabit Ethernet switch for local network connectivity.",
    },
    {
      id: "3",
      name: "Storage Array",
      warehouse: "Warehouse South",
      aisle: "C",
      shelf: "05",
      ai: true,
      weight: 320,
      width: 55,
      height: 90,
      quantity: 1,
      description: "High-capacity storage array with 24TB total capacity and RAID configuration.",
    },
    {
      id: "4",
      name: "Backup System",
      warehouse: "Warehouse North",
      aisle: "A",
      shelf: "12",
      ai: false,
      weight: 45,
      width: 50,
      height: 30,
      quantity: 1,
      description: "Automated backup system for daily incremental backups.",
    },
    {
      id: "5",
      name: "UPS Unit",
      warehouse: "Warehouse South",
      aisle: "D",
      shelf: "08",
      ai: true,
      weight: 180,
      width: 40,
      height: 85,
      quantity: 1,
      description: "Uninterruptible power supply unit providing backup power for critical systems.",
    },
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "1",
      name: "Warehouse North",
      aisles: [
        { id: "1", name: "A", shelves: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"] },
        { id: "2", name: "B", shelves: ["01", "02", "03", "04", "05", "06", "07", "08"] },
        { id: "3", name: "C", shelves: ["01", "02", "03", "04", "05"] },
      ],
    },
    {
      id: "2",
      name: "Warehouse South",
      aisles: [
        { id: "4", name: "C", shelves: ["01", "02", "03", "04", "05", "06"] },
        { id: "5", name: "D", shelves: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"] },
      ],
    },
  ]);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

    // Carica utenti all'avvio
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (search?: string) => {
        setUsersLoading(true);
        try {
            const url = search ? `/users/search/${search}` : '/users';
            const response = await api.get(url);
            setUsers(response.data.map(mapApiUserToLocal));
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    // casamatta passs: 0yb78qq7qt1!Aa

    const addUser = async (user: Omit<User, "id">): Promise<void> => {
      const generatedPassword = Math.random().toString(36).slice(-10) + "1!Aa";  
      
      try {
            const response = await api.post('/users', {
                email:     user.email,
                full_name: user.name,
                password:  generatedPassword,
                role_id:   user.role === 'Admin' ? 1 : 2,
                role_name: user.role.toLowerCase(),
                is_active: user.status === 'Active',
            });
            
            const newUser = mapApiUserToLocal(response.data);
            setUsers(prev => [...prev, newUser]);

            alert(`User created! Temporary password: ${generatedPassword}`);
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, ...updates } : user)));
  };

  const deleteUser = async (id: string) => {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
  };

    const addObject = (object: Omit<VaultObject, "id">) => {
    const newObject = { ...object, id: Date.now().toString() };
    setObjects([...objects, newObject]);
  };

  const updateObject = (id: string, updates: Partial<VaultObject>) => {
    setObjects(objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)));
  };

  const deleteObject = (id: string) => {
    setObjects(objects.filter((obj) => obj.id !== id));
  };

  const getObject = (id: string) => {
    return objects.find((obj) => obj.id === id);
  };

  const addWarehouse = (warehouse: Omit<Warehouse, "id">) => {
    const newWarehouse = { ...warehouse, id: Date.now().toString() };
    setWarehouses([...warehouses, newWarehouse]);
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses(warehouses.map((wh) => (wh.id === id ? { ...wh, ...updates } : wh)));
  };

  const deleteWarehouse = (id: string) => {
    setWarehouses(warehouses.filter((wh) => wh.id !== id));
  };

  const addAisle = (warehouseId: string, aisle: Omit<Aisle, "id">) => {
    setWarehouses(
      warehouses.map((wh) => {
        if (wh.id === warehouseId) {
          const newAisle = { ...aisle, id: Date.now().toString() };
          return { ...wh, aisles: [...wh.aisles, newAisle] };
        }
        return wh;
      })
    );
  };

  const deleteAisle = (warehouseId: string, aisleId: string) => {
    setWarehouses(
      warehouses.map((wh) => {
        if (wh.id === warehouseId) {
          return { ...wh, aisles: wh.aisles.filter((a) => a.id !== aisleId) };
        }
        return wh;
      })
    );
  };

  const addShelf = (warehouseId: string, aisleId: string, shelf: string) => {
    setWarehouses(
      warehouses.map((wh) => {
        if (wh.id === warehouseId) {
          return {
            ...wh,
            aisles: wh.aisles.map((a) => {
              if (a.id === aisleId) {
                return { ...a, shelves: [...a.shelves, shelf] };
              }
              return a;
            }),
          };
        }
        return wh;
      })
    );
  };

  const deleteShelf = (warehouseId: string, aisleId: string, shelf: string) => {
    setWarehouses(
      warehouses.map((wh) => {
        if (wh.id === warehouseId) {
          return {
            ...wh,
            aisles: wh.aisles.map((a) => {
              if (a.id === aisleId) {
                return { ...a, shelves: a.shelves.filter((s) => s !== shelf) };
              }
              return a;
            }),
          };
        }
        return wh;
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        objects,
        warehouses,
        users,
        addObject,
        updateObject,
        deleteObject,
        getObject,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        addAisle,
        deleteAisle,
        addShelf,
        deleteShelf,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
}