
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../store/FinanceContext';
import { TransactionType, Currency } from '../types';

const AddEntry: React.FC = () => {
  const navigate = useNavigate();
  const { funds, categories, addTransaction, t } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TransactionType.INCOME | TransactionType.EXPENSE>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofImage, setProofImage] = useState<string | undefined>(undefined);

  const [fundId, setFundId] = useState(funds[0].id);
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState<Currency>(funds[0].supportedCurrencies[0]);

  const selectedFund = useMemo(() => funds.find(f => f.id === fundId), [funds, fundId]);
  
  const filteredCategories = useMemo(() => 
    categories.filter(c => c.type === type), 
  [categories, type]);

  useEffect(() => {
    if (selectedFund && !selectedFund.supportedCurrencies.includes(currency)) {
      setCurrency(selectedFund.supportedCurrencies[0]);
    }
  }, [fundId, selectedFund, currency]);

  useEffect(() => {
    setCategoryId(filteredCategories[0]?.id || '');
  }, [type, filteredCategories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openPicker = (useCamera: boolean) => {
    if (fileInputRef.current) {
      if (useCamera) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  const handleSave = () => {
    const srcAmt = parseFloat(amount);
    if (!amount || srcAmt <= 0) return alert(t('enter_valid_amount') || 'Enter a valid amount');
    
    addTransaction({
      type,
      amount: srcAmt,
      currency,
      categoryId,
      sourceFundId: fundId,
      date,
      note: '',
      proofImage,
    });
    
    navigate('/');
  };

  return (
    <div className="px-6 py-4 max-w-md mx-auto pb-24 animate-in fade-in duration-500">
      {/* Minimized Header Section */}
      <header className="mb-4 text-center">
        <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">{t('new_transaction')}</h2>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{t('record') || 'Record your flow'}</p>
      </header>

      <div className="space-y-4">
        {/* Amount Input Block - Moved to Top */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm text-center space-y-1">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {t('amount')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-base font-black text-slate-300">{currency}</span>
            <input 
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full text-4xl font-black tracking-tighter outline-none bg-transparent text-center placeholder:text-slate-100 transition-colors ${
                type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
              }`}
            />
          </div>
        </div>

        {/* Entry Type Toggle - Moved below amount */}
        <div className="relative flex bg-slate-100 p-1 rounded-xl border border-slate-200 backdrop-blur-sm">
          {(['INCOME', 'EXPENSE'] as const).map(tType => {
            const enumType = TransactionType[tType];
            return (
              <button 
                key={tType}
                onClick={() => setType(enumType)}
                className={`relative z-10 flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                  type === enumType 
                  ? (enumType === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600')
                  : 'text-slate-400'
                }`}
              >
                {t(enumType.toLowerCase())}
                {type === enumType && (
                  <div className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-100"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Details Selection */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase px-1 tracking-widest">{t('account')}</label>
              <select 
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 transition-all shadow-inner"
              >
                {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase px-1 tracking-widest">{t('currencies')}</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 transition-all shadow-inner"
                >
                  {selectedFund?.supportedCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase px-1 tracking-widest">{t('category')}</label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 transition-all shadow-inner"
                >
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase px-1 tracking-widest">{t('date')}</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Proof Upload Block */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('proof')}</label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => openPicker(true)}
                className="text-[8px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1"
              >
                <i className="fas fa-camera"></i> {t('camera')}
              </button>
              <button 
                onClick={() => openPicker(false)}
                className="text-[8px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1"
              >
                <i className="fas fa-images"></i> {t('gallery')}
              </button>
            </div>
          </div>
          
          {proofImage && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group animate-in zoom-in-95 duration-200">
              <img src={proofImage} alt="Proof preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button 
                  onClick={() => setProofImage(undefined)}
                  className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <i className="fas fa-trash-can text-sm"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSave}
          className={`w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all mt-2 text-white ${
            type === TransactionType.INCOME ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
          }`}
        >
          {`${t('save')} ${t(type.toLowerCase())}`}
        </button>
      </div>
    </div>
  );
};

export default AddEntry;
