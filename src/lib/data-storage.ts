import { DashboardData, Transaction, Category, Budget, SavingsGoal, UserPreferences } from './types';

const STORAGE_KEY = 'financial-dashboard-data';

const defaultPreferences: UserPreferences = {
  currency: 'USD',
  dateFormat: 'MM/dd/yyyy',
  theme: 'system',
  notifications: {
    budgetAlerts: true,
    goalReminders: true,
    monthlyReports: true,
  },
};

const defaultCategories: Category[] = [
  // Income categories
  { id: '1', name: 'Salary', type: 'income', color: '#10b981' },
  { id: '2', name: 'Freelance', type: 'income', color: '#059669' },
  { id: '3', name: 'Investments', type: 'income', color: '#047857' },
  { id: '4', name: 'Other Income', type: 'income', color: '#065f46' },
  
  // Expense categories
  { id: '5', name: 'Housing', type: 'expense', color: '#ef4444' },
  { id: '6', name: 'Food & Dining', type: 'expense', color: '#f97316' },
  { id: '7', name: 'Transportation', type: 'expense', color: '#eab308' },
  { id: '8', name: 'Healthcare', type: 'expense', color: '#8b5cf6' },
  { id: '9', name: 'Entertainment', type: 'expense', color: '#ec4899' },
  { id: '10', name: 'Shopping', type: 'expense', color: '#06b6d4' },
  { id: '11', name: 'Utilities', type: 'expense', color: '#84cc16' },
  { id: '12', name: 'Insurance', type: 'expense', color: '#f59e0b' },
  { id: '13', name: 'Education', type: 'expense', color: '#3b82f6' },
  { id: '14', name: 'Other Expenses', type: 'expense', color: '#6b7280' },
];

export const getStoredData = (): DashboardData => {
  if (typeof window === 'undefined') {
    return {
      transactions: [],
      categories: defaultCategories,
      budgets: [],
      savingsGoals: [],
      preferences: defaultPreferences,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: DashboardData = JSON.parse(stored);
      // Ensure we have default categories if none exist
      if (!data.categories || data.categories.length === 0) {
        data.categories = defaultCategories;
      }
      // Ensure preferences exist
      if (!data.preferences) {
        data.preferences = defaultPreferences;
      }
      return data;
    }
  } catch (error) {
    console.error('Error loading stored data:', error);
  }

  return {
    transactions: [],
    categories: defaultCategories,
    budgets: [],
    savingsGoals: [],
    preferences: defaultPreferences,
  };
};

export const saveData = (data: DashboardData): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>): void => {
  const data = getStoredData();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  data.transactions.push(newTransaction);
  saveData(data);
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
  const data = getStoredData();
  const index = data.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    data.transactions[index] = { ...data.transactions[index], ...updates };
    saveData(data);
  }
};

export const deleteTransaction = (id: string): void => {
  const data = getStoredData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
};

export const addBudget = (budget: Omit<Budget, 'id' | 'spent'>): void => {
  const data = getStoredData();
  const newBudget: Budget = {
    ...budget,
    id: Date.now().toString(),
    spent: 0,
  };
  data.budgets.push(newBudget);
  saveData(data);
};

export const updateBudget = (id: string, updates: Partial<Budget>): void => {
  const data = getStoredData();
  const index = data.budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    data.budgets[index] = { ...data.budgets[index], ...updates };
    saveData(data);
  }
};

export const deleteBudget = (id: string): void => {
  const data = getStoredData();
  data.budgets = data.budgets.filter(b => b.id !== id);
  saveData(data);
};

export const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>): void => {
  const data = getStoredData();
  const newGoal: SavingsGoal = {
    ...goal,
    id: Date.now().toString(),
  };
  data.savingsGoals.push(newGoal);
  saveData(data);
};

export const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>): void => {
  const data = getStoredData();
  const index = data.savingsGoals.findIndex(g => g.id === id);
  if (index !== -1) {
    data.savingsGoals[index] = { ...data.savingsGoals[index], ...updates };
    saveData(data);
  }
};

export const deleteSavingsGoal = (id: string): void => {
  const data = getStoredData();
  data.savingsGoals = data.savingsGoals.filter(g => g.id !== id);
  saveData(data);
};

export const addCategory = (category: Omit<Category, 'id'>): void => {
  const data = getStoredData();
  const newCategory: Category = {
    ...category,
    id: Date.now().toString(),
  };
  data.categories.push(newCategory);
  saveData(data);
};

export const updatePreferences = (preferences: Partial<UserPreferences>): void => {
  const data = getStoredData();
  data.preferences = { ...data.preferences, ...preferences };
  saveData(data);
};

export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const importData = (importedData: Partial<DashboardData>): void => {
  const currentData = getStoredData();
  const mergedData: DashboardData = {
    transactions: [...currentData.transactions, ...(importedData.transactions || [])],
    categories: importedData.categories || currentData.categories,
    budgets: [...currentData.budgets, ...(importedData.budgets || [])],
    savingsGoals: [...currentData.savingsGoals, ...(importedData.savingsGoals || [])],
    preferences: { ...currentData.preferences, ...(importedData.preferences || {}) },
  };
  saveData(mergedData);
};