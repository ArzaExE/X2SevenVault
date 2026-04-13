import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUsers, User } from "../context/UsersContext";
import { Plus, Trash2, Edit, X, Search, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Navigate } from "react-router";

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

type FormData = {
  full_name: string;
  email: string;
  password: string;
  role_name: string;
  role_id: number;
  is_active: boolean;
};

const ROLE_MAP: Record<string, number> = { admin: 1, operator: 2 };
const emptyForm: FormData = { full_name: "", email: "", password: "", role_name: "", role_id: 0, is_active: true };

function DialogForm({
  title, onClose, onSubmit, isSubmitting, submitLabel, formData, setFormData, showPassword = false,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitLabel: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  showPassword?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name*</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={inputCls}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email*</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputCls}
              placeholder="Enter email address"
              required
            />
          </div>
          {showPassword && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password*</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputCls}
                placeholder="Enter password"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Role*</label>
            <select
              value={formData.role_name}
              onChange={(e) => setFormData({
                ...formData,
                role_name: e.target.value,
                role_id: ROLE_MAP[e.target.value] ?? 0,
              })}
              className={inputCls}
            >
              <option value="">Select role...</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${formData.is_active ? "bg-blue-600" : "bg-zinc-600"}`} />
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.is_active ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-zinc-300">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                : submitLabel
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UsersPage() {
  const { users, createUser, updateUser, deleteUser, userLoading } = useUsers();
  const { user, isGuest, authLoading } = useAuth();

  const [searchQuery, setSearchQuery]       = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen]   = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser]     = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isSubmittingAdd, setIsSubmittingAdd]   = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [formData, setFormData]             = useState<FormData>(emptyForm);

  if (userLoading || authLoading) {
    return <div className="flex items-center justify-center h-full"><p className="text-zinc-400 text-lg">Loading...</p></div>;
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  const filteredUsers = users.filter((u) =>
    (u.full_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role_name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdd(true);
    try {
      await createUser({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role_name: formData.role_name,
        role_id: formData.role_id,
        is_active: formData.is_active,
      } as any);
      setFormData(emptyForm);
      setIsAddDialogOpen(false);
      toast.success("User created!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmittingEdit(true);
    try {
      await updateUser(selectedUser.id, {
        full_name: formData.full_name,
        email: formData.email,
        role_name: formData.role_name,
        role_id: formData.role_id,
        is_active: formData.is_active,
      } as any);
      setFormData(emptyForm);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success("User updated!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setDeletingUserId(id);
    try {
      await deleteUser(id);
      toast.success("User deleted!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setDeletingUserId(null);
    }
  };

  const openEditDialog = (u: User) => {
    setSelectedUser(u);
    setFormData({
      full_name: u.full_name,
      email: u.email,
      password: "",
      role_name: u.role_name ?? "",
      role_id: u.role_id ?? 0,
      is_active: u.is_active,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold">User Management</h1>
            <p className="text-zinc-400 mt-1">Manage system users and permissions</p>
          </div>
          <button
            onClick={() => { setFormData(emptyForm); setIsAddDialogOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add User
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Users",    value: users.length },
            { label: "Active Users",   value: users.filter((u) => u.is_active).length },
            { label: "Inactive Users", value: users.filter((u) => !u.is_active).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-zinc-400 text-sm">{label}</p>
              <p className="text-white text-3xl font-semibold mt-2">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  {["Name", "Email", "Role", "Status", "Actions"].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-xs font-medium text-zinc-300 uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-white">{u.full_name}</td>
                      <td className="px-6 py-4 text-zinc-300">{u.email}</td>
                      <td className="px-6 py-4">
                        {u.role_name
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-blue-600/20 text-blue-400 border-blue-600/40">{u.role_name}</span>
                          : <span className="text-zinc-500 text-sm">—</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${u.is_active ? "bg-green-600/20 text-green-400" : "bg-zinc-700 text-zinc-400"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditDialog(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 rounded transition-colors">
                            <Edit className="w-4 h-4" /><span className="text-sm">Edit</span>
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} disabled={deletingUserId === u.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletingUserId === u.id
                              ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Deleting...</span></>
                              : <><Trash2 className="w-4 h-4" /><span className="text-sm">Delete</span></>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddDialogOpen && (
        <DialogForm
          title="Add New User"
          onClose={() => { setIsAddDialogOpen(false); setFormData(emptyForm); }}
          onSubmit={handleAddUser}
          isSubmitting={isSubmittingAdd}
          submitLabel="Add User"
          formData={formData}
          setFormData={setFormData}
          showPassword={true}
        />
      )}

      {isEditDialogOpen && (
        <DialogForm
          title="Edit User"
          onClose={() => { setIsEditDialogOpen(false); setSelectedUser(null); setFormData(emptyForm); }}
          onSubmit={handleEditUser}
          isSubmitting={isSubmittingEdit}
          submitLabel="Save Changes"
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </>
  );
}