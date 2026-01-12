
import React, { useState, useEffect } from 'react';
import { useFinance, AuthMethod } from '../store/FinanceContext';
import { TransactionType, Currency, Language } from '../types';

const AVAILABLE_LANGUAGES: { code: Language, name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ur', name: 'اردو' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'dv', name: 'ދިވެހި' },
  { code: 'ne', name: 'नेपाली' },
  { code: 'si', name: 'සිංහල' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'de', name: 'Deutsch' }
];

const Settings: React.FC = () => {
  const { 
    transactions, balances, exchangeRates, importData, isCloudEnabled, setCloudEnabled, 
    lastSyncTime, performSync, userProfile, setUserProfile, categories, funds, availableCurrencies,
    language, setLanguage, t, addCategory, updateCategory, deleteCategory, addFund,
    updateFund, deleteFund, addCurrency, removeCurrency, isSecurityEnabled,
    setSecurityEnabled, authMethod, setAuthMethod, authSecret, setAuthSecret,
    isLoggedIn, login, logout
  } = useFinance();

  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'funds' | 'categories' | 'currencies' | 'language' | 'security' | 'data' | null>('funds');
  
  const [catForm, setCatForm] = useState<{ id?: string, name: string, type: TransactionType.INCOME | TransactionType.EXPENSE, icon: string } | null>(null);
  const [fundForm, setFundForm] = useState<{ id?: string, name: string, supportedCurrencies: Currency[] } | null>(null);
  const [newCurr, setNewCurr] = useState('');
  
  // Auth/Profile form state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // Security configuration state
  const [tempSecret, setTempSecret] = useState('');
  const [showSecretInput, setShowSecretInput] = useState(false);

  useEffect(() => {
    setTempSecret('');
    setShowSecretInput(false);
  }, [authMethod]);

  const exportToJson = () => {
    const data = {
      balances, transactions, exchangeRates, funds, categories, availableCurrencies, language,
      exportedAt: new Date().toISOString(), version: "1.2"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AW_Finance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm("Importing data will merge/overwrite current session. Proceed?")) {
          importData(data);
          alert("Import successful");
        }
      } catch (err) { alert("Invalid backup file"); }
    };
    reader.readAsText(file);
  };

  const handleManualSync = async () => {
    if (!isLoggedIn) return setShowAuthModal(true);
    setSyncing(true);
    await performSync();
    setSyncing(false);
  };

  const handleLoginSubmit = () => {
    if (!authForm.email) return alert("Please enter an email");
    login(authForm.email, authForm.password);
    setShowAuthModal(false);
  };

  const saveSecurity = () => {
    if ((authMethod === 'pin' || authMethod === 'password') && !tempSecret) {
      return alert(`Please enter a ${authMethod.toUpperCase()}`);
    }
    setAuthSecret(tempSecret);
    alert('Security settings saved successfully');
    setShowSecretInput(false);
  };

  const handleSaveFund = () => {
    if (!fundForm?.name || fundForm.supportedCurrencies.length === 0) return alert("Fill all fields");
    if (fundForm.id) updateFund(fundForm.id, fundForm);
    else addFund({ name: fundForm.name, supportedCurrencies: fundForm.supportedCurrencies });
    setFundForm(null);
  };

  const handleDeleteFund = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteFund(id);
    }
  };

  const handleSaveCategory = () => {
    if (!catForm?.name || !catForm.icon) return alert("Fill all fields");
    if (catForm.id) updateCategory(catForm.id, catForm);
    else addCategory({ name: catForm.name, type: catForm.type, icon: catForm.icon });
    setCatForm(null);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCategory(id);
    }
  };

  const handleAddCurrency = (code?: string) => {
    const val = code || newCurr;
    if (!val) return;
    addCurrency(val);
    if (!code) setNewCurr('');
  };

  return (
    <div className="px-6 py-6 pb-24 max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('settings')}</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure your experience</p>
      </header>

      {/* Profile & Cloud Section */}
      <section className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
                <img src={userProfile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest&backgroundColor=f8fafc"} alt="User" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{userProfile?.name || "Guest Account"}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{userProfile?.email || "Local data only"}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isLoggedIn ? (
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[8px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-all"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <i className={`fab fa-google text-xs ${isCloudEnabled && isLoggedIn ? 'text-indigo-500' : 'text-slate-300'}`}></i>
                  <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Automatic Cloud Backup</span>
               </div>
               <button 
                onClick={() => isLoggedIn ? setCloudEnabled(!isCloudEnabled) : setShowAuthModal(true)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isCloudEnabled && isLoggedIn ? 'bg-indigo-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isCloudEnabled && isLoggedIn ? 'left-5.5' : 'left-0.5'}`}></div>
              </button>
            </div>
            {isLoggedIn && (
               <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                  <div className="flex flex-col gap-0.5">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Sync Status</p>
                     <p className="text-[8px] font-bold text-slate-600">{lastSyncTime ? `Last: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Never synced'}</p>
                  </div>
                  <button 
                    onClick={handleManualSync}
                    disabled={syncing}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[8px] font-black uppercase transition-all ${syncing ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 active:scale-95'}`}
                  >
                    {syncing ? <i className="fas fa-rotate animate-spin"></i> : <i className="fas fa-cloud-arrow-up"></i>}
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto hide-scrollbar">
        {['funds', 'categories', 'currencies', 'language', 'security', 'data'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 px-5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'funds' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{t('funds')}</h3>
              <button onClick={() => setFundForm({ name: '', supportedCurrencies: [availableCurrencies[0] || 'BDT'] })} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">+ New Fund</button>
            </div>
            <div className="space-y-3">
              {funds.map(f => (
                <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100"><i className="fas fa-vault text-slate-300 text-xs"></i></div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase">{f.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{f.supportedCurrencies.join(' • ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFundForm({ id: f.id, name: f.name, supportedCurrencies: f.supportedCurrencies })} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 active:scale-90 transition-all"><i className="fas fa-edit text-[10px]"></i></button>
                    {!f.isSystemDefault && f.id !== 'f-1' && (
                      <button onClick={() => handleDeleteFund(f.id, f.name)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-400 border border-rose-100 active:scale-90 transition-all"><i className="fas fa-trash-can text-[10px]"></i></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'security' && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">App Lock</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Protect your data from unauthorized access</p>
                </div>
                <button 
                  onClick={() => setSecurityEnabled(!isSecurityEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isSecurityEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSecurityEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {isSecurityEnabled && (
                <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lock Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['biometric', 'pin', 'password'] as AuthMethod[]).map(method => (
                        <button
                          key={method}
                          onClick={() => setAuthMethod(method)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${authMethod === method ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                        >
                          <i className={`fas ${method === 'biometric' ? 'fa-fingerprint' : method === 'pin' ? 'fa-th' : 'fa-key'} text-lg`}></i>
                          <span className="text-[8px] font-black uppercase tracking-tighter">{method}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {(authMethod === 'pin' || authMethod === 'password') && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          {authMethod === 'pin' ? 'Set 4-Digit PIN' : 'Set Password'}
                        </label>
                        <div className="relative">
                          <input 
                            type={authMethod === 'pin' ? 'number' : 'text'}
                            maxLength={authMethod === 'pin' ? 4 : 32}
                            value={tempSecret}
                            onChange={e => setTempSecret(e.target.value)}
                            placeholder={authMethod === 'pin' ? '0000' : 'Your secret'}
                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-sm outline-none focus:border-indigo-500 transition-all"
                          />
                          <button 
                            onClick={saveSecurity}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest active:scale-95"
                          >
                            Update
                          </button>
                        </div>
                        <p className="text-[7px] font-bold text-slate-400 italic mt-1 px-1">
                          Current status: {authSecret ? 'Secret established' : 'No secret set yet'}
                        </p>
                      </div>
                    </div>
                  )}

                  {authMethod === 'biometric' && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <i className="fas fa-info-circle text-slate-300 mb-2"></i>
                      <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">
                        Uses your device's native fingerprint or face unlock system.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'language' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{t('language')}</h3>
            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${language === lang.code ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang.name}</span>
                  {language === lang.code && <i className="fas fa-check-circle text-sm"></i>}
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'currencies' && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{t('currencies')}</h3>
                <div className="flex gap-2">
                  <input type="text" maxLength={5} value={newCurr} onChange={e => setNewCurr(e.target.value.toUpperCase())} placeholder="USD" className="w-20 bg-white border border-slate-200 p-2.5 rounded-xl text-center text-[10px] font-black outline-none" />
                  <button onClick={() => handleAddCurrency()} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Add</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {availableCurrencies.map(curr => (
                  <div key={curr} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-800">{curr}</span>
                    <button onClick={() => { if (window.confirm(`Remove ${curr}?`)) removeCurrency(curr); }} className="w-6 h-6 rounded-lg bg-rose-50 text-rose-400"><i className="fas fa-times text-[8px]"></i></button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'categories' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{t('categories')}</h3>
              <button onClick={() => setCatForm({ name: '', type: TransactionType.EXPENSE, icon: 'fa-tag' })} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">+ New Cat</button>
            </div>
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${c.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                      <i className={`fas ${c.icon} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase">{c.name}</p>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${c.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>{t(c.type.toLowerCase())}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCatForm(c)} className="w-9 h-9 bg-slate-50 rounded-xl text-slate-400 border border-slate-100"><i className="fas fa-edit text-[10px]"></i></button>
                    <button onClick={() => handleDeleteCategory(c.id, c.name)} className="w-9 h-9 bg-rose-50 rounded-xl text-rose-400 border border-rose-100"><i className="fas fa-trash-can text-[10px]"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'data' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <button onClick={exportToJson} className="w-full bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500"><i className="fas fa-file-export"></i></div>
                <div className="text-left"><p className="text-xs font-black text-slate-800 uppercase tracking-tight">Export Backup</p><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Download .JSON file</p></div>
              </div>
              <i className="fas fa-chevron-right text-slate-200"></i>
            </button>
            <label className="w-full bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500"><i className="fas fa-file-import"></i></div>
                <div className="text-left"><p className="text-xs font-black text-slate-800 uppercase tracking-tight">Restore Data</p><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Upload .JSON file</p></div>
              </div>
              <i className="fas fa-chevron-right text-slate-200"></i>
            </label>
          </section>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 space-y-6 border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -z-10"></div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Cloud Account</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Connect to sync across devices</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={authForm.email} 
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 transition-all shadow-inner" 
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  value={authForm.password} 
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none focus:border-indigo-500 transition-all shadow-inner" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleLoginSubmit} 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
              >
                Continue to Cloud
              </button>
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund form modal */}
      {fundForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -z-10"></div>
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center">{fundForm.id ? 'Edit Fund' : 'New Fund'}</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fund Name</label>
                <input type="text" value={fundForm.name} onChange={e => setFundForm({ ...fundForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none shadow-inner" placeholder="e.g., Bank" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setFundForm(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-2xl active:scale-95 transition-all">{t('cancel')}</button>
              <button onClick={handleSaveFund} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-2xl shadow-lg active:scale-95 transition-all">{t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category form modal */}
      {catForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-200 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-3xl -z-10"></div>
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center">{catForm.id ? 'Edit Category' : 'New Category'}</h3>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl shadow-inner">
                 <button onClick={() => setCatForm({...catForm, type: TransactionType.INCOME})} className={`py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${catForm.type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>{t('income')}</button>
                 <button onClick={() => setCatForm({...catForm, type: TransactionType.EXPENSE})} className={`py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${catForm.type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>{t('expense')}</button>
               </div>
               <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                <input type="text" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xs outline-none shadow-inner" placeholder="e.g. Dining" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setCatForm(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-2xl active:scale-95 transition-all">{t('cancel')}</button>
              <button onClick={handleSaveCategory} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-2xl shadow-lg active:scale-95 transition-all">{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
