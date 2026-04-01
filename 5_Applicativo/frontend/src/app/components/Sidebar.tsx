import { Package, Home, Warehouse, Settings, Users, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, isGuest, logout, authLoading } = useAuth();


    const allNavItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, path: "/", roles: ["admin", "operator"] },
        { id: "objects", label: "Objects", icon: Package, path: "/objects", roles: ["admin", "operator", "guest"] },
        { id: "warehouse", label: "Warehouse", icon: Warehouse, path: "/warehouse", roles: ["admin", "operator"] },
        { id: "users", label: "Users", icon: Users, path: "/users", roles: ["admin"] },
        { id: "settings", label: "Settings", icon: Settings, path: "/settings", roles: ["admin", "operator"] },
    ];

    const role = profile?.role ?? (isGuest ? "guest" : "");

    const navItems = allNavItems.filter((item) =>
        role ? item.roles.includes(role) : false
    );

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (authLoading) {
        return (
        <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400 text-lg">Loading...</p>
        </div>
        );
    }

    return (
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-semibold text-lg">X2SevenVault</h1>
                        <p className="text-zinc-400 text-xs">Admin Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                            {profile?.name?.charAt(0) ?? "G"}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{!profile?.name ? "Guest User" : profile?.name}</p>
                        <p className="text-zinc-400 text-xs truncate">{profile?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
}