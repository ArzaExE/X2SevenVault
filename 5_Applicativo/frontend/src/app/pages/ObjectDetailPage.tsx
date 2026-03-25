import { useParams, useNavigate } from "react-router";
import { useData } from "../data/store";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Package, MapPin, Layers, Weight, Ruler, Maximize, Bot, Edit, Hash } from "lucide-react";
import { useState } from "react";

export function ObjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getObject, updateObject } = useData();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const isGuest = user?.role === "Guest";
  const object = getObject(id || "");

  const [editForm, setEditForm] = useState({
    name: object?.name || "",
    description: object?.description || "",
    weight: object?.weight || 0,
    width: object?.width || 0,
    height: object?.height || 0,
    quantity: object?.quantity || 0,
    ai: object?.ai || false,
  });

  if (!object) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Object not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Objects
          </button>
        </div>
      </div>
    );
  }

  const location = `${object.warehouse}, ${object.aisle}-${object.shelf}`;

  const handleSave = () => {
    updateObject(object.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: object.name,
      description: object.description,
      weight: object.weight,
      width: object.width,
      height: object.height,
      quantity: object.quantity,
      ai: object.ai,
    });
    setIsEditing(false);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <button
          onClick={() => navigate("/")}
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
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-2xl font-semibold bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            ) : (
              <h1 className="text-white text-2xl font-semibold">{object.name}</h1>
            )}
            <p className="text-zinc-400 mt-1">
              {isGuest ? "Object Details (Read-only)" : "Object Details"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {object.ai && !isEditing && (
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-white text-lg font-semibold mb-4">Location Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-zinc-400 text-sm">Full Location</p>
                  <p className="text-white font-medium">{location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-zinc-400 text-sm">Warehouse</p>
                  <p className="text-white font-medium">{object.warehouse}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-zinc-400 text-sm">Aisle</p>
                  <p className="text-white font-medium">{object.aisle}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-zinc-400 text-sm">Shelf</p>
                  <p className="text-white font-medium">{object.shelf}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Specifications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-white text-lg font-semibold mb-4">Physical Specifications</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Quantity</p>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="text-white font-medium">{object.quantity}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Weight className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Weight</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: parseFloat(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="text-white font-medium">{object.weight} kg</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ruler className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Width</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.width}
                      onChange={(e) => setEditForm({ ...editForm, width: parseFloat(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="text-white font-medium">{object.width} cm</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Maximize className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">Height</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.height}
                      onChange={(e) => setEditForm({ ...editForm, height: parseFloat(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="text-white font-medium">{object.height} cm</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm">AI Features</p>
                  {isEditing ? (
                    <label className="flex items-center gap-2 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.ai}
                        onChange={(e) => setEditForm({ ...editForm, ai: e.target.checked })}
                        className="w-5 h-5 bg-zinc-800 border border-zinc-700 rounded text-blue-600 focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-white">Enable AI</span>
                    </label>
                  ) : (
                    <p className="text-white font-medium">{object.ai ? "Enabled" : "Disabled"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-lg font-semibold mb-4">Description</h2>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter object description"
              />
            ) : (
              <p className="text-zinc-300 leading-relaxed">{object.description}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}