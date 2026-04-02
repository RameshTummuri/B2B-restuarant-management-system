import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  Routes, Route, Link, useNavigate, useLocation, Navigate 
} from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Package, Clock, AlertTriangle, RefreshCw, Cpu, Activity,
  ChevronRight, ShoppingCart, Zap, PieChart, LayoutDashboard, Utensils, 
  BarChart3, Settings, ShieldCheck, LogOut, Table as TableIcon, Filter, 
  Search, PlusSquare, PlusCircle, Printer, X, CheckCircle, Smartphone
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

// --- AUTH PROTECTOR ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth-token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// --- COMPONENT: PRINTER-STYLE KOT MODAL ---
const KOTModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white text-black w-full max-w-sm p-8 shadow-2xl relative font-mono overflow-hidden">
        <div className="absolute top-2 right-2 print:hidden"><button onClick={onClose}><X size={20}/></button></div>
        <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
          <h2 className="text-xl font-black uppercase tracking-tighter">BAKE-IT B2B KOT</h2>
          <div className="text-[10px] opacity-70">CONTROL CENTER OPERATIONAL UNIT</div>
          <div className="text-[10px] mt-1 italic font-bold">POS Terminal: #{order.order_id}</div>
        </div>
        <div className="flex justify-between text-xs mb-4 font-bold border-b border-black pb-2">
            <span>TABLE: {order.table_number}</span>
            <span>{new Date(order.order_time).toLocaleTimeString()}</span>
        </div>
        <div className="space-y-3 mb-6">
            <div className="flex justify-between text-[10px] font-black border-b border-black/10 pb-1">
                <span className="w-2/3 uppercase">ITEM DESCRIPTION</span>
                <span>QTY</span>
            </div>
            {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                    <span className="uppercase font-bold text-xs">{it.name}</span>
                    <span className="font-black">X {it.quantity}</span>
                </div>
            ))}
        </div>
        <div className="border-t-2 border-dashed border-black pt-4 text-center space-y-1">
            <div className="text-[9px] font-black uppercase">Predicted Ready: {Math.ceil(order.predicted_prep_time)} mins</div>
            <div className="text-[8px] opacity-50 italic">AI Managed Operation</div>
            <button onClick={() => window.print()} className="mt-4 w-full bg-black text-white py-2 text-[10px] font-black uppercase print:hidden">Execute Thermal Print</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS ---
const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'create-order', label: 'Create Order', icon: PlusCircle, path: '/create-order' },
    { id: 'orders', label: 'Table Monitor', icon: TableIcon, path: '/orders' },
    { id: 'kitchen', label: 'Kitchen Hub', icon: Utensils, path: '/kitchen' },
    { id: 'inventory', label: 'Inventory Hub', icon: Package, path: '/inventory' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    toast.success('DEAUTHORIZED SESSION');
    navigate('/login');
  };

  return (
    <aside className="w-72 border-r border-white/5 bg-[#0a0a0c] p-8 flex flex-col h-screen fixed left-0">
      <div className="mb-12">
        <h1 className="text-2xl font-black flex items-center gap-2 tracking-tighter italic">
          <Package className="text-primary" size={32} /> BAKE-IT B2B
        </h1>
        <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-widest pl-1">Enterprise Cluster</p>
      </div>
      
      <nav className="flex-1 space-y-3">
        {menuItems.map(item => (
          <Link 
            key={item.id} 
            to={item.path} 
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <item.icon size={20}/> 
            <span className="font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-8 border-t border-white/5">
        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-600 hover:text-danger hover:bg-danger/5 transition-all outline-none font-bold">
          <LogOut size={20}/> <span className="font-semibold text-sm tracking-widest uppercase text-[10px]">Terminate Auth</span>
        </button>
      </div>
    </aside>
  );
};

const Header = ({ title, date, onDateChange }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const tID = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(tID);
  }, []);

  return (
    <header className="flex justify-between items-start mb-10">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase italic">{title}</h2>
        <div className="flex gap-4 mt-3">
          <span className="flex items-center gap-2 text-xs bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
            <Activity size={14} className="animate-pulse"/> Live Operational Core
          </span>
          <span className="flex items-center gap-2 text-xs bg-white/5 text-gray-500 border border-white/10 px-4 py-1.5 rounded-full font-mono font-bold tracking-widest">
            <Clock size={14}/> {time}
          </span>
          <span className="flex items-center gap-2 text-xs bg-success/10 text-success border border-success/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
            <ShieldCheck size={14}/> Node Verified
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
         <Filter size={18} className="text-gray-500 ml-2" />
         <input 
           type="date" 
           value={date} 
           onChange={(e) => onDateChange(e.target.value)}
           className="bg-transparent text-sm font-bold outline-none border-none p-1 text-gray-300 focus:text-primary transition-all pr-4"
         />
      </div>
    </header>
  );
};

