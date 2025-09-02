export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'yearly';
    nextDate: Date;
  };
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  netWorth: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement';
  title: string;
  message: string;
  actionable?: boolean;
  action?: string;
}

export interface UserPreferences {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    monthlyReports: boolean;
  };
}

export interface DashboardData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  preferences: UserPreferences;
}