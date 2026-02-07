
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, Package, AlertCircle, Loader2, Database } from 'lucide-react';
import { supabase, TABLES } from '../db';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          const fallbackUser: User = {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || 'user',
            fullName: 'Staff Member',
            role: UserRole.PHARMACIST
          };
          onLogin(fallbackUser);
        } else {
          onLogin(profile);
        }
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-6">
            <Package className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">PharmaFlow</h1>
          <p className="text-slate-500 mt-2 font-medium uppercase tracking-widest text-[10px]">Professional POS Solutions</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Staff Portal</h2>
              <p className="text-slate-400 text-sm">Authorized access only</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
              <Database size={20} />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-2xl border border-red-100 flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" /> 
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <UserIcon size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                  placeholder="name@pharmacy.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-slate-200 transform active:scale-[0.98] flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {loading ? 'Verifying...' : 'Login to Terminal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
