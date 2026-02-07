
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Filter, ChevronRight, AlertTriangle, Package, X } from 'lucide-react';
import { AppState, Medicine, UnitType } from '../types';

interface InventoryPageProps {
  state: AppState;
  onUpdate: (med: Medicine) => void;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ state, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Medicine, 'id'>>({
    name: '',
    strength: '',
    unitType: UnitType.TABLET,
    stock: 0,
    minThreshold: 10,
    price: 0
  });

  const filteredMedicines = useMemo(() => {
    return state.medicines.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.medicines, searchTerm]);

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      strength: '',
      unitType: UnitType.TABLET,
      stock: 0,
      minThreshold: 10,
      price: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({ ...med });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Medicine = {
      ...formData,
      id: editingMedicine ? editingMedicine.id : '' // App.tsx handles empty ID as new Insert
    };
    onUpdate(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">INVENTORY CONTROL</h1>
          <p className="text-slate-500 font-medium">Manage medicines and monitor stock levels</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center shadow-lg shadow-blue-100 transition-all transform active:scale-[0.98]"
        >
          <Plus size={20} className="mr-2" /> Add New Medicine
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Search inventory by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Medicine Identity</th>
                <th className="px-6 py-5 text-center">Packaging</th>
                <th className="px-6 py-5 text-center">Unit Stock</th>
                <th className="px-6 py-5 text-center">Unit Price</th>
                <th className="px-8 py-5 text-right">Modify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMedicines.map(med => (
                <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-transform group-hover:scale-110 ${med.stock <= med.minThreshold ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                        <Package size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{med.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{med.strength}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200">
                      {med.unitType}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-black ${med.stock <= med.minThreshold ? 'text-amber-600' : 'text-slate-900'}`}>
                        {med.stock}
                      </span>
                      {med.stock <= med.minThreshold && (
                        <span className="flex items-center text-[9px] text-amber-500 font-black uppercase tracking-tighter mt-1">
                          <AlertTriangle size={10} className="mr-1" /> Reorder Point
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center font-bold text-slate-900">
                    ${med.price.toFixed(2)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => openEditModal(med)}
                      className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-300">
                    <Package size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold text-sm">No inventory records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingMedicine ? 'Update' : 'Register'} Medicine</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Trade Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Strength (e.g. 500mg)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    value={formData.strength}
                    onChange={e => setFormData({ ...formData, strength: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Unit Packaging</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 appearance-none"
                    value={formData.unitType}
                    onChange={e => setFormData({ ...formData, unitType: e.target.value as UnitType })}
                  >
                    {Object.values(UnitType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Unit List Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Min. Threshold</label>
                  <input
                    type="number"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    value={formData.minThreshold}
                    onChange={e => setFormData({ ...formData, minThreshold: parseInt(e.target.value) })}
                  />
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
