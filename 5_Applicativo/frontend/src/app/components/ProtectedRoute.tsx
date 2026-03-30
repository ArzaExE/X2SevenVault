import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isGuest, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <p className="text-zinc-400">Loading...</p>
            </div>
        );
    }

    if (!user && !isGuest) {
        return <Navigate to="/login" replace />;
    }

    if (isGuest && !location.pathname.startsWith("/objects")) {
        return <Navigate to="/objects" replace />;
    }

    return <>{children}</>;
}