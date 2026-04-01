import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useItems } from "../context/ItemsContext";
import { Package, Warehouse, Bot } from "lucide-react";

export function DashboardPage() {
  const { items, warehouses, itemLoading, warehouseLoading } = useItems();
  const { user, isGuest, authLoading } = useAuth();

  if (itemLoading || authLoading || warehouseLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace/>;
  }

  const aiEnabledCount = items.filter((obj) => obj.is_ai).length;

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <div>
          <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Overview of your X2SevenVault system</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8" />
              <span className="text-blue-200 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold mb-1">{items.length}</p>
            <p className="text-blue-200 text-sm">Objects in Vault</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Warehouse className="w-8 h-8" />
              <span className="text-purple-200 text-sm">Active</span>
            </div>
            <p className="text-3xl font-bold mb-1">{warehouses.length}</p>
            <p className="text-purple-200 text-sm">Warehouses</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Bot className="w-8 h-8" />
              <span className="text-green-200 text-sm">AI</span>
            </div>
            <p className="text-3xl font-bold mb-1">{aiEnabledCount}</p>
            <p className="text-green-200 text-sm">AI Enabled</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Warehouse Distribution</h2>
            <div className="space-y-3">
              {warehouses.map((warehouse) => {
                const warehouseObjects = items.filter((obj) => obj.warehouse_id === warehouse.id);
                const percentage = items.length > 0 ? (warehouseObjects.length / items.length) * 100 : 0;
                return (
                  <div key={warehouse.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-300">{warehouse.name}</span>
                      <span className="text-white font-medium">{warehouseObjects.length} objects</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Recent Objects</h2>
            <div className="space-y-3">
              {items.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-zinc-400 text-sm">
                        {item.warehouse_id}, {item.aisle_id}-{item.shelf_id}
                      </p>
                    </div>
                  </div>
                  {item.is_ai && (
                    <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}