
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Fund, Transaction, Balance, Category, TransactionType, Currency, ExchangeRates, Language } from '../types';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export type AuthMethod = 'biometric' | 'pin' | 'password';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', reports: 'Reports', transfer: 'Transfer', trash: 'Trash', settings: 'Settings', calculator: 'Calculator',
    portfolio_summary: 'Portfolio Summary', unified_flow: 'Unified Balance Flow', available: 'Available',
    inflow: 'Inflow', outflow: 'Outflow', fund_accounts: 'Fund Accounts', latest_activity: 'Latest Activity',
    new_transaction: 'New Transaction', amount: 'Amount', memo: 'Memo', date: 'Date',
    category: 'Category', account: 'Account', save: 'Save', cancel: 'Cancel', income: 'Income',
    expense: 'Expense', language: 'Language', security: 'Security', data: 'Data',
    funds: 'Funds', categories: 'Categories', currencies: 'Currencies',
    cloud_sync_title: 'Cloud Sync',
    cloud_sync_desc: 'Your data is being backed up to your account. This allows you to access your financial records across different devices and prevents data loss.',
    local_save_title: 'Local Storage',
    local_save_desc: 'Data is saved directly on your device. This ensures the app works perfectly offline and provides instant loading times for your records.',
    edit_profile: 'Edit Profile', login: 'Login', logout: 'Logout', name: 'Name', email: 'Email',
    remittance_calc: 'Remittance Calc', sending_amount: 'Sending Amount', transfer_fee: 'Transfer Fee', exchange_rate: 'Exchange Rate', gov_bonus: 'Gov. Bonus (%)', total_receivable: 'Total Receivable',
    select_country: 'Select Country', country_rules: 'Fee Rules Applied',
    deduct_fee: 'Deduct fee from amount', add_fee: 'Pay fee separately', total_to_pay: 'Total to Pay', net_sending: 'Net Sending'
  },
  // ... (keeping other languages as provided in the source)
  bn: { dashboard: 'ড্যাশবোর্ড', reports: 'রিপোর্ট', transfer: 'ট্রান্সফার', trash: 'ট্র্যাশ', settings: 'সেটিংস', calculator: 'ক্যালকুলেটর', portfolio_summary: 'পোর্টফোলিও সারাংশ', unified_flow: 'ব্যালেন্স প্রবাহ', available: 'উপলব্ধ', inflow: 'আয়', outflow: 'ব্যয়', fund_accounts: 'ফান্ড অ্যাকাউন্ট', latest_activity: 'সাম্প্রতিক কার্যক্রম', new_transaction: 'নতুন লেনদেন', amount: 'পরিমাণ', memo: 'নোট', date: 'তারিখ', category: 'বিভাগ', account: 'অ্যাকাউন্ট', save: 'সংরক্ষণ', cancel: 'বাতিল', income: 'আয়', expense: 'ব্যয়', language: 'ভাষা', security: 'নিরাপত্তা', data: 'ডেটা', funds: 'তহবিল', categories: 'বিভাগসমূহ', currencies: 'মুদ্রা', cloud_sync_title: 'ক্লাউড সিঙ্ক', cloud_sync_desc: 'আপনার ডেটা অ্যাকাউন্টে ব্যাকআপ করা হচ্ছে।', local_save_title: 'লোকাল স্টোরেজ', local_save_desc: 'ডেটা সরাসরি আপনার ডিভাইসে সেভ করা হয়।', edit_profile: 'প্রোফাইল সম্পাদনা', login: 'লগইন', logout: 'লগআউট', name: 'নাম', email: 'ইমেইল', remittance_calc: 'রেমিট্যান্স ক্যালক', sending_amount: 'প্রেরিত পরিমাণ', transfer_fee: 'ট্রান্সফার ফি', exchange_rate: 'এক্সচেঞ্জ রেট', gov_bonus: 'সরকারি বোনাস (%)', total_receivable: 'মোট প্রাপ্তব্য', select_country: 'দেশ নির্বাচন করুন', country_rules: 'ফি নিয়ম প্রযোজ্য', deduct_fee: 'পরিমাণ থেকে ফি কাটুন', add_fee: 'আলাদাভাবে ফি দিন', total_to_pay: 'মোট প্রদেয়', net_sending: 'নিট পাঠানো' },
} as any;

