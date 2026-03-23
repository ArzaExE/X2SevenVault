import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ObjectsPage } from "./pages/ObjectsPage";
import { ObjectDetailPage } from "./pages/ObjectDetailPage";
import { WarehousePage } from "./pages/WarehousePage";
import { UsersPage } from "./pages/UsersPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ObjectsPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "object/:id", Component: ObjectDetailPage },
      { path: "warehouse", Component: WarehousePage },
      { path: "users", Component: UsersPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);