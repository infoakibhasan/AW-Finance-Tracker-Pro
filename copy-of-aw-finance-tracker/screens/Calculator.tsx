
import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../store/FinanceContext';

interface FeeRule {
  min: number;
  max: number;
  fee: number;
}

const WU_FEE_RULES = {
  SOUTH_ASIA_A: [
    { min: 1, max: 500, fee: 4 },
    { min: 501, max: 1000, fee: 6 },
    { min: 1001, max: 3000, fee: 8 }
  ],
  SRI_LANKA: [
    { min: 1, max: 500, fee: 5 },
    { min: 501, max: 1000, fee: 7 },
    { min: 1001, max: 3000, fee: 9 }
  ],
  INDIA: [
    { min: 1, max: 250, fee: 4 },
    { min: 251, max: 500, fee: 5 },
    { min: 501, max: 1000, fee: 7 },
    { min: 1001, max: 2400, fee: 9 }
  ],
  PAKISTAN: [
    { min: 1, max: 3000, fee: 10 }
  ],
  EAST_ASIA: [
    { min: 1, max: 500, fee: 8 },
    { min: 501, max: 1000, fee: 13 },
    { min: 1001, max: 1500, fee: 18 },
    { min: 1501, max: 2000, fee: 28 },
    { min: 2001, max: 3000, fee: 36 }
  ],
  GLOBAL: [
    { min: 1, max: 85, fee: 13 },
    { min: 86, max: 212, fee: 21 },
    { min: 213, max: 340, fee: 30 },
    { min: 341, max: 425, fee: 34 },
    { min: 426, max: 510, fee: 42 },
    { min: 511, max: 595, fee: 47 },
    { min: 596, max: 765, fee: 55 },
    { min: 766, max: 892, fee: 64 },
    { min: 893, max: 1020, fee: 74 },
    { min: 1021, max: 1274, fee: 86 },
    { min: 1275, max: 1487, fee: 94 },
    { min: 1488, max: 1742, fee: 105 },
    { min: 1743, max: 1997, fee: 116 },
    { min: 1998, max: 2507, fee: 133 },
    { min: 2508, max: 3017, fee: 152 }
  ]
};

const COUNTRY_CONFIG: Record<string, { rules: FeeRule[], currency: string }> = {
  'Bangladesh': { rules: WU_FEE_RULES.SOUTH_ASIA_A, currency: 'BDT' },
  'Nepal': { rules: WU_FEE_RULES.SOUTH_ASIA_A, currency: 'NPR' },
  'Sri Lanka': { rules: WU_FEE_RULES.SRI_LANKA, currency: 'LKR' },
  'India': { rules: WU_FEE_RULES.INDIA, currency: 'INR' },
  'Pakistan': { rules: WU_FEE_RULES.PAKISTAN, currency: 'PKR' },
  'Thailand': { rules: WU_FEE_RULES.EAST_ASIA, currency: 'THB' },
  'Indonesia': { rules: WU_FEE_RULES.EAST_ASIA, currency: 'IDR' },
  'Philippines': { rules: WU_FEE_RULES.EAST_ASIA, currency: 'PHP' },
  'China': { rules: WU_FEE_RULES.EAST_ASIA, currency: 'CNY' },
  'Other Countries': { rules: WU_FEE_RULES.GLOBAL, currency: 'LCL' }
};

type CalcTab = 'WU' | 'MANUAL';
type BonusType = 'NONE' | 'ADD';

