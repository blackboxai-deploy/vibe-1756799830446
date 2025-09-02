import { Transaction, FinancialSummary, MonthlyReport, ChartDataPoint, Budget } from './types';

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const calculateFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = transactions.reduce((sum, t) => 
    sum + (t.type === 'income' ? t.amount : -t.amount), 0
  );

  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    netWorth: totalBalance,
  };
};

export const getMonthlyReport = (transactions: Transaction[], month: number, year: number): MonthlyReport => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate category breakdown
  const categoryMap = new Map<string, number>();
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? amount / totalExpenses : 0,
  }));

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  return {
    month: monthNames[monthStart.getMonth()],
    year,
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    categoryBreakdown,
  };
};

export const getMonthlyTrend = (transactions: Transaction[], months = 12): ChartDataPoint[] => {
  const now = new Date();
  const trend: ChartDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    trend.push({
      name: `${monthNames[targetMonth.getMonth()]} ${targetMonth.getFullYear()}`,
      value: income - expenses,
      date: `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`,
    });
  }

  return trend;
};

export const getCategoryBreakdown = (transactions: Transaction[], type: 'income' | 'expense'): ChartDataPoint[] => {
  const categoryMap = new Map<string, number>();
  
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
};

export const calculateBudgetProgress = (budget: Budget): number => {
  if (budget.amount === 0) return 0;
  return Math.min(budget.spent / budget.amount, 1);
};

export const getBudgetStatus = (budget: Budget): 'safe' | 'warning' | 'danger' => {
  const progress = calculateBudgetProgress(budget);
  if (progress >= 1) return 'danger';
  if (progress >= 0.8) return 'warning';
  return 'safe';
};

export const generateFinancialInsights = (
  transactions: Transaction[], 
  budgets: Budget[]
): Array<{ type: 'warning' | 'tip' | 'achievement'; title: string; message: string; }> => {
  const insights = [];
  const summary = calculateFinancialSummary(transactions);

  // Savings rate insights
  if (summary.savingsRate > 0.2) {
    insights.push({
      type: 'achievement' as const,
      title: 'Great Savings Rate!',
      message: `You're saving ${formatPercentage(summary.savingsRate)} of your income this month. Keep it up!`,
    });
  } else if (summary.savingsRate < 0.1) {
    insights.push({
      type: 'warning' as const,
      title: 'Low Savings Rate',
      message: `You're only saving ${formatPercentage(summary.savingsRate)} of your income. Consider reducing expenses.`,
    });
  }

  // Budget warnings
  budgets.forEach(budget => {
    const status = getBudgetStatus(budget);
    if (status === 'danger') {
      insights.push({
        type: 'warning' as const,
        title: 'Budget Exceeded',
        message: `You've exceeded your ${budget.name} budget by ${formatCurrency(budget.spent - budget.amount)}.`,
      });
    } else if (status === 'warning') {
      insights.push({
        type: 'tip' as const,
        title: 'Budget Alert',
        message: `You're at ${formatPercentage(budget.spent / budget.amount)} of your ${budget.name} budget.`,
      });
    }
  });

  return insights.slice(0, 5); // Return top 5 insights
};

export const exportToCSV = (transactions: Transaction[]): string => {
  const headers = ['Date', 'Type', 'Amount', 'Category', 'Description'];
  const rows = transactions.map(t => {
    const date = new Date(t.date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return [
      formattedDate,
      t.type,
      t.amount.toString(),
      t.category,
      t.description,
    ];
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};