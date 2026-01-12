
import React from 'react';
import { Currency } from '../types';

interface BalanceCardProps {
  label: string;
  amount: number;
  currency: Currency;
  color: string;
  isPrivate: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ label, amount, currency, color, isPrivate }) => {
  const formatted = isPrivate 
    ? '***' 
    : new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);

  return (
    <div className={`${color} min-w-[260px] p-6 rounded-lg shadow-lg flex flex-col justify-between text-white overflow-hidden relative border border-white/10`}>
      <div className="absolute -top-4 -right-4 opacity-10 text-8xl">
        <i className={`fas ${currency === 'USD' ? 'fa-dollar-sign' : currency === 'EUR' ? 'fa-euro-sign' : 'fa-coins'}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">{label}</p>
        <h2 className="text-3xl font-black mt-1">
          {formatted} <span className="text-xl font-medium opacity-70">{currency}</span>
        </h2>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1 w-12 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white w-2/3"></div>
        </div>
        <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">Live Sync</span>
      </div>
    </div>
  );
};

export default BalanceCard;
