
import React from 'react';
import { useFinance } from '../store/FinanceContext';

const Trash: React.FC = () => {
  const { transactions, restoreTransaction, permanentlyDeleteTransaction, clearTrash, funds, categories, privacyMode } = useFinance();
  
  const deletedTxs = transactions.filter(t => t.isDeleted);

  const handleClearAll = () => {
    if (window.confirm("Clear entire Recycle Bin? This cannot be undone.")) {
      clearTrash();
    }
  };

  const handleDeleteForever = (id: string) => {
    if (window.confirm("Permanently delete this record? This action is irreversible.")) {
      permanentlyDeleteTransaction(id);
    }
  };

  return (
    <div className="px-6 py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-800">Recycle Bin</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Trash auto-clears on device reset</p>
        </div>
        {deletedTxs.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform"
          >
            Clear All
          </button>
        )}
      </div>

      {deletedTxs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-300 bg-white rounded-lg border border-slate-100 shadow-sm border-dashed">
          <i className="fas fa-trash-arrow-up text-5xl mb-4 opacity-20"></i>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deletedTxs.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const fund = funds.find(f => f.id === tx.sourceFundId);
            
            return (
              <div key={tx.id} className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between opacity-80 group transition-all hover:opacity-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                    <i className={`fas ${cat?.icon || 'fa-tag'} text-slate-400`}></i>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-700 leading-tight uppercase tracking-tight">{cat?.name || 'Transaction'}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{fund?.name}</span>
                      <span className="text-[9px] text-slate-300 font-bold">|</span>
                      <span className="text-[9px] text-slate-400 font-bold">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right mr-1">
                    <p className="text-xs font-black text-slate-800">
                      {privacyMode ? '***' : tx.amount.toLocaleString()} 
                      <span className="text-[9px] ml-1 opacity-60 uppercase">{tx.currency}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => restoreTransaction(tx.id)}
                      className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center active:scale-90 transition-all border border-emerald-100"
                      title="Restore"
                    >
                      <i className="fas fa-rotate-left text-xs"></i>
                    </button>
                    <button 
                      onClick={() => handleDeleteForever(tx.id)}
                      className="w-9 h-9 bg-rose-50 text-rose-500 rounded flex items-center justify-center active:scale-90 transition-all border border-rose-100"
                      title="Delete Permanently"
                    >
                      <i className="fas fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Trash;
