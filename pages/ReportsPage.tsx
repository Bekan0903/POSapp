
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Sparkles, Send, X, Loader2, CheckCircle, Mail, History, Download, FileText
} from 'lucide-react';
import { AppState, Notification } from '../types';
import { GoogleGenAI } from "@google/genai";

const ReportsPage: React.FC<{ 
  state: AppState;
  onDispatch: (notif: Omit<Notification, 'id' | 'timestamp' | 'read' | 'type'>) => Promise<boolean>;
}> = ({ state, onDispatch }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [aiDraft, setAiDraft] = useState({ subject: '', body: '' });

  const salesByMedicine = useMemo(() => {
    const map = new Map<string, { name: string, quantity: number, revenue: number }>();
    state.sales.forEach(sale => {
      const existing = map.get(sale.medicineId) || { name: sale.medicineName, quantity: 0, revenue: 0 };
      map.set(sale.medicineId, {
        ...existing,
        quantity: existing.quantity + sale.quantity,
        revenue: existing.revenue + (sale.totalPrice || 0)
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [state.sales]);

  const generateAiReport = async () => {
    setIsAiModalOpen(true);
    setIsGenerating(true);
    setSendSuccess(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const lowStock = state.medicines.filter(m => m.stock <= m.minThreshold);
      const topSellers = salesByMedicine.slice(0, 3);
      const totalRev = state.sales.reduce((a, b) => a + (b.totalPrice || 0), 0);

      const prompt = `
        Draft a Professional Executive Briefing.
        Revenue: $${totalRev.toFixed(2)}
        Sales: ${state.sales.length} records.
        Top Selling: ${topSellers.map(s => s.name).join(', ')}
        Low Stock: ${lowStock.length} items.
        
        Requirements: Provide performance insights and 1 recommendation.
        Format as JSON: {"subject": "...", "body": "..."}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setAiDraft({
        subject: result.subject || "Executive Briefing",
        body: result.body || "Detailed metrics follow..."
      });
    } catch (e) {
      setAiDraft({ subject: 'Operational Report', body: 'Report draft unavailable. Review metrics below.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendDispatch = async () => {
    setIsSending(true);
    const success = await onDispatch(aiDraft);
    setIsSending(false);
    if (success) {
      setSendSuccess(true);
      setTimeout(() => setIsAiModalOpen(false), 2000);
    }
  };

  const exportAuditCSV = () => {
    if (state.sales.length === 0) return;
    
    const headers = ["Ref ID", "Timestamp", "Medicine", "Quantity", "Total Revenue"];
    const rows = state.sales.map(s => [
      s.id,
      new Date(s.timestamp).toLocaleString(),
      s.medicineName,
      s.quantity,
      `$${(s.totalPrice || 0).toFixed(2)}`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pharmaflow_audit_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Audit & Intelligence</h1>
          <p className="text-slate-500 font-medium">Business metrics and verified logs</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportAuditCSV}
            className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl flex items-center shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Download size={18} className="mr-2" /> Export Audit Log
          </button>
          <button 
            onClick={generateAiReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center shadow-lg shadow-blue-100 transition-all transform active:scale-[0.98]"
          >
            <Sparkles size={18} className="mr-2" /> AI Briefing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Mail className="text-blue-600 mr-2" size={20} /> History
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {state.notifications.length > 0 ? state.notifications.map(n => (
              <div key={n.id} className="p-4 rounded-2xl border bg-slate-50 border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${n.type === 'ALERT' ? 'bg-amber-200 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>
                    {n.type}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{n.subject}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
              </div>
            )) : (
              <div className="py-20 text-center text-slate-300">
                <History size={40} className="mx-auto mb-2 opacity-10" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No sent briefs</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Revenue Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByMedicine.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Audit Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Ref ID</th>
                <th className="px-6 py-5">Time</th>
                <th className="px-6 py-5">Item</th>
                <th className="px-6 py-5 text-center">Qty</th>
                <th className="px-6 py-5 text-center">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...state.sales].reverse().map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-[10px] text-slate-300">#{sale.id.slice(0, 8)}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600">{new Date(sale.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-5 font-bold text-slate-900">{sale.medicineName}</td>
                  <td className="px-6 py-5 text-center text-slate-900 font-black">{sale.quantity}</td>
                  <td className="px-6 py-5 text-center font-black text-blue-600">${(sale.totalPrice || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Dispatch</h3>
                <p className="text-xs text-blue-100 font-bold opacity-80">AI Insight Agent</p>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-6">
              {isGenerating ? (
                <div className="py-20 text-center space-y-4">
                  <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
                  <p className="text-slate-500 font-bold">Generating Insights...</p>
                </div>
              ) : sendSuccess ? (
                <div className="py-20 text-center animate-in zoom-in-90">
                  <CheckCircle className="text-emerald-500 mx-auto mb-4" size={64} />
                  <h2 className="text-2xl font-black text-slate-900">Brief Dispatched</h2>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-600 uppercase">Subject</label>
                      <div className="font-bold text-slate-900">{aiDraft.subject}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-600 uppercase">Analysis</label>
                      <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {aiDraft.body}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendDispatch}
                    disabled={isSending}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center transition-all disabled:bg-slate-300"
                  >
                    {isSending ? <Loader2 className="animate-spin mr-2" /> : <Send size={20} className="mr-3" />}
                    Send Email Briefing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
