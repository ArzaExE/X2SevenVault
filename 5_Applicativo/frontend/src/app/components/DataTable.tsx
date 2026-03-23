import { Trash2, Check, X } from "lucide-react";
import { useNavigate } from "react-router";
import { VaultObject } from "../data/store";

interface DataTableProps {
  objects: VaultObject[];
  onDelete: (id: string) => void;
}

export function DataTable({ objects, onDelete }: DataTableProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                AI
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {objects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No objects found. Add your first object to get started.
                </td>
              </tr>
            ) : (
              objects.map((object) => (
                <tr
                  key={object.id}
                  onClick={() => navigate(`/object/${object.id}`)}
                  className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-white">{object.name}</td>
                  <td className="px-6 py-4 text-zinc-300">
                    {object.warehouse}, {object.aisle}-{object.shelf}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{object.quantity}</td>
                  <td className="px-6 py-4">
                    {object.ai ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                        <Check className="w-3.5 h-3.5" />
                        Enabled
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800 text-zinc-500 rounded text-sm">
                        <X className="w-3.5 h-3.5" />
                        Disabled
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(object.id);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}