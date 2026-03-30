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
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loginAsGuest: () => void;
    isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    const loginAsGuest = () => setIsGuest(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const response = await api.get('/me');
                    setProfile(response.data);
                } catch (error) {
                    console.error('Error loading profile:', error);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async (): Promise<void> => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, profile, isGuest, loading, login, loginAsGuest, logout  }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}