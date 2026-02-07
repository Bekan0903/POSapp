
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppState, UserRole, Notification } from '../types';
import { Package, AlertTriangle, TrendingUp, ShoppingBag, CheckCircle2, ListFilter, ShieldCheck, Mail, Bell, ExternalLink, Send, ShieldAlert, Sparkles, Loader2, Check } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

const DashboardPage: React.FC<{ 
  state: AppState;
  onDispatch: (notif: Omit<Notification, 'id' | 'timestamp' | 'read' | 'type'>) => Promise<boolean>;
}> = ({ state, onDispatch }) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const lowStockItems = state.medicines.filter(m => m.stock <= m.minThreshold);
  const totalItemsSold = useMemo(() => state.sales.reduce((acc, s) => acc + s.quantity, 0), [state.sales]);
  
  const quantityData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.sales.forEach(sale => {
      counts[sale.medicineName] = (counts[sale.medicineName] || 0) + sale.quantity;
    });
    return Object.entries(counts).map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [state.sales]);

  const recentAlerts = state.notifications.slice(0, 5);

  const handleQuickDispatch = async () => {
    if (isDispatching) return;
    setIsDispatching(true);
    setDispatchSuccess(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Generate a concise Pharmacy Status Update for email relay.
        Sales today: ${state.sales.length}
        Low Stock Warnings: ${lowStockItems.length}
        Total varieties: ${state.medicines.length}
        Staff on duty: ${state.currentUser?.fullName}
        Format as JSON: {"subject": "string", "body": "string"}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      await onDispatch({
        subject: result.subject || "Daily Operations Summary",
        body: result.body || "Operational data attached."
      });
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 3000);
    } catch (e) {
      console.error("Quick Dispatch Failed:", e);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Overview</h1>
          <p className="text-slate-500 font-medium">Tracking <span className="text-blue-600 font-bold">{state.medicines.length}</span> inventory items</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button 
            onClick={handleQuickDispatch}
            disabled={isDispatching}
            className={`flex items-center px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border ${
              dispatchSuccess 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-white text-blue-600 border-slate-200 hover:bg-blue-50'
            }`}
          >
            {isDispatching ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : dispatchSuccess ? (
              <Check size={14} className="mr-2" />
            ) : (
              <Sparkles size={14} className="mr-2" />
            )}
            {dispatchSuccess ? 'Report Sent' : 'Dispatch Audit'}
          </button>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase border border-emerald-100 flex items-center shadow-sm">
            <CheckCircle2 size={12} className="mr-2" /> Live System
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-6">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Volume Sold</h3>
            <p className="text-3xl font-black text-slate-900">{totalItemsSold}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-6">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Catalog Size</h3>
            <p className="text-3xl font-black text-slate-900">{state.medicines.length}</p>
          </div>
        </div>

        <div className={`p-8 rounded-[2rem] shadow-sm border flex flex-col justify-between hover:shadow-md transition-all ${lowStockItems.length > 0 ? 'bg-amber-50/30 border-amber-100' : 'bg-white border-slate-100'}`}>
          <div className={`p-3 rounded-2xl w-fit mb-6 ${lowStockItems.length > 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Stock Alerts</h3>
            <p className={`text-3xl font-black ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{lowStockItems.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-800 flex flex-col justify-between transform hover:scale-[1.02] transition-all">
          <div className="p-3 bg-slate-800 text-blue-400 rounded-2xl w-fit mb-6">
            <TrendingUp size={24} />
          </div>
          <div className="text-white">
            <h3 className="text-slate-50 text-[10px] font-bold uppercase tracking-widest mb-1">Transactions</h3>
            <p className="text-3xl font-black">{state.sales.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Bell className="text-blue-600 mr-2" size={20} /> Latest Notifications
              </h3>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {recentAlerts.length > 0 ? recentAlerts.map(notif => (
                <div key={notif.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group relative">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${notif.type === 'ALERT' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {notif.type === 'ALERT' ? <AlertTriangle size={18} /> : <Mail size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 pr-10">{notif.subject}</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{notif.body}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <Mail size={48} className="mx-auto mb-4 opacity-10 text-slate-400" />
                  <p className="font-bold text-sm uppercase text-slate-300 tracking-widest">No recent alerts</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-10 flex items-center">
              <ListFilter size={20} className="mr-2 text-blue-600" /> Dispensation Trend
            </h3>
            <div className="h-64">
              {quantityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quantityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontSize: 11, fontWeight: 700}} width={100} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="qty" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 italic text-sm font-bold uppercase tracking-widest">Awaiting sales...</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <AlertTriangle className="text-amber-500 mr-2" size={20} /> Stock Watchlist
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {lowStockItems.length > 0 ? lowStockItems.map(item => (
              <div key={item.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center border-l-4 border-l-amber-400">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-[10px] text-amber-700 font-bold uppercase">{item.strength}</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-black text-amber-600">{item.stock}</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <CheckCircle2 size={48} className="mb-4 opacity-10" />
                <p className="font-bold text-xs uppercase tracking-widest">Stock is Healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
