import { useState } from "react";
import { X } from "lucide-react";
import { Item, Warehouse, Aisle, Shelf, useItems } from "../context/ItemsContext"; 

interface AddObjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Item, "id">) => void;  // ← Tipo Item senza id
  warehouses: Warehouse[];
}

export function AddObjectDialog({ isOpen, onClose, onAdd, warehouses }: AddObjectDialogProps) {
  const { warehouseLoading } = useItems();

  if (!isOpen) return null;
  
  const [formData, setFormData] = useState<Omit<Item, "id">>({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
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
    onClose();
  };

  const selectedWarehouseData = warehouses?.find((wh) => wh.id === formData.warehouse_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h2 className="text-white text-xl font-semibold">Add New Object</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Object Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter object name"
                required
              />
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Warehouse</label>
              <select
                value={formData.warehouse_id}
                onChange={(e) => {
                  setFormData({ ...formData, warehouse_id: e.target.value, aisle_id: "", shelf_id: "" });
                }}
                disabled={warehouseLoading}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select warehouse</option>
                {warehouses?.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Aisle */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Aisle</label>
              <select
                value={formData.aisle_id}
                onChange={(e) => setFormData({ ...formData, aisle_id: e.target.value, shelf_id: "" })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={!formData.warehouse_id}
              >
                <option value="">Select aisle</option>
                {selectedWarehouseData?.aisles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shelf */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Shelf</label>
              <select
                value={formData.shelf_id}
                onChange={(e) => setFormData({ ...formData, shelf_id: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={!formData.aisle_id}
              >
                <option value="">Select shelf</option>
                {selectedWarehouseData?.aisles
                    .find((a) => a.id === formData.aisle_id)
                    ?.shelves.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Weight ({formData.weight_unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight_value}
                onChange={(e) => setFormData({ ...formData, weight_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter weight"
                required
              />
            </div>

            {/* Width */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Width ({formData.width_unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.width_value}
                onChange={(e) => setFormData({ ...formData, width_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter width"
                required
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Height ({formData.height_unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.height_value}
                onChange={(e) => setFormData({ ...formData, height_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter height"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter object description"
              />
            </div>

            {/* AI */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_ai}
                  onChange={(e) => setFormData({ ...formData, is_ai: e.target.checked })}
                  className="w-5 h-5 bg-zinc-800 border border-zinc-700 rounded text-blue-600 focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-zinc-300">Enable AI features</span>
              </label>
            </div>
          </div>

          {/* Actions */}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Object
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}