
import React from 'react';
import { Currency } from '../types';

interface FundBalance {
  amount: number;
  currency: Currency;
}

interface FundCardProps {
  name: string;
  balances: FundBalance[];
  color: string;
  isPrivate: boolean;
}

const FundCard: React.FC<FundCardProps> = ({ name, balances, color, isPrivate }) => {
  return (
    <div className={`${color} min-w-[120px] p-3 rounded-lg shadow-sm flex flex-col justify-between text-white overflow-hidden relative transition-all active:scale-95 border border-white/10`}>
      <div className="absolute -top-1 -right-1 opacity-10 text-2xl">
        <i className="fas fa-vault"></i>
      </div>
      
      <div className="relative z-10">
        <p className="text-[7px] font-black opacity-70 uppercase tracking-wider mb-1 truncate">{name}</p>
        <div className="space-y-0.5">
          {balances.length > 0 ? (
            balances.map((b) => (
              <div key={b.currency} className="flex items-baseline gap-1">
                <span className="text-sm font-black tracking-tighter leading-none">
                  {isPrivate ? '••••' : b.amount.toLocaleString()}
                </span>
                <span className="text-[7px] font-bold opacity-60 uppercase">{b.currency}</span>
              </div>
            ))
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black leading-none">{isPrivate ? '••••' : '0'}</span>
              <span className="text-[7px] font-bold opacity-60 uppercase">Empty</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundCard;