interface FinanceState {
  funds: Fund[];
  balances: Balance[];
  transactions: Transaction[];
  categories: Category[];
  availableCurrencies: Currency[];
  exchangeRates: ExchangeRates;
  privacyMode: boolean;
  language: Language;
  isCloudEnabled: boolean;
  isSyncing: boolean;
  isSavingLocal: boolean;
  lastSyncTime: string | null;
  userProfile: UserProfile | null;
  isSecurityEnabled: boolean;
  authMethod: AuthMethod;
  authSecret: string;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => void;
  logout: () => void;
  setUserProfile: (profile: Omit<UserProfile, 'avatar'>) => void;
  setSecurityEnabled: (enabled: boolean) => void;
  setAuthMethod: (method: AuthMethod) => void;
  setAuthSecret: (secret: string) => void;
  setPrivacyMode: (mode: boolean) => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  setCloudEnabled: (enabled: boolean) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  restoreTransaction: (id: string) => void;
  permanentlyDeleteTransaction: (id: string) => void;
  clearTrash: () => void;
  getFundBalance: (fundId: string, currency: Currency) => number;
  getTotalBalanceInCurrency: (targetCurrency: Currency) => number;
  getSumByCurrency: (currency: Currency) => number;
  importData: (data: any) => void;
  performSync: () => Promise<void>;
  addCategory: (cat: Omit<Category, 'id' | 'isCustom'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addFund: (fund: Omit<Fund, 'id' | 'isCustom'>) => void;
  updateFund: (id: string, fund: Partial<Fund>) => void;
  deleteFund: (id: string) => void;
  addCurrency: (currency: Currency) => void;
  removeCurrency: (currency: Currency) => void;
}

const FinanceContext = createContext<FinanceState | undefined>(undefined);

const INITIAL_FUNDS: Fund[] = [
  { id: 'f-1', name: 'Cash', supportedCurrencies: ['BDT', 'USD', 'MVR'], isSystemDefault: true, isCustom: false },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-inc-1', name: 'Salary', type: TransactionType.INCOME, icon: 'fa-money-check-dollar', isCustom: false },
  { id: 'cat-inc-2', name: 'Freelance', type: TransactionType.INCOME, icon: 'fa-laptop-code', isCustom: false },
  { id: 'cat-inc-3', name: 'Personal income', type: TransactionType.INCOME, icon: 'fa-hand-holding-dollar', isCustom: false },
  { id: 'cat-inc-4', name: 'Others', type: TransactionType.INCOME, icon: 'fa-circle-plus', isCustom: false },
  { id: 'cat-exp-1', name: 'Food', type: TransactionType.EXPENSE, icon: 'fa-bowl-food', isCustom: false },
  { id: 'cat-exp-2', name: 'Daily usage things', type: TransactionType.EXPENSE, icon: 'fa-basket-shopping', isCustom: false },
  { id: 'cat-exp-3', name: 'Personal expenses', type: TransactionType.EXPENSE, icon: 'fa-user-tag', isCustom: false },
  { id: 'cat-exp-4', name: 'Family Maintenance', type: TransactionType.EXPENSE, icon: 'fa-house-chimney-user', isCustom: false },
  { id: 'cat-exp-7', name: 'Others', type: TransactionType.EXPENSE, icon: 'fa-receipt', isCustom: false },
];

const DEFAULT_CURRENCIES: Currency[] = ['BDT', 'USD', 'MVR', 'EUR'];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('aw_logged_in') === 'true');
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('aw_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const storageSuffix = userProfile ? `_${userProfile.email}` : '_guest';

  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUNDS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ USD: 110, MVR: 7.14, EUR: 120, BDT: 1 });
  
  const [privacyMode, setPrivacyMode] = useState(false);
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('aw_language') as Language) || 'en');
  const [isCloudEnabled, setCloudEnabled] = useState(() => localStorage.getItem('aw_cloud_enabled') === 'true');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem(`aw_last_sync${storageSuffix}`));

  const [isSecurityEnabled, setSecurityEnabled] = useState(() => localStorage.getItem('aw_security_enabled') === 'true');
  const [authMethod, setAuthMethod] = useState<AuthMethod>(() => (localStorage.getItem('aw_auth_method') as AuthMethod) || 'biometric');
  const [authSecret, setAuthSecret] = useState(() => localStorage.getItem('aw_auth_secret') || '');

  const syncTimeoutRef = useRef<number | null>(null);

  const t = useCallback((key: string) => {
    const langSet = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return langSet[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  const setUserProfile = useCallback((profile: Omit<UserProfile, 'avatar'>) => {
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.email)}`;
    const fullProfile = { ...profile, avatar };
    setUserProfileState(fullProfile);
    localStorage.setItem('aw_user_profile', JSON.stringify(fullProfile));
  }, []);

  const login = useCallback((email: string, password?: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('aw_logged_in', 'true');
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
    const profile = { name: email.split('@')[0], email, avatar };
    setUserProfileState(profile);
    localStorage.setItem('aw_user_profile', JSON.stringify(profile));
    // Data will automatically pivot via storageSuffix on next effect cycle
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserProfileState(null);
    localStorage.setItem('aw_logged_in', 'false');
    localStorage.removeItem('aw_user_profile');
  }, []);

  const loadUserData = useCallback(() => {
    const currentSuffix = userProfile ? `_${userProfile.email}` : '_guest';
    const savedBalances = localStorage.getItem(`aw_balances${currentSuffix}`);
    const savedTransactions = localStorage.getItem(`aw_transactions${currentSuffix}`);
    const savedRates = localStorage.getItem(`aw_rates${currentSuffix}`);
    const savedFunds = localStorage.getItem(`aw_funds${currentSuffix}`);
    const savedCategories = localStorage.getItem(`aw_categories${currentSuffix}`);
    const savedCurrencies = localStorage.getItem(`aw_currencies${currentSuffix}`);
    
    if (savedBalances) setBalances(JSON.parse(savedBalances)); else setBalances([]);
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions)); else setTransactions([]);
    if (savedRates) setExchangeRates(JSON.parse(savedRates)); else setExchangeRates({ USD: 110, MVR: 7.14, EUR: 120, BDT: 1 });
    if (savedFunds) setFunds(JSON.parse(savedFunds)); else setFunds(INITIAL_FUNDS);
    if (savedCategories) setCategories(JSON.parse(savedCategories)); else setCategories(INITIAL_CATEGORIES);
    if (savedCurrencies) setAvailableCurrencies(JSON.parse(savedCurrencies)); else setAvailableCurrencies(DEFAULT_CURRENCIES);
  }, [userProfile]);

  useEffect(() => {
    loadUserData();
  }, [userProfile, loadUserData]);

  useEffect(() => {
    setIsSavingLocal(true);
    const currentSuffix = userProfile ? `_${userProfile.email}` : '_guest';
    localStorage.setItem(`aw_balances${currentSuffix}`, JSON.stringify(balances));
    localStorage.setItem(`aw_transactions${currentSuffix}`, JSON.stringify(transactions));
    localStorage.setItem(`aw_rates${currentSuffix}`, JSON.stringify(exchangeRates));
    localStorage.setItem(`aw_funds${currentSuffix}`, JSON.stringify(funds));
    localStorage.setItem(`aw_categories${currentSuffix}`, JSON.stringify(categories));
    localStorage.setItem(`aw_currencies${currentSuffix}`, JSON.stringify(availableCurrencies));
    
    localStorage.setItem('aw_language', language);
    localStorage.setItem('aw_cloud_enabled', String(isCloudEnabled));
    localStorage.setItem('aw_security_enabled', String(isSecurityEnabled));
    localStorage.setItem('aw_auth_method', authMethod);
    localStorage.setItem('aw_auth_secret', authSecret);
    
    const timer = setTimeout(() => setIsSavingLocal(false), 800);

    if (isCloudEnabled && isLoggedIn) {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = window.setTimeout(() => {
        performSync();
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [balances, transactions, exchangeRates, funds, categories, availableCurrencies, language, isCloudEnabled, isSecurityEnabled, authMethod, authSecret, isLoggedIn, userProfile]);

  const performSync = useCallback(async () => {
    if (!isCloudEnabled || !isLoggedIn || !userProfile) return;
    setIsSyncing(true);
    const backup = { balances, transactions, exchangeRates, funds, categories, availableCurrencies, language };
    // Simulate real cloud sync with a slightly longer delay and logging
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString();
        const currentSuffix = `_${userProfile.email}`;
        localStorage.setItem(`aw_cloud_backup${currentSuffix}`, JSON.stringify(backup));
        setLastSyncTime(now);
        localStorage.setItem(`aw_last_sync${currentSuffix}`, now);
        setIsSyncing(false);
        resolve();
      }, 1500);
    });
  }, [balances, transactions, exchangeRates, funds, categories, availableCurrencies, language, isCloudEnabled, isLoggedIn, userProfile]);

  const updateBalance = useCallback((fundId: string, currency: Currency, delta: number) => {
    setBalances(prev => {
      const existingIdx = prev.findIndex(b => b.fundId === fundId && b.currency === currency);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], amount: next[existingIdx].amount + delta };
        return next;
      }
      return [...prev, { fundId, currency, amount: delta }];
    });
  }, []);

  const addTransaction = useCallback((txData: Omit<Transaction, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTx: Transaction = { ...txData, id: newId };
    setTransactions(prev => [newTx, ...prev]);
    if (newTx.type === TransactionType.INCOME) {
      updateBalance(newTx.sourceFundId, newTx.currency, newTx.amount);
    } else if (newTx.type === TransactionType.EXPENSE) {
      updateBalance(newTx.sourceFundId, newTx.currency, -newTx.amount);
    } else if (newTx.type === TransactionType.TRANSFER) {
      updateBalance(newTx.sourceFundId, newTx.currency, -newTx.amount);
      if (newTx.targetFundId && newTx.targetCurrency && newTx.exchangeRate) {
        updateBalance(newTx.targetFundId, newTx.targetCurrency, newTx.amount * newTx.exchangeRate);
      }
    }
  }, [updateBalance]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      const tx = prev[idx];
      if (tx.type === TransactionType.INCOME) updateBalance(tx.sourceFundId, tx.currency, -tx.amount);
      else if (tx.type === TransactionType.EXPENSE) updateBalance(tx.sourceFundId, tx.currency, tx.amount);
      else if (tx.type === TransactionType.TRANSFER) {
        updateBalance(tx.sourceFundId, tx.currency, tx.amount);
        if (tx.targetFundId && tx.targetCurrency && tx.exchangeRate) {
          updateBalance(tx.targetFundId, tx.targetCurrency, -(tx.amount * tx.exchangeRate));
        }
      }
      const next = [...prev];
      next[idx] = { ...tx, isDeleted: true, deletedAt: new Date().toISOString() };
      return next;
    });
  }, [updateBalance]);

  const restoreTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      const tx = prev[idx];
      if (tx.type === TransactionType.INCOME) updateBalance(tx.sourceFundId, tx.currency, tx.amount);
      else if (tx.type === TransactionType.EXPENSE) updateBalance(tx.sourceFundId, tx.currency, -tx.amount);
      else if (tx.type === TransactionType.TRANSFER) {
        updateBalance(tx.sourceFundId, tx.currency, -tx.amount);
        if (tx.targetFundId && tx.targetCurrency && tx.exchangeRate) {
          updateBalance(tx.targetFundId, tx.targetCurrency, tx.amount * tx.exchangeRate);
        }
      }
      const next = [...prev];
      next[idx] = { ...tx, isDeleted: false, deletedAt: undefined };
      return next;
    });
  }, [updateBalance]);

  const permanentlyDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearTrash = useCallback(() => {
    setTransactions(prev => prev.filter(t => !t.isDeleted));
  }, []);

  const addCategory = useCallback((cat: Omit<Category, 'id' | 'isCustom'>) => {
    setCategories(prev => [...prev, { ...cat, id: `c-${Math.random().toString(36).substr(2, 5)}`, isCustom: true }]);
  }, []);

  const updateCategory = useCallback((id: string, catUpdate: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...catUpdate } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addFund = useCallback((fund: Omit<Fund, 'id' | 'isCustom'>) => {
    setFunds(prev => [...prev, { ...fund, id: `f-${Math.random().toString(36).substr(2, 5)}`, isCustom: true }]);
  }, []);

  const updateFund = useCallback((id: string, fundUpdate: Partial<Fund>) => {
    setFunds(prev => prev.map(f => f.id === id ? { ...f, ...fundUpdate } : f));
  }, []);

  const deleteFund = useCallback((id: string) => {
    setFunds(prev => {
      const fund = prev.find(f => f.id === id);
      if (fund?.isSystemDefault || fund?.id === 'f-1') return prev;
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const addCurrency = useCallback((currency: Currency) => {
    const clean = currency.toUpperCase().trim();
    if (!clean || clean.length < 2) return;
    setAvailableCurrencies(prev => prev.includes(clean) ? prev : [...prev, clean]);
  }, []);

  const removeCurrency = useCallback((currency: Currency) => {
    setAvailableCurrencies(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(c => c !== currency);
    });
  }, []);

  const getFundBalance = (fundId: string, currency: Currency) => balances.find(b => b.fundId === fundId && b.currency === currency)?.amount || 0;
  
  const getTotalBalanceInCurrency = (targetCurrency: Currency) => {
    const rateToTarget = exchangeRates[targetCurrency] || 1;
    const totalInBDT = balances.reduce((sum, b) => sum + (b.amount * (exchangeRates[b.currency] || 1)), 0);
    return targetCurrency === 'BDT' ? totalInBDT : totalInBDT / rateToTarget;
  };

  const getSumByCurrency = useCallback((currency: Currency) => balances.filter(b => b.currency === currency).reduce((sum, b) => sum + b.amount, 0), [balances]);

  const importData = useCallback((data: any) => {
    if (data.balances) setBalances(data.balances);
    if (data.transactions) setTransactions(data.transactions);
    if (data.exchangeRates) setExchangeRates(data.exchangeRates);
    if (data.funds) setFunds(data.funds);
    if (data.categories) setCategories(data.categories);
    if (data.availableCurrencies) setAvailableCurrencies(data.availableCurrencies);
    if (data.language) setLanguage(data.language);
  }, []);

  return (
    <FinanceContext.Provider value={{
      funds, balances, transactions, categories, availableCurrencies, exchangeRates, privacyMode, language, isCloudEnabled, isSyncing, isSavingLocal, lastSyncTime, userProfile,
      isSecurityEnabled, authMethod, authSecret, isLoggedIn, login, logout,
      setUserProfile, setSecurityEnabled, setAuthMethod, setAuthSecret,
      setPrivacyMode, setLanguage, t, setCloudEnabled, addTransaction, deleteTransaction, restoreTransaction, permanentlyDeleteTransaction, clearTrash,
      getFundBalance, getTotalBalanceInCurrency, getSumByCurrency, importData, performSync,
      addCategory, updateCategory, deleteCategory, addFund, updateFund, deleteFund,
      addCurrency, removeCurrency
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
