import { Trash2, Check, X, Loader2 } from "lucide-react"; // Aggiunto Loader2
import { useNavigate } from "react-router";
import { Item } from "../context/ItemsContext";
import { useState } from "react"; // Aggiunto useState

interface DataTableProps {
  items: Item[];
  onDelete: (id: string) => Promise<void>; // Cambiato in Promise per gestire l'attesa
  onRowClick?: (id: string) => void;
  isReadOnly?: boolean;
}

export function DataTable({ items, onDelete, onRowClick, isReadOnly = false }: DataTableProps) {
  const navigate = useNavigate();
  // Stato per tracciare l'ID dell'oggetto che stiamo eliminando
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Impedisce di navigare alla pagina dell'oggetto
  
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">AI</th>
              {!isReadOnly && (
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={isReadOnly ? 4 : 5} className="px-6 py-12 text-center text-zinc-500">
                  No objects found. Add your first object to get started.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => !deletingId && onRowClick ? onRowClick(item.id) : navigate(`/object/${item.id}`)}
                  className={`transition-colors cursor-pointer ${
                    deletingId === item.id ? "bg-red-950/10" : "hover:bg-zinc-800/50"
                  }`}
                >
                  <td className="px-6 py-4 text-white">{item.name}</td>
                  <td className="px-6 py-4 text-zinc-300">
                    {item.warehouse_id}, {item.aisle_id}-{item.shelf_id}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{item.quantity}</td>
                  <td className="px-6 py-4">
                    {item.is_ai ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                        <Check className="w-3.5 h-3.5" /> Enabled
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800 text-zinc-500 rounded text-sm">
                        <X className="w-3.5 h-3.5" /> Disabled
                      </div>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => handleDeleteClick(e, item.id)}
                        disabled={deletingId !== null}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === item.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm">Delete</span>
                          </>
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}