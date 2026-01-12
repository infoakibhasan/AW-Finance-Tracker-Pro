
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useFinance } from '../store/FinanceContext';
import { TransactionType, Currency } from '../types';

type ReportView = 'all' | 'income' | 'expense';

const Reports: React.FC = () => {
  const { transactions, categories, privacyMode, availableCurrencies } = useFinance();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(availableCurrencies[0] || 'BDT');
  const [reportView, setReportView] = useState<ReportView>('all');

  const activeTxs = useMemo(() => 
    transactions.filter(t => !t.isDeleted && t.currency === selectedCurrency),
  [transactions, selectedCurrency]);

  const summary = useMemo(() => {
    const income = activeTxs.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = activeTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [activeTxs]);

  const pieData = useMemo(() => {
    let targetTxs = activeTxs;
    if (reportView === 'income') {
      targetTxs = activeTxs.filter(t => t.type === TransactionType.INCOME);
    } else if (reportView === 'expense') {
      targetTxs = activeTxs.filter(t => t.type === TransactionType.EXPENSE);
    } else {
      targetTxs = activeTxs.filter(t => t.type === TransactionType.EXPENSE);
    }

    const data: Record<string, number> = {};
    targetTxs.forEach(tx => {
      const catName = categories.find(c => c.id === tx.categoryId)?.name || 'Other';
      data[catName] = (data[catName] || 0) + tx.amount;
    });

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeTxs, categories, reportView]);

  const barData = useMemo(() => {
    const days = 7;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayTxs = activeTxs.filter(t => t.date === dateStr);
      const income = dayTxs.filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTxs.filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        income,
        expense
      });
    }
    return result;
  }, [activeTxs]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="px-6 py-6 space-y-8 pb-24">
      <header className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Reports</h2>
        
        {/* Minimal Currency Switcher */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6">
          {availableCurrencies.map(curr => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap border ${
                selectedCurrency === curr 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md active:scale-95' 
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Minimal Tab Switcher */}
        <div className="relative flex bg-slate-200/50 p-1 rounded-md border border-slate-300/30 backdrop-blur-sm">
          {(['all', 'income', 'expense'] as ReportView[]).map(v => (
            <button
              key={v}
              onClick={() => setReportView(v)}
              className={`relative z-10 flex-1 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                reportView === v 
                ? 'text-slate-900' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v === 'all' ? 'Overview' : v}
              {reportView === v && (
                <div className="absolute inset-0 bg-white rounded-sm shadow-sm -z-10 animate-in fade-in duration-200 border border-slate-200"></div>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-4">
        {(reportView === 'all' || reportView === 'income') && (
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform group-hover:scale-110">
              <i className="fas fa-arrow-down-long text-emerald-500 text-xl"></i>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Inflow</p>
            <p className="text-xl font-black text-emerald-600">
              {privacyMode ? '••••' : summary.income.toLocaleString()}
              <span className="text-[10px] ml-1 opacity-40 font-bold">{selectedCurrency}</span>
            </p>
          </div>
        )}
        {(reportView === 'all' || reportView === 'expense') && (
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform group-hover:scale-110">
              <i className="fas fa-arrow-up-long text-rose-500 text-xl"></i>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outflow</p>
            <p className="text-xl font-black text-rose-600">
              {privacyMode ? '••••' : summary.expense.toLocaleString()}
              <span className="text-[10px] ml-1 opacity-40 font-bold">{selectedCurrency}</span>
            </p>
          </div>
        )}
        {reportView === 'all' && (
          <div className="col-span-2 bg-slate-900 p-6 rounded-lg shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Net Savings</p>
                <p className={`text-2xl font-black ${summary.net >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {privacyMode ? '••••••' : (summary.net > 0 ? `+${summary.net.toLocaleString()}` : summary.net.toLocaleString())}
                  <span className="text-xs ml-2 font-bold text-slate-600 uppercase tracking-widest">{selectedCurrency}</span>
                </p>
              </div>
              <div className={`w-12 h-12 rounded-md flex items-center justify-center border border-white/10 ${summary.net >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <i className={`fas ${summary.net >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-xl`}></i>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Weekly Trends Bar Chart */}
      {reportView === 'all' && (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Weekly Activity</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Inflow</span></div>
               <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Outflow</span></div>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px' }}
                   itemStyle={{ fontWeight: 800, fontSize: '11px' }}
                   labelStyle={{ fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px', color: '#94a3b8' }}
                   formatter={(value: number) => privacyMode ? '***' : `${value.toLocaleString()} ${selectedCurrency}`}
                />
                <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} barSize={8} />
                <Bar dataKey="expense" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Categorized breakdown (Pie) */}
      {reportView !== 'all' && (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
              {reportView === 'income' ? 'Income' : 'Expense'} Breakdown
            </h3>
            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{selectedCurrency}</span>
          </div>
          
          {pieData.length > 0 ? (
            <>
              <div className="h-64 w-full relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total</p>
                  <p className="text-2xl font-black text-slate-900">
                    {privacyMode ? '••••' : (reportView === 'income' ? summary.income : summary.expense).toLocaleString()}
                  </p>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => privacyMode ? '***' : `${value.toLocaleString()} ${selectedCurrency}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8 space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{d.name}</span>
                    </div>
                    <p className="text-xs font-black text-slate-900">
                      {privacyMode ? '***' : d.value.toLocaleString()}
                      <span className="text-[9px] ml-1.5 text-slate-400 font-bold">{selectedCurrency}</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-slate-300 gap-4">
              <div className="w-16 h-16 rounded-md bg-slate-50 flex items-center justify-center border border-slate-100">
                <i className="fas fa-chart-pie text-3xl opacity-20"></i>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No data records</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Reports;
