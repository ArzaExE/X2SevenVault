import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/axios';

interface UserProfile {
    user_id: string;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    authLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loginAsGuest: () => void;
    isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const [token, setToken] = useState<string | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

            const guest = localStorage.getItem("guest") === "true";
            setIsGuest(guest);


            // 👉 CASO GUEST → niente API
            if (guest) {
                setUser(null);
                setProfile(null);
                setAuthLoading(false);
                return;
            }

            // 👉 CASO LOGGATO
            if (firebaseUser) {
                setUser(firebaseUser);

                try {
                    const response = await api.get('/me');
                    setProfile(response.data);
                } catch (error) {
                    console.error('Error loading profile:', error);
                    setUser(null);
                    setProfile(null);
                } finally {
                    setAuthLoading(false);
                }
            } 
            else {
                setUser(null);
                setProfile(null);
                setAuthLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            setAuthLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setAuthLoading(false);
            throw error;
        }
    };

    const loginAsGuest = () => {
        try {
            setAuthLoading(true);
            localStorage.setItem("guest", "true");
            setIsGuest(true);
            setUser(null);
            setProfile(null);
        } finally {
            setAuthLoading(false); 
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await signOut(auth);
            localStorage.removeItem("guest"); 
            setIsGuest(false);
        } finally {
            setAuthLoading(false);
            console.log("User logged out: ", authLoading);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, isGuest, authLoading, login, loginAsGuest, logout  }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}