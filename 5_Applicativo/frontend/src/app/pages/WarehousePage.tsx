import { useState } from "react";
import { useWarehouses } from "../context/WarehousesContext";
import { Plus, Trash2, Package, X, Edit, Info, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const extractError = (err: any): string => {
  const data = err.response?.data;

  // 1. Controlla la chiave 'error' (quella che usi in Laravel)
  if (data?.error) return data.error;

  // 2. Controlla 'detail' (spesso usato da FastAPI o librerie di validazione)
  if (data?.detail) {
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: { msg: string }) => d.msg).join(", ");
    }
    return data.detail;
  }

  // 3. Fallback su 'message' (standard Laravel per eccezioni non gestite) o errore generico
  return data?.message ?? err.message ?? "An unexpected error occurred.";
};

const inputCls = "w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600";

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-zinc-300">{label}</label>
        {hint && (
          <div className="relative group">
            <Info className="w-4 h-4 text-zinc-500 hover:text-zinc-300 cursor-help transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-zinc-700 border border-zinc-600 text-zinc-200 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              {hint}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ActiveToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-zinc-600"}`} />
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </div>
      <span className="text-sm text-zinc-300">Active</span>
    </label>
  );
}

function DialogActions({ onCancel, submitLabel, isSubmitting }: { onCancel: () => void; submitLabel: string; isSubmitting: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}

export function WarehousePage() {
  const {
    warehouses, addWarehouse, updateWarehouse, deleteWarehouse, deleteAisle, deleteShelf,
    addAisle, updateAisle, addShelf, updateShelf, warehouseLoading,
  } = useWarehouses();

  const [isAddWarehouseOpen, setIsAddWarehouseOpen]   = useState(false);
  const [isEditWarehouseOpen, setIsEditWarehouseOpen] = useState(false);
  const [isAddAisleOpen, setIsAddAisleOpen]           = useState(false);
  const [isEditAisleOpen, setIsEditAisleOpen]         = useState(false);
  const [isAddShelfOpen, setIsAddShelfOpen]           = useState(false);
  const [isEditShelfOpen, setIsEditShelfOpen]         = useState(false);

  // Loading states per ogni operazione
  const [isSubmittingAddWarehouse, setIsSubmittingAddWarehouse]   = useState(false);
  const [isSubmittingEditWarehouse, setIsSubmittingEditWarehouse] = useState(false);
  const [isSubmittingAddAisle, setIsSubmittingAddAisle]           = useState(false);
  const [isSubmittingEditAisle, setIsSubmittingEditAisle]         = useState(false);
  const [isSubmittingAddShelf, setIsSubmittingAddShelf]           = useState(false);
  const [isSubmittingEditShelf, setIsSubmittingEditShelf]         = useState(false);

  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    warehouses.length > 0 ? warehouses[0].id : null
  );
  const [selectedAisle, setSelectedAisle] = useState<string | null>(null);

  const [newWarehouse, setNewWarehouse] = useState({ id: "", name: "", description: "", is_active: true });
  const [newAisle, setNewAisle]         = useState({ id: "", name: "", description: "", is_active: true });
  const [newShelf, setNewShelf]         = useState({ id: "", name: "", description: "", is_active: true });

  const [editWarehouseForm, setEditWarehouseForm] = useState({ id: "", name: "", description: "", is_active: true });
  const [editAisleForm, setEditAisleForm]         = useState({ id: "", name: "", description: "", is_active: true });
  const [editShelfForm, setEditShelfForm]         = useState({ id: "", aisleId: "", name: "", description: "", is_active: true });

  const [deletingWarehouseId, setDeletingWarehouseId] = useState<string | null>(null);
  const [deletingAisleId, setDeletingAisleId] = useState<string | null>(null);
  const [deletingShelfId, setDeletingShelfId] = useState<string | null>(null);

  const { authLoading } = useAuth();

  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAddWarehouse(true);
    try {
      await addWarehouse({ warehouse_id: newWarehouse.id, name: newWarehouse.name, description: newWarehouse.description, is_active: newWarehouse.is_active, aisles: [] });
      setNewWarehouse({ id: "", name: "", description: "", is_active: true });
      setIsAddWarehouseOpen(false);
      toast.success("Warehouse added!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingAddWarehouse(false);
    }
  };

  const handleEditWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEditWarehouse(true);
    try {
      await updateWarehouse(editWarehouseForm.id, { name: editWarehouseForm.name, description: editWarehouseForm.description, is_active: editWarehouseForm.is_active });
      setIsEditWarehouseOpen(false);
      toast.success("Warehouse updated!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingEditWarehouse(false);
    }
  };

  const handleAddAisle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;
    setIsSubmittingAddAisle(true);
    try {
      await addAisle(selectedWarehouse, { aisle_id: newAisle.id, name: newAisle.name, description: newAisle.description, is_active: newAisle.is_active });
      setNewAisle({ id: "", name: "", description: "", is_active: true });
      setIsAddAisleOpen(false);
      toast.success("Aisle added!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingAddAisle(false);
    }
  };

  const handleEditAisle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;
    setIsSubmittingEditAisle(true);
    try {
      await updateAisle(selectedWarehouse, editAisleForm.id, { name: editAisleForm.name, description: editAisleForm.description, is_active: editAisleForm.is_active });
      setIsEditAisleOpen(false);
      toast.success("Aisle updated!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingEditAisle(false);
    }
  };

  const handleAddShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse || !selectedAisle) return;
    setIsSubmittingAddShelf(true);
    try {
      await addShelf(selectedWarehouse, selectedAisle, { shelf_id: newShelf.id, name: newShelf.name, description: newShelf.description, is_active: newShelf.is_active });
      setNewShelf({ id: "", name: "", description: "", is_active: true });
      setIsAddShelfOpen(false);
      toast.success("Shelf added!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingAddShelf(false);
    }
  };

  const handleEditShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;
    setIsSubmittingEditShelf(true);
    try {
      await updateShelf(selectedWarehouse, editShelfForm.aisleId, editShelfForm.id, { name: editShelfForm.name, description: editShelfForm.description, is_active: editShelfForm.is_active });
      setIsEditShelfOpen(false);
      toast.success("Shelf updated!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingEditShelf(false);
    }
  };

  const selectedWarehouseData = warehouses.find((wh) => wh.id === selectedWarehouse);

  if (warehouseLoading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-zinc-700 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-zinc-400 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

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
            onClick={() => setIsAddWarehouseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Warehouse
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
                  onClick={() => { setSelectedWarehouse(warehouse.id); setSelectedAisle(null); }}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedWarehouse === warehouse.id
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{warehouse.name}</p>
                      <p className={`text-xs ${selectedWarehouse === warehouse.id ? "text-blue-200" : "text-zinc-500"}`}>
                        {warehouse.aisles?.length ?? 0} aisles
                        {warehouse.is_active === false && <span className="ml-2 text-red-400">inactive</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditWarehouseForm({ id: warehouse.id, name: warehouse.name, description: warehouse.description ?? "", is_active: warehouse.is_active ?? true });
                        setIsEditWarehouseOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setDeletingWarehouseId(warehouse.id);
                        try {
                          await deleteWarehouse(warehouse.id);
                          if (selectedWarehouse === warehouse.id)
                            setSelectedWarehouse(warehouses[0]?.id || null);
                          toast.success("Warehouse deleted!");
                        } catch (err: any) {
                          toast.error(extractError(err));
                        } finally {
                          setDeletingWarehouseId(null);
                        }
                      }}
                      disabled={deletingWarehouseId === warehouse.id}
                      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingWarehouseId === warehouse.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aisles & Shelves */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            {selectedWarehouseData ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-lg font-semibold">
                    {selectedWarehouseData.name} — Aisles & Shelves
                  </h2>
                  <button
                    onClick={() => setIsAddAisleOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Aisle
                  </button>
                </div>
                <div className="space-y-4">
                  {(selectedWarehouseData.aisles ?? []).map((aisle) => (
                    <div key={aisle.id} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-white font-medium">{aisle.id} - {aisle.name}</h3>
                          {aisle.description && <p className="text-zinc-500 text-xs mt-0.5">{aisle.description}</p>}
                          {aisle.is_active === false && <span className="text-xs text-red-400">inactive</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditAisleForm({ id: aisle.id, name: aisle.name, description: aisle.description ?? "", is_active: aisle.is_active ?? true });
                              setIsEditAisleOpen(true);
                            }}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedAisle(aisle.id); setIsAddShelfOpen(true); }}
                            className="flex items-center gap-1.5 px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded hover:bg-zinc-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add Shelf
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!selectedWarehouse) return;
                              setDeletingAisleId(aisle.id);
                              try {
                                await deleteAisle(selectedWarehouse, aisle.id);
                                if (selectedAisle === aisle.id) setSelectedAisle(null);
                                toast.success("Aisle deleted!");
                              } catch (err: any) {
                                toast.error(extractError(err));
                              } finally {
                                setDeletingAisleId(null);
                              }
                            }}
                            disabled={deletingAisleId === aisle.id}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingAisleId === aisle.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aisle.shelves.map((shelf) => (
                          <div key={shelf.id} className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-700 text-zinc-300 rounded text-sm">
                            <span>{shelf.id} - {shelf.name}</span>
                            {shelf.is_active === false && <span className="text-xs text-red-400">off</span>}
                            <button
                              onClick={() => {
                                setEditShelfForm({ id: shelf.id, aisleId: aisle.id, name: shelf.name, description: shelf.description ?? "", is_active: shelf.is_active ?? true });
                                setIsEditShelfOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 transition-all"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!selectedWarehouse) return;
                                setDeletingShelfId(shelf.id);
                                try {
                                  await deleteShelf(selectedWarehouse, aisle.id, shelf.id);
                                  toast.success("Shelf deleted!");
                                } catch (err: any) {
                                  toast.error(extractError(err));
                                } finally {
                                  setDeletingShelfId(null);
                                }
                              }}
                              disabled={deletingShelfId === shelf.id}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingShelfId === shelf.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <X className="w-3 h-3" />
                              }
                            </button>
                          </div>
                        ))}
                        {aisle.shelves.length === 0 && <p className="text-zinc-500 text-sm">No shelves yet</p>}
                      </div>
                    </div>
                  ))}
                  {(selectedWarehouseData.aisles ?? []).length === 0 && (
                    <p className="text-zinc-500 text-center py-8">No aisles configured yet.</p>
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

      {/* ── Add Warehouse ── */}
      {isAddWarehouseOpen && (
        <Dialog title="Add New Warehouse" onClose={() => setIsAddWarehouseOpen(false)}>
          <form onSubmit={handleAddWarehouse} className="p-6 space-y-4">
            <Field label="Warehouse ID*" hint="Must start with 'WH_' followed by letters or numbers. Example: WH_001, WH_MAIN">
              <input
                value={newWarehouse.id}
                onChange={e => setNewWarehouse(f => ({ ...f, id: e.target.value }))}
                className={inputCls} placeholder="e.g. WH_001"
                pattern="^WH_[A-Za-z0-9]+$"
                title="Must match format: WH_ followed by letters or numbers"
                required
              />
            </Field>
            <Field label="Name*">
              <input value={newWarehouse.name} onChange={e => setNewWarehouse(f => ({ ...f, name: e.target.value }))}
                className={inputCls} placeholder="e.g. Main Warehouse" required />
            </Field>
            <Field label="Description">
              <textarea value={newWarehouse.description} onChange={e => setNewWarehouse(f => ({ ...f, description: e.target.value }))}
                className={inputCls} rows={3} placeholder="Optional description" />
            </Field>
            <ActiveToggle checked={newWarehouse.is_active} onChange={v => setNewWarehouse(f => ({ ...f, is_active: v }))} />
            <DialogActions onCancel={() => setIsAddWarehouseOpen(false)} submitLabel="Add Warehouse" isSubmitting={isSubmittingAddWarehouse} />
          </form>
        </Dialog>
      )}

      {/* ── Edit Warehouse ── */}
      {isEditWarehouseOpen && (
        <Dialog title="Edit Warehouse" onClose={() => setIsEditWarehouseOpen(false)}>
          <form onSubmit={handleEditWarehouse} className="p-6 space-y-4">
            <Field label="Warehouse ID">
              <div className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 font-mono text-sm select-all">
                {editWarehouseForm.id}
              </div>
            </Field>
            <Field label="Name">
              <input value={editWarehouseForm.name} onChange={e => setEditWarehouseForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} required />
            </Field>
            <Field label="Description">
              <textarea value={editWarehouseForm.description} onChange={e => setEditWarehouseForm(f => ({ ...f, description: e.target.value }))}
                className={inputCls} rows={3} placeholder="Optional description" />
            </Field>
            <ActiveToggle checked={editWarehouseForm.is_active} onChange={v => setEditWarehouseForm(f => ({ ...f, is_active: v }))} />
            <DialogActions onCancel={() => setIsEditWarehouseOpen(false)} submitLabel="Save Changes" isSubmitting={isSubmittingEditWarehouse} />
          </form>
        </Dialog>
      )}

      {/* ── Add Aisle ── */}
      {isAddAisleOpen && (
        <Dialog title="Add New Aisle" onClose={() => setIsAddAisleOpen(false)}>
          <form onSubmit={handleAddAisle} className="p-6 space-y-4">
            <Field label="Aisle ID*" hint="Must start with an uppercase letter followed by numbers. Example: A1, B12, C3">
              <input
                value={newAisle.id}
                onChange={e => setNewAisle(f => ({ ...f, id: e.target.value }))}
                className={inputCls} placeholder="e.g. A1"
                pattern="^[A-Z][0-9]+$"
                title="Must match format: one uppercase letter followed by numbers"
                required
              />
            </Field>
            <Field label="Name*">
              <input value={newAisle.name} onChange={e => setNewAisle(f => ({ ...f, name: e.target.value }))}
                className={inputCls} placeholder="e.g. Aisle A" required />
            </Field>
            <Field label="Description">
              <textarea value={newAisle.description} onChange={e => setNewAisle(f => ({ ...f, description: e.target.value }))}
                className={inputCls} rows={3} placeholder="Optional description" />
            </Field>
            <ActiveToggle checked={newAisle.is_active} onChange={v => setNewAisle(f => ({ ...f, is_active: v }))} />
            <DialogActions onCancel={() => setIsAddAisleOpen(false)} submitLabel="Add Aisle" isSubmitting={isSubmittingAddAisle} />
          </form>
        </Dialog>
      )}

      {/* ── Edit Aisle ── */}
      {isEditAisleOpen && (
        <Dialog title="Edit Aisle" onClose={() => setIsEditAisleOpen(false)}>
          <form onSubmit={handleEditAisle} className="p-6 space-y-4">
            <Field label="Aisle ID">
              <div className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 font-mono text-sm select-all">
                {editAisleForm.id}
              </div>
            </Field>
            <Field label="Name">
              <input value={editAisleForm.name} onChange={e => setEditAisleForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} required />
            </Field>
            <Field label="Description">
              <textarea value={editAisleForm.description} onChange={e => setEditAisleForm(f => ({ ...f, description: e.target.value }))}
                className={inputCls} rows={3} placeholder="Optional description" />
            </Field>
            <ActiveToggle checked={editAisleForm.is_active} onChange={v => setEditAisleForm(f => ({ ...f, is_active: v }))} />
            <DialogActions onCancel={() => setIsEditAisleOpen(false)} submitLabel="Save Changes" isSubmitting={isSubmittingEditAisle} />
          </form>
        </Dialog>
      )}

      {/* ── Add Shelf ── */}
      {isAddShelfOpen && (
        <Dialog title="Add New Shelf" onClose={() => setIsAddShelfOpen(false)}>
          <form onSubmit={handleAddShelf} className="p-6 space-y-4">
            <Field label="Shelf ID*" hint="Must start with an uppercase letter followed by numbers. Example: A1, B12, C3">
              <input
                value={newShelf.id}
                onChange={e => setNewShelf(f => ({ ...f, id: e.target.value }))}
                className={inputCls} placeholder="e.g. A1"
                pattern="^[A-Z][0-9]+$"
                title="Must match format: one uppercase letter followed by numbers"
                required
              />
            </Field>
            <Field label="Name*">
              <input value={newShelf.name} onChange={e => setNewShelf(f => ({ ...f, name: e.target.value }))}
                className={inputCls} placeholder="e.g. Shelf 01" required />
            </Field>
            <Field label="Description">
              <textarea value={newShelf.description} onChange={e => setNewShelf(f => ({ ...f, description: e.target.value }))}
                className={inputCls} rows={3} placeholder="Optional description" />
            </Field>
            <ActiveToggle checked={newShelf.is_active} onChange={v => setNewShelf(f => ({ ...f, is_active: v }))} />
            <DialogActions onCancel={() => setIsAddShelfOpen(false)} submitLabel="Add Shelf" isSubmitting={isSubmittingAddShelf} />
          </form>
        </Dialog>
      )}

      {/* ── Edit Shelf ── */}
      {isEditShelfOpen && (
        <Dialog title="Edit Shelf" onClose={() => setIsEditShelfOpen(false)}>
          <form onSubmit={handleEditShelf} className="p-6 space-y-4">
            <Field label="Shelf ID">
              <div className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 font-mono text-sm select-all">
                {editShelfForm.id}
              </div>
            </Field>
            <Field label="Name">
              <input value={editShelfForm.name} onChange={e => setEditShelfForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} required />
            </Field>
            <Field label="Description">
              <textarea value={editShelfForm.description} onChange={e => setEditShelfForm(f => ({ ...f, description: e.target.value }))}
                className={inputCls} rows={3} placeholder="Optional description" />
            </Field>
            <ActiveToggle checked={editShelfForm.is_active} onChange={v => setEditShelfForm(f => ({ ...f, is_active: v }))} />
            <DialogActions onCancel={() => setIsEditShelfOpen(false)} submitLabel="Save Changes" isSubmitting={isSubmittingEditShelf} />
          </form>
        </Dialog>
      )}
    </>
  );
}