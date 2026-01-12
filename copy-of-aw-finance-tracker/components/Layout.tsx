
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useFinance } from '../store/FinanceContext';
import { Language } from '../types';

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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { 
    privacyMode, 
    setPrivacyMode, 
    isSecurityEnabled, 
    authMethod, 
    authSecret, 
    isCloudEnabled, 
    isSyncing, 
    isSavingLocal,
    lastSyncTime,
    language,
    setLanguage,
    t
  } = useFinance();
  const [locked, setLocked] = useState(isSecurityEnabled);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeStatusInfo, setActiveStatusInfo] = useState<'cloud' | 'local' | null>(null);

  useEffect(() => {
    if (!isSecurityEnabled) {
      setLocked(false);
    }
  }, [isSecurityEnabled]);

  const handleUnlock = () => {
    if (authMethod === 'biometric') {
      setLocked(false);
    } else {
      if (inputValue === authSecret) {
        setLocked(false);
        setError(false);
      } else {
        setError(true);
        setInputValue('');
        setTimeout(() => setError(false), 500);
      }
    }
  };

  const handlePINKey = (num: string) => {
    if (inputValue.length < 4) {
      const next = inputValue + num;
      setInputValue(next);
      if (next.length === 4 && authMethod === 'pin') {
         if (next === authSecret) {
           setLocked(false);
           setInputValue('');
         } else {
           setError(true);
           setInputValue('');
           setTimeout(() => setError(false), 500);
         }
      }
    }
  };

  if (locked) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className={`w-20 h-20 bg-indigo-500/10 rounded-md flex items-center justify-center mb-6 border border-indigo-500/20 ${error ? 'animate-bounce border-rose-500/50' : 'animate-pulse'}`}>
          <i className={`fas ${authMethod === 'biometric' ? 'fa-fingerprint' : authMethod === 'pin' ? 'fa-th' : 'fa-lock'} text-4xl ${error ? 'text-rose-500' : 'text-indigo-500'}`}></i>
        </div>
        <h1 className="text-xl font-black text-white mb-2 tracking-tight uppercase">
          {authMethod === 'biometric' ? 'Fingerprint Required' : authMethod === 'pin' ? 'Enter PIN' : 'Enter Password'}
        </h1>
        <p className="text-slate-500 text-xs mb-10 font-medium uppercase tracking-widest">Authentication restricted</p>
        
        {authMethod === 'biometric' && (
          <button 
            onClick={handleUnlock}
            className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-md font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all text-[10px]"
          >
            Touch Sensor
          </button>
        )}

        {authMethod === 'pin' && (
          <div className="w-full max-w-[240px] space-y-6">
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full border-2 border-indigo-500/30 ${inputValue.length > i ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'C'].map((n, i) => (
                <button
                  key={i}
                  disabled={n === ''}
                  onClick={() => n === 'C' ? setInputValue('') : handlePINKey(n.toString())}
                  className={`h-12 w-12 rounded-md flex items-center justify-center font-black text-white border border-white/10 active:bg-white/10 transition-all ${n === '' ? 'opacity-0' : 'opacity-100'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {authMethod === 'password' && (
          <div className="w-full max-w-xs space-y-4">
            <input 
              type="password"
              placeholder="••••••••"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-md text-white text-center font-black focus:border-indigo-500 outline-none"
            />
            <button 
              onClick={handleUnlock}
              className="w-full bg-indigo-600 text-white py-4 rounded-md font-black uppercase tracking-widest text-[10px]"
            >
              Unlock App
            </button>
          </div>
        )}
      </div>
    );
  }

  const NavItem = ({ to, icon, labelKey }: { to: string, icon: string, labelKey: string }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`relative flex flex-col items-center gap-1 transition-all duration-200 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200 ${active ? 'bg-indigo-50 border border-indigo-100' : 'bg-transparent'}`}>
          <i className={`fas ${icon} ${active ? 'text-base' : 'text-sm'}`}></i>
        </div>
        <span className={`text-[7px] font-black uppercase tracking-[0.1em] transition-opacity ${active ? 'opacity-100' : 'opacity-50'}`}>{t(labelKey)}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 px-3 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-hidden">
          <Link to="/" className="group shrink-0">
            <h1 className="text-sm font-black text-slate-900 tracking-tighter transition-transform active:scale-95 uppercase">AW FINANCE</h1>
            <p className="text-[6px] text-slate-400 uppercase font-black tracking-[0.4em]">TRACKER PRO</p>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 mr-1">
            <button 
              onClick={() => setActiveStatusInfo('cloud')}
              className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all duration-300 active:scale-90 ${isSyncing ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}
            >
              {isCloudEnabled ? (isSyncing ? <i className="fab fa-google text-[10px] text-indigo-500 animate-bounce"></i> : <i className="fab fa-google text-[10px] text-emerald-500"></i>) : <i className="fab fa-google text-[10px] text-slate-300"></i>}
            </button>
            <button 
              onClick={() => setActiveStatusInfo('local')}
              className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all duration-300 active:scale-90 ${isSavingLocal ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}
            >
              {isSavingLocal ? <i className="fas fa-mobile-screen text-[10px] text-indigo-500 animate-pulse"></i> : <i className="fas fa-mobile-screen text-[10px] text-slate-400"></i>}
            </button>
          </div>

          <div className="w-[1px] h-4 bg-slate-200 mx-0.5"></div>

          <button 
            onClick={() => setShowLangMenu(true)}
            className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
          >
            <i className="fas fa-globe text-xs"></i>
          </button>

          <button 
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all border ${privacyMode ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
          >
            <i className={`fas ${privacyMode ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
          </button>
          <Link to="/settings" className="w-9 h-9 bg-slate-900 rounded-md flex items-center justify-center text-white shadow-md active:scale-90 transition-transform border border-slate-800">
            <i className="fas fa-cog text-xs"></i>
          </Link>
        </div>
      </header>

      {showLangMenu && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-xs bg-white rounded-lg shadow-2xl p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{t('language')}</h3>
              <button onClick={() => setShowLangMenu(false)} className="text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1 hide-scrollbar">
              {AVAILABLE_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-md border text-left transition-all ${language === lang.code ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-600'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang.name}</span>
                  {language === lang.code && <i className="fas fa-check-circle text-xs"></i>}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setShowLangMenu(false)}></div>
        </div>
      )}

      {activeStatusInfo && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-8 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-xs bg-white rounded-xl shadow-2xl p-8 space-y-6 border border-slate-200 relative">
            <button 
              onClick={() => setActiveStatusInfo(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${activeStatusInfo === 'cloud' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'}`}>
                <i className={`fas ${activeStatusInfo === 'cloud' ? 'fab fa-google text-2xl' : 'fa-mobile-screen text-2xl'}`}></i>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{activeStatusInfo === 'cloud' ? t('cloud_sync_title') : t('local_save_title')}</h3>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-block ${activeStatusInfo === 'cloud' ? (isCloudEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400') : 'bg-emerald-100 text-emerald-600'}`}>{activeStatusInfo === 'cloud' ? (isCloudEnabled ? 'Connected' : 'Disabled') : 'Active'}</div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{activeStatusInfo === 'cloud' ? t('cloud_sync_desc') : t('local_save_desc')}</p>
            </div>
            <button onClick={() => setActiveStatusInfo(null)} className="w-full py-4 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Understood</button>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setActiveStatusInfo(null)}></div>
        </div>
      )}

      <main className="animate-in fade-in slide-in-from-bottom-1 duration-300">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl px-4 py-2 flex items-center justify-between safe-area-inset-bottom">
          <NavItem to="/" icon="fa-gauge-high" labelKey="dashboard" />
          <NavItem to="/reports" icon="fa-chart-pie" labelKey="reports" />
          
          <Link to="/add" className="relative group mx-1">
            <div className="w-12 h-12 bg-slate-900 rounded-md flex items-center justify-center text-white shadow-xl group-active:scale-90 transition-all border-2 border-white">
              <i className="fas fa-plus text-base"></i>
            </div>
          </Link>

          <NavItem to="/transfers" icon="fa-arrow-right-arrow-left" labelKey="transfer" />
          <NavItem to="/trash" icon="fa-trash-can" labelKey="trash" />
        </div>
      </nav>
    </div>
  );
};

export default Layout;
