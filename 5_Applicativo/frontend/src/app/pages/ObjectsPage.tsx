import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { AddObjectDialog } from "../components/AddObjectDialog";
import { useData } from "../data/store";
import { Search, Plus } from "lucide-react";

export function ObjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { objects, addObject, deleteObject, warehouses } = useData();

  const filteredObjects = objects.filter(
    (obj) =>
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.aisle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.shelf.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold">Objects Management</h1>
            <p className="text-zinc-400 mt-1">Manage and organize your vault objects</p>
          </div>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Object
          </button>
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
            <p className="text-white text-3xl font-semibold mt-2">{objects.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">AI Enabled</p>
            <p className="text-white text-3xl font-semibold mt-2">
              {objects.filter((obj) => obj.ai).length}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Warehouses</p>
            <p className="text-white text-3xl font-semibold mt-2">{warehouses.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">Total Quantity</p>
            <p className="text-white text-3xl font-semibold mt-2">
              {objects.reduce((sum, obj) => sum + obj.quantity, 0)}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable objects={filteredObjects} onDelete={deleteObject} />
      </div>

      {/* Add Object Dialog */}
      <AddObjectDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addObject}
      />
    </>
  );
}