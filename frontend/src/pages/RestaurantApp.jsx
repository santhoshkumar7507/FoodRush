import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import OrderCard from '../components/OrderCard';
import { 
  LogOut, Store, BellRing, Check, X, User, DollarSign, Package, 
  Clock, TrendingUp, Zap, LayoutDashboard, UtensilsCrossed, 
  BarChart3, Settings, ShieldCheck, Activity, Users, Flame, ArrowRight, Plus, Search, Mail, Phone, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RestaurantApp({ user, darkMode }) {
  const { messages, sendMessage } = useWebSocket('restaurant', user.user_id);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Main Course', description: '' });
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notifications', 'profile', or null
  const [showAddModal, setShowAddModal] = useState(false);

  // We'll hardcode to the first restaurant for demo purposes
  const restaurantId = "r1"; 

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/orders/restaurant/${restaurantId}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'menu') {
        fetchMenu();
    }
  }, [activeTab]);

  const fetchMenu = () => {
    fetch(`http://127.0.0.1:8000/api/restaurants/${restaurantId}/menu`)
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error("Error fetching menu:", err));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    fetch(`http://127.0.0.1:8000/api/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, id: `m${Date.now()}`, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80' })
    })
    .then(res => res.json())
    .then(() => {
        fetchMenu();
        setShowAddModal(false);
        setNewItem({ name: '', price: '', category: 'Main Course', description: '' });
    })
    .catch(err => console.error("Error adding item:", err));
  };

  const deleteItem = (itemId) => {
    fetch(`http://127.0.0.1:8000/api/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'DELETE'
    })
    .then(() => fetchMenu())
    .catch(err => console.error("Error deleting item:", err));
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      if (lastMsg.type === 'order_placed') {
        const order = lastMsg.order;
        if (order.restaurant_id === restaurantId) {
          setOrders(prev => [order, ...prev]);
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play();
          } catch(e) {}
        }
      }
      
      if (lastMsg.type === 'order_picked_up' || lastMsg.type === 'order_delivered') {
        setOrders(prev => prev.map(o => o.id === lastMsg.order_id ? { ...o, status: lastMsg.type === 'order_picked_up' ? 'Picked Up' : 'Delivered' } : o));
      }
    }
  }, [messages]);

  const updateOrderStatus = (orderId, actionType) => {
    sendMessage({ type: actionType, order_id: orderId });
    
    const statusMap = {
      'order_confirmed': 'Confirmed',
      'order_rejected': 'Rejected',
      'order_preparing': 'Preparing',
      'order_ready': 'Ready for Pickup'
    };
    
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: statusMap[actionType] } : o));
  };

  const activeOrders = orders.filter(o => !['Delivered', 'Rejected'].includes(o.status));
  const pastOrders = orders.filter(o => ['Delivered', 'Rejected'].includes(o.status));
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((acc, curr) => acc + curr.total_amount, 0);

  const sidebarItems = [
    { id: 'dashboard', label: 'Operational Hub', icon: <LayoutDashboard size={22} /> },
    { id: 'orders', label: 'Neural Queue', icon: <Package size={22} />, badge: activeOrders.length },
    { id: 'menu', label: 'Menu Matrix', icon: <UtensilsCrossed size={22} /> },
    { id: 'analytics', label: 'Yield Analytics', icon: <BarChart3 size={22} /> },
    { id: 'settings', label: 'Command Terminal', icon: <Settings size={22} /> },
  ];

  const renderOrdersList = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-10 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.5)]" />
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Operational Queue</h2>
        </div>
        {activeOrders.length > 0 && (
          <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 px-6 py-3 rounded-2xl border border-white dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
            <Zap size={18} className="text-orange-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">Grid Link Stable</span>
          </div>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-24 text-center rounded-[4rem] border border-white dark:border-slate-800/50 shadow-2xl relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10">
            <div className="w-40 h-40 rounded-[3.5rem] bg-slate-100 dark:bg-slate-950 flex items-center justify-center mx-auto mb-10 shadow-2xl relative group-hover:scale-110 transition-transform duration-700">
               <div className="absolute inset-0 rounded-[3.5rem] bg-orange-500/10 animate-ping opacity-20" />
               <Flame size={80} className="text-slate-300 dark:text-slate-800 group-hover:text-orange-500 transition-colors" />
            </div>
            <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-none uppercase italic">Synchronizing Grid</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed text-sm">Standby mode engaged. All subsystems are operational and awaiting customer request transmissions across the network.</p>
            <div className="mt-12 flex justify-center gap-2">
               {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {activeOrders.map(order => (
              <motion.div 
                key={order.id} 
                layout
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -40 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <OrderCard 
                  order={order} 
                  role="restaurant"
                  actions={
                    <div className="flex flex-col gap-4 w-full mt-6">
                      {order.status === 'Placed' && (
                        <div className="flex gap-4">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'order_confirmed')}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all shadow-xl shadow-emerald-500/20"
                          >
                            <Check size={18} className="mr-3" /> Accept
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'order_rejected')}
                            className="flex-1 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all border border-red-500/10"
                          >
                            <X size={18} className="mr-3" /> Deny
                          </button>
                        </div>
                      )}
                      
                      {order.status === 'Confirmed' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'order_preparing')}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-500/20"
                        >
                          Process Ingredients
                        </button>
                      )}
                      
                      {order.status === 'Preparing' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'order_ready')}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20"
                        >
                          Release to Logistics
                        </button>
                      )}
                      
                      {['Ready for Pickup', 'Picked Up', 'On the Way'].includes(order.status) && (
                        <div className="w-full flex items-center justify-center gap-4 bg-slate-100/50 dark:bg-slate-950/50 py-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">Partner Active In Field</span>
                        </div>
                      )}
                    </div>
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  const renderKitchenHealth = () => (
    <div className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-slate-800/50 rounded-[3.5rem] p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Kitchen Health</h3>
        <div className="flex gap-1">
          {[1,2,3].map(i => <div key={i} className="w-1 h-4 bg-orange-500/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
        </div>
      </div>
      
      <div className="relative h-24 mb-8 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/50 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
        <svg className="w-full h-full opacity-30">
          <motion.path 
            d="M 0 50 Q 50 10, 100 50 T 200 50 T 300 50" 
            stroke="orange" 
            fill="transparent" 
            strokeWidth="2"
            animate={{ d: ["M 0 50 Q 50 10, 100 50 T 200 50 T 300 50", "M 0 50 Q 50 90, 100 50 T 200 50 T 300 50", "M 0 50 Q 50 10, 100 50 T 200 50 T 300 50"] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.path 
            d="M 0 60 Q 70 20, 140 60 T 280 60" 
            stroke="red" 
            fill="transparent" 
            strokeWidth="1"
            animate={{ d: ["M 0 60 Q 70 20, 140 60 T 280 60", "M 0 60 Q 70 80, 140 60 T 280 60", "M 0 60 Q 70 20, 140 60 T 280 60"] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </svg>
        <span className="absolute text-[8px] font-black uppercase tracking-[0.5em] text-orange-500/50">Neural Sync Active</span>
      </div>

      <div className="space-y-8">
        {[
          { label: 'Thermal Efficiency', value: '98%', color: 'emerald' },
          { label: 'Neural Link Load', value: '42%', color: 'orange' },
          { label: 'Inventory Buffer', value: 'High', color: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              <span>{stat.label}</span>
              <span className={`text-${stat.color}-500`}>{stat.value}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: stat.value === 'High' ? '85%' : stat.value }}
                transition={{ duration: 1.5, delay: i * 0.2 }}
                className={`h-full bg-${stat.color}-500 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLiveLogs = () => (
    <div className="bg-gradient-to-br from-slate-900 to-black rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Live Logs</h3>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
        <div className="space-y-6">
          {[
            { time: '14:22', msg: 'Order #A92 confirmed' },
            { time: '14:18', msg: 'Logistics partner assigned' },
            { time: '14:15', msg: 'System integrity check passed' },
          ].map((log, i) => (
            <div key={i} className="flex gap-4 items-start group/log">
              <span className="text-[10px] font-black text-orange-500/50 font-mono mt-0.5">{log.time}</span>
              <p className="text-xs font-medium text-slate-400 group-hover/log:text-white transition-colors">{log.msg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12">
            {/* Top Stat Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Order Velocity', value: activeOrders.length, icon: <Zap size={24}/>, color: 'orange', trend: 'Active Pulse' },
                { label: 'Daily Yield', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={24}/>, color: 'emerald', trend: '+12.4%' },
                { label: 'Prep Accuracy', value: '98.4%', icon: <Check size={24}/>, color: 'indigo', trend: 'Optimized' },
                { label: 'Network Load', value: 'Moderate', icon: <Activity size={24}/>, color: 'purple', trend: '64%' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800/50 shadow-xl group hover:border-orange-500/30 transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter leading-none">{stat.value}</h3>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg bg-${stat.color}-500/5 text-${stat.color}-500 border border-${stat.color}-500/10 uppercase tracking-widest`}>
                      {stat.trend}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                {/* Logistics Hub */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-xl overflow-hidden relative">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-8 bg-orange-500 rounded-full" />
                         <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Live Logistics Hub</h3>
                      </div>
                      <div className="flex gap-2">
                         <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">7 Partners Active</div>
                      </div>
                   </div>
                   <div className="h-80 bg-slate-100 dark:bg-slate-950 rounded-[2.5rem] relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                      {/* Simulated Map Background */}
                      <div className="absolute inset-0 opacity-20 dark:opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.5946,12.9716,12,0/800x400?access_token=YOUR_MAPBOX_TOKEN_HERE')] bg-cover bg-center" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-100 dark:from-slate-950 to-transparent" />
                      
                      {/* Animated Markers */}
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/50 shadow-2xl">
                            <Store className="text-orange-500" size={24} />
                         </div>
                      </motion.div>
                      {[
                        { top: '30%', left: '40%' },
                        { top: '60%', left: '70%' },
                        { top: '40%', left: '20%' },
                      ].map((pos, i) => (
                        <motion.div key={i} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }} className="absolute" style={pos}>
                           <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                        </motion.div>
                      ))}

                      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                         <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white dark:border-slate-800 shadow-2xl">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                  <Users size={16} className="text-orange-500" />
                               </div>
                               <div>
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Assigned Partners</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">4 Dispatched</p>
                               </div>
                            </div>
                         </div>
                         <button className="bg-orange-500 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 transition-all">Expand Matrix</button>
                      </div>
                </div>
                </div>
                {renderOrdersList()}
              </div>
              <div className="lg:col-span-4 space-y-10">
                {renderKitchenHealth()}
                {renderLiveLogs()}
                
                {/* Secondary Widget: Peak Hours */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-xl">
                   <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Yield Density</h4>
                   <div className="space-y-6">
                      {[
                        { label: 'Main Course', value: '64%', color: 'orange' },
                        { label: 'Beverages', value: '18%', color: 'blue' },
                        { label: 'Desserts', value: '12%', color: 'purple' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                              <span className="text-slate-500">{item.label}</span>
                              <span className={`text-${item.color}-500`}>{item.value}</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full bg-${item.color}-500`} style={{ width: item.value }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-12 pb-24">
            {/* Order Pipeline Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Pending Matrix', count: orders.filter(o => o.status === 'Placed').length, color: 'orange', sub: 'Action Required' },
                { label: 'Active Processing', count: orders.filter(o => o.status === 'Preparing').length, color: 'indigo', sub: 'In Kitchen' },
                { label: 'Logistics Handover', count: orders.filter(o => ['Ready for Pickup', 'Picked Up', 'On the Way'].includes(o.status)).length, color: 'emerald', sub: 'Partner Active' },
              ].map((pipe, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800/50 flex items-center justify-between group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-2">{pipe.label}</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{pipe.count}</h3>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-3 text-${pipe.color}-500`}>{pipe.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${pipe.color}-500/10 flex items-center justify-center text-${pipe.color}-500 group-hover:rotate-12 transition-transform`}>
                    <Package size={20} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800/50 shadow-xl">
               <div className="relative w-full max-w-md group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search Order Protocol ID..." 
                    className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-inner"
                  />
               </div>
               <div className="flex gap-4">
                  <button className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg">History Node</button>
                  <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">Export JSON Matrix</button>
               </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-2.5 h-10 bg-orange-500 rounded-full" />
                 <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Neural Queue Console</h2>
              </div>
              {renderOrdersList()}
            </div>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                   <div className="w-2.5 h-12 bg-orange-500 rounded-full" />
                   <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Menu Matrix</h2>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-orange-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:shadow-2xl shadow-orange-500/30 transition-all text-xs flex items-center gap-3 hover:scale-105 active:scale-95"
                >
                    <Plus size={20} /> Deploy New Entry
                </button>
            </div>

            {/* Menu Controls */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-xl flex flex-col md:flex-row gap-8 items-center">
               <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search Menu Data..." 
                    className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl pl-16 pr-6 py-5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-inner"
                  />
               </div>
               <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                  {['All Nodes', 'Main Course', 'Starters', 'Desserts', 'Beverages'].map((cat, i) => (
                     <button key={i} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${i === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {cat}
                     </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                {menu.map((item) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -10 }}
                        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-slate-800/50 rounded-[3rem] overflow-hidden group hover:border-orange-500/40 transition-all shadow-xl"
                    >
                        <div className="h-60 overflow-hidden relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/20 shadow-2xl">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{item.name}</h4>
                                <span className="text-2xl font-black text-orange-500 tracking-tighter leading-none">₹{item.price}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-10 line-clamp-2 leading-relaxed">{item.description}</p>
                            <div className="flex gap-4">
                                <button className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">Modify Matrix</button>
                                <button 
                                    onClick={() => deleteItem(item.id)}
                                    className="w-16 h-16 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all border border-red-500/10 shadow-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] p-16 relative z-10 border border-white/10 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex items-center gap-6 mb-12">
                           <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-inner">
                              <Plus size={32} />
                           </div>
                           <div>
                              <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none mb-2">Deploy New Entry</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Synchronized Deployment</p>
                           </div>
                        </div>

                        <form onSubmit={handleAddItem} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-4">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Item Designation</label>
                                   <input 
                                       type="text" 
                                       value={newItem.name}
                                       onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                       className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] px-8 py-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-inner"
                                       placeholder="e.g. Signature Truffle Pizza"
                                       required
                                   />
                               </div>
                               <div className="space-y-4">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Valuation (₹)</label>
                                   <input 
                                       type="number" 
                                       value={newItem.price}
                                       onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                       className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] px-8 py-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-inner"
                                       placeholder="499"
                                       required
                                   />
                               </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Cluster Category</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   {['Main Course', 'Starters', 'Desserts', 'Beverages'].map((cat) => (
                                      <button 
                                        type="button"
                                        key={cat}
                                        onClick={() => setNewItem({...newItem, category: cat})}
                                        className={`px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${newItem.category === cat ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-slate-100/50 dark:bg-slate-950/50 text-slate-500 border-transparent hover:border-orange-500/30'}`}
                                      >
                                         {cat}
                                      </button>
                                   ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Technical Description</label>
                                <textarea 
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                    className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] px-8 py-6 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all h-36 resize-none shadow-inner"
                                    placeholder="Define the item's composition..."
                                />
                            </div>

                            <div className="flex gap-6 pt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 rounded-[2rem] font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Abort</button>
                                <button type="submit" className="flex-1 py-6 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Commit Entry</button>
                            </div>
                        </form>
                    </motion.div>
            </div>
          )}
        </div>
      );

      case 'analytics':
        return (
          <div className="space-y-12 pb-24">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-2.5 h-12 bg-emerald-500 rounded-full" />
                   <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Yield Analytics</h2>
                </div>
                <div className="flex gap-4">
                   <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Download PDF Report</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Avg Prep Cycle', value: '16.4 min', icon: <Clock size={20}/>, color: 'orange', trend: '-2.4m' },
                { label: 'Growth Index', value: '+24.8%', icon: <TrendingUp size={20}/>, color: 'emerald', trend: 'Peak' },
                { label: 'Loyalty Factor', value: '88%', icon: <Users size={20}/>, color: 'blue', trend: '+5%' },
              ].map((stat, i) => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white dark:border-slate-800/50 shadow-xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 shadow-inner`}>
                      {stat.icon}
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl bg-${stat.color}-500/5 text-${stat.color}-500 border border-${stat.color}-500/10 uppercase tracking-widest`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white dark:border-slate-800/50 shadow-2xl">
                   <div className="flex justify-between items-center mb-12">
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Financial Pulse</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly Gross Yield Revenue</p>
                       </div>
                       <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-inner">
                           <option>Last 7 Cycles</option>
                           <option>Last 30 Cycles</option>
                       </select>
                   </div>
                   <div className="h-80 flex items-end gap-6 px-4">
                       {[40, 75, 45, 95, 65, 85, 55].map((h, i) => (
                       <div key={i} className="flex-1 group relative">
                           <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: `${h}%` }}
                               transition={{ duration: 1.5, delay: i * 0.1, type: "spring" }}
                               className="w-full bg-gradient-to-t from-emerald-500 to-teal-600 rounded-[1.5rem] group-hover:from-emerald-400 group-hover:to-teal-500 transition-all cursor-pointer shadow-2xl shadow-emerald-500/10" 
                           />
                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-2xl whitespace-nowrap">₹{(h*1420).toLocaleString()}</div>
                       </div>
                       ))}
                   </div>
                   <div className="flex justify-between mt-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100 dark:border-slate-800 pt-8">
                       <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                   </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                   <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white dark:border-slate-800/50 shadow-2xl text-center">
                      <h3 className="text-xl font-black mb-12 uppercase tracking-tighter text-slate-900 dark:text-white">Sentiment Score</h3>
                      <div className="flex items-center justify-center h-52 relative">
                          <svg className="w-56 h-56 transform -rotate-90">
                              <circle cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                              <motion.circle 
                                  cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                  strokeDasharray={565}
                                  initial={{ strokeDashoffset: 565 }}
                                  animate={{ strokeDashoffset: 565 - (565 * 0.94) }}
                                  transition={{ duration: 2.5, ease: "easeOut" }}
                                  className="text-emerald-500" 
                              />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">4.9</span>
                             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-3">Elite Status</p>
                          </div>
                      </div>
                      <div className="mt-12 space-y-5">
                          {[
                              { label: 'Quality', value: 98, color: 'emerald' },
                              { label: 'Latency', value: 85, color: 'orange' },
                              { label: 'Package', value: 92, color: 'blue' },
                          ].map((m, i) => (
                              <div key={i} className="space-y-2">
                                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                     <span>{m.label}</span>
                                     <span className={`text-${m.color}-500`}>{m.value}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                      <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${m.value}%` }}
                                          className={`h-full bg-${m.color}-500 shadow-lg`}
                                      />
                                  </div>
                              </div>
                          ))}
                      </div>
                   </div>
                </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-12 pb-32">
            {/* Header section with terminal feel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
               <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Subsystem v4.2.0 Active</span>
                  </div>
                  <h2 className="text-6xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">Command Terminal</h2>
               </div>
               <div className="flex gap-4">
                  <div className="px-8 py-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] border border-white dark:border-slate-800/50 flex items-center gap-6 shadow-xl">
                     <Activity size={22} className="text-emerald-500" />
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Uptime Index</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">99.98%</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* Main Configuration Matrix */}
               <div className="lg:col-span-8 space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110" />
                    <div className="flex items-center gap-6 mb-16">
                       <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30">
                          <Store size={36} />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none mb-2">Node Identity</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Primary Data Matrix &bull; ID: {restaurantId.toUpperCase()}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       {[
                         { label: 'Store Designation', value: user.restaurantName, icon: <Activity size={16}/> },
                         { label: 'Network Alias', value: 'hq@foodrush.io', icon: <Users size={16}/> },
                       ].map((field, i) => (
                         <div key={i} className="space-y-4 group/input">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 flex items-center gap-3">
                               <span className="text-orange-500">{field.icon}</span> {field.label}
                            </label>
                            <input 
                              type="text" 
                              defaultValue={field.value} 
                              className="w-full bg-slate-100/30 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-[2rem] px-8 py-6 font-bold text-slate-900 dark:text-white focus:ring-4 ring-orange-500/10 outline-none transition-all group-hover/input:border-orange-500/40" 
                            />
                         </div>
                       ))}
                       <div className="md:col-span-2 space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6">Deployment Coordinates (Address)</label>
                          <textarea 
                            defaultValue="Tech Corridor 7, Block-X, Bengaluru Matrix 560001" 
                            className="w-full bg-slate-100/30 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] px-8 py-6 font-bold text-slate-900 dark:text-white focus:ring-4 ring-orange-500/10 outline-none transition-all h-36 resize-none" 
                          />
                       </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-xl">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-10">Operational Toggles</h4>
                        <div className="space-y-8">
                           {[
                             { name: 'Quantum Dispatch', active: true },
                             { name: 'Neural Pricing', active: false },
                             { name: 'Auto-Replenish', active: true },
                           ].map((t, i) => (
                             <div key={i} className="flex justify-between items-center bg-slate-100/30 dark:bg-slate-950/30 p-6 rounded-[1.5rem] border border-transparent hover:border-orange-500/20 transition-all cursor-pointer group/toggle">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover/toggle:text-slate-900 dark:group-hover/toggle:text-white transition-colors">{t.name}</span>
                                <div className={`w-14 h-7 rounded-full p-1.5 transition-all duration-500 ${t.active ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                   <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-500 ${t.active ? 'translate-x-7' : 'translate-x-0'}`} />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-xl">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-10">Service Range (KM)</h4>
                        <div className="flex flex-col items-center justify-center pb-4">
                           <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                 <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                 <motion.circle 
                                   cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" 
                                   strokeDasharray={502}
                                   initial={{ strokeDashoffset: 502 }}
                                   animate={{ strokeDashoffset: 502 - (502 * 0.72) }}
                                   transition={{ duration: 2, ease: "easeOut" }}
                                   className="text-orange-500" 
                                 />
                              </svg>
                              <div className="flex flex-col items-center">
                                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">12.5</span>
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Radius</span>
                              </div>
                           </div>
                           <input type="range" className="w-full accent-orange-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Sidebar Matrix */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="bg-gradient-to-br from-slate-900 to-black p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] -mr-24 -mt-24 animate-pulse" />
                     <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-12">
                           <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                              <ShieldCheck className="text-orange-500" size={24} />
                           </div>
                           <h3 className="text-xl font-black uppercase tracking-tighter text-white">Encryption</h3>
                        </div>
                        <div className="space-y-8">
                           {[
                             { label: 'Public Access Token', value: 'pk_live_09x22...11z' },
                             { label: 'Secret Matrix Hash', value: '••••••••••••••••' },
                           ].map((k, i) => (
                             <div key={i} className="space-y-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{k.label}</label>
                                <div className="bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 flex items-center justify-between group/key cursor-pointer hover:bg-white/10 transition-all">
                                   <code className="text-[10px] text-orange-400 font-mono truncate mr-4 tracking-wider">{k.value}</code>
                                   <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-xl">
                     <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-10">Subsystem Health</h4>
                     <div className="space-y-10">
                        {[
                          { name: 'Core Engine', health: 98, status: 'Stable', color: 'emerald' },
                          { name: 'Logistics Link', health: 85, status: 'Active', color: 'orange' },
                          { name: 'Payment Gate', health: 100, status: 'Online', color: 'emerald' },
                        ].map((s, i) => (
                          <div key={i} className="space-y-4">
                             <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-${s.color}-500 animate-pulse`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest text-${s.color}-500`}>{s.status}</span>
                                </div>
                             </div>
                             <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s.health}%` }}
                                  transition={{ duration: 1.5, delay: i * 0.2 }}
                                  className={`h-full bg-${s.color}-500 shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-full`} 
                                />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Floating Commit Bar */}
            <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5, type: "spring" }}
               className="fixed bottom-12 left-80 right-0 flex justify-center z-50 pointer-events-none px-12"
            >
               <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-2xl border border-white/10 dark:border-black/5 p-5 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex items-center justify-between gap-12 pointer-events-auto max-w-3xl w-full">
                  <div className="flex items-center gap-5 ml-8">
                     <div className="w-3.5 h-3.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_20px_rgba(255,107,0,0.6)]" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white dark:text-slate-900 leading-none mb-1">State Mutation Detected</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Unsaved changes in buffer</span>
                     </div>
                  </div>
                  <div className="flex gap-4 pr-2">
                     <button className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white dark:hover:text-black transition-all">Discard Buffer</button>
                     <button className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">Commit Matrix</button>
                  </div>
               </div>
            </motion.div>
          </div>
        );
    }
  };
return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex selection:bg-orange-500/30 overflow-hidden transition-colors duration-700 font-body">
      <div className={`fixed inset-0 ${darkMode ? 'bg-mesh opacity-20' : 'light-mesh opacity-60'} pointer-events-none transition-opacity duration-1000`} />
      
      <aside className="w-80 h-screen bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-r border-white dark:border-slate-800/50 p-8 flex flex-col relative z-20 transition-all duration-500 shrink-0">
        <div className="flex items-center gap-5 px-2 mb-16">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 group-hover:scale-110 transition-transform duration-700 relative">
             <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-pulse" />
             <Zap className="text-white relative z-10" size={32} fill="white" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.8] uppercase">Food<br/><span className="text-orange-500">Rush</span></h2>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Enterprise Node</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                activeTab === item.id 
                ? 'text-white translate-x-2' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:translate-x-1'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="flex items-center gap-4 relative z-10">
                <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-orange-500'} transition-colors duration-300`}>
                  {item.icon}
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black relative z-10 ${
                  activeTab === item.id ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-orange-500 text-white animate-pulse'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800/50">
          <div className="bg-slate-100/50 dark:bg-slate-950/50 p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 group hover:border-orange-500/20 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-orange-500/10 transition-colors" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Authority</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trust Level</span>
                       <span className="text-xs font-black text-slate-900 dark:text-white">Lvl 4.2</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 leading-tight uppercase tracking-widest">Protocol 8.2 &bull; Active Node</p>
                </div>
            </div>
          </div>
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto relative z-10 scrollbar-hide">
        <div className="max-w-6xl mx-auto px-12 py-12">
          <header className="flex justify-between items-center mb-16">
            <div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mb-4 uppercase">
                {activeTab === 'dashboard' ? 'Operational Hub' : activeTab === 'settings' ? 'Command Terminal' : activeTab}
              </h1>
              <div className="flex items-center gap-4 bg-white/30 dark:bg-slate-900/30 px-6 py-3 rounded-2xl border border-white dark:border-slate-800/50 backdrop-blur-xl">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500">Live Grid</span>
                </div>
                <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Node: {restaurantId.toUpperCase()} &bull; {user.restaurantName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 relative">
              
              {/* Notification Toggle Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications');
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-lg group transition-all duration-300 z-30 ${activeDropdown === 'notifications' ? 'bg-orange-500 text-white scale-110' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}
              >
                <BellRing size={24} className={activeDropdown === 'notifications' ? 'text-white' : 'text-slate-400 group-hover:text-orange-500'} />
                {activeOrders.length > 0 && (
                  <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 text-[9px] font-black flex items-center justify-center transition-colors ${activeDropdown === 'notifications' ? 'bg-white text-orange-500 border-orange-500' : 'bg-red-500 text-white border-slate-50 dark:border-[#020617]'}`}>
                    {activeOrders.length}
                  </span>
                )}
              </button>

              {/* Account Toggle Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'profile' ? null : 'profile');
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 z-30 ${activeDropdown === 'profile' ? 'bg-orange-500 text-white scale-110' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}
              >
                <User size={24} className={activeDropdown === 'profile' ? 'text-white' : 'text-slate-400'} />
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {activeDropdown === 'notifications' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="absolute top-20 right-20 w-96 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 z-[999] backdrop-blur-3xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Neural Pulse Center</h3>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                       {activeOrders.length > 0 ? activeOrders.map((order, i) => (
                         <div key={i} className="bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-transparent hover:border-orange-500/20 transition-all group cursor-default">
                            <div className="flex items-center gap-4 mb-3">
                               <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                  <Package size={20} />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incoming Signal</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-white leading-none mt-1">#{order.id.split('-')[0].toUpperCase()}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">Active request detected from node: {order.customer_id.slice(0,8).toUpperCase()}</p>
                         </div>
                       )) : (
                         <div className="text-center py-12">
                            <BellRing size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-6 opacity-20" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Neural silence detected</p>
                         </div>
                       )}
                    </div>
                    <button 
                      onClick={() => setActiveDropdown(null)}
                      className="w-full mt-8 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                    >
                      Clear All Signals
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {activeDropdown === 'profile' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="absolute top-20 right-0 w-80 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-10 z-[999] backdrop-blur-3xl"
                  >
                    <div className="text-center mb-10">
                       <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-orange-500 to-red-600 mx-auto mb-6 flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 border-4 border-white dark:border-slate-800 relative group overflow-hidden">
                          <User size={48} />
                          <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{user.name}</h3>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Protocol: {user.role.toUpperCase()}</p>
                    </div>

                    <div className="space-y-4 mb-10">
                       {[
                         { label: 'Network Node', value: user.restaurantName, icon: <Store size={14}/> },
                         { label: 'Security Level', value: 'Level 4.2', icon: <ShieldCheck size={14}/> },
                         { label: 'Email Protocol', value: user.email || 'N/A', icon: <Mail size={14}/> },
                         { label: 'Comm Link', value: user.phone || 'N/A', icon: <Phone size={14}/> },
                         { label: 'GST ID', value: user.gstNumber || 'N/A', icon: <ShieldCheck size={14}/> },
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                               <span className="text-orange-500">{item.icon}</span>
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white truncate max-w-[120px]">{item.value}</span>
                         </div>
                       ))}
                       <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-orange-500"><MapPin size={14}/></span>
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Deployment Coordinates</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">{user.restaurantAddress || 'No address provided'}</p>
                       </div>
                    </div>

                    <button 
                      onClick={() => window.location.href = '/'}
                      className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut size={16} /> Terminate Protocol
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
