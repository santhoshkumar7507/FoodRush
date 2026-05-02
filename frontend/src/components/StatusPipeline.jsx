import React from 'react';
import { CheckCircle2, Clock, ChefHat, Bike, MapPin, Gift } from 'lucide-react';

const pipeline = [
  { id: 'Placed', label: 'Order Placed', icon: Clock },
  { id: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'Preparing', label: 'Preparing', icon: ChefHat },
  { id: 'Ready for Pickup', label: 'Ready', icon: Gift },
  { id: 'Picked Up', label: 'Picked Up', icon: Bike },
  { id: 'Delivered', label: 'Delivered', icon: MapPin },
];

export default function StatusPipeline({ status }) {
  const currentIndex = pipeline.findIndex(s => s.id === status);

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex items-center justify-between min-w-[700px] px-4">
        {pipeline.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              <div className="flex items-center justify-center relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border
                  ${isCompleted ? 'bg-orange-500 text-white border-orange-400 shadow-xl shadow-orange-500/20' : 
                    isCurrent ? 'bg-white dark:bg-orange-500 text-orange-500 dark:text-white border-orange-500 dark:border-orange-400 shadow-2xl scale-110 animate-pulse' : 
                    'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                  <Icon size={22} />
                </div>
              </div>
              
              <div className="text-[10px] font-black mt-4 whitespace-nowrap uppercase tracking-widest">
                <span className={isCurrent ? 'text-slate-900 dark:text-white' : isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {idx < pipeline.length - 1 && (
                <div className="absolute top-6 left-[50%] w-full h-[3px] -z-0 px-2">
                  <div className={`h-full rounded-full transition-all duration-1000 ${
                    idx < currentIndex ? 'bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-slate-200 dark:bg-slate-800'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
