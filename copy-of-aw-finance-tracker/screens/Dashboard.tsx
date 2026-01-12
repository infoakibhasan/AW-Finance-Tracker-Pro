
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFinance } from '../store/FinanceContext';
import FundCard from '../components/FundCard';
import TransactionList from '../components/TransactionList';
import { TransactionType } from '../types';
import { GoogleGenAI } from "@google/genai";

const FINANCIAL_TIPS = [
  {
    title: "50/30/20 Rule",
    desc: "50% Needs, 30% Wants, 20% Savings.",
    icon: "fa-pie-chart"
  },
  {
    title: "Emergency Fund",
    desc: "Keep 3-6 months of expenses in Cash.",
    icon: "fa-shield-halved"
  },
  {
    title: "Debt Snowball",
    desc: "Pay smallest debts first for momentum.",
    icon: "fa-snowplow"
  }
];

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    privacyMode,
    balances,
    funds,
    availableCurrencies,
    getSumByCurrency,
    t
  } = useFinance();
  
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fundColors: Record<string, string> = {
    'f-1': 'bg-gradient-to-br from-indigo-600 to-blue-500', 
  };

  const currencySummaries = useMemo(() => {
    const activeTxs = transactions.filter(t => !t.isDeleted);
    
    return availableCurrencies.map(curr => {
      const income = activeTxs
        .filter(t => t.type === TransactionType.INCOME && t.currency === curr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = activeTxs
        .filter(t => t.type === TransactionType.EXPENSE && t.currency === curr)
        .reduce((sum, t) => sum + t.amount, 0);

      const available = getSumByCurrency(curr);

      return {
        currency: curr,
        income,
        expense,
        available
      };
    }).filter(s => s.available !== 0 || s.income !== 0 || s.expense !== 0);
  }, [transactions, availableCurrencies, getSumByCurrency]);

  const getAIAdvice = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = currencySummaries.map(s => `${s.available} ${s.currency}`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Portfolio: ${summary}. Give one short professional financial tip (max 15 words).`,
        config: {
          systemInstruction: "You are a concise financial advisor.",
          temperature: 0.7,
        }
      });

      setAiAdvice(response.text || "Track expenses to find savings.");
    } catch (error) {
      setAiAdvice("Maintain 20% savings for long-term security.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Compact Portfolio Summary */}
      <section className="px-4 pt-4">
        <div className="bg-slate-900 rounded-xl p-5 shadow-xl relative overflow-hidden border border-white/5">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-white tracking-tight uppercase">{t('portfolio_summary')}</h2>
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                <i className="fas fa-chart-line text-blue-400 text-xs"></i>
              </div>
            </div>

            <div className="space-y-4">
              {currencySummaries.length > 0 ? (
                currencySummaries.map((summary) => (
                  <div key={summary.currency} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{summary.currency} {t('available')}</p>
                        <h3 className="text-xl font-black text-white">
                          {privacyMode ? '••••' : summary.available.toLocaleString()}
                          <span className="text-[10px] font-bold text-slate-500 ml-1.5">{summary.currency}</span>
                        </h3>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <p className="text-[7px] font-black text-emerald-500/80 uppercase">In</p>
                          <p className="text-[11px] font-black text-white">{privacyMode ? '••' : summary.income.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] font-black text-rose-500/80 uppercase">Out</p>
                          <p className="text-[11px] font-black text-white">{privacyMode ? '••' : summary.expense.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">No activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mini Quick Tools */}
      <section className="px-4 grid grid-cols-2 gap-2">
        <Link to="/calculator" className="flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-lg shadow-md border border-indigo-500 group active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-white text-sm shrink-0">
              <i className="fas fa-calculator"></i>
            </div>
            <div className="truncate">
              <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate">Remittance Calc</h4>
              <p className="text-[7px] font-bold text-indigo-200 uppercase tracking-widest truncate">Bank Rates</p>
            </div>
          </div>
        </Link>

        <Link to="/tp-assistant" className="flex items-center justify-between bg-slate-800 hover:bg-slate-900 px-4 py-3 rounded-lg shadow-md border border-slate-700 group active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-white text-sm shrink-0">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="truncate">
              <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate">TP Assistant</h4>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate">Direct TP Calc</p>
            </div>
          </div>
        </Link>
      </section>

      {/* Funds & Accounts - Compact */}
      <section className="px-4">
        <div className="flex overflow-x-auto gap-2 hide-scrollbar snap-x -mx-4 px-4">
          {funds.map(fund => {
            const fundBalances = balances
              .filter(b => b.fundId === fund.id && b.amount !== 0)
              .map(b => ({ amount: b.amount, currency: b.currency }));

            return (
              <div key={fund.id} className="snap-center first:pl-0">
                <FundCard 
                  name={fund.name}
                  balances={fundBalances}
                  color={fundColors[fund.id] || 'bg-slate-800'}
                  isPrivate={privacyMode}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest Activity - Densified */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('latest_activity')}</h3>
          <Link to="/reports" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">History</Link>
        </div>
        <TransactionList transactions={transactions} limit={4} />
      </section>

      {/* Advisor Corner - Minimal Grid */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Advisor Corner</h3>
          <button 
            onClick={getAIAdvice}
            disabled={isGenerating}
            className="text-[8px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1"
          >
            {isGenerating ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            {t('AI Tip')}
          </button>
        </div>

        {aiAdvice && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
            <i className="fas fa-robot text-indigo-500 text-xs mt-0.5"></i>
            <p className="text-[10px] font-bold text-indigo-900 italic leading-tight">"{aiAdvice}"</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {FINANCIAL_TIPS.map((tip, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <i className={`fas ${tip.icon} text-[10px] text-slate-400`}></i>
                <h4 className="text-[8px] font-black text-slate-900 uppercase">{tip.title}</h4>
              </div>
              <p className="text-[8px] text-slate-500 font-medium leading-tight">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
