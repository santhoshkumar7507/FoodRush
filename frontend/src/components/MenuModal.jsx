import React from 'react';
import { X, Plus, Minus, ShoppingBag, Leaf, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MenuModal({ restaurant, onClose, cart, addToCart, removeFromCart }) {
  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center items-end sm:items-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white dark:bg-slate-900 w-full sm:w-[600px] h-[90vh] sm:h-[85vh] sm:rounded-[3rem] flex flex-col border border-slate-200 dark:border-slate-800/50 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.4)] dark:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden relative"
      >
        {/* Top Decorative Image */}
        <div className="h-40 w-full relative shrink-0">
          <img src={restaurant.image} className="w-full h-full object-cover opacity-50 dark:opacity-30" alt={restaurant.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-3 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl text-slate-900 dark:text-white transition-all border border-black/5 dark:border-white/10 shadow-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Header Info */}
        <div className="px-8 pb-6 -mt-12 relative z-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{restaurant.name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{restaurant.cuisine}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{restaurant.eta}m Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-8 py-4 flex gap-4 overflow-x-auto no-scrollbar border-y border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          {['Recommended', 'Main Course', 'Appetizers', 'Beverages'].map((cat, i) => (
            <button key={cat} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {restaurant.menu.map(item => {
            const cartItem = cart.find(c => c.item_id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <motion.div 
                key={item.id} 
                layout
                className="flex gap-6 items-center group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-md border-2 ${item.veg ? 'border-emerald-500/50' : 'border-red-500/50'} flex items-center justify-center`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                    {item.rating > 4.5 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame size={12} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Best Seller</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1 group-hover:text-orange-500 transition-colors">{item.name}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 max-w-sm">Premium quality ingredients prepared with the finest traditional recipes.</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">₹{item.price}</p>
                </div>
                
                <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden flex-shrink-0 shadow-2xl border border-slate-100 dark:border-slate-800/50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                    {quantity === 0 ? (
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="w-full py-2.5 bg-white dark:bg-white text-slate-900 text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all border border-slate-200 dark:border-transparent"
                        onClick={() => addToCart(item)}
                      >
                        ADD
                      </motion.button>
                    ) : (
                      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-white transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-black text-white">{quantity}</span>
                        <button onClick={() => addToCart(item)} className="text-orange-500 hover:text-orange-400 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
