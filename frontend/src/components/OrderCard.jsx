import React from 'react';
import { MapPin, Package, Clock, CreditCard, ChevronRight } from 'lucide-react';

export default function OrderCard({ order, actions = null, role }) {
  if (!order) return null;

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20';
      case 'Confirmed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20';
      case 'Picked Up': return 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20';
      case 'On the Way': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default: return 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20';
    }
  };

  return (
    <div className="bg-white/50 dark:bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white dark:border-slate-800/50 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:shadow-none relative overflow-hidden group transition-all duration-500 hover:border-orange-500/40 hover:shadow-[0_32px_64px_-16px_rgba(255,107,0,0.1)]">
      {/* Status Badge */}
      <div className="absolute top-8 right-8">
        <span className={`text-[10px] font-black px-4 py-2 rounded-xl border-2 uppercase tracking-[0.2em] shadow-sm ${getStatusStyles(order.status)}`}>
          {order.status}
        </span>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 flex items-center justify-center border border-orange-500/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Package size={28} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter leading-none mb-2">Order #{order.id.split('-')[0].toUpperCase()}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em]">
              {role === 'customer' ? `Terminal ID: ${order.restaurant_id.slice(0,8).toUpperCase()}` : `Protocol Target: ${order.customer_id.slice(0,8).toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4 mb-8 bg-slate-100/50 dark:bg-black/20 p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
        {order.items && order.items.map((item, idx) => (
          <div key={item.item_id || idx} className="flex justify-between items-center text-sm group/item">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm group-hover/item:border-orange-500/30 transition-colors">{item.quantity}x</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold tracking-tight">{item.name}</span>
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-black tracking-widest">₹{(item.price || 0) * (item.quantity || 1)}</span>
          </div>
        ))}
        
        <div className="pt-5 mt-5 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-400">
            <CreditCard size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Settlement</span>
          </div>
          <span className="text-slate-900 dark:text-white font-black text-3xl tracking-tighter leading-none">₹{order.total_amount}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-slate-400 mb-8 px-2">
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-orange-500/50" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">T + 2 MINS</span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin size={16} className="text-indigo-500/50" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">2.4 KM RADIUS</span>
        </div>
      </div>

      {actions && (
        <div className="relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-2">
          {actions}
        </div>
      )}

      {/* Decoration */}
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-orange-500/10 transition-all duration-700" />
    </div>
  );
}

