import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import useGPS from '../hooks/useGPS';
import OrderCard from '../components/OrderCard';
import { LogOut, Bike, Map, CheckCircle2, User, Wallet, Star, Navigation, Power, Bell, MapPin, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

export default function PartnerApp({ user, darkMode }) {
  const { messages, sendMessage } = useWebSocket('partner', user.user_id);
  const { location, error } = useGPS();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    earnings: "₹1,240.50",
    rating: "4.8",
    trips: "12"
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orders/partner/available`)
      .then(res => res.json())
      .then(data => setAvailableOrders(data))
      .catch(err => console.error("Error fetching available orders:", err));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      if (lastMsg.type === 'new_available_order') {
        if (!activeOrder && isOnline) {
          setAvailableOrders(prev => {
            if (!prev.find(o => o.id === lastMsg.order.id)) {
              return [...prev, lastMsg.order];
            }
            return prev;
          });
        }
      }
    }
  }, [messages, activeOrder, isOnline]);

  // GPS streaming
  useEffect(() => {
    if (activeOrder && location.lat && isOnline) {
      const interval = setInterval(() => {
        let currentLat = location.lat;
        let currentLng = location.lng;
        
        // Add tiny random jitter to simulate movement
        currentLat += (Math.random() - 0.5) * 0.0005;
        currentLng += (Math.random() - 0.5) * 0.0005;
        
        sendMessage({
          type: 'location_update',
          lat: currentLat,
          lng: currentLng,
          order_id: activeOrder.id
        });
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [activeOrder, location, sendMessage, isOnline]);

  const acceptOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/partners/${user.user_id}/accept/${orderId}`, {
        method: 'POST'
      });
      if (res.ok) {
        const order = availableOrders.find(o => o.id === orderId);
        setActiveOrder({ ...order, status: 'Picked Up' });
        setAvailableOrders([]);
      }
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  };

  const markDelivered = () => {
    sendMessage({
      type: 'order_delivered',
      order_id: activeOrder.id
    });
    setActiveOrder(null);
    fetch(`${API_BASE_URL}/api/orders/partner/available`)
      .then(res => res.json())
      .then(data => setAvailableOrders(data));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-body selection:bg-orange-500/30 transition-colors duration-700">
      {/* Background Mesh */}
      <div className={`fixed inset-0 bg-mesh opacity-20 pointer-events-none transition-opacity duration-1000`} />
      
      <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 bg-white/50 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-slate-800/50 p-8 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 0, scale: 1.1 }}
              className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/20 transform -rotate-12 transition-all duration-500"
            >
              <Bike size={32} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-2 text-slate-900 dark:text-white">Food<span className="text-orange-500">Rush</span></h1>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">Partner Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 border-r border-slate-200 dark:border-slate-800 pr-10">
              
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-end">
                  <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] leading-none mt-1.5">Sector Agent</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-lg shadow-black/5 cursor-pointer hover:scale-110 transition-all">
                  <User size={28} className="text-slate-400" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border-2 shadow-lg ${
                isOnline 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-500' 
                  : 'bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-500'
              }`}
            >
              <Power size={18} className={isOnline ? 'animate-pulse' : ''} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">{isOnline ? 'Online' : 'Offline'}</span>
            </button>

            <button onClick={() => window.location.href = '/'} className="p-5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-[1.5rem] border border-red-500/10 transition-all transform active:scale-95 group">
              <LogOut size={26} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Cumulative Yield', value: stats.earnings, icon: <Wallet size={24} />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Agent Reputation', value: stats.rating, icon: <Star size={24} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { label: 'Total Operations', value: stats.trips, icon: <Navigation size={24} />, color: 'text-blue-500', bg: 'bg-blue-500/10' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-slate-800/50 p-8 rounded-[3.5rem] flex items-center gap-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-none transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg shadow-black/5`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeOrder ? (
                <motion.div 
                  key="active-delivery"
                  initial={{ opacity: 0, scale: 0.95, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -40 }}
                  className="space-y-8"
                >
                  <div className="bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 p-8 rounded-[3.5rem] flex items-center justify-between backdrop-blur-xl shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[2rem] bg-orange-500 flex items-center justify-center animate-pulse shadow-2xl shadow-orange-500/40">
                        <Navigation size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-orange-600 dark:text-orange-500 uppercase tracking-tighter">Mission Active</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Broadcasting telemetry to client node</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Protocol ID</p>
                      <p className="font-mono text-base font-bold text-slate-900 dark:text-white">#{activeOrder.id.slice(0,12).toUpperCase()}</p>
                    </div>
                  </div>

                  <OrderCard 
                    order={activeOrder} 
                    role="partner"
                    actions={
                      <button 
                        onClick={markDelivered}
                        className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-7 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-emerald-500/30 transform hover:y-[-4px] active:scale-[0.98]"
                      >
                        <CheckCircle2 size={32} /> 
                        <span className="uppercase tracking-[0.2em]">Terminate Operation</span>
                      </button>
                    }
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="available-jobs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-10 bg-orange-500 rounded-full" />
                      <h2 className="text-4xl font-black tracking-tighter">Available Vectors</h2>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-2 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-white dark:border-slate-800/50 shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">Network Scan Active</span>
                    </div>
                  </div>

                  {!isOnline ? (
                    <div className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-slate-800/50 p-24 rounded-[4rem] text-center shadow-xl backdrop-blur-3xl">
                      <div className="w-28 h-28 rounded-[3rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-10 shadow-inner">
                        <Power size={56} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">Offline Protocol</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto font-medium">Re-establish network connectivity to begin receiving operational requests.</p>
                      <button 
                        onClick={() => setIsOnline(true)}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl shadow-orange-500/20"
                      >
                        Restore Network
                      </button>
                    </div>
                  ) : availableOrders.length === 0 ? (
                    <div className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-slate-800/50 p-24 rounded-[4rem] text-center relative overflow-hidden group shadow-xl backdrop-blur-3xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative z-10">
                        <div className="w-32 h-32 rounded-[3.5rem] bg-white dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-10 border border-slate-100 dark:border-slate-700/50 shadow-lg group-hover:scale-110 transition-transform duration-700">
                          <Bell size={64} className="text-slate-200 dark:text-slate-700" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tighter leading-none uppercase">Awaiting Data...</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-base font-medium">New logistics requests from local nodes will be synchronized automatically.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                      {availableOrders.map((order, i) => (
                        <motion.div 
                          key={order.id}
                          initial={{ opacity: 0, x: -40 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, type: "spring", damping: 15 }}
                        >
                          <OrderCard 
                            order={order} 
                            role="partner"
                            actions={
                              <button 
                                onClick={() => acceptOrder(order.id)}
                                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-6 rounded-[1.5rem] font-black flex items-center justify-center gap-4 transition-all group shadow-xl shadow-orange-500/20"
                              >
                                <span className="uppercase tracking-[0.3em] text-sm">Initiate Job</span>
                                <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                              </button>
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Map Placeholder */}
            <div className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-slate-800/50 rounded-[3.5rem] overflow-hidden h-[450px] relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none backdrop-blur-2xl group">
              <div className="absolute inset-0 bg-slate-100/10 dark:bg-slate-950/20 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                    <MapPin size={40} className="text-orange-500" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter text-xl">Sector Visualization</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em] max-w-[240px] mx-auto leading-relaxed">
                    Tactical grid active with real-time GPS synchronization
                  </p>
                </div>
              </div>
              {/* Simulated Map Background */}
              <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/80.2,13.0,12/800x800?access_token=YOUR_MAPBOX_TOKEN_HERE')] bg-cover bg-center grayscale dark:grayscale-0 opacity-40 dark:opacity-20 group-hover:scale-110 transition-transform duration-[10s] linear" />
            </div>

            {/* Performance Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[3.5rem] p-10 shadow-2xl shadow-blue-500/30 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-2xl font-black text-white mb-8 relative z-10 tracking-tight">Peak Operations</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-black text-white/70 uppercase tracking-[0.2em]">Vector Efficiency</span>
                  <span className="text-xl font-black text-white leading-none">8 / 15</span>
                </div>
                <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '53%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                  />
                </div>
                <p className="text-xs font-bold text-white/50 pt-4 leading-relaxed italic border-t border-white/10 mt-4">
                  Target threshold: 7 additional vectors required before 22:00 for ₹500 efficiency credit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

