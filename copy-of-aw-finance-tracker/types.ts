
export type Currency = string;
export type Language = 'en' | 'bn' | 'es' | 'ar' | 'fr' | 'hi' | 'pt' | 'zh' | 'ja' | 'de' | 'ur' | 'dv' | 'ne' | 'si';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface Fund {
  id: string;
  name: string;
  supportedCurrencies: Currency[];
  isSystemDefault?: boolean;
  isCustom?: boolean; // True if added by user
}

export interface Balance {
  fundId: string;
  currency: Currency;
  amount: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: string;
  sourceFundId: string;
  targetFundId?: string; // Only for transfers
  targetCurrency?: Currency; // Only for transfers
  exchangeRate?: number; // Only for transfers
  date: string;
  note: string;
  isDeleted?: boolean;
  deletedAt?: string;
  isCommitment?: boolean; // For "Send to Bank" special feature
  proofImage?: string; // Base64 encoded image
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType.INCOME | TransactionType.EXPENSE;
  icon: string;
  isCustom?: boolean; // True if added by user
}

export interface ExchangeRates {
  [key: string]: number; // Last known rates (e.g., USD: 120, MVR: 8) in BDT
}
