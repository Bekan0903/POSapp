
import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  PlusCircle, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  Users as UsersIcon,
  Loader2, 
  Bell,
  Mail,
  Send
} from 'lucide-react';
import { AppState, User, Medicine, Sale, Purchase, UserRole, UnitType, Notification } from './types';
import { supabase, TABLES } from './db';
import { GoogleGenAI } from "@google/genai";

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import PurchasePage from './pages/PurchasePage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

const WEB3FORMS_ACCESS_KEY: string = "eaf0cc74-3785-49ca-a075-1e5e067943c1"; 

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

const sendEmailViaWeb3Forms = async (subject: string, message: string) => {
  if (!WEB3FORMS_ACCESS_KEY) return { success: false, error: "Missing Access Key" };

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `[PharmaFlow] ${subject}`,
        message: message,
        from_name: "PharmaFlow POS",
      }),
    });
    const result = await response.json();
    return { success: result.success };
  } catch (e) {
    console.error("Email Relay Error:", e);
    return { success: false, error: "Network Error" };
  }
};

const Layout: React.FC<{ 
  state: AppState; 
  onLogout: () => void;
  children: React.ReactNode;
}> = ({ state, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'POS', path: '/pos', icon: ShoppingCart },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Stock-In', path: '/purchase', icon: PlusCircle },
    { label: 'Staff', path: '/users', icon: UsersIcon, adminOnly: true },
    { label: 'Reports', path: '/reports', icon: BarChart3, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || (state.currentUser?.role === UserRole.ADMIN)
  );

  const lowStockCount = state.medicines.filter(m => m.stock <= m.minThreshold).length;
  const unreadNotifs = state.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">PharmaFlow</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col h-screen
      `}>
        <div className="p-6 border-b border-slate-100 hidden md:flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PharmaFlow
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.label === 'Reports' && unreadNotifs > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadNotifs}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-4 py-3 text-slate-500">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative">
               <UserIcon size={16} />
               {lowStockCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white rounded-full"></span>}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-800 truncate">{state.currentUser?.fullName || 'User'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{state.currentUser?.role || 'Pharmacist'}</span>
            </div>
          </div>
          <button
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center space-x-3 px-4 py-3 mt-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    medicines: [],
    sales: [],
    purchases: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: medsData } = await supabase.from(TABLES.MEDICINES).select('*').order('name');
      const mappedMedicines: Medicine[] = (medsData || []).map(m => ({
        id: m.id,
        name: m.name,
        strength: m.strength,
        unitType: m.unit_type as UnitType,
        stock: m.stock,
        minThreshold: m.min_threshold,
        price: m.price
      }));

      const { data: salesData } = await supabase.from(TABLES.SALES).select('*').order('timestamp', { ascending: false });
      const { data: purchasesData } = await supabase.from(TABLES.PURCHASES).select('*').order('timestamp', { ascending: false });
      const { data: profiles } = await supabase.from(TABLES.PROFILES).select('*');
      const { data: notifData } = await supabase.from(TABLES.NOTIFICATIONS).select('*').order('timestamp', { ascending: false });

      setState(prev => ({
        ...prev,
        medicines: mappedMedicines,
        sales: (salesData || []).map(s => ({
          id: s.id, 
          medicineId: s.medicine_id, 
          medicineName: s.medicine_name, 
          quantity: s.quantity, 
          totalPrice: s.total_price, 
          timestamp: s.timestamp, 
          userId: s.user_id
        })),
        purchases: (purchasesData || []).map(p => ({
          id: p.id, 
          medicineId: p.medicine_id, 
          medicineName: p.medicine_name,
          quantity: p.quantity, 
          supplier: p.supplier, 
          timestamp: p.timestamp, 
          userId: p.user_id
        })),
        users: (profiles || []).map(p => ({
          id: p.id, username: p.username, fullName: p.full_name, role: p.role as UserRole
        })),
        notifications: (notifData || []).map(n => ({
          id: n.id, type: n.type, subject: n.subject, body: n.body, timestamp: n.timestamp, read: n.read
        }))
      }));
    } catch (err) {
      console.error('Data sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let { data: profile } = await supabase.from(TABLES.PROFILES).select('*').eq('id', session.user.id).single();
        if (!profile) {
          profile = { id: session.user.id, username: session.user.email?.split('@')[0] || 'staff', full_name: 'Staff Member', role: UserRole.PHARMACIST };
          await supabase.from(TABLES.PROFILES).insert(profile);
        }
        setState(prev => ({ ...prev, currentUser: { id: profile.id, username: profile.username, fullName: profile.full_name, role: profile.role as UserRole }}));
        fetchData();
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const triggerThresholdAlert = async (medicine: Medicine) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        URGENT PHARMACY ALERT.
        Item: ${medicine.name} ${medicine.strength}
        Current Level: ${medicine.stock}
        Threshold: ${medicine.minThreshold}
        Write a professional restock request notification.
        Return ONLY JSON: {"subject": "string", "body": "string"}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      await sendEmailViaWeb3Forms(result.subject, result.body);

      await supabase.from(TABLES.NOTIFICATIONS).insert({
        id: generateId(),
        type: 'ALERT',
        subject: result.subject || `Stock Alert: ${medicine.name}`,
        body: result.body,
        timestamp: new Date().toISOString(),
        read: false
      });

      fetchData();
    } catch (e) {
      console.error('AI Alert Failure:', e);
    }
  };

  const dispatchBriefing = async (notif: Omit<Notification, 'id' | 'timestamp' | 'read' | 'type'>) => {
    const emailRes = await sendEmailViaWeb3Forms(notif.subject, notif.body);

    const { error } = await supabase.from(TABLES.NOTIFICATIONS).insert({
      id: generateId(),
      type: 'REPORT',
      subject: notif.subject,
      body: notif.body,
      timestamp: new Date().toISOString(),
      read: false
    });

    if (!error) {
      fetchData();
      return emailRes.success;
    }
    return false;
  };

  const recordSale = async (saleItems: { medicineId: string, quantity: number, price: number }[]) => {
    try {
      for (const item of saleItems) {
        const { data: med } = await supabase.from(TABLES.MEDICINES).select('*').eq('id', item.medicineId).single();
        if (med) {
          const { error: saleError } = await supabase.from(TABLES.SALES).insert({
            id: generateId(), medicine_id: med.id, medicine_name: med.name,
            quantity: item.quantity, total_price: item.quantity * item.price,
            timestamp: new Date().toISOString(), user_id: state.currentUser?.id
          });
          
          if (!saleError) {
            const newStock = med.stock - item.quantity;
            await supabase.from(TABLES.MEDICINES).update({ stock: newStock }).eq('id', med.id);
            if (newStock <= med.min_threshold) {
              await triggerThresholdAlert({ ...med, stock: newStock, minThreshold: med.min_threshold, unitType: med.unit_type as UnitType });
            }
          }
        }
      }
      await fetchData();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const recordPurchase = async (purchase: Omit<Purchase, 'id' | 'timestamp' | 'userId'>) => {
    try {
      const { data: med } = await supabase.from(TABLES.MEDICINES).select('*').eq('id', purchase.medicineId).single();
      if (!med) throw new Error('Medicine not found');
      const { error: pErr } = await supabase.from(TABLES.PURCHASES).insert({
        id: generateId(), medicine_id: purchase.medicineId, medicine_name: purchase.medicineName,
        quantity: purchase.quantity, supplier: purchase.supplier,
        timestamp: new Date().toISOString(), user_id: state.currentUser?.id
      });
      if (!pErr) {
        await supabase.from(TABLES.MEDICINES).update({ stock: med.stock + purchase.quantity }).eq('id', med.id);
      }
      await fetchData();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const updateInventory = async (medicine: Medicine) => {
    const dbPayload: any = {
      name: medicine.name, strength: medicine.strength, unit_type: medicine.unitType,
      stock: medicine.stock, min_threshold: medicine.minThreshold, price: medicine.price
    };
    dbPayload.id = (medicine.id && medicine.id.trim() !== '') ? medicine.id : generateId();
    await supabase.from(TABLES.MEDICINES).upsert(dbPayload);
    if (medicine.stock <= medicine.minThreshold) triggerThresholdAlert(medicine);
    fetchData();
  };

  const updateUserProfile = async (user: User) => {
    await supabase.from(TABLES.PROFILES).update({ full_name: user.fullName, role: user.role }).eq('id', user.id);
    fetchData();
  };

  const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
    if (!state.currentUser) return <Navigate to="/login" replace />;
    if (adminOnly && state.currentUser.role !== UserRole.ADMIN) return <Navigate to="/dashboard" replace />;
    return <Layout state={state} onLogout={handleLogout}>{children}</Layout>;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <MemoryRouter>
      <Routes>
        <Route path="/login" element={state.currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={(u) => setState(p => ({...p, currentUser: u}))} />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage state={state} onDispatch={dispatchBriefing} /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><POSPage state={state} onRecordSale={recordSale} /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage state={state} onUpdate={updateInventory} /></ProtectedRoute>} />
        <Route path="/purchase" element={<ProtectedRoute><PurchasePage state={state} onRecordPurchase={recordPurchase} /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage state={state} onUpdateUser={updateUserProfile} /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute adminOnly><ReportsPage state={state} onDispatch={dispatchBriefing} /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MemoryRouter>
  );
};

export default App;
