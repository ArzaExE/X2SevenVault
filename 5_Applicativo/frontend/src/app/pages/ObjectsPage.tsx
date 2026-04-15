import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { AddObjectDialog } from "../components/AddObjectDialog";
import { useItems } from "../context/ItemsContext";
import { useAuth } from "../context/AuthContext";
import { Search, Plus } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function ObjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { items, warehouses, warehouseCount, addItem, deleteItem, itemLoading, loadCompleteWarehouses } = useItems();
  const { user, isGuest, authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const navigate = useNavigate();


  const handleRowClick = (id: string) => {
    loadCompleteWarehouses(); // fire and forget, non aspettiamo
    navigate(`/object/${id}`);
  };

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

  const handleDelete = async () => {
    if (!confirmId) return;
    setIsDeleting(true);
    try {
      await deleteItem(confirmId);
      toast.success("Object deleted successfully");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error deleting object";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setConfirmId(null);
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
          onDelete={isGuest ? async () => {} : async (id) => setConfirmId(id)} 
          onRowClick={handleRowClick}
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
      {!isGuest && (
        <ConfirmDialog
          isOpen={!!confirmId}
          itemName={items.find(i => i.id === confirmId)?.name}
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}