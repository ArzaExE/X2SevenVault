import { useParams, useNavigate, Navigate } from "react-router";
import { Aisle, Shelf, Item, useItems } from "../context/ItemsContext";
import { useWarehouses } from "../context/WarehousesContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Package, MapPin, Layers, Weight, Ruler, Maximize, Bot, Edit, Hash, BrainCircuit } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

function ActiveToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-zinc-600"}`} />
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </div>
      <span className="text-sm text-zinc-300">Enable AI</span>
    </label>
  );
}

export function ObjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, deleteItem, itemLoading, updateItem, completeWarehouses, loadCompleteWarehouses } = useItems();
  // warehouses per risolvere i nomi in read-only
  const { warehouses, warehouseLoading } = useWarehouses();
  const { user, isGuest, authLoading } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingItem, setLoadingItem] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableAisles, setAvailableAisles] = useState<Aisle[]>([]);
  const [availableShelves, setAvailableShelves] = useState<Shelf[]>([]);

  const emptyForm = {
    id: "",
    name: "",
    description: "",
    warehouse_id: "",
    aisle_id: "",
    shelf_id: "",
    weight_unit: "",
    weight_value: 0,
    width_unit: "",
    width_value: 0,
    height_unit: "",
    height_value: 0,
    quantity: 0,
    is_ai: false,
  };

  const [editForm, setEditForm] = useState(emptyForm);
  const editFormRef = useRef(emptyForm);

  const updateEditForm = (data: typeof emptyForm) => {
    editFormRef.current = data;
    setEditForm(data);
  };

  // Usa completeWarehouses per i select del form di edit
  const handleWarehouseChange = (warehouseId: string) => {
    const updated = { ...editFormRef.current, warehouse_id: warehouseId, aisle_id: "", shelf_id: "" };
    updateEditForm(updated);
    setAvailableShelves([]);
    const selected = completeWarehouses.find((wh) => wh.id === warehouseId);
    setAvailableAisles(selected?.aisles || []);
  };

  const handleAisleChange = (aisleId: string) => {
    const updated = { ...editFormRef.current, aisle_id: aisleId, shelf_id: "" };
    updateEditForm(updated);
    const warehouse = completeWarehouses.find((wh) => wh.id === editFormRef.current.warehouse_id);
    const selectedAisle = warehouse?.aisles.find((a) => a.id === aisleId);
    setAvailableShelves(selectedAisle?.shelves || []);
  };

  // Popola aisles/shelves usando completeWarehouses
  const populateLocationFromItem = (data: Item) => {
    const wh = completeWarehouses.find((w) => w.id === data.warehouse_id);
    const aisles = wh?.aisles || [];
    setAvailableAisles(aisles);
    const aisle = aisles.find((a) => a.id === data.aisle_id);
    setAvailableShelves(aisle?.shelves || []);
  };

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const data = await getItemById(id);
      if (data) {
        setItem(data);
        updateEditForm({
          id: data.id,
          name: data.name,
          description: data.description || "",
          warehouse_id: data.warehouse_id,
          aisle_id: data.aisle_id,
          shelf_id: data.shelf_id,
          weight_value: data.weight_value,
          weight_unit: data.weight_unit,
          width_unit: data.width_unit,
          width_value: data.width_value,
          height_unit: data.height_unit,
          height_value: data.height_value,
          quantity: data.quantity,
          is_ai: data.is_ai,
        });
      }
      setLoadingItem(false);
    };
    fetchItem();
  }, [id]);

  
  // Usa completeWarehouses per popolare i dropdown
  useEffect(() => {
    if (item && completeWarehouses.length > 0) {
      populateLocationFromItem(item);
    }
  }, [completeWarehouses, item]);

  if (itemLoading || authLoading || loadingItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-zinc-700 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-zinc-400 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Object not found</p>
          <button
            onClick={() => navigate("/objects")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Objects
          </button>
        </div>
      </div>
    );
  }

  // Risolve i nomi usando warehouses (tutte) per la vista read-only
  const warehouseName = warehouses.find(w => w.id === item.warehouse_id)?.name || item.warehouse_id;
  const aisleName = warehouses.find(w => w.id === item.warehouse_id)?.aisles.find(a => a.id === item.aisle_id)?.name || item.aisle_id;
  const shelfName = warehouses.find(w => w.id === item.warehouse_id)?.aisles.find(a => a.id === item.aisle_id)?.shelves.find(s => s.id === item.shelf_id)?.name || item.shelf_id;
  const location = `${warehouseName}, ${aisleName} - ${shelfName}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = editFormRef.current;
    setError(null);
    setIsSubmitting(true);
    try {
      await updateItem(item.id, formData);
      const updatedData = await getItemById(item.id);
      if (updatedData) {
        setItem(updatedData);
        populateLocationFromItem(updatedData);
      }
      toast.success("Object updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0] as string[];
        setError(firstError[0]);
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || "Error updating object. Please try again.";
        setError(msg);
        toast.error("Errore: " + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    updateEditForm({
      id: item.id,
      name: item.name,
      description: item.description || "",
      warehouse_id: item.warehouse_id,
      aisle_id: item.aisle_id,
      shelf_id: item.shelf_id,
      weight_value: item.weight_value,
      weight_unit: item.weight_unit,
      width_unit: item.width_unit,
      width_value: item.width_value,
      height_unit: item.height_unit,
      height_value: item.height_value,
      quantity: item.quantity,
      is_ai: item.is_ai,
    });
    populateLocationFromItem(item);
    setIsEditing(false);
    setError(null);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <button
          onClick={() => navigate("/objects")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Objects
        </button>
        <div className="flex items-center justify-between">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => updateEditForm({ ...editFormRef.current, name: e.target.value })}
                className="text-2xl font-semibold bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            ) : (
              <h1 className="text-white text-2xl font-semibold">{item.name}</h1>
            )}
            <p className="text-zinc-400 mt-1">
              {isGuest ? "Object Details (Read-only)" : "Object Details"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {item.is_ai && !isEditing && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600/40 rounded-lg">
                <Bot className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">AI Enabled</span>
              </div>
            )}
            {!isGuest && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </>
                ) : (
                  <button
                      onClick={async () => {
                        loadCompleteWarehouses();
                        setIsEditing(true);
                      }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Object
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Location Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-white text-lg font-semibold mb-4">Location Information</h2>
            <div className="space-y-4">

              {!isEditing && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-zinc-400 text-sm">Full Location</p>
                    <p className="text-white font-medium">{location}</p>
                  </div>
                </div>
              )}

              {/* Warehouse */}
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Warehouse</p>
                  {isEditing ? (
                    <select
                      value={editForm.warehouse_id}
                      onChange={(e) => handleWarehouseChange(e.target.value)}
                      disabled={warehouseLoading}
                      className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                    >
                      <option value="">{warehouseLoading ? "Loading..." : "Select warehouse"}</option>
                      {/* usa completeWarehouses per il form */}
                      {completeWarehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white font-medium">{item.warehouse_id} - {warehouseName}</p>
                  )}
                </div>
              </div>

              {/* Aisle */}
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Aisle</p>
                  {isEditing ? (
                    <select
                      value={editForm.aisle_id}
                      onChange={(e) => handleAisleChange(e.target.value)}
                      disabled={!editForm.warehouse_id}
                      className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                    >
                      <option value="">Select aisle</option>
                      {availableAisles.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white font-medium">{item.aisle_id} - {aisleName}</p>
                  )}
                </div>
              </div>

              {/* Shelf */}
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Shelf</p>
                  {isEditing ? (
                    <select
                      value={editForm.shelf_id}
                      onChange={(e) => updateEditForm({ ...editFormRef.current, shelf_id: e.target.value })}
                      disabled={!editForm.aisle_id}
                      className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                    >
                      <option value="">Select shelf</option>
                      {availableShelves.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white font-medium">{item.shelf_id} - {shelfName}</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Physical Specifications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-white text-lg font-semibold mb-4">Physical Specifications</h2>
            <div className="space-y-4">

              {/* Quantity */}
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Quantity</p>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editForm.quantity}
                      onChange={(e) => updateEditForm({ ...editFormRef.current, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="text-white font-medium">{item.quantity}</p>
                  )}
                </div>
              </div>

              {/* Weight */}
              <div className="flex items-start gap-3">
                <Weight className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Weight</p>
                  {isEditing ? (
                    <div className="flex mt-1">
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.weight_value}
                        onChange={(e) => updateEditForm({ ...editFormRef.current, weight_value: Number(parseFloat(e.target.value).toFixed(2) || 0) })}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-l px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <select
                        value={editForm.weight_unit}
                        onChange={(e) => updateEditForm({ ...editFormRef.current, weight_unit: e.target.value })}
                        className="w-20 bg-zinc-700 border border-zinc-700 border-l-0 rounded-r text-white focus:outline-none px-1 text-sm"
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-white font-medium">{item.weight_value} {item.weight_unit}</p>
                  )}
                </div>
              </div>

              {/* Width */}
              <div className="flex items-start gap-3">
                <Ruler className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Width</p>
                  {isEditing ? (
                    <div className="flex mt-1">
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.width_value}
                        onChange={(e) => updateEditForm({ ...editFormRef.current, width_value: Number(parseFloat(e.target.value).toFixed(2) || 0) })}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-l px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <select
                        value={editForm.width_unit}
                        onChange={(e) => updateEditForm({ ...editFormRef.current, width_unit: e.target.value })}
                        className="w-20 bg-zinc-700 border border-zinc-700 border-l-0 rounded-r text-white focus:outline-none px-1 text-sm"
                      >
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="m">m</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-white font-medium">{item.width_value} {item.width_unit}</p>
                  )}
                </div>
              </div>

              {/* Height */}
              <div className="flex items-start gap-3">
                <Maximize className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Height</p>
                  {isEditing ? (
                    <div className="flex mt-1">
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.height_value}
                        onChange={(e) => updateEditForm({ ...editFormRef.current, height_value: Number(parseFloat(e.target.value).toFixed(2) || 0) })}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-l px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <select
                        value={editForm.height_unit}
                        onChange={(e) => updateEditForm({ ...editFormRef.current, height_unit: e.target.value })}
                        className="w-20 bg-zinc-700 border border-zinc-700 border-l-0 rounded-r text-white focus:outline-none px-1 text-sm"
                      >
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="m">m</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-white font-medium">{item.height_value} {item.height_unit}</p>
                  )}
                </div>
              </div>

              {/* AI Features */}
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">AI Features</p>
                  {isEditing ? (
                    <div className="mt-2">
                      <ActiveToggle
                        checked={editForm.is_ai}
                        onChange={(is_ai) => updateEditForm({ ...editFormRef.current, is_ai })}
                      />
                    </div>
                  ) : (
                    <p className="text-white font-medium">{item.is_ai ? "Enabled" : "Disabled"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI ID */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-blue-400" />
              <label className="block text-sm font-medium text-zinc-400">AI Identifier (AI ID)</label>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded px-4 py-3">
              <code className="text-blue-300 font-mono text-sm">
                {item.ai_class_id || "Not assigned"}
              </code>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              This is the unique identifier used by the AI engine to process this object.
            </p>
          </div>

          {/* Description */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-lg font-semibold mb-4">Description</h2>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => updateEditForm({ ...editFormRef.current, description: e.target.value })}
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter object description"
              />
            ) : (
              <p className="text-zinc-300 leading-relaxed">{item.description || "No description available"}</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
}