import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ObjectsPage } from "./pages/ObjectsPage";
import { ObjectDetailPage } from "./pages/ObjectDetailPage";
import { WarehousePage } from "./pages/WarehousePage";
import { UsersPage } from "./pages/UsersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/login",
        Component: LoginPage,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, Component: DashboardPage },
            { path: "objects", Component: ObjectsPage },
            { path: "object/:id", Component: ObjectDetailPage },
            { path: "warehouse", Component: WarehousePage },
            { path: "users", Component: UsersPage },
            { path: "settings", Component: SettingsPage },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);