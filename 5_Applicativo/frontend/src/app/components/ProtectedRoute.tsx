import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isGuest } = useAuth();


    if (!user && !isGuest) {
        return <Navigate to="/login" replace />;
    }

    if (isGuest && !location.pathname.startsWith("/objects")) {
        return <Navigate to="/objects" replace />;
    }

    return <>{children}</>;
}