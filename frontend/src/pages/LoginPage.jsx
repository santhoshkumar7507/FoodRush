import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, ShoppingBag, Store, Bike, ArrowRight, User, Mail, Phone, ChevronLeft, Building, MapPin, FileText, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  {
    id: 'customer',
    title: 'Customer',
    description: 'Order from the best local restaurants delivered to your doorstep.',
    icon: <ShoppingBag size={32} />,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
    color: 'from-orange-500 to-red-600',
    accent: '#FF6B00'
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Join our platform and reach more customers than ever before.',
    icon: <Store size={32} />,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
    color: 'from-indigo-500 to-purple-600',
    accent: '#6366F1'
  },
  {
    id: 'partner',
    title: 'Delivery Partner',
    description: 'Flexible hours, competitive pay. Start delivering today.',
    icon: <Bike size={32} />,
    image: 'https://images.unsplash.com/photo-1526367764999-575da8f113cc?auto=format&fit=crop&w=1000&q=80',
    color: 'from-emerald-500 to-teal-600',
    accent: '#10B981'
  }
];

export default function LoginPage({ setUser, darkMode }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState('role'); // role, details
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    restaurantAddress: '',
    gstNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill all fields');
        return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: formData.name, 
            role: selectedRole.id,
            email: formData.email,
            phone: formData.phone,
            restaurantName: formData.restaurantName,
            restaurantAddress: formData.restaurantAddress,
            gstNumber: formData.gstNumber
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      setUser(data);
      setTimeout(() => {
        navigate(`/${selectedRole.id}`);
      }, 500);
    } catch (err) {
      setError(err.message || 'Connection to server failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white relative overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-orange-500/30 transition-colors duration-700">
      {/* Background Mesh */}
      <div className={`fixed inset-0 bg-mesh opacity-20 pointer-events-none transition-opacity duration-1000`} />
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/5 rounded-full premium-blur animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 dark:bg-orange-600/5 rounded-full premium-blur animate-pulse delay-700" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16 z-20"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div 
            whileHover={{ rotate: 0, scale: 1.1 }}
            className="bg-gradient-to-tr from-orange-500 to-red-600 p-5 rounded-[2.5rem] shadow-2xl shadow-orange-500/30 mr-8 transform -rotate-12 transition-transform duration-500"
          >
            <Utensils size={48} className="text-white" />
          </motion.div>
          <h1 className="text-8xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">
            Food<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Rush</span>
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-black tracking-[0.4em] uppercase text-[10px] ml-4">Premium Culinary Network</p>
      </motion.div>

      <div className="w-full max-w-6xl z-20">
        <AnimatePresence mode="wait">
          {step === 'role' ? (
            <motion.div
              key="role-selection"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  variants={itemVariants}
                  whileHover={{ y: -20, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedRole(role);
                    setStep('details');
                  }}
                  className="group relative cursor-pointer h-[520px] rounded-[4rem] overflow-hidden bg-white/40 dark:bg-slate-900/40 border border-white dark:border-slate-800/50 hover:border-orange-500/50 transition-all duration-700 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                    <img src={role.image} alt={role.title} className="w-full h-full object-cover opacity-50 dark:opacity-40 group-hover:opacity-70 dark:group-hover:opacity-60 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/40 dark:via-slate-950/40 to-transparent" />
                  </div>
                  
                  {/* Card Content */}
                  <div className="absolute inset-0 p-14 flex flex-col justify-end">
                    <div className={`w-24 h-24 rounded-[2.8rem] bg-gradient-to-br ${role.color} flex items-center justify-center mb-10 shadow-2xl shadow-orange-500/20 transform group-hover:rotate-12 transition-transform duration-500`}>
                      <div className="text-white">
                        {React.cloneElement(role.icon, { size: 36 })}
                      </div>
                    </div>
                    <h3 className="text-5xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white">{role.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-base mb-12 leading-relaxed font-medium">
                      {role.description}
                    </p>
                    <div className="flex items-center text-orange-600 dark:text-orange-500 font-black tracking-[0.25em] uppercase text-xs group-hover:gap-6 transition-all duration-500">
                      <span>Explore</span>
                      <ArrowRight size={24} className="transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-500/5 to-transparent transition-opacity pointer-events-none`} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="flex justify-center"
            >
              <div className="w-full max-w-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl border border-white dark:border-slate-800/50 p-16 rounded-[4.5rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.15)] dark:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] relative overflow-hidden">
                {/* Decoration */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${selectedRole.color} opacity-10 dark:opacity-20 blur-[100px]`} />
                
                {/* Back Button */}
                <button 
                  onClick={() => {
                    setStep('role');
                    setError('');
                  }}
                  className="absolute top-12 left-12 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] group"
                >
                  <div className="w-12 h-12 rounded-[1.2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all duration-300">
                    <ChevronLeft size={20} />
                  </div>
                  <span>Return</span>
                </button>

                <div className="text-center mb-14 mt-6">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className={`inline-flex w-28 h-28 rounded-[3rem] bg-gradient-to-br ${selectedRole.color} items-center justify-center mb-10 shadow-2xl shadow-orange-500/20`}
                  >
                    <div className="text-white">
                      {React.cloneElement(selectedRole.icon, { size: 42 })}
                    </div>
                  </motion.div>
                  <h2 className="text-6xl font-black mb-4 tracking-tighter leading-none text-slate-900 dark:text-white">
                    {selectedRole.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                    {isLoginMode 
                      ? 'Secure Authentication' 
                      : 'Login To Your Account'
                    }
                  </p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10 p-6 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-500 dark:text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-5"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-8">
                  <div className="space-y-8">
                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-6 group-focus-within:text-orange-500 transition-colors">Username</label>
                      <div className="relative">
                        <User className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={24} />
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-20 pr-8 py-6 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 font-bold text-base shadow-sm"
                          placeholder="Alexander Pierce"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-6 group-focus-within:text-orange-500 transition-colors">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={24} />
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-20 pr-8 py-6 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 font-bold text-base shadow-sm"
                          placeholder="alex@nexus.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-6 group-focus-within:text-orange-500 transition-colors">Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={24} />
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-20 pr-8 py-6 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 font-bold text-base shadow-sm"
                          placeholder="+1 (555) 000-0000"
                          required
                        />
                      </div>
                    </div>

                    {!isLoginMode && selectedRole.id === 'restaurant' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-8 overflow-hidden"
                      >
                        <div className="group">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-6 group-focus-within:text-orange-500 transition-colors">Restaurant Name</label>
                          <div className="relative">
                            <Building className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={24} />
                            <input 
                              type="text" 
                              value={formData.restaurantName}
                              onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                              className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-20 pr-8 py-6 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 font-bold text-base shadow-sm"
                              placeholder="The Culinary Hub"
                              required
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-6 group-focus-within:text-orange-500 transition-colors">Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={24} />
                            <input 
                              type="text" 
                              value={formData.restaurantAddress}
                              onChange={(e) => setFormData({...formData, restaurantAddress: e.target.value})}
                              className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-20 pr-8 py-6 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 font-bold text-base shadow-sm"
                              placeholder="Sector 7, Manhattan"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading}
                    className={`w-full mt-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-orange-500/30 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-5 text-xl`}
                  >
                    {loading ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="uppercase tracking-[0.3em] text-sm">
                          {isLoginMode 
                            ? 'Authenticate' 
                            : 'Login'
                          }
                        </span>
                        <ArrowRight size={26} />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-12 text-center">
                  <button 
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 group mx-auto"
                  >
                    <span>
                      {isLoginMode 
                        ? "New User? Create Profile" 
                        : "Existing Member? Access Portal"}
                    </span>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </button>
                </div>

                {/* Secure Badge */}
                <div className="mt-12 flex items-center justify-center gap-3 text-slate-300 dark:text-slate-800">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Quantum Encrypted Security</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-20 text-slate-400 dark:text-slate-700 text-[10px] font-black uppercase tracking-[0.6em] text-center"
      >
        &copy; 2026 FoodRush &bull; Neural Core v4.2
      </motion.p>
    </div>
  );
}

