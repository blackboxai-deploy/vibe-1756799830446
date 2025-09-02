import { Transaction, Budget, SavingsGoal } from '../lib/types';

// Generate sample transactions for the last 3 months
const generateSampleTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Sample income transactions
  const incomeTransactions = [
    { amount: 5500, category: 'Salary', description: 'Monthly Salary' },
    { amount: 1200, category: 'Freelance', description: 'Web Development Project' },
    { amount: 300, category: 'Investments', description: 'Stock Dividends' },
  ];

  // Sample expense transactions
  const expenseTransactions = [
    { amount: 1200, category: 'Housing', description: 'Monthly Rent' },
    { amount: 400, category: 'Food & Dining', description: 'Groceries' },
    { amount: 150, category: 'Food & Dining', description: 'Restaurant' },
    { amount: 250, category: 'Transportation', description: 'Car Payment' },
    { amount: 80, category: 'Transportation', description: 'Gas' },
    { amount: 200, category: 'Utilities', description: 'Electricity & Internet' },
    { amount: 120, category: 'Healthcare', description: 'Health Insurance' },
    { amount: 300, category: 'Entertainment', description: 'Streaming & Movies' },
    { amount: 180, category: 'Shopping', description: 'Clothing' },
    { amount: 90, category: 'Other Expenses', description: 'Miscellaneous' },
  ];

  // Generate transactions for the last 3 months
  for (let month = 0; month < 3; month++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 15);
    
    // Add income transactions
    incomeTransactions.forEach((income, index) => {
      transactions.push({
        id: `income-${month}-${index}`,
        type: 'income',
        amount: income.amount + (Math.random() * 200 - 100), // Add some variation
        category: income.category,
        description: income.description,
        date: new Date(monthDate.getTime() + (index * 24 * 60 * 60 * 1000)),
      });
    });

    // Add expense transactions throughout the month
    expenseTransactions.forEach((expense, index) => {
      const dayOffset = Math.floor(Math.random() * 28) + 1;
      transactions.push({
        id: `expense-${month}-${index}`,
        type: 'expense',
        amount: expense.amount + (Math.random() * 50 - 25), // Add some variation
        category: expense.category,
        description: expense.description,
        date: new Date(now.getFullYear(), now.getMonth() - month, dayOffset),
      });
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateSampleBudgets = (): Budget[] => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return [
    {
      id: 'budget-1',
      categoryId: '6', // Food & Dining
      name: 'Food & Dining',
      amount: 600,
      spent: 420,
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
    },
    {
      id: 'budget-2',
      categoryId: '7', // Transportation
      name: 'Transportation',
      amount: 400,
      spent: 330,
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
    },
    {
      id: 'budget-3',
      categoryId: '9', // Entertainment
      name: 'Entertainment',
      amount: 200,
      spent: 180,
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
    },
    {
      id: 'budget-4',
      categoryId: '10', // Shopping
      name: 'Shopping',
      amount: 300,
      spent: 220,
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
    },
  ];
};

const generateSampleSavingsGoals = (): SavingsGoal[] => {
  const now = new Date();
  
  return [
    {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6500,
      targetDate: new Date(now.getFullYear() + 1, 5, 1),
      priority: 'high',
      description: '6 months of expenses for financial security',
    },
    {
      id: 'goal-2',
      name: 'Vacation to Europe',
      targetAmount: 3500,
      currentAmount: 1800,
      targetDate: new Date(now.getFullYear(), 8, 15),
      priority: 'medium',
      description: 'Two-week trip to Italy and France',
    },
    {
      id: 'goal-3',
      name: 'New Laptop',
      targetAmount: 2000,
      currentAmount: 800,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      priority: 'low',
      description: 'MacBook Pro for work and personal projects',
    },
    {
      id: 'goal-4',
      name: 'Home Down Payment',
      targetAmount: 50000,
      currentAmount: 15000,
      targetDate: new Date(now.getFullYear() + 2, 0, 1),
      priority: 'high',
      description: '20% down payment for first home purchase',
    },
  ];
};

export const sampleData = {
  transactions: generateSampleTransactions(),
  budgets: generateSampleBudgets(),
  savingsGoals: generateSampleSavingsGoals(),
};

export const initializeSampleData = async () => {
  if (typeof window !== 'undefined') {
    const existingData = localStorage.getItem('financial-dashboard-data');
    if (!existingData) {
      const { getStoredData, saveData } = await import('../lib/data-storage');
      const currentData = getStoredData();
      
      const updatedData = {
        ...currentData,
        transactions: sampleData.transactions,
        budgets: sampleData.budgets,
        savingsGoals: sampleData.savingsGoals,
      };
      
      saveData(updatedData);
    }
  }
};