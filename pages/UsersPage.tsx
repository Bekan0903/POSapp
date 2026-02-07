
import React, { useState } from 'react';
import { Shield, User as UserIcon, X, Search, Edit2, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { AppState, User, UserRole } from '../types';

interface UsersPageProps {
  state: AppState;
  onUpdateUser: (user: User) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ state, onUpdateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    role: UserRole.PHARMACIST
  });

  const filteredUsers = state.users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        fullName: formData.fullName,
        role: formData.role
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">STAFF MANAGEMENT</h1>
          <p className="text-slate-500 font-medium">Manage pharmacist roles and system access</p>
        </div>
        <div className="flex gap-3">
          <a 
            href="https://supabase.com/dashboard/project/_/auth/users" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-2xl flex items-center shadow-lg transition-all transform active:scale-[0.98]"
          >
            Create Login Account <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
      </div>

      {/* Guide Box */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start space-x-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl shrink-0 flex items-center justify-center">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm">How to add a new Pharmacist</h4>
          <p className="text-blue-700/70 text-xs mt-1 leading-relaxed">
            1. First, click "Create Login Account" to add their email/password in the secure Supabase Dashboard.<br/>
            2. After they log in once, their profile will appear in the list below.<br/>
            3. Use the edit button below to set their official name and assign their Pharmacist or Admin permissions.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Full Name & Email</th>
                <th className="px-6 py-5 text-center">System Role</th>
                <th className="px-6 py-5 text-center">Unique ID</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${user.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {user.role === UserRole.ADMIN ? <Shield size={22} /> : <UserIcon size={22} />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{user.fullName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${user.role === UserRole.ADMIN ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="font-mono text-[10px] text-slate-300 uppercase select-all">
                      {user.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit Staff Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-3 mb-2">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight leading-relaxed">
                  You are editing the local identity of this staff member. Emails and passwords must be updated via the cloud dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Official Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Access Privileges</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: UserRole.PHARMACIST})}
                      className={`py-4 px-4 rounded-2xl border-2 font-black text-xs transition-all ${formData.role === UserRole.PHARMACIST ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    >
                      PHARMACIST
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: UserRole.ADMIN})}
                      className={`py-4 px-4 rounded-2xl border-2 font-black text-xs transition-all ${formData.role === UserRole.ADMIN ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    >
                      ADMINISTRATOR
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-slate-100 transition-all transform active:scale-[0.98]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
