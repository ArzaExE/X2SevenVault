import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  getUsers, 
  getUserById as fetchUserById, 
  deleteUser,
  createUser,
  updateUser
} 
from "../services/userService";
import { useAuth } from "./AuthContext";

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role_name: string;
  role_id: number;
  is_active: boolean;
}
//
// 🔹 2. CONTEXT TYPE
//
interface UserContextType {
  users: User[];
  roles: Role[];
  // loadUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | null>;
  createUser: (data: Omit<User, "id">) => Promise<any>;
  updateUser: (id: string, data: Partial<User>) => Promise<any>;
  deleteUser: (id: string) => Promise<any>;
  userLoading: boolean;
}



//
// 🔹 3. CREATE CONTEXT
//
const UserContext = createContext<UserContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const { user, isGuest } = useAuth();
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      // Iniziamo mettendo tutto in loading
      setUserLoading(true);

      try {
        // 2. Aspetta le Warehouse se non è guest
        if (user && !isGuest) {
          const userRes = await getUsers();
          const mapped = userRes.data.map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name ?? u.name ?? "",
            role_name: u.role_name ?? u.role ?? "",
            role_id: u.role_id ?? 0,
            is_active: u.is_active ?? true,
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        // SOLO ORA spegniamo i caricamenti, tutti insieme
        setUserLoading(false);
      }
    };

    loadInitialData();
  }, [user, isGuest]);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
  
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const getUserById = async (id: string): Promise<User | null> => {
    try {
      const res = await fetchUserById(id);
      return res.data;
    } catch (err) {
      console.error("Error fetching user:", err);
      return null;
    }
  };

  const addUser = async (data: Omit<User, "id">) => {
    try {
      const res = await createUser(data);
      const raw = res.data;
      const mapped: User = {
        id: raw.id,
        email: raw.email,
        full_name: raw.full_name ?? raw.name ?? "",
        role_name: raw.role_name ?? raw.role ?? "",
        role_id: raw.role_id ?? 0,
        is_active: raw.is_active ?? true,
      };
      setUsers((prev) => [...prev, mapped]);
      return { success: true };
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  };

  const editUser = async (id: string, data: Partial<User>) => {
    try {
        const res = await updateUser(id, data);
        const raw = res.data;
        const mapped: User = {
          id: raw.id,
          email: raw.email,
          full_name: raw.full_name ?? raw.name ?? "",
          role_name: raw.role_name ?? raw.role ?? "",
          role_id: raw.role_id ?? 0,
          is_active: raw.is_active ?? true,
        };
        setUsers((prev) => prev.map((u) => (u.id === id ? mapped : u)));
        return { success: true };
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  const removeUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        roles,
        // loadUsers,
        getUserById,
        createUser: addUser,
        updateUser: editUser,
        deleteUser: removeUser,
        userLoading
      }}
    >
      {children}
    </UserContext.Provider>
  );

}

export function useUsers(): UserContextType {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUsers must be used within a UsersProvider');
    return context;
}