const Calculator: React.FC = () => {
  const { t } = useFinance();
  const [activeTab, setActiveTab] = useState<CalcTab>('WU');
  
  // WU Tab States
  const [selectedCountry, setSelectedCountry] = useState<string>(() => localStorage.getItem('calc_country') || 'Bangladesh');
  const [rate, setRate] = useState<string>(() => localStorage.getItem('calc_rate') || '0'); 
  const [bonus, setBonus] = useState<string>(() => localStorage.getItem('calc_bonus') || '2.5');
  // Update: Defaulting to 'NONE' consistently
  const [wuBonusType, setWuBonusType] = useState<BonusType>(() => (localStorage.getItem('wu_bonus_type') as BonusType) || 'NONE');
  const [totalInHand, setTotalInHand] = useState<string>('0'); 

  // Manual Tab States
  const [manualAmount, setManualAmount] = useState<string>('0');
  const [manualRate, setManualRate] = useState<string>('0');
  const [manualFee, setManualFee] = useState<string>('0');
  const [manualBonus, setManualBonus] = useState<string>('2.5');
  // Update: Default 'NONE'
  const [manualBonusType, setManualBonusType] = useState<BonusType>('NONE'); 
  const [manualCurrency, setManualCurrency] = useState<string>('BDT');
  const [manualCustomCurrency, setManualCustomCurrency] = useState<string>('');
  const [manualCountryName, setManualCountryName] = useState<string>('');

  const [showRuleTable, setShowRuleTable] = useState(false);

  useEffect(() => {
    localStorage.setItem('calc_country', selectedCountry);
    localStorage.setItem('calc_rate', rate);
    localStorage.setItem('calc_bonus', bonus);
    localStorage.setItem('wu_bonus_type', wuBonusType);
  }, [selectedCountry, rate, bonus, wuBonusType]);

  const activeCurrency = useMemo(() => {
    if (activeTab === 'WU') return COUNTRY_CONFIG[selectedCountry]?.currency || 'BDT';
    return manualCurrency === 'CUSTOM' ? (manualCustomCurrency || 'LCL') : manualCurrency;
  }, [activeTab, selectedCountry, manualCurrency, manualCustomCurrency]);

  const wuFee = useMemo(() => {
    const rules = COUNTRY_CONFIG[selectedCountry].rules;
    const total = parseFloat(totalInHand) || 0;
    if (total <= 0) return 0;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const potentialPrincipal = total - rule.fee;
      if (potentialPrincipal >= rule.min && potentialPrincipal <= rule.max) return rule.fee;
      if (potentialPrincipal < rule.min) return rule.fee;
    }
    return rules[rules.length - 1].fee;
  }, [selectedCountry, totalInHand]);

  const wuResult = useMemo(() => {
    const total = parseFloat(totalInHand) || 0;
    const f = wuFee;
    const r = parseFloat(rate) || 0;
    const b = wuBonusType === 'NONE' ? 0 : (parseFloat(bonus) || 0);
    const netPrincipal = Math.max(0, total - f);
    
    let baseVal = 0;
    let bonusAmount = 0;
    let totalVal = 0;

    baseVal = netPrincipal * r;
    bonusAmount = baseVal * (b / 100);
    totalVal = baseVal + bonusAmount;

    return { netPrincipal, baseBDT: baseVal, bonusAmount, totalBDT: totalVal };
  }, [totalInHand, wuFee, rate, bonus, wuBonusType]);

  const manualResult = useMemo(() => {
    const amt = parseFloat(manualAmount) || 0;
    const r = parseFloat(manualRate) || 0;
    const f = parseFloat(manualFee) || 0;
    const b = manualBonusType === 'NONE' ? 0 : (parseFloat(manualBonus) || 0);
    const netPrincipal = Math.max(0, amt - f);
    
    let baseVal = 0;
    let bonusAmount = 0;
    let totalVal = 0;

    baseVal = netPrincipal * r;
    bonusAmount = baseVal * (b / 100);
    totalVal = baseVal + bonusAmount;

    return { netPrincipal, baseBDT: baseVal, bonusAmount, totalBDT: totalVal, fee: f };
  }, [manualAmount, manualRate, manualFee, manualBonus, manualBonusType]);

  const activeResult = activeTab === 'WU' ? wuResult : manualResult;
  const activeServiceFee = activeTab === 'WU' ? wuFee : parseFloat(manualFee) || 0;

  const handleCopy = () => {
    let text = "";
    if (activeTab === 'WU') {
      text = `Remittance Summary (Western Union - ${selectedCountry}):
Total USD: $${totalInHand}
Fee: $${wuFee}
Net Sent: $${wuResult.netPrincipal.toFixed(2)}
Rate: ${rate}
Base Amount: ${wuResult.baseBDT.toLocaleString()} ${activeCurrency}
Incentive: ${wuResult.bonusAmount.toLocaleString()} ${activeCurrency}
Receivable: ${wuResult.totalBDT.toLocaleString()} ${activeCurrency}`;
    } else {
      const countryLabel = manualCountryName ? ` (${manualCountryName})` : "";
      text = `Remittance Summary (Other Banks${countryLabel}):
Total USD: $${manualAmount}
Fee: $${manualFee}
Net Sent: $${manualResult.netPrincipal.toFixed(2)}
Rate: ${manualRate}
Base Amount: ${manualResult.baseBDT.toLocaleString()} ${activeCurrency}
Incentive: ${manualResult.bonusAmount.toLocaleString()} ${activeCurrency}
Receivable: ${manualResult.totalBDT.toLocaleString()} ${activeCurrency}`;
    }
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto space-y-5 pb-24 animate-in fade-in duration-500">
      <header className="text-center">
        <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">{t('remittance_calc')}</h2>
      </header>

      {/* Tab Switcher */}
      <div className="bg-slate-200/50 p-1 rounded-xl border border-slate-300/30 flex shadow-inner">
        <button 
          onClick={() => setActiveTab('WU')}
          className={`flex-1 py-3 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'WU' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500'}`}
        >
          Western Union Rate Based
        </button>
        <button 
          onClick={() => setActiveTab('MANUAL')}
          className={`flex-1 py-3 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'MANUAL' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500'}`}
        >
          Other Banks Rate Calc
        </button>
      </div>

      {/* Results Section */}
      <section className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center space-y-1">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('total_receivable')}</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">
            {activeResult.totalBDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-bold text-slate-500 ml-2 uppercase">{activeCurrency}</span>
          </h3>
          
          <div className="pt-4 grid grid-cols-2 gap-y-3 gap-x-4 border-t border-white/5 mt-4">
             <div className="text-center">
                <p className="text-[7px] font-black text-slate-500 uppercase">Net Sent (USD)</p>
                <p className="text-sm font-black text-white">${activeResult.netPrincipal.toFixed(2)}</p>
             </div>
             <div className="text-center">
                <p className="text-[7px] font-black text-slate-500 uppercase">Service Fee (USD)</p>
                <p className="text-sm font-black text-rose-400">${activeServiceFee.toFixed(2)}</p>
             </div>
             <div className="text-center opacity-70">
                <p className="text-[7px] font-black text-slate-500 uppercase">Base Amount ({activeCurrency})</p>
                <p className="text-[10px] font-black text-white">{activeResult.baseBDT.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
             </div>
             <div className="text-center opacity-70">
                <p className="text-[7px] font-black text-slate-500 uppercase">Incentive ({activeCurrency})</p>
                <p className="text-[10px] font-black text-emerald-400">+{activeResult.bonusAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
             </div>
          </div>
        </div>
      </section>

      {/* Input Fields */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        {activeTab === 'WU' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-50 border-none p-3 rounded-xl font-black text-[10px] outline-none shadow-inner"
                >
                  {Object.keys(COUNTRY_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Ex. Rate ({activeCurrency})</label>
                <input 
                  type="number" value={rate} onChange={e => setRate(e.target.value)}
                  className="w-full bg-slate-50 border-none p-3 rounded-xl font-black text-[10px] outline-none shadow-inner" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Total USD In-Hand</label>
              <input 
                type="number" value={totalInHand} onChange={e => setTotalInHand(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-black text-lg outline-none focus:border-indigo-500 transition-all" 
              />
            </div>

            {/* Gov Bonus Block for WU - Defaulting to NONE */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Apply Gov Bonus</label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg">
                    <button onClick={() => setWuBonusType('NONE')} className={`px-4 py-1 rounded-md text-[7px] font-black uppercase ${wuBonusType === 'NONE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>None</button>
                    <button onClick={() => setWuBonusType('ADD')} className={`px-4 py-1 rounded-md text-[7px] font-black uppercase ${wuBonusType === 'ADD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Add Bonus</button>
                  </div>
                </div>
                
                {wuBonusType !== 'NONE' && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Incentive Pct</span>
                      <span className="text-[9px] font-black text-indigo-600">{bonus}%</span>
                    </div>
                    <input type="range" min="0" max="5" step="0.1" value={bonus} onChange={e => setBonus(e.target.value)} className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-full appearance-none" />
                  </div>
                )}
                
                {wuBonusType === 'NONE' && (
                  <div className="text-center py-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">No bonus will be applied</p>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Currency</label>
                  <select 
                    value={manualCurrency}
                    onChange={(e) => setManualCurrency(e.target.value)}
                    className="w-full bg-slate-50 border-none p-3 rounded-xl font-black text-[10px] outline-none shadow-inner"
                  >
                    <option value="BDT">BDT (Bangladesh)</option>
                    <option value="NPR">NPR (Nepal)</option>
                    <option value="INR">INR (India)</option>
                    <option value="PKR">PKR (Pakistan)</option>
                    <option value="LKR">LKR (Sri Lanka)</option>
                    <option value="THB">THB (Thailand)</option>
                    <option value="IDR">IDR (Indonesia)</option>
                    <option value="PHP">PHP (Philippines)</option>
                    <option value="CNY">CNY (China)</option>
                    <option value="CUSTOM">Other (Manual Entry)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Ex. Rate ({activeCurrency})</label>
                  <input 
                    type="number" value={manualRate} onChange={e => setManualRate(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-black text-[11px] outline-none focus:border-indigo-500 shadow-sm" 
                  />
                </div>
             </div>

             {manualCurrency === 'CUSTOM' && (
               <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Country</label>
                    <input 
                      type="text" value={manualCountryName} onChange={e => setManualCountryName(e.target.value)}
                      placeholder="e.g. Canada"
                      className="w-full bg-slate-50 border-none p-3 rounded-xl font-black text-[10px] outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Code</label>
                    <input 
                      type="text" value={manualCustomCurrency} onChange={e => setManualCustomCurrency(e.target.value.toUpperCase())}
                      placeholder="e.g. CAD"
                      className="w-full bg-slate-50 border-none p-3 rounded-xl font-black text-[10px] outline-none shadow-inner" 
                    />
                 </div>
               </div>
             )}
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">USD Amount</label>
                  <input 
                    type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-black text-sm outline-none focus:border-indigo-500 shadow-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Fee ($)</label>
                  <input 
                    type="number" value={manualFee} onChange={e => setManualFee(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-black text-sm outline-none focus:border-indigo-500 shadow-sm" 
                  />
                </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Apply Gov Bonus</label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg">
                    <button onClick={() => setManualBonusType('NONE')} className={`px-4 py-1 rounded-md text-[7px] font-black uppercase ${manualBonusType === 'NONE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>None</button>
                    <button onClick={() => setManualBonusType('ADD')} className={`px-4 py-1 rounded-md text-[7px] font-black uppercase ${manualBonusType === 'ADD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Add Bonus</button>
                  </div>
                </div>
                
                {manualBonusType !== 'NONE' && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Incentive Pct</span>
                      <span className="text-[9px] font-black text-indigo-600">{manualBonus}%</span>
                    </div>
                    <input type="range" min="0" max="5" step="0.1" value={manualBonus} onChange={e => setManualBonus(e.target.value)} className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-full appearance-none" />
                  </div>
                )}
                
                {manualBonusType === 'NONE' && (
                  <div className="text-center py-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">No bonus will be applied</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </section>

      <div className="flex gap-2">
        <button onClick={handleCopy} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Copy Result</button>
        {activeTab === 'WU' && (
          <button onClick={() => setShowRuleTable(!showRuleTable)} className="px-5 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl active:scale-95 transition-all">
            <i className={`fas ${showRuleTable ? 'fa-eye-slash' : 'fa-list-ul'}`}></i>
          </button>
        )}
      </div>

      {showRuleTable && activeTab === 'WU' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 animate-in zoom-in-95 duration-200 space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">WU Fee Structure: {selectedCountry}</p>
          {COUNTRY_CONFIG[selectedCountry].rules.map((r, i) => (
            <div key={i} className="flex justify-between text-[9px] font-bold p-2 bg-slate-50 rounded-lg">
              <span>${r.min} - ${r.max}</span>
              <span className="text-indigo-600">${r.fee}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calculator;
