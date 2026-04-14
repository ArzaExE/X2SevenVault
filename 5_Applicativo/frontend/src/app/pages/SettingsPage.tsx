import { useState, useEffect } from "react";
import { User as UserIcon, Key, Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUsers } from "../context/UsersContext"; // Importiamo il context
import { useAuth } from "../context/AuthContext";


const extractError = (err: any): string => {
  return err.response?.data?.error ?? err.response?.data?.message ?? err.message ?? "An error occurred";
};

export function SettingsPage() {
  const { getMe, updateUser, updatePassword } = useUsers();
  
  const [userData, setUserData] = useState({ id: "", name: "", email: "" });
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  const { logout, refreshProfile, authLoading } = useAuth();


  // Caricamento iniziale tramite Context
  useEffect(() => {
    getMe()
      .then(data => setUserData({ id: data.id, name: data.full_name, email: data.email }))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      // 1. Aggiorna sul database
      await updateUser(userData.id, { 
        full_name: userData.name, 
        email: userData.email 
      });

      // 2. Forza l'aggiornamento del profilo nell'AuthContext
      // Questo aggiornerà automaticamente la Sidebar e il nome in alto
      await refreshProfile();
      
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSavingAccount(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match");
    }
    
    setUpdatingPass(true);
    try {
      // AGGIUNTO: Passiamo sia la nuova password che la conferma
      await updatePassword(passwords.new, passwords.confirm);
      
      setPasswords({ new: "", confirm: "" });
      toast.success("Password changed! Please login again.");
      await logout();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUpdatingPass(false);
    }
  };

  if (loading || authLoading) 
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-zinc-700 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-zinc-400 text-lg animate-pulse">Loading...</p>
      </div>
    );

  return (
    <div className="flex-1 overflow-auto px-8 py-6">
      <div className="max-w-4xl space-y-6">
        
        {/* Form Profilo */}
        <form onSubmit={handleSaveAccount} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-semibold">Account Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={e => setUserData({ ...userData, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
              <input
                type="email"
                value={userData.email}
                onChange={e => setUserData({ ...userData, email: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button disabled={savingAccount} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-4">
              {savingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>

        {/* Form Password */}
        <form onSubmit={handleUpdatePassword} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={e => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwords.confirm}
              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button disabled={updatingPass} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {updatingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}