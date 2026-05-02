import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function ETATimer({ etaMinutes, startTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!startTime || !etaMinutes) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const targetTime = start + (etaMinutes * 60 * 1000);
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft('Arriving now');
        clearInterval(interval);
      } else {
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [etaMinutes, startTime]);

  return (
    <div className="flex items-center text-[#FF6B00] font-bold bg-[#FF6B00]/10 px-3 py-1.5 rounded-lg border border-[#FF6B00]/30">
      <Timer size={16} className="mr-2 animate-pulse" />
      <span>{timeLeft || `${etaMinutes} mins`}</span>
    </div>
  );
}
