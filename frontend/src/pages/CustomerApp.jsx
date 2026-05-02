import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import useGPS from '../hooks/useGPS';
import RestaurantList from '../components/RestaurantList';
import MenuModal from '../components/MenuModal';
import Cart from '../components/Cart';
import TrackingMap from '../components/TrackingMap';
import StatusPipeline from '../components/StatusPipeline';
import ETATimer from '../components/ETATimer';
import confetti from 'canvas-confetti';
import { LogOut, User, Navigation, Search, Bell, MapPin, Heart, ShoppingBag, Utensils, Mail, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerApp({ user, darkMode }) {
  const { messages, sendMessage } = useWebSocket('customer', user.user_id);
  const { location: customerLocation } = useGPS();
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  
  const [activeOrder, setActiveOrder] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [orderStartTime, setOrderStartTime] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/restaurants')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      if (lastMsg.order_id === activeOrder?.id) {
        if (['Confirmed', 'Rejected', 'Preparing', 'Ready for Pickup'].includes(lastMsg.status)) {
          setActiveOrder(prev => ({ ...prev, status: lastMsg.status }));
        }
        
        if (lastMsg.type === 'order_picked_up') {
          setActiveOrder(prev => ({ ...prev, status: 'Picked Up' }));
        }
        
        if (lastMsg.type === 'location_broadcast') {
          setPartnerLocation({ lat: lastMsg.lat, lng: lastMsg.lng });
          if (activeOrder.status === 'Picked Up') {
             setActiveOrder(prev => ({ ...prev, status: 'On the Way' }));
          }
        }
        
        if (lastMsg.type === 'order_delivered') {
          setActiveOrder(prev => ({ ...prev, status: 'Delivered' }));
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B00', '#ffffff', '#4ade80']
          });
        }
      }
    }
  }, [messages, activeOrder]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.item_id === item.id);
      if (existing) {
        return prev.map(c => c.item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(c => c.item_id === itemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map(c => c.item_id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.item_id !== itemId);
    });
  };

  const handleCheckout = async () => {
    if (!selectedRestaurant || cart.length === 0) return;
    
    const totalAmount = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) + selectedRestaurant.delivery_fee;
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.user_id,
          restaurant_id: selectedRestaurant.id,
          items: cart,
          total_amount: totalAmount,
          customer_lat: customerLocation.lat || 12.9716,
          customer_lng: customerLocation.lng || 77.5946
        })
      });
      const data = await res.json();
      
      setActiveOrder({
        id: data.order_id,
        restaurant_id: selectedRestaurant.id,
        status: 'Placed',
        restaurant: selectedRestaurant
      });
      setOrderStartTime(new Date().toISOString());
      setSelectedRestaurant(null);
      setCart([]);
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  };

  const handleLogout = () => {
    window.location.href = '/';
  };

  if (activeOrder) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] selection:bg-orange-500/30 transition-colors duration-700">
        <div className={`fixed inset-0 ${darkMode ? 'bg-mesh opacity-20' : 'light-mesh opacity-60'} pointer-events-none transition-opacity duration-1000`} />
        <div className="max-w-5xl mx-auto p-8 relative z-10">
          <header className="flex justify-between items-center mb-12 pt-4">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-500/5">
                <ShoppingBag className="text-orange-500" size={28} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Track Journey</h1>
            </div>
            <div className="flex items-center gap-6">
               
               {activeOrder.status === 'Delivered' && (
                 <motion.button 
                   whileHover={{ scale: 1.05, y: -2 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setActiveOrder(null)}
                   className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20"
                 >
                   Order Again
                 </motion.button>
               )}
            </div>
          </header>

          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 dark:bg-orange-500/10 blur-[100px] rounded-full -mr-24 -mt-24" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 dark:bg-slate-800 flex items-center justify-center border border-slate-800/50 shadow-2xl">
                    <Utensils size={36} className="text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">{activeOrder.restaurant?.name || 'Restaurant'}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Protocol ID</span>
                      <span className="font-mono text-sm font-bold text-orange-500">#{activeOrder.id.split('-')[0].toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                {activeOrder.status !== 'Delivered' && activeOrder.status !== 'Rejected' && (
                  <ETATimer etaMinutes={activeOrder.restaurant?.eta || 30} startTime={orderStartTime} />
                )}
              </div>

              <StatusPipeline status={activeOrder.status} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-[4rem] overflow-hidden border border-white dark:border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] h-[550px]"
            >
              <TrackingMap 
                customerLocation={customerLocation.lat ? [customerLocation.lat, customerLocation.lng] : [12.9716, 77.5946]}
                restaurantLocation={activeOrder.restaurant ? [activeOrder.restaurant.lat, activeOrder.restaurant.lng] : null}
                partnerLocation={partnerLocation ? [partnerLocation.lat, partnerLocation.lng] : null}
              />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] selection:bg-orange-500/30 overflow-x-hidden transition-colors duration-700">
      <div className={`fixed inset-0 ${darkMode ? 'bg-mesh opacity-20' : 'light-mesh opacity-60'} pointer-events-none transition-opacity duration-1000`} />

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=80" 
            className="w-full h-full object-cover grayscale-[0.1] dark:grayscale-[0.5] opacity-30 dark:opacity-20 transition-all duration-1000"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/70 to-slate-50 dark:from-[#020617] dark:via-[#020617]/70 dark:to-[#020617]" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.h2 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[0.9]"
          >
            THE SUPREME <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">NETWORK</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
          >
            <div className="relative w-full max-w-xl group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={24} />
              <input 
                type="text"
                placeholder="Search for restaurants, cuisines..."
                className="w-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white dark:border-slate-800 rounded-[2rem] pl-20 pr-8 py-6 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-lg shadow-xl"
              />
            </div>
            <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/10 dark:shadow-white/5">
              Explore
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 bg-white/50 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-slate-800/50 p-8 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-10">
            <div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3">Food<span className="text-orange-500">Rush</span></h1>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <MapPin size={16} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Coordinates Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-8 border-r border-slate-200 dark:border-slate-800 pr-10">
              
              <div className="flex items-center gap-5 relative">
                <div className="flex flex-col items-end">
                  <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] leading-none mt-1.5">Alpha Protocol</span>
                </div>
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className={`w-14 h-14 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center overflow-hidden group hover:scale-110 transition-all cursor-pointer shadow-lg shadow-black/5 ${showProfile ? 'ring-2 ring-orange-500' : ''}`}
                >
                  <User size={28} className={`${showProfile ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'} transition-colors`} />
                </button>

                <AnimatePresence>
                  {showProfile && (
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
                           { label: 'Security Level', value: 'Alpha Node', icon: <ShieldCheck size={14}/> },
                           { label: 'Email Protocol', value: user.email || 'N/A', icon: <Mail size={14}/> },
                           { label: 'Comm Link', value: user.phone || 'N/A', icon: <Phone size={14}/> },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-2xl">
                              <div className="flex items-center gap-3">
                                 <span className="text-orange-500">{item.icon}</span>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                              </div>
                              <span className="text-[10px] font-black text-slate-900 dark:text-white truncate max-w-[120px]">{item.value}</span>
                           </div>
                         ))}
                      </div>

                      <button 
                        onClick={handleLogout}
                        className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                      >
                        <LogOut size={16} /> Terminate Protocol
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <button onClick={handleLogout} className="p-5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-[1.5rem] border border-red-500/10 transition-all transform active:scale-95 group">
              <LogOut size={26} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </header>

        {/* Restaurants Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center gap-6">
              <div className="w-2.5 h-12 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
              <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Peak Recommendations</h2>
            </div>
            <div className="flex gap-4">
              <button className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 transition-colors shadow-xl">
                <Heart size={24} className="text-slate-400" />
              </button>
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-800 dark:border-transparent px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">View Hierarchy</button>
            </div>
          </div>

          <RestaurantList 
            restaurants={restaurants} 
            loading={loading} 
            onSelect={(r) => setSelectedRestaurant(r)} 
          />
        </div>

        <AnimatePresence>
          {selectedRestaurant && (
            <MenuModal 
              restaurant={selectedRestaurant} 
              onClose={() => setSelectedRestaurant(null)}
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
            />
          )}
        </AnimatePresence>

        <Cart 
          cart={cart} 
          restaurant={selectedRestaurant} 
          onCheckout={handleCheckout} 
        />
      </div>
    </div>
  );
}

