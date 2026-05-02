import React from 'react';
import { Clock, Star, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RestaurantList({ restaurants, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="bg-slate-100 dark:bg-slate-900/40 rounded-[2.5rem] overflow-hidden h-80 animate-pulse border border-slate-200 dark:border-slate-800/50">
            <div className="h-44 bg-slate-200 dark:bg-slate-800/50"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-800/50 rounded-xl w-2/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded-xl w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {restaurants.map((r, i) => (
        <motion.div 
          key={r.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(r)}
          className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] shadow-lg"
        >
          {/* Image Container */}
          <div className="h-56 w-full overflow-hidden relative">
            <img 
              src={r.image} 
              alt={r.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 dark:from-slate-950 via-transparent to-transparent opacity-60 dark:opacity-100" />
            
            {/* Top Badges */}
            <div className="absolute top-6 left-6 flex gap-2">
              {r.rating >= 4.5 && (
                <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-xl">
                  <Zap size={12} className="fill-current" />
                  Trending
                </div>
              )}
              <div className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-black/10">
                {r.cuisine}
              </div>
            </div>

            {/* Rating Badge Overlay */}
            <div className="absolute bottom-6 right-6 flex items-center bg-emerald-500 text-white px-3 py-1.5 rounded-2xl text-xs font-black shadow-xl shadow-emerald-500/20">
              <span>{r.rating}</span>
              <Star size={12} className="ml-1.5 fill-current" />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight mb-2 group-hover:text-orange-500 transition-colors">{r.name}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Premium Selection</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Clock size={16} className="text-orange-500" />
                  </div>
                  <span className="font-black text-sm text-slate-600 dark:text-slate-300">{r.eta}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp size={16} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <span className="font-black text-sm text-slate-600 dark:text-slate-300">₹{r.delivery_fee}</span>
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 transition-all transform group-hover:translate-x-1 border border-slate-200 dark:border-slate-700">
                <ChevronRight size={20} className="text-slate-400 group-hover:text-white" />
              </div>
            </div>
          </div>

          {/* Hover Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-500/5 to-transparent transition-opacity pointer-events-none" />
        </motion.div>
      ))}
    </div>
  );
}