const StatCard = ({ title, value, icon: Icon, color, ai = false, trend }) => (
  <div className="glass-card p-6 border-b-2 group" style={{ borderColor: `${color}44` }}>
    <div className="flex justify-between items-start mb-4">
       <div className="bg-white/5 p-3 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
         <Icon size={20} style={{ color }} />
       </div>
       {ai && <div className="text-[10px] font-bold bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-1.5 tracking-tighter italic animate-pulse"><Cpu size={12}/> AI PREDICTION</div>}
    </div>
    <div className="stat-label text-gray-600 text-[10px] font-black uppercase tracking-[3px]">{title}</div>
    <div className="flex items-end justify-between mt-1">
      <div className="text-3xl font-black text-white">{value}</div>
      {trend && <div className={`text-xs font-bold ${trend > 0 ? 'text-success' : 'text-danger'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</div>}
    </div>
  </div>
);

// --- PAGE: LOGIN ---
const Login = () => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading('EXECUTING SECURITY HANDSHAKE...');
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, creds);
      localStorage.setItem('auth-token', res.data.token);
      toast.success('ADMIN AUTHORIZED SUCCESFULLY', { id: loadToast });
      navigate('/dashboard');
    } catch (err) {
      toast.error('ACCESS DENIED', { id: loadToast });
      setError('AUTHENTICATION FAILED: INVALID CREDENTIALS');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0c0c0e] p-6">
      <div className="glass-card w-full max-w-md p-12 shadow-2xl shadow-primary/5 border border-white/10 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 bg-primary/5 w-64 h-64 rounded-full blur-3xl"></div>
        <div className="flex justify-center mb-10 text-primary group transition-transform duration-500 hover:scale-110">
          <ShieldCheck size={72} strokeWidth={1} />
        </div>
        <h2 className="text-4xl font-black text-center mb-10 tracking-widest italic uppercase">Gateway</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[4px]">Access ID</label>
            <input 
              type="text" 
              className="w-full bg-[#1c1c1e] border border-white/5 p-4 rounded-2xl outline-none focus:border-primary/40 transition-all font-bold text-lg shadow-inner"
              placeholder="Root Admin"
              value={creds.username}
              onChange={e => setCreds({...creds, username: e.target.value})}
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[4px]">Secure Key</label>
            <input 
              type="password" 
              className="w-full bg-[#1c1c1e] border border-white/5 p-4 rounded-2xl outline-none focus:border-primary/40 transition-all font-bold text-lg shadow-inner"
              placeholder="••••••••"
              value={creds.password}
              onChange={e => setCreds({...creds, password: e.target.value})}
              required
            />
          </div>
          {error && <p className="text-danger text-[10px] font-black text-center animate-pulse tracking-widest">{error}</p>}
          <button className="w-full bg-primary hover:bg-opacity-90 py-5 rounded-3xl font-black uppercase tracking-[3px] transition-all shadow-xl shadow-primary/20 hover:translate-y-[-2px] active:scale-95 text-white">
            INITIALIZE AUTH
          </button>
        </form>
      </div>
    </div>
  );
};

// --- PAGE: CREATE ORDER ---
const CreateOrder = () => {
    const [order, setOrder] = useState({ table_number: 1, items: [] });
    const [formData, setFormData] = useState({ itemName: '', quantity: 1 });
    const [loading, setLoading] = useState(false);
    const [kotOrder, setKotOrder] = useState(null);
    const navigate = useNavigate();
  
    const addItem = () => {
      if (!formData.itemName) return;
      setOrder({
        ...order,
        items: [...order.items, { id: Date.now(), name: formData.itemName, quantity: formData.quantity }]
      });
      setFormData({ itemName: '', quantity: 1 });
      toast('Item added to manifest', { icon: '📝' });
    };
  
    const removeItem = (id) => {
      setOrder({
        ...order,
        items: order.items.filter(it => it.id !== id)
      });
      toast('Item removed', { icon: '🗑️' });
    };
  
    const handleCreate = async () => {
      if (order.items.length === 0) return;
      setLoading(true);
      const toastId = toast.loading('SYNCING WITH KITCHEN NODE...');
      try {
        const res = await axios.post(`${API_BASE_URL}/orders/create`, order);
        toast.success(`MANIFEST #${res.data.order_id} CONFIRMED`, { id: toastId });
        setKotOrder(res.data);
      } catch (err) {
        toast.error('SYNC FAILURE', { id: toastId });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="max-w-4xl mx-auto p-4">
        <KOTModal order={kotOrder} isOpen={!!kotOrder} onClose={() => { setKotOrder(null); navigate('/orders'); }} />
        <div className="glass-card p-12 relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingCart size={120} strokeWidth={1} /></div>
          <h3 className="text-3xl font-black mb-10 tracking-widest italic uppercase border-l-8 border-primary pl-6">New Order Manifest</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest">Target Station (Table)</label>
                <div className="grid grid-cols-4 gap-2">
                    {Array.from({length: 12}, (_, i) => i + 1).map(num => (
                        <button 
                            key={num}
                            type="button"
                            onClick={() => setOrder({...order, table_number: num})}
                            className={`p-3 rounded-xl border text-sm font-black transition-all ${order.table_number === num ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
              </div>
  
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Manifest Ops</label>
                  <div className="space-y-4">
                      <input 
                          type="text" 
                          placeholder="Operational Unit (e.g. Pasta)" 
                          className="w-full bg-dark border border-white/10 p-5 rounded-2xl text-lg font-bold outline-none focus:border-primary/50"
                          value={formData.itemName}
                          onChange={e => setFormData({...formData, itemName: e.target.value})}
                      />
                      <div className="flex gap-4">
                        <div className="flex-1 flex bg-dark border border-white/10 rounded-2xl overflow-hidden">
                             <button onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})} className="px-6 hover:bg-white/5">-</button>
                             <div className="flex-1 text-center py-4 font-black">{formData.quantity}</div>
                             <button onClick={() => setFormData({...formData, quantity: formData.quantity + 1})} className="px-6 hover:bg-white/5">+</button>
                        </div>
                        <button onClick={addItem} className="bg-primary hover:bg-opacity-90 px-10 py-4 rounded-2xl text-black font-black flex items-center gap-2"><PlusSquare size={18}/> APPEND</button>
                      </div>
                  </div>
              </div>
            </div>
  
            <div className="space-y-8 border-l border-white/5 pl-12 flex flex-col h-full bg-gradient-to-br from-transparent to-white/[0.01] rounded-r-3xl">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-[5px]">Active Manifest Summary</label>
              <div className="flex-1 space-y-3 min-h-[300px]">
                  {order.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                          <div className="flex flex-col">
                              <span className="font-bold text-lg tracking-tight uppercase">{it.name}</span>
                              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">Inventory Unit: {it.name.substring(0,3)}</span>
                          </div>
                          <div className="flex items-center gap-6">
                              <span className="text-primary font-black text-xl italic font-mono">x{it.quantity}</span>
                              <button onClick={() => removeItem(it.id)} className="text-gray-700 hover:text-danger hover:scale-110 transition-all"><X size={20}/></button>
                          </div>
                      </div>
                  ))}
                  {order.items.length === 0 && <div className="text-center py-20 opacity-20 italic font-bold uppercase tracking-[10px]">NULL STATE</div>}
              </div>
              
              <button 
                  onClick={handleCreate} 
                  disabled={loading || order.items.length === 0}
                  className="w-full bg-white text-black hover:bg-opacity-90 py-6 rounded-3xl font-black uppercase tracking-[5px] flex items-center justify-center gap-4 transition-all disabled:opacity-30 shadow-2xl relative overflow-hidden group"
              >
                  <div className="absolute inset-0 bg-primary/20 translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-500"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? <RefreshCw className="animate-spin" size={20}/> : <CheckCircle size={20}/>}
                    INITIALIZE TRANSMISSION
                  </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

// --- PAGE: ORDERS GRID ---
const OrderGrid = ({ orders }) => {
  const [activeKOT, setActiveKOT] = useState(null);
  const tableGroups = useMemo(() => {
    const groups = {};
    orders.forEach(o => {
      if (!groups[o.table_number]) groups[o.table_number] = [];
      groups[o.table_number].push(o);
    });
    return groups;
  }, [orders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KOTModal order={activeKOT} isOpen={!!activeKOT} onClose={() => setActiveKOT(null)} />
      {Array.from({ length: 12 }, (_, i) => i + 1).map(t => {
        const tableOrders = tableGroups[t] || [];
        const hasActive = tableOrders.some(o => o.status !== 'Served');
        
        return (
          <div key={t} className={`glass-card group overflow-hidden transition-all duration-500 flex flex-col ${hasActive ? 'border-primary/40 shadow-2xl shadow-primary/5 scale-105' : 'opacity-30 grayscale hover:grayscale-0 hover:opacity-100'}`}>
            <div className={`p-5 flex justify-between items-center bg-gradient-to-r from-transparent ${hasActive ? 'to-primary/10' : 'to-white/5'}`}>
              <h3 className="font-black text-2xl tracking-tighter italic">ST-{t.toString().padStart(2, '0')}</h3>
              {tableOrders.length > 0 && <span className="text-[10px] font-black bg-primary text-black px-3 py-1 rounded uppercase tracking-tighter">{tableOrders.length} Ops Active</span>}
            </div>
            
            <div className="p-5 space-y-4 flex-1">
              {tableOrders.length > 0 ? (
                tableOrders.map(o => (
                  <div key={o.order_id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 cursor-pointer hover:bg-white/10 transition-all border-l-4 border-l-accent" onClick={() => setActiveKOT(o)}>
                    <div className="flex justify-between font-black text-sm">
                      <span className="truncate w-3/4">{o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</span>
                      <Printer size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className={`${o.status === 'Queued' ? 'text-gray-500' : o.status === 'Ready' ? 'text-success animate-pulse' : 'text-primary'}`}>{o.status}</span>
                        <div className="flex items-center gap-1 opacity-40"><Smartphone size={10}/> {o.order_id}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-10 space-y-3 border-2 border-white/5 rounded-3xl border-dashed">
                    <TableIcon size={48} strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-[5px]">Station Idle</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- PAGE: KITCHEN ---
const Kitchen = ({ orders, onUpdateStatus }) => {
    const activeOrders = orders
        .filter(o => o.status !== 'Served')
        .sort((a, b) => (a.status === 'Preparing' ? -1 : 1));

    return (
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
            {activeOrders.map(o => (
                <div key={o.order_id} className="glass-card p-8 flex flex-col md:flex-row justify-between items-center gap-10 border-l-[12px] border-l-primary/40 relative overflow-hidden group transition-all duration-300 hover:border-l-primary">
                    <div className="absolute right-0 bottom-0 p-4 opacity-[0.03] transition-transform duration-700 group-hover:scale-125"><Utensils size={180} strokeWidth={1} /></div>
                    <div className="flex gap-10 items-center flex-1 relative z-10">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center min-w-[100px] shadow-2xl backdrop-blur-3xl">
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-tighter mb-1 opacity-50">StnID</div>
                            <div className="text-4xl font-black text-primary italic">#{o.table_number}</div>
                        </div>
                        <div className="flex-1">
                            <div className="text-3xl font-black tracking-tighter uppercase italic">{o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                            <div className="flex gap-6 text-[10px] font-black text-gray-500 mt-4 uppercase tracking-[3px]">
                                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full"><Clock size={16} className="text-primary"/> AI PREDICTION: <span className="text-primary italic">{o.predicted_prep_time}M</span></span>
                                <span className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-white border border-primary/20 tracking-normal italic font-bold">{o.status}</span>
                                <span className="opacity-20 flex items-center font-normal lowercase tracking-normal">id: {o.order_id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 flex-shrink-0 relative z-10 w-full md:w-auto">
                        {o.status === 'Queued' && (
                            <button onClick={() => onUpdateStatus(o.order_id, 'Preparing')} className="flex-1 md:flex-none bg-primary/20 hover:bg-primary/40 text-primary border border-primary/40 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/10">
                                START OPERATIONS
                            </button>
                        )}
                        {o.status === 'Preparing' && (
                            <button onClick={() => onUpdateStatus(o.order_id, 'Ready')} className="flex-1 md:flex-none bg-success/20 hover:bg-success/40 text-success border border-success/40 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-success/10 animate-pulse">
                                SIGNAL READY
                            </button>
                        )}
                        {o.status === 'Ready' && (
                            <button onClick={() => onUpdateStatus(o.order_id, 'Served')} className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                                DEPLOY SERVICE
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {activeOrders.length === 0 && (
                <div className="glass-card p-40 flex flex-col items-center justify-center opacity-20 space-y-6">
                    <CheckCircle size={80} strokeWidth={1} />
                    <span className="font-black uppercase tracking-[15px] ml-[15px] text-center italic">GRID CLEAR: ALL NODES OPERATIONAL</span>
                </div>
            )}
        </div>
    );
};

// --- PAGE: ANALYTICS ---
const Analytics = ({ kpi, forecast }) => (
    <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="glass-card p-10 relative overflow-hidden backdrop-blur-3xl">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><BarChart3 size={120} /></div>
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xl flex items-center gap-3 tracking-widest uppercase italic">
                        <TrendingUp size={24} className="text-primary"/> AI Demand Projection
                    </h3>
                    <span className="text-[10px] font-black opacity-30 tracking-[5px]">7 DAY HORIZON</span>
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <AreaChart data={forecast}>
                            <defs>
                                <linearGradient id="anDemand" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="5 5" stroke="#222" />
                            <XAxis dataKey="day" stroke="#444" fontSize={10} fontStyle="italic" />
                            <YAxis stroke="#444" fontSize={10} />
                            <Tooltip contentStyle={{ background: '#0a0a0c', border: '1px solid #333', borderRadius: '16px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                            <Area type="monotone" dataKey="demand" stroke="#818cf8" strokeWidth={5} fill="url(#anDemand)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-10 relative overflow-hidden backdrop-blur-3xl">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><Activity size={120} /></div>
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xl flex items-center gap-3 tracking-widest uppercase italic">
                        <Activity size={24} className="text-secondary"/> Real-Time Log Utilization
                    </h3>
                    <span className="text-[10px] font-black opacity-30 tracking-[5px]">OPERATIONAL DATA</span>
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={kpi?.demand_trend?.dates.map((d, i) => ({ date: d, orders: kpi.demand_trend.counts[i] })) || []}>
                            <CartesianGrid strokeDasharray="5 5" stroke="#222" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#444" 
                                fontSize={10} 
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                                }}
                                interval={30} // Only show labels approx every month to avoid clutter
                            />
                            <YAxis stroke="#444" fontSize={10} />
                            <Tooltip contentStyle={{ background: '#0a0a0c', border: '1px solid #333', borderRadius: '16px' }} />
                            <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="glass-card p-12 bg-gradient-to-r from-transparent to-white/[0.02]">
            <h4 className="text-[10px] font-black uppercase tracking-[8px] text-gray-600 mb-10 italic">Core Operational Efficiency Index</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                 <div>
                    <div className="text-5xl font-black text-white italic tracking-tighter">{kpi?.completion_rate}%</div>
                    <div className="text-[10px] font-bold text-gray-700 uppercase mt-3 tracking-widest italic">Manifest Success Rate</div>
                 </div>
                 <div>
                    <div className="text-5xl font-black text-white tracking-tighter uppercase">{kpi?.kitchen_load}</div>
                    <div className="text-[10px] font-bold text-gray-700 uppercase mt-3 tracking-widest italic">Grid Pressure Index</div>
                 </div>
                 <div>
                    <div className="text-5xl font-black text-primary italic tracking-tighter animate-pulse">ACTIVE</div>
                    <div className="text-[10px] font-bold text-gray-700 uppercase mt-3 tracking-widest italic">ML Intelligence Sync</div>
                 </div>
                 <div>
                    <div className="text-5xl font-black text-white italic tracking-tighter">₹{kpi?.total_revenue?.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-700 uppercase mt-3 tracking-widest italic">Consolidated Yield</div>
                 </div>
            </div>
        </div>
        <DashboardInsights kpi={kpi} />
    </div>
);

// --- COMPONENT: REAL TIME INSIGHTS ---
const DashboardInsights = ({ kpi }) => (
    <div className="mt-16 space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[8px] text-gray-600 mb-10 flex items-center gap-3 italic">
            <div className="w-12 h-[1px] bg-gray-800"></div> AI Insight Matrix <div className="w-12 h-[1px] bg-gray-800"></div>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[40px] flex items-start gap-6 transition-all hover:bg-primary/10 hover:translate-y-[-5px]">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-xl"><TrendingUp size={24}/></div>
                <div>
                   <div className="font-black text-lg mb-2 italic uppercase tracking-tight">Demand Spike</div>
                   <p className="text-[11px] text-gray-500 leading-relaxed font-bold">Projected increase of <strong>+18%</strong> for main-course units next cycle. Recommendation: Initialize pre-batching of base sauces.</p>
                </div>
            </div>
            <div className="p-8 bg-accent/5 border border-accent/20 rounded-[40px] flex items-start gap-6 transition-all hover:bg-accent/10 hover:translate-y-[-5px]">
                <div className="p-4 bg-accent/10 rounded-2xl text-accent shadow-xl"><AlertTriangle size={24}/></div>
                <div>
                   <div className="font-black text-lg mb-2 italic uppercase tracking-tight">Critical Stock</div>
                   <p className="text-[11px] text-gray-500 leading-relaxed font-bold whitespace-nowrap overflow-hidden text-ellipsis"><strong>Organic Butter</strong> depletion imminent in &lt;36 hrs. Auto-logistics replenishment has been triggered.</p>
                </div>
            </div>
            <div className="p-8 bg-success/5 border border-success/20 rounded-[40px] flex items-start gap-6 transition-all hover:bg-success/10 hover:translate-y-[-5px]">
                <div className="p-4 bg-success/10 rounded-2xl text-success shadow-xl"><CheckCircle size={24}/></div>
                <div>
                   <div className="font-black text-lg mb-2 italic uppercase tracking-tight">Node Optimized</div>
                   <p className="text-[11px] text-gray-500 leading-relaxed font-bold">Preparation nodes optimized by <strong>+9%</strong>. AI has successfully synchronized station B with high-traffic peaks.</p>
                </div>
            </div>
        </div>
    </div>
);

// --- PAGE: INVENTORY ---
const InventoryTerminal = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {[
            { id: 1, name: 'Premium Flour', stock: '240kg', usage: 'High', alert: 'Stable', color: '#10b981', trend: '+2%' },
            { id: 2, name: 'Organic Butter', stock: '12kg', usage: 'Critical', alert: 'Refill Active', color: '#ef4444', trend: '-18%' },
            { id: 3, name: 'Saffron Threads', stock: '450g', usage: 'Moderate', alert: 'Suggested', color: '#f59e0b', trend: '0%' },
            { id: 4, name: 'Tomato Concassé', stock: '85L', usage: 'High', alert: 'Stable', color: '#10b981', trend: '+5%' },
            { id: 5, name: 'Frozen Meat (Lamb)', stock: '40kg', usage: 'Moderate', alert: 'Stable', color: '#10b981', trend: '-2%' },
            { id: 6, name: 'Condensed Milk', stock: '30L', usage: 'High', alert: 'Stock Alert', color: '#ef4444', trend: '-12%' }
        ].map(item => (
            <div key={item.id} className="glass-card flex flex-col p-8 space-y-6 hover:border-primary transition-all group relative overflow-hidden bg-white/[0.01]">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05]"><Package size={80} /></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className="font-black text-2xl tracking-tighter italic uppercase">{item.name}</div>
                        <div className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mt-1">RefCode: {item.name.substring(0,3)}00{item.id}</div>
                    </div>
                    <span className="text-[10px] font-black py-1.5 px-4 rounded-full uppercase border border-white/5 shadow-xl" style={{ background: `${item.color}22`, color: item.color }}>{item.alert}</span>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px]">Reserve Quant.</div>
                        <div className="text-5xl font-black italic tracking-tighter">{item.stock}</div>
                    </div>
                    <div className="text-right">
                         <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Efficiency Trend</div>
                         <div className={`font-black text-xl italic`} style={{ color: item.trend.includes('-') ? '#ef4444' : '#10b981'}}>{item.trend}</div>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex gap-4 relative z-10">
                    <button className="flex-1 bg-white/5 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-all border border-white/5">Order Stock</button>
                    <button className="flex-1 bg-primary/20 text-primary py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-primary/30 transition-all border border-primary/20">Audit Unit</button>
                </div>
            </div>
        ))}
    </div>
);

// --- MAIN LAYOUT ---
const AppLayout = ({ activeTab, kpi, orders, forecast, dateFilter, onDateChange, onUpdateStatus }) => (
    <div className="flex min-h-screen bg-dark text-white overflow-hidden font-sans selection:bg-primary selection:text-black">
        <Sidebar activeTab={activeTab} />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1c1c1e', color: '#fff', border: '1px solid #333', borderRadius: '16px', fontWeight: 'bold' } }} />
        
        <main className="flex-1 ml-72 overflow-y-auto p-16 bg-[#0c0c0e] relative">
            <div className="absolute top-0 right-0 p-20 bg-primary/5 w-96 h-96 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <Header title={activeTab.replace('-', ' ')} date={dateFilter} onDateChange={onDateChange} />

            {/* Global Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <StatCard title="Active Station Load" value={kpi?.total_active || 0} icon={Utensils} color="#3b82f6" />
                <StatCard title="AI Prep Latency (Avg)" value={`${kpi?.avg_prep_time || 0}m`} icon={Clock} color="#8b5cf6" ai={true} />
                <StatCard title="Grid Pressure Level" value={kpi?.kitchen_load || 'Stable'} icon={Activity} color="#ef4444" trend={-5}/>
                <StatCard title="Projected Net Yield" value={`₹${kpi?.total_revenue?.toLocaleString() || 0}`} icon={TrendingUp} color="#10b981" trend={12}/>
            </div>

            <Routes>
                <Route path="/dashboard" element={<Analytics kpi={kpi} forecast={forecast} />} />
                <Route path="/create-order" element={<CreateOrder />} />
                <Route path="/orders" element={<OrderGrid orders={orders} />} />
                <Route path="/kitchen" element={<Kitchen orders={orders} onUpdateStatus={onUpdateStatus} />} />
                <Route path="/inventory" element={<InventoryTerminal />} />
            </Routes>
        </main>
    </div>
);

// --- ROOT APP ---
export default function App() {
  const [kpi, setKpi] = useState(null);
  const [orders, setOrders] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const location = useLocation();
  const activeTab = location.pathname.substring(1);

  const refreshData = useCallback(async () => {
    try {
      const [kpiRes, ordersRes, forecastRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard/kpi`),
        axios.get(`${API_BASE_URL}/orders?date=${dateFilter}`),
        axios.get(`${API_BASE_URL}/forecast/demand?days=7`)
      ]);
      
      // Toast notification for new status changes
      if (orders.length > 0 && ordersRes.data.length > 0) {
          const oldServed = orders.filter(o => o.status === 'Served').length;
          const newServed = ordersRes.data.filter(o => o.status === 'Served').length;
          if (newServed > oldServed) toast.success('ORDER DEPLOYED TO TARGET TABLE', { icon: '🍽️' });
          
          const oldReady = orders.filter(o => o.status === 'Ready').length;
          const newReady = ordersRes.data.filter(o => o.status === 'Ready').length;
          if (newReady > oldReady) toast.success('ORDER READY FOR PICKUP!', { icon: '🔥', duration: 6000 });
      }

      setKpi(kpiRes.data);
      setOrders(ordersRes.data);
      setForecast(forecastRes.data.forecast.map((v, i) => ({ day: `D+${i+1}`, demand: Math.round(v) })));
    } catch (err) {
      console.error("Operational Fetch Failure:", err);
    }
  }, [dateFilter, orders]);

  useEffect(() => {
    if (activeTab === 'login') return;
    refreshData();
    const poller = setInterval(refreshData, 8000); 
    return () => clearInterval(poller);
  }, [refreshData, activeTab]);

  const handleUpdateStatus = async (order_id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/update-status`, { order_id, status });
      toast.success(`STATUS UPDATED: ${status.toUpperCase()}`);
      refreshData();
    } catch (err) {
      toast.error("OP_UPDATE_FAILED");
    }
  };

  return (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
            path="/*" 
            element={
                <ProtectedRoute>
                    <AppLayout 
                        activeTab={activeTab} 
                        kpi={kpi} 
                        orders={orders} 
                        forecast={forecast} 
                        dateFilter={dateFilter}
                        onDateChange={setDateFilter}
                        onUpdateStatus={handleUpdateStatus}
                    />
                </ProtectedRoute>
            } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
