'use client';

import { useState, useEffect } from 'react';
import { DashboardData, Transaction, Budget, SavingsGoal, Category } from '../lib/types';
import { 
  getStoredData, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  addBudget,
  updateBudget,
  deleteBudget,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addCategory
} from '../lib/data-storage';
import { calculateFinancialSummary } from '../lib/financial-utils';

export const useFinancialData = () => {
  const [data, setData] = useState<DashboardData>({
    transactions: [],
    categories: [],
    budgets: [],
    savingsGoals: [],
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/dd/yyyy',
      theme: 'system',
      notifications: {
        budgetAlerts: true,
        goalReminders: true,
        monthlyReports: true,
      },
    },
  });
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = getStoredData();
        setData(storedData);
      } catch (error) {
        console.error('Error loading financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate financial summary
  const financialSummary = calculateFinancialSummary(data.transactions);

  // Transaction operations
  const createTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    updateTransaction(id, updates);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  const removeTransaction = (id: string) => {
    deleteTransaction(id);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  // Budget operations
  const createBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    addBudget(budget);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  const editBudget = (id: string, updates: Partial<Budget>) => {
    updateBudget(id, updates);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  const removeBudget = (id: string) => {
    deleteBudget(id);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  // Savings goal operations
  const createSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    addSavingsGoal(goal);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  const editSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    updateSavingsGoal(id, updates);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  const removeSavingsGoal = (id: string) => {
    deleteSavingsGoal(id);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  // Category operations
  const createCategory = (category: Omit<Category, 'id'>) => {
    addCategory(category);
    const updatedData = getStoredData();
    setData(updatedData);
  };

  // Refresh data
  const refreshData = () => {
    const updatedData = getStoredData();
    setData(updatedData);
  };

  return {
    data,
    loading,
    financialSummary,
    // Transaction operations
    createTransaction,
    editTransaction,
    removeTransaction,
    // Budget operations
    createBudget,
    editBudget,
    removeBudget,
    // Savings goal operations
    createSavingsGoal,
    editSavingsGoal,
    removeSavingsGoal,
    // Category operations
    createCategory,
    // Utility
    refreshData,
  };
};