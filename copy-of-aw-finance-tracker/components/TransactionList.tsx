
import React, { useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { useFinance } from '../store/FinanceContext';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit = 5 }) => {
  const { categories, funds, deleteTransaction, privacyMode } = useFinance();
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  
  const displayTxs = transactions.filter(t => !t.isDeleted).slice(0, limit);

  const handleDelete = (txId: string) => {
    if (window.confirm("Delete this transaction? It will be moved to the Trash.")) {
      deleteTransaction(txId);
    }
  };

  if (displayTxs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-300">
        <i className="fas fa-receipt text-3xl mb-3 opacity-20"></i>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No history yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {displayTxs.map(tx => {
          const cat = categories.find(c => c.id === tx.categoryId);
          const fund = funds.find(f => f.id === tx.sourceFundId);
          const isExpense = tx.type === TransactionType.EXPENSE;
          
          return (
            <div key={tx.id} className="group flex items-center justify-between p-4 bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${isExpense ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                  <i className={`fas ${cat?.icon || 'fa-tag'} text-sm`}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-800 leading-tight uppercase tracking-tight">{cat?.name || 'Item'}</p>
                    {tx.proofImage && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewingProof(tx.proofImage!); }}
                        className="text-indigo-500 hover:text-indigo-700 transition-colors"
                        title="View Receipt"
                      >
                        <i className="fas fa-file-invoice text-[10px]"></i>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{fund?.name || 'Fund'}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-400">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <p className={`text-sm font-black ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {isExpense ? '-' : '+'}
                  {privacyMode ? '***' : tx.amount.toLocaleString()} 
                  <span className="text-[10px] ml-1 opacity-60">{tx.currency}</span>
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                  className="text-slate-300 hover:text-rose-500 p-2 transition-all active:scale-125"
                >
                  <i className="fas fa-trash-can text-[10px]"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof Viewer Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl max-h-[80vh] bg-white rounded-md overflow-hidden shadow-2xl border border-white/20">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setViewingProof(null)}
                className="w-10 h-10 bg-slate-900/50 text-white rounded-full flex items-center justify-center backdrop-blur hover:bg-slate-900 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-1 overflow-auto max-h-[80vh]">
              <img src={viewingProof} alt="Invoice Proof" className="w-full h-auto object-contain" />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Proof</span>
              <a 
                href={viewingProof} 
                download="invoice_proof.png"
                className="px-3 py-1.5 bg-slate-900 text-white rounded-sm text-[8px] font-black uppercase tracking-widest"
              >
                Download
              </a>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setViewingProof(null)}></div>
        </div>
      )}
    </>
  );
};

export default TransactionList;
