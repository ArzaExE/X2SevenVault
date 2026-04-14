import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Item, Warehouse, Aisle, Shelf, useItems } from "../context/ItemsContext"; 

interface AddObjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Item, "id">) => Promise<void>;
  warehouses: Warehouse[];
}

function AIToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-zinc-600"}`} />
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </div>
      <span className="text-sm text-zinc-300">Active AI</span>
    </label>
  );
}

export function AddObjectDialog({ isOpen, onClose, onAdd }: AddObjectDialogProps) {
  const { warehouseLoading, loadCompleteWarehouses, warehouses } = useItems();
  
  const [formData, setFormData] = useState<Omit<Item, "id">>({
    name: "",
    warehouse_id: "",
    aisle_id: "",
    shelf_id: "",
    is_ai: false,
    weight_value: "" as any,
    weight_unit: "kg",
    width_value: "" as any,
    width_unit: "cm",
    height_value: "" as any,
    height_unit: "cm",
    quantity: "" as any,
    description: "",
  });

  const [availableAisles, setAvailableAisles] = useState<Aisle[]>([]);
  const [availableShelves, setAvailableShelves] = useState<Shelf[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && warehouses.length === 0) {
      loadCompleteWarehouses().catch(err => {
        console.error("Errore nel caricamento magazzini:", err);
      });
    }
  }, [isOpen]);

  // Cambio magazzino → popoliamo le aisle
  const handleWarehouseChange = (warehouseId: string) => {
    setFormData(prev => ({ ...prev, warehouse_id: warehouseId, aisle_id: "", shelf_id: "" }));
    setAvailableShelves([]);

    const selected = warehouses.find((wh) => wh.id === warehouseId);
    setAvailableAisles(selected?.aisles || []);
  };

  // Cambio aisle → popoliamo le shelf
  const handleAisleChange = (aisleId: string) => {
    setFormData(prev => ({ ...prev, aisle_id: aisleId, shelf_id: "" }));

    const warehouse = warehouses.find((wh) => wh.id === formData.warehouse_id);
    const selectedAisle = warehouse?.aisles.find((a) => a.id === aisleId);
    setAvailableShelves(selectedAisle?.shelves || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onAdd(formData);
      toast.success("Object added successfully!");
      setFormData({
        name: "",
        warehouse_id: "",
        aisle_id: "",
        shelf_id: "",
        is_ai: false,
        weight_value: 0,
        weight_unit: "kg",
        width_value: 0,
        width_unit: "cm",
        height_value: 0,
        height_unit: "cm",
        quantity: 0,
        description: "",
      });
      setAvailableAisles([]);
      setAvailableShelves([]);
      onClose();
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0] as string[];
        setError(firstError[0]);
      } else {
        const msg = err.response?.data?.message || "Error adding object. Please try again.";
        setError(msg);
        toast.error("Errore: " + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h2 className="text-white text-xl font-semibold">Add New Object</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Nome (Full Width) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Object Name*</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Warehouse*</label>
              <select
                value={formData.warehouse_id}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={warehouseLoading}
              >
                <option value="">{warehouseLoading ? "Loading..." : "Select warehouse"}</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>

            {/* Aisle */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Aisle*</label>
              <select
                value={formData.aisle_id}
                onChange={(e) => handleAisleChange(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                required
                disabled={!formData.warehouse_id}
              >
                <option value="">Select aisle</option>
                {availableAisles.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Shelf */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Shelf*</label>
              <select
                value={formData.shelf_id}
                onChange={(e) => setFormData({ ...formData, shelf_id: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                required
                disabled={!formData.aisle_id}
              >
                <option value="">Select shelf</option>
                {availableShelves.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Weight*</label>
              <div className="flex">
                <input
                  type="number" step="0.1"
                  value={formData.weight_value}
                  onChange={(e) => setFormData({ ...formData, weight_value: Number(parseFloat(e.target.value).toFixed(2) || 0) })}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <select
                  value={formData.weight_unit}
                  onChange={(e) => setFormData({ ...formData, weight_unit: e.target.value })}
                  className="w-24 bg-zinc-700 border border-zinc-700 border-l-0 rounded-r-lg text-white focus:outline-none px-2"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            {/* Width */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Width*</label>
              <div className="flex">
                <input
                  type="number" step="0.1"
                  value={formData.width_value}
                  onChange={(e) => setFormData({ ...formData, width_value: Number(parseFloat(e.target.value).toFixed(2) || 0) })}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <select
                  value={formData.width_unit}
                  onChange={(e) => setFormData({ ...formData, width_unit: e.target.value })}
                  className="w-24 bg-zinc-700 border border-zinc-700 border-l-0 rounded-r-lg text-white focus:outline-none px-2"
                >
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Height*</label>
              <div className="flex">
                <input
                  type="number" step="0.1"
                  value={formData.height_value}
                  onChange={(e) => setFormData({ ...formData, height_value: Number(parseFloat(e.target.value).toFixed(2) || 0) })}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <select
                  value={formData.height_unit}
                  onChange={(e) => setFormData({ ...formData, height_unit: e.target.value })}
                  className="w-24 bg-zinc-700 border border-zinc-700 border-l-0 rounded-r-lg text-white focus:outline-none px-2"
                >
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Quantity*</label>
              <input
                type="number" min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* AI Toggle */}
            <div className="md:col-span-2">
              <AIToggle
                checked={formData.is_ai}
                onChange={(v) => setFormData({ ...formData, is_ai: v })}
              />
            </div>
          </div>

          {/* Error box */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-500 text-sm flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Adding...</span>
                </div>
              ) : (
                "Add Object"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}