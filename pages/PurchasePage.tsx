
import React, { useState } from 'react';
import { Truck, PlusCircle, History, Package, Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AppState, Purchase } from '../types';

interface PurchasePageProps {
  state: AppState;
  onRecordPurchase: (purchase: Omit<Purchase, 'id' | 'timestamp' | 'userId'>) => Promise<{ success: boolean, error?: string }>;
}

const PurchasePage: React.FC<PurchasePageProps> = ({ state, onRecordPurchase }) => {
  const [selectedMedId, setSelectedMedId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [supplier, setSupplier] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedMedId || quantity <= 0 || !supplier) {
      setError('Please fill out all fields correctly.');
      return;
    }
    
    const med = state.medicines.find(m => m.id === selectedMedId);
    if (!med) {
      setError('Medicine not found in list.');
      return;
    };

    setLoading(true);
    const result = await onRecordPurchase({
      medicineId: selectedMedId,
      medicineName: med.name,
      quantity,
      supplier
    });

    setLoading(false);

    if (result.success) {
      setQuantity(1);
      setSupplier('');
      setSelectedMedId('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError(result.error || 'Database rejected the request. Please check permissions.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Stock-In Logistics</h1>
        <p className="text-slate-500 font-medium">Record new shipments and replenish active inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <PlusCircle className="text-blue-600 mr-2" size={24} /> Log Shipment
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {showSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-2xl border border-emerald-100 flex items-center animate-in zoom-in-95">
                  <CheckCircle2 size={18} className="mr-2" /> Stock successfully added!
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-start animate-in shake duration-300">
                  <AlertCircle size={18} className="mr-2 mt-0.5 shrink-0" /> 
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Target Medicine</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </div>
                  <select
                    required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-slate-800"
                    value={selectedMedId}
                    onChange={e => setSelectedMedId(e.target.value)}
                  >
                    <option value="">Choose a medicine...</option>
                    {state.medicines.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.strength})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Supplier Agency</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PharmaCorp Global"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-slate-200 transform active:scale-[0.98] flex items-center justify-center uppercase tracking-wider"
              >
                {loading ? <Loader2 size={24} className="animate-spin mr-2" /> : <Truck size={20} className="mr-2" />}
                {loading ? 'Processing...' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col min-h-[600px]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
                <History className="text-indigo-600 mr-3" size={24} /> Log History
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{state.purchases.length} Records</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {state.purchases.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {[...state.purchases].map(purchase => (
                    <div key={purchase.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mr-5 group-hover:scale-110 transition-transform">
                          <Truck size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{purchase.medicineName}</h4>
                          <div className="flex items-center text-xs text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                            <span className="text-slate-900 font-bold mr-1">{purchase.supplier}</span> • {new Date(purchase.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-xl font-black text-indigo-600">+{purchase.quantity}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Units Received</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                  <Package size={64} className="mb-4 opacity-10" />
                  <p className="font-bold text-sm uppercase tracking-widest">Warehouse log empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
