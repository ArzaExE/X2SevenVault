import { useState } from "react";
import { useData } from "../data/store";
import { Plus, Trash2, Package, X, Edit } from "lucide-react";

export function WarehousePage() {
  const { warehouses, objects, addWarehouse, updateWarehouse, deleteWarehouse, addAisle, deleteAisle, addShelf, deleteShelf } = useData();
  const [isAddWarehouseDialogOpen, setIsAddWarehouseDialogOpen] = useState(false);
  const [isEditWarehouseDialogOpen, setIsEditWarehouseDialogOpen] = useState(false);
  const [isAddAisleDialogOpen, setIsAddAisleDialogOpen] = useState(false);
  const [isAddShelfDialogOpen, setIsAddShelfDialogOpen] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [editWarehouseName, setEditWarehouseName] = useState("");
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);
  const [newAisleName, setNewAisleName] = useState("");
  const [newShelfName, setNewShelfName] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    warehouses.length > 0 ? warehouses[0].id : null
  );
  const [selectedAisle, setSelectedAisle] = useState<string | null>(null);

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWarehouseName) {
      addWarehouse({
        name: newWarehouseName,
        aisles: [],
      });
      setNewWarehouseName("");
      setIsAddWarehouseDialogOpen(false);
    }
  };

  const handleEditWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWarehouseId && editWarehouseName) {
      updateWarehouse(editingWarehouseId, {
        name: editWarehouseName,
      });
      setEditWarehouseName("");
      setIsEditWarehouseDialogOpen(false);
    }
  };

  const handleAddAisle = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWarehouse && newAisleName) {
      addAisle(selectedWarehouse, {
        name: newAisleName,
        shelves: [],
      });
      setNewAisleName("");
      setIsAddAisleDialogOpen(false);
    }
  };

  const handleAddShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWarehouse && selectedAisle && newShelfName) {
      addShelf(selectedWarehouse, selectedAisle, newShelfName);
      setNewShelfName("");
      setIsAddShelfDialogOpen(false);
    }
  };

  const selectedWarehouseData = warehouses.find((wh) => wh.id === selectedWarehouse);
  const totalLocations = warehouses.reduce(
    (sum, wh) => sum + wh.aisles.reduce((s, a) => s + a.shelves.length, 0),
    0
  );
  const occupiedLocations = new Set(objects.map((obj) => `${obj.warehouse}-${obj.aisle}-${obj.shelf}`)).size;

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold">Warehouse Management</h1>
            <p className="text-zinc-400 mt-1">Manage warehouses, aisles, and shelves</p>
          </div>
          <button
            onClick={() => setIsAddWarehouseDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Warehouse List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">Warehouses</h2>
              <span className="text-zinc-400 text-sm">Total: {warehouses.length}</span>
            </div>
            <div className="space-y-2">
              {warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedWarehouse === warehouse.id
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                  onClick={() => {
                    setSelectedWarehouse(warehouse.id);
                    setSelectedAisle(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{warehouse.name}</p>
                      <p className={`text-xs ${selectedWarehouse === warehouse.id ? "text-blue-200" : "text-zinc-500"}`}>
                        {warehouse.aisles.length} aisles
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingWarehouseId(warehouse.id);
                        setEditWarehouseName(warehouse.name);
                        setIsEditWarehouseDialogOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWarehouse(warehouse.id);
                        if (selectedWarehouse === warehouse.id) {
                          setSelectedWarehouse(warehouses[0]?.id || null);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warehouse Details */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            {selectedWarehouseData ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-lg font-semibold">
                    {selectedWarehouseData.name} - Aisles & Shelves
                  </h2>
                  <button
                    onClick={() => setIsAddAisleDialogOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Aisle
                  </button>
                </div>
                <div className="space-y-4">
                  {selectedWarehouseData.aisles.map((aisle) => (
                    <div key={aisle.id} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">Aisle {aisle.name}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAisle(aisle.id);
                              setIsAddShelfDialogOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded hover:bg-zinc-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add Shelf
                          </button>
                          <button
                            onClick={() => deleteAisle(selectedWarehouse!, aisle.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aisle.shelves.map((shelf) => (
                          <div
                            key={shelf}
                            className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-700 text-zinc-300 rounded text-sm"
                          >
                            <span>Shelf {shelf}</span>
                            <button
                              onClick={() => deleteShelf(selectedWarehouse!, aisle.id, shelf)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {aisle.shelves.length === 0 && (
                          <p className="text-zinc-500 text-sm">No shelves yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedWarehouseData.aisles.length === 0 && (
                    <p className="text-zinc-500 text-center py-8">
                      No aisles configured for this warehouse yet.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500">Select a warehouse to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Warehouse Dialog */}
      {isAddWarehouseDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-white text-xl font-semibold">Add New Warehouse</h2>
              <button
                onClick={() => setIsAddWarehouseDialogOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddWarehouse} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Warehouse Name
                </label>
                <input
                  type="text"
                  value={newWarehouseName}
                  onChange={(e) => setNewWarehouseName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter warehouse name"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseDialogOpen(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Warehouse Dialog */}
      {isEditWarehouseDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-white text-xl font-semibold">Edit Warehouse</h2>
              <button
                onClick={() => {
                  setIsEditWarehouseDialogOpen(false);
                  setEditWarehouseName("");
                  setEditingWarehouseId(null);
                }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditWarehouse} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Warehouse Name
                </label>
                <input
                  type="text"
                  value={editWarehouseName}
                  onChange={(e) => setEditWarehouseName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter warehouse name"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditWarehouseDialogOpen(false);
                    setEditWarehouseName("");
                    setEditingWarehouseId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Aisle Dialog */}
      {isAddAisleDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-white text-xl font-semibold">Add New Aisle</h2>
              <button
                onClick={() => setIsAddAisleDialogOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAisle} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Aisle Name
                </label>
                <input
                  type="text"
                  value={newAisleName}
                  onChange={(e) => setNewAisleName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter aisle name (e.g., A, B, C)"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAisleDialogOpen(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Aisle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shelf Dialog */}
      {isAddShelfDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-white text-xl font-semibold">Add New Shelf</h2>
              <button
                onClick={() => setIsAddShelfDialogOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddShelf} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Shelf Number
                </label>
                <input
                  type="text"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter shelf number (e.g., 01, 02, 03)"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddShelfDialogOpen(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Shelf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}