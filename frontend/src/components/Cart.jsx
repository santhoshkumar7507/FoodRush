import React from 'react';
import { ShoppingBag, ChevronRight, CreditCard, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart({ cart, restaurant, onCheckout, loading }) {
  if (!cart || cart.length === 0 || !restaurant) return null;

  const itemTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const total = itemTotal + restaurant.delivery_fee;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-10 sm:bottom-10 z-50 w-full sm:w-[380px]"
    >
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-6 sm:rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow Decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <ShoppingBag className="text-orange-500" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Your Basket</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cart.length} Items Selected</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <Clock size={12} className="text-orange-500" />
            <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">{restaurant.eta}m</span>
          </div>
        </div>
        
        <div className="max-h-40 overflow-y-auto mb-6 space-y-3 custom-scrollbar pr-2 relative z-10">
          {cart.map(item => (
            <div key={item.item_id} className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">{item.quantity}x</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 mb-6 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">₹{itemTotal}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delivery Fee</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">₹{restaurant.delivery_fee}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-orange-500" />
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Total Amount</span>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{total}</span>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCheckout}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group relative z-10"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-sm uppercase tracking-[0.2em]">Confirm & Pay</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
