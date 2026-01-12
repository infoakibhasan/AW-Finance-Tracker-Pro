import React, { useState, useMemo } from 'react';
import { useFinance } from '../store/FinanceContext';

// --- Official Western Union Tiered Fee Logic ---
const WU_FEE_TIERS: Record<string, { min: number; max: number; fee: number }[]> = {
  'Bangladesh/Nepal': [
    { min: 1, max: 500, fee: 4 },
    { min: 501, max: 1000, fee: 6 },
    { min: 1001, max: 3000, fee: 8 }
  ],
  'Sri Lanka/India': [
    { min: 1, max: 500, fee: 5 },
    { min: 501, max: 1000, fee: 8 },
    { min: 1001, max: 3000, fee: 10 }
  ],
  'Pakistan': [
    { min: 1, max: 3000, fee: 10 }
  ]
};

type CalcTab = 'WU' | 'OTHER';
type EntryCurrency = 'USD' | 'MVR' | 'BDT';

const RemittanceDashboard: React.FC = () => {
  const { privacyMode } = useFinance();

  // --- Global Reference Rates ---
  const [refUsdMvr, setRefUsdMvr] = useState<string>('20.20');
  const [refUsdBdt, setRefUsdBdt] = useState<string>('125.46');
  
  // --- UI State ---
  const [activeTab, setActiveTab] = useState<CalcTab>('WU');

  // --- Tab 1: Western Union State ---
  const [wuAmount, setWuAmount] = useState<string>('1000');
  const [wuCurrency, setWuCurrency] = useState<EntryCurrency>('MVR');
  const [wuCountry, setWuCountry] = useState<string>('Bangladesh/Nepal');
  const [wuIncentivePct, setWuIncentivePct] = useState<string>('2.5');

  // --- Tab 2: Manual Bank State ---
  const [otherAmount, setOtherAmount] = useState<string>('1000');
  const [otherCurrency, setOtherCurrency] = useState<EntryCurrency>('MVR');
  const [otherRateBdt, setOtherRateBdt] = useState<string>('125.00');
  const [otherFeeUsd, setOtherFeeUsd] = useState<string>('0');
  const [otherAdjustmentBdt, setOtherAdjustmentBdt] = useState<string>('0');

  // --- Western Union Calculation Logic (Automated) ---
  const wuResult = useMemo(() => {
    const amt = parseFloat(wuAmount) || 0;
    const mvrRate = parseFloat(refUsdMvr) || 0;
    const bdtRate = parseFloat(refUsdBdt) || 0;
    const incentive = parseFloat(wuIncentivePct) || 0;

    let usdGross = 0;
    if (wuCurrency === 'USD') usdGross = amt;
    else if (wuCurrency === 'MVR') usdGross = mvrRate > 0 ? amt / mvrRate : 0;
    else if (wuCurrency === 'BDT') usdGross = bdtRate > 0 ? amt / bdtRate : 0;

    // Fixed Western Union Fees applied based on tiered rules
    const tiers = WU_FEE_TIERS[wuCountry] || WU_FEE_TIERS['Bangladesh/Nepal'];
    const tier = tiers.find(t => usdGross >= t.min && usdGross <= t.max) || tiers[tiers.length - 1];
    const fee = tier ? tier.fee : 0;

    const usdNet = Math.max(0, usdGross - fee);
    const baseBdt = usdNet * bdtRate;
    const incentiveBdt = baseBdt * (incentive / 100);
    const finalBdt = baseBdt + incentiveBdt;
    const totalPaidMvr = usdGross * mvrRate;

    return { usdGross, fee, usdNet, baseBdt, incentiveBdt, finalBdt, totalPaidMvr, bdtRate };
  }, [wuAmount, wuCurrency, wuCountry, wuIncentivePct, refUsdMvr, refUsdBdt]);

  // --- Other Bank Calculation Logic (Manual) ---
  const otherResult = useMemo(() => {
    const amt = parseFloat(otherAmount) || 0;
    const mvrRate = parseFloat(refUsdMvr) || 0;
    const rate = parseFloat(otherRateBdt) || 0;
    const fee = parseFloat(otherFeeUsd) || 0;
    const adj = parseFloat(otherAdjustmentBdt) || 0;

    let usdGross = 0;
    if (otherCurrency === 'USD') usdGross = amt;
    else if (otherCurrency === 'MVR') usdGross = mvrRate > 0 ? amt / mvrRate : 0;
    else if (otherCurrency === 'BDT') usdGross = rate > 0 ? amt / rate : 0;

    const usdNet = Math.max(0, usdGross - fee);
    const baseBdt = usdNet * rate;
    const finalBdt = baseBdt + adj;
    const totalPaidMvr = usdGross * mvrRate;

    return { usdGross, fee, usdNet, baseBdt, adj, finalBdt, totalPaidMvr, rate };
  }, [otherAmount, otherCurrency, otherRateBdt, otherFeeUsd, otherAdjustmentBdt, refUsdMvr]);

  const fmt = (v: number) => privacyMode ? '••••' : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-slate-50 min-h-screen pb-32 safe-area-padding-top">
      {/* Rate Config Header */}
      <section className="bg-slate-900 text-white px-6 pt-8 pb-12 rounded-b-[3rem] shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase leading-none italic">AW REMIT PRO</h2>
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Enterprise Finance v5.0</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Global References</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
            <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">MVR / 1 USD</label>
            <input 
              type="number" value={refUsdMvr} onChange={e => setRefUsdMvr(e.target.value)}
              className="w-full bg-transparent font-black text-lg outline-none text-white focus:text-indigo-400"
            />
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
            <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">BDT / 1 USD</label>
            <input 
              type="number" value={refUsdBdt} onChange={e => setRefUsdBdt(e.target.value)}
              className="w-full bg-transparent font-black text-lg outline-none text-white focus:text-indigo-400"
            />
          </div>
        </div>
      </section>

      <div className="max-w-md mx-auto px-4 -mt-8 space-y-6">
        {/* Tab Selection */}
        <div className="bg-white p-1.5 rounded-full shadow-2xl border border-slate-100 flex gap-1">
          <button 
            onClick={() => setActiveTab('WU')}
            className={`flex-1 py-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'WU' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}
          >
            Western Union
          </button>
          <button 
            onClick={() => setActiveTab('OTHER')}
            className={`flex-1 py-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'OTHER' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}
          >
            Manual Bank
          </button>
        </div>

        {/* Input Console */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
             <i className={`fas ${activeTab === 'WU' ? 'fa-building-columns' : 'fa-keyboard'} text-9xl`}></i>
          </div>

          <div className="space-y-6 relative z-10 text-center">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Input Amount</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['USD', 'MVR', 'BDT'] as EntryCurrency[]).map(curr => {
                  const activeCurr = activeTab === 'WU' ? wuCurrency : otherCurrency;
                  return (
                    <button 
                      key={curr}
                      onClick={() => activeTab === 'WU' ? setWuCurrency(curr) : setOtherCurrency(curr)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${activeCurr === curr ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                    >
                      {curr}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-1">
              <input 
                type="number"
                value={activeTab === 'WU' ? wuAmount : otherAmount}
                onChange={e => activeTab === 'WU' ? setWuAmount(e.target.value) : setOtherAmount(e.target.value)}
                className="w-full text-5xl font-black text-slate-900 outline-none bg-transparent text-center tracking-tighter"
                placeholder="0.00"
              />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Principal Value</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 space-y-4 relative z-10">
            {activeTab === 'WU' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">WU Dest. Tiers</label>
                  <select 
                    value={wuCountry}
                    onChange={e => setWuCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-[11px] outline-none shadow-inner"
                  >
                    {Object.keys(WU_FEE_TIERS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Incentive %</label>
                  <input 
                    type="number" value={wuIncentivePct} onChange={e => setWuIncentivePct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-[11px] outline-none"
                  />
                </div>
                <div className="col-span-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center justify-center gap-2">
                   <i className="fas fa-shield-halved text-[10px] text-indigo-400"></i>
                   <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Fixed Official Western Union Tiers</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Applied Rate</label>
                    <input 
                      type="number" value={otherRateBdt} onChange={e => setOtherRateBdt(e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 shadow-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Fees (USD)</label>
                    <input 
                      type="number" value={otherFeeUsd} onChange={e => setOtherFeeUsd(e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 shadow-md"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Extra Adjustments (BDT)</label>
                  <input 
                    type="number" value={otherAdjustmentBdt} onChange={e => setOtherAdjustmentBdt(e.target.value)}
                    placeholder="+/- Amount"
                    className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 shadow-md"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Audit Breakdown */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
          <div className="flex justify-between items-center px-1 border-b border-slate-50 pb-3">
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Calculation Path</h3>
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Internal Engine</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-tight">Entered Amount</span>
              <span className="font-black text-slate-900">
                {activeTab === 'WU' ? wuAmount : otherAmount} {activeTab === 'WU' ? wuCurrency : otherCurrency}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-tight">Net USD Gross</span>
              <span className="font-black text-slate-900">${fmt(activeTab === 'WU' ? wuResult.usdGross : otherResult.usdGross)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-tight">Service Fees</span>
                {activeTab === 'WU' && (
                  <span className="text-[7px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">WU Official</span>
                )}
              </div>
              <span className={`font-black ${(activeTab === 'WU' ? wuResult.fee : otherResult.fee) > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                - ${(activeTab === 'WU' ? wuResult.fee : otherResult.fee).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-tight">Conversion Rate</span>
              <span className="font-black text-indigo-600">
                {activeTab === 'WU' ? wuResult.bdtRate : otherResult.rate} ৳ / $
              </span>
            </div>

            {activeTab === 'WU' ? (
              <div className="flex justify-between items-center text-xs bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-inner">
                <span className="font-bold text-emerald-600 uppercase tracking-tight">Gov. Bonus ({wuIncentivePct}%)</span>
                <span className="font-black text-emerald-600">+{fmt(wuResult.incentiveBdt)} ৳</span>
              </div>
            ) : (
              otherResult.adj !== 0 && (
                <div className={`flex justify-between items-center text-xs p-4 rounded-2xl border shadow-inner ${otherResult.adj > 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'}`}>
                  <span className={`font-bold uppercase tracking-tight ${otherResult.adj > 0 ? 'text-indigo-600' : 'text-rose-600'}`}>Manual Adjustments</span>
                  <span className={`font-black ${otherResult.adj > 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {otherResult.adj > 0 ? '+' : ''}{fmt(otherResult.adj)} ৳
                  </span>
                </div>
              )
            )}
          </div>

          {activeTab === 'WU' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
              <p className="text-[8px] font-black text-slate-400 italic leading-relaxed uppercase tracking-tighter">
                Note: Fees are applied strictly according to official Western Union charges for {wuCountry}.
              </p>
            </div>
          )}
        </section>

        {/* Final Large Result Display */}
        <section className="grid grid-cols-2 gap-4 pb-12">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl space-y-2 border border-white/5 flex flex-col items-center">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Paid</p>
            <h4 className="text-xl font-black text-white tracking-tighter">
              {fmt(activeTab === 'WU' ? wuResult.totalPaidMvr : otherResult.totalPaidMvr)}
              <span className="text-[10px] ml-1 font-bold text-slate-600 uppercase">MVR</span>
            </h4>
          </div>

          <div className={`p-6 rounded-[2.5rem] text-white shadow-xl space-y-2 flex flex-col items-center transition-all duration-500 ${activeTab === 'WU' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}>
            <p className="text-[8px] font-black opacity-60 uppercase tracking-widest text-center">Receiver Gets</p>
            <h4 className="text-xl font-black tracking-tighter">
              {fmt(activeTab === 'WU' ? wuResult.finalBdt : otherResult.finalBdt)}
              <span className="text-[10px] ml-1 font-bold opacity-60 uppercase">BDT</span>
            </h4>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-24 left-0 right-0 px-8 pointer-events-none">
        <div className="max-w-xs mx-auto bg-white/95 backdrop-blur rounded-full py-3 px-6 flex items-center justify-center gap-3 border border-slate-200 shadow-2xl">
           <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'WU' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'}`}></div>
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">
             {activeTab === 'WU' ? 'WU Charges Enforced' : 'Custom Manual Logic Active'}
           </p>
        </div>
      </footer>
    </div>
  );
};

export default RemittanceDashboard;