
import React, { useState, useMemo } from 'react';
// Added Shield to the imports from lucide-react
import { Search, ShoppingCart, CheckCircle2, AlertTriangle, ArrowRight, Package, Calculator, List, Tag, Shield } from 'lucide-react';
import { AppState, Medicine } from '../types';

interface POSPageProps {
  state: AppState;
  onRecordSale: (items: { medicineId: string, quantity: number, price: number }[]) => void;
}

const POSPage: React.FC<POSPageProps> = ({ state, onRecordSale }) => {
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const filteredMedicines = state.medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPrice = useMemo(() => {
    if (!selectedMed) return 0;
    return selectedMed.price * quantity;
  }, [selectedMed, quantity]);

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMed) {
      setError('Please select a medicine first.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (quantity > selectedMed.stock) {
      setError(`Insufficient stock. Current inventory: ${selectedMed.stock}`);
      return;
    }

    onRecordSale([{
      medicineId: selectedMed.id,
      quantity: quantity,
      price: selectedMed.price
    }]);

    setSelectedMed(null);
    setQuantity(1);
    setSearchTerm('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Terminal 01</h1>
          <p className="text-slate-500 font-medium">Record pharmaceutical dispensations</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center shadow-lg shadow-slate-200">
            <Calculator size={14} className="mr-2 text-blue-400" /> Session: {state.currentUser?.fullName}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 mr-1">Auth Level: {state.currentUser?.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full min-h-[500px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <Search size={14} className="mr-2" /> Live Catalog Search
            </h3>
            
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Start typing medicine name..."
                className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredMedicines.map(med => (
                <button
                  key={med.id}
                  onClick={() => setSelectedMed(med)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border group ${
                    selectedMed?.id === med.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' 
                      : 'bg-white border-slate-100 text-slate-700 hover:border-blue-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold truncate max-w-[120px]">{med.name}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-tighter ${selectedMed?.id === med.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {med.strength} • {med.unitType}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-black ${selectedMed?.id === med.id ? 'text-white' : 'text-slate-900'}`}>${med.price.toFixed(2)}</div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        med.stock <= med.minThreshold 
                          ? (selectedMed?.id === med.id ? 'bg-blue-500 text-white' : 'bg-amber-100 text-amber-600') 
                          : (selectedMed?.id === med.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500')
                      }`}>
                        {med.stock} IN STOCK
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <form onSubmit={handleRecordSale} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShoppingCart size={120} />
            </div>

            {showSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl border border-emerald-100 flex items-center animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="mr-3" /> Sale completed. Stock deducted.
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 flex items-center">
                <AlertTriangle className="mr-3 shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-6">
              <div className={`p-8 rounded-3xl border flex items-center justify-between transition-all ${selectedMed ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Item in Cart</label>
                  <div className={`text-2xl font-black transition-colors ${selectedMed ? 'text-blue-600' : 'text-slate-300'}`}>
                    {selectedMed ? selectedMed.name : 'Select Item...'}
                  </div>
                  {selectedMed && (
                    <div className="flex items-center text-xs text-slate-500 font-bold uppercase mt-2">
                      <Tag size={12} className="mr-1" /> Unit Price: ${selectedMed.price.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${selectedMed ? 'bg-white text-blue-600 border-blue-100 shadow-sm' : 'bg-white text-slate-200 border-slate-50'}`}>
                  <Package size={28} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button" 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200 font-bold text-slate-600"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="flex-1 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all text-xl font-black text-slate-800 text-center"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200 font-bold text-slate-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 flex flex-col justify-center items-center text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Total Payable</span>
                  <div className="text-3xl font-black">${totalPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={!selectedMed}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center text-xl uppercase tracking-wider group"
              >
                Checkout Now <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest font-bold flex items-center justify-center">
                {/* Fixed: Added Shield to the imports at the top of the file */}
                <Shield className="w-3 h-3 mr-2" /> Finalized Transactions are permanent
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
