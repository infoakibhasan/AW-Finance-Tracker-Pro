
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../store/FinanceContext';
import { TransactionType, Currency } from '../types';

const Transfers: React.FC = () => {
  const navigate = useNavigate();
  const { funds, addTransaction } = useFinance();

  const [sourceFundId, setSourceFundId] = useState(funds[0].id);
  const [targetFundId, setTargetFundId] = useState(funds[1]?.id || funds[0].id);
  const [amount, setAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState<Currency>(funds[0].supportedCurrencies[0]);
  const [targetCurrency, setTargetCurrency] = useState<Currency>(funds[1]?.supportedCurrencies[0] || funds[0].supportedCurrencies[0]);

  const sourceFund = useMemo(() => funds.find(f => f.id === sourceFundId), [funds, sourceFundId]);
  const targetFund = useMemo(() => funds.find(f => f.id === targetFundId), [funds, targetFundId]);

  const handleTransfer = () => {
    const srcAmt = parseFloat(amount);
    const trgAmt = parseFloat(targetAmount);

    if (!amount || srcAmt <= 0) return alert('Enter sending amount');
    if (!targetAmount || trgAmt <= 0) return alert('Enter receiving amount');
    if (sourceFundId === targetFundId && sourceCurrency === targetCurrency) return alert('Source and target must be different');

    addTransaction({
      type: TransactionType.TRANSFER,
      amount: srcAmt,
      currency: sourceCurrency,
      categoryId: 'transfer',
      sourceFundId,
      targetFundId,
      targetCurrency,
      exchangeRate: trgAmt / srcAmt,
      date: new Date().toISOString().split('T')[0],
      note: `Transfer to ${targetFund?.name} (${targetCurrency})`,
    });
    
    navigate('/');
  };

  return (
    <div className="px-6 py-6 space-y-8 max-w-md mx-auto pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Transfer Funds</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Move money between accounts</p>
      </div>

      <div className="space-y-4">
        {/* From Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Account</span>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100 shadow-sm">
              <i className="fas fa-arrow-up text-xs"></i>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select 
              value={sourceFundId}
              onChange={(e) => {
                setSourceFundId(e.target.value);
                const f = funds.find(fund => fund.id === e.target.value);
                if (f) setSourceCurrency(f.supportedCurrencies[0]);
              }}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
            >
              {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select 
              value={sourceCurrency}
              onChange={(e) => setSourceCurrency(e.target.value as Currency)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
            >
              {sourceFund?.supportedCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Send</label>
            {/* Update 2: Lightened input styling - removed text-3xl font-black */}
            <input 
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-2xl font-semibold text-slate-600 outline-none placeholder:text-slate-200 bg-transparent border-b-2 border-slate-50 focus:border-indigo-100 transition-all py-1"
            />
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center -my-6 relative z-10">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
            <i className="fas fa-repeat text-indigo-500"></i>
          </div>
        </div>

        {/* To Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Account</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100 shadow-sm">
              <i className="fas fa-arrow-down text-xs"></i>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select 
              value={targetFundId}
              onChange={(e) => {
                setTargetFundId(e.target.value);
                const f = funds.find(fund => fund.id === e.target.value);
                if (f) setTargetCurrency(f.supportedCurrencies[0]);
              }}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
            >
              {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select 
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value as Currency)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
            >
              {targetFund?.supportedCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Receive</label>
            {/* Update 2: Lightened input styling - removed font-black and made color more subtle */}
            <input 
              type="number"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full text-2xl font-semibold text-emerald-500 outline-none placeholder:text-slate-200 bg-transparent border-b-2 border-slate-50 focus:border-emerald-100 transition-all py-1"
            />
          </div>
        </div>

        <button 
          onClick={handleTransfer}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-4 border border-slate-800"
        >
          Confirm Transfer
        </button>
      </div>
    </div>
  );
};

export default Transfers;
