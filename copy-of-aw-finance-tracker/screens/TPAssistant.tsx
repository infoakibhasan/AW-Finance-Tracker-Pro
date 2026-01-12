
import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../store/FinanceContext';

type Channel = 'BANK' | 'BKASH';
type InputMode = 'BDT_TO_MVR' | 'MVR_TO_BDT';

const TPAssistant: React.FC = () => {
  const { privacyMode } = useFinance();

  // --- Configuration Rates (Persistent) ---
  const [bankRate1Lac, setBankRate1Lac] = useState<string>(() => localStorage.getItem('tp_bank_1lac') || '16320');
  const [bkashRate5k, setBkashRate5k] = useState<string>(() => localStorage.getItem('tp_bkash_5k') || '835');
  const [targetCurrency, setTargetCurrency] = useState<string>(() => localStorage.getItem('tp_target_curr') || 'BDT');

  // --- Calculation Inputs ---
  const [activeChannel, setActiveChannel] = useState<Channel>('BANK');
  const [inputAmount, setInputAmount] = useState<string>('5000');
  const [inputMode, setInputMode] = useState<InputMode>('BDT_TO_MVR');

  // Sync rates and currency to local storage
  useEffect(() => {
    localStorage.setItem('tp_bank_1lac', bankRate1Lac);
    localStorage.setItem('tp_bkash_5k', bkashRate5k);
    localStorage.setItem('tp_target_curr', targetCurrency);
  }, [bankRate1Lac, bkashRate5k, targetCurrency]);

  // --- Calculation Engine ---
  const calculation = useMemo(() => {
    const amt = parseFloat(inputAmount) || 0;
    const rateBank = parseFloat(bankRate1Lac) || 0;
    const rateBkash = parseFloat(bkashRate5k) || 0;
    const currentTargetCurrency = activeChannel === 'BANK' ? targetCurrency : 'BDT';

    let steps: { label: string, value: string }[] = [];
    let finalPayable = 0;
    let finalCurrency = '';

    if (inputMode === 'BDT_TO_MVR') {
      finalCurrency = 'MVR';
      const targetVal = amt; // Amount receiver should get (Net)
      steps.push({ label: `Target ${currentTargetCurrency} (Net)`, value: `${targetVal.toLocaleString()} ${currentTargetCurrency}` });

      if (activeChannel === 'BANK') {
        finalPayable = (targetVal / 100000) * rateBank;
        steps.push({ label: 'Bank Rate', value: `${rateBank} MVR / 1 Lac` });
      } else {
        // bKash: 835 MVR = 5,000 BDT (Net)
        finalPayable = (targetVal / 5000) * rateBkash;
        const bkashCharge = targetVal * 0.02;
        const totalBdtValue = targetVal + bkashCharge;
        
        steps.push({ label: 'bKash Rate', value: `${rateBkash} MVR / 5K` });
        steps.push({ label: 'Fee (2%)', value: `${bkashCharge.toLocaleString()} BDT` });
        steps.push({ label: 'Total BDT', value: `${totalBdtValue.toLocaleString()} BDT` });
      }
    } else {
      // MVR TO TARGET
      finalCurrency = currentTargetCurrency;
      const inputMvr = amt;
      steps.push({ label: 'Input MVR', value: `${inputMvr.toLocaleString()} MVR` });

      if (activeChannel === 'BANK') {
        finalPayable = (inputMvr / rateBank) * 100000;
        steps.push({ label: 'Bank Rate', value: `${rateBank} MVR / 1 Lac` });
      } else {
        // bKash logic: 835 MVR = 5000 BDT Net. Total BDT is 5000 + 100 = 5100.
        const netBdt = (inputMvr / rateBkash) * 5000;
        const fee = netBdt * 0.02;
        finalPayable = netBdt + fee; 

        steps.push({ label: 'bKash Rate', value: `${rateBkash} MVR / 5K` });
        steps.push({ label: 'Net BDT (Receiver)', value: `${Math.floor(netBdt).toLocaleString()} BDT` });
        steps.push({ label: 'Fee (2%)', value: `${Math.ceil(fee).toLocaleString()} BDT` });
      }
    }

    return { steps, finalPayable, finalCurrency, currentTargetCurrency };
  }, [inputAmount, inputMode, activeChannel, bankRate1Lac, bkashRate5k, targetCurrency]);

  const fmt = (v: number) => privacyMode ? '••••' : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-slate-50 h-screen flex flex-col overflow-hidden pb-safe">
      {/* 1. Header & Rates (Compact) */}
      <section className="bg-slate-900 text-white p-4 rounded-b-3xl shadow-lg space-y-3 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-indigo-400">TP Rate Reference</h2>
          <div className="flex items-center gap-2">
             {activeChannel === 'BANK' && (
                <div className="flex bg-white/5 border border-white/10 rounded overflow-hidden">
                   <button onClick={() => setTargetCurrency('BDT')} className={`px-2 py-0.5 text-[7px] font-black uppercase ${targetCurrency === 'BDT' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>BDT</button>
                   <input 
                      type="text" 
                      value={targetCurrency === 'BDT' ? '' : targetCurrency} 
                      onChange={e => setTargetCurrency(e.target.value.toUpperCase())}
                      placeholder="OTH"
                      className={`w-10 px-1 py-0.5 text-[7px] font-black text-center bg-transparent outline-none border-l border-white/10 ${targetCurrency !== 'BDT' ? 'text-white' : 'text-slate-500'}`}
                   />
                </div>
             )}
             <div className="bg-indigo-500/20 px-1.5 py-0.5 rounded text-[7px] font-black text-indigo-300 uppercase">Config</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
            <label className="block text-[7px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">Bank (1 Lac {activeChannel === 'BANK' ? targetCurrency : 'BDT'})</label>
            <div className="flex items-center gap-1">
              <input 
                type="number" value={bankRate1Lac} onChange={e => setBankRate1Lac(e.target.value)}
                className="w-full bg-transparent font-black text-base outline-none text-white"
              />
              <span className="text-[8px] font-black text-slate-600">MVR</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
            <label className="block text-[7px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">bKash (5K BDT)</label>
            <div className="flex items-center gap-1">
              <input 
                type="number" value={bkashRate5k} onChange={e => setBkashRate5k(e.target.value)}
                className="w-full bg-transparent font-black text-base outline-none text-white"
              />
              <span className="text-[8px] font-black text-slate-600">MVR</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Calc Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 justify-center">
        <div className="bg-white rounded-[2rem] p-5 shadow-md border border-slate-100 space-y-4">
          {/* Toggles */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button 
                onClick={() => setInputMode('BDT_TO_MVR')}
                className={`flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${inputMode === 'BDT_TO_MVR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                {calculation.currentTargetCurrency} to MVR
              </button>
              <button 
                onClick={() => setInputMode('MVR_TO_BDT')}
                className={`flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${inputMode === 'MVR_TO_BDT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                MVR to {calculation.currentTargetCurrency}
              </button>
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button 
                onClick={() => setActiveChannel('BANK')}
                className={`flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${activeChannel === 'BANK' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
              >
                <i className="fas fa-building-columns mr-1"></i>Bank
              </button>
              <button 
                onClick={() => setActiveChannel('BKASH')}
                className={`flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${activeChannel === 'BKASH' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400'}`}
              >
                <i className="fas fa-wallet mr-1"></i>bKash
              </button>
            </div>
          </div>

          {/* Input Amount */}
          <div className="text-center space-y-1 py-2 border-y border-slate-50">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
              Enter {inputMode === 'BDT_TO_MVR' ? calculation.currentTargetCurrency : 'MVR'}
            </label>
            <input 
              type="number"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
              className="w-full text-4xl font-black text-slate-900 outline-none bg-transparent text-center tracking-tighter"
              placeholder="0"
            />
          </div>

          {/* Steps List */}
          <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2">
            {calculation.steps.map((step, idx) => (
              <div key={idx} className="flex justify-between items-center text-[9px]">
                <span className="font-bold text-slate-400 uppercase tracking-tight">{step.label}</span>
                <span className="font-black text-slate-800">{step.value}</span>
              </div>
            ))}
          </div>

          {/* Final Large Result */}
          <div className={`p-4 rounded-2xl text-white shadow-xl transition-all ${activeChannel === 'BANK' ? 'bg-indigo-600' : 'bg-pink-600'}`}>
            <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mb-0.5 text-center">
              {inputMode === 'BDT_TO_MVR' ? 'Total MVR to Pay' : `Total ${calculation.currentTargetCurrency} (Incl. Fee)`}
            </p>
            <div className="flex items-baseline gap-1.5 justify-center">
              <h4 className="text-3xl font-black tracking-tighter leading-none">
                {fmt(calculation.finalPayable)}
              </h4>
              <span className="text-sm font-black opacity-80">{calculation.finalCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Global Footer (Very Small) */}
      <footer className="shrink-0 p-3 text-center mb-16">
        <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em]">AW Finance TP v3.3</p>
      </footer>
    </div>
  );
};

export default TPAssistant;
