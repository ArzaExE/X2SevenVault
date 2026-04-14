import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { AddObjectDialog } from "../components/AddObjectDialog";
import { useItems } from "../context/ItemsContext";
import { useAuth } from "../context/AuthContext";
import { Search, Plus } from "lucide-react";
import { Navigate } from "react-router";
import { toast } from "react-hot-toast";

export function ObjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { items, warehouses, warehouseCount, addItem, deleteItem, itemLoading } = useItems();
  const { user, isGuest, authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (itemLoading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-zinc-700 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-zinc-400 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace/>;
  }


  const filteredObjects = items.filter(
    (obj) =>
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.warehouse_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.aisle_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.shelf_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this object?")) return;
    setError(null);
    setIsDeleting(true);

    try {
      await deleteItem(id);
      toast.success("Object deleted successfully");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error deleting object";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold">Objects Management</h1>
            <p className="text-zinc-400 mt-1">
              {!user ? "View vault objects (Read-only mode)" : "Manage and organize your vault objects"}
            </p>
          </div>
          {user && (
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Object
            </button>
          )}
        </div>
      </div>

      {/* Search Bar and Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, warehouse, aisle, or shelf..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Total Objects</p>
            <p className="text-white text-3xl font-semibold mt-2">{items.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">AI Enabled</p>
            <p className="text-white text-3xl font-semibold mt-2">
              {items.filter((obj) => obj.is_ai).length}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Warehouses</p>
            <p className="text-white text-3xl font-semibold mt-2">{warehouseCount}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Total Quantity</p>
            <p className="text-white text-3xl font-semibold mt-2">
              {items.reduce((sum, obj) => sum + obj.quantity, 0)}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable 
          items={filteredObjects} 
          onDelete={isGuest ? async () => {} : handleDelete} 
          isReadOnly={isGuest} 
        />
      </div>

      {/* Add Object Dialog */}
      {/* Mostra il dialogo solo se NON è guest e se è aperto */}
      {!isGuest && (
        <AddObjectDialog 
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={addItem}
          warehouses={warehouses} // Ora sarà piena solo per gli utenti loggati
        />
      )}
    </>
  );
}