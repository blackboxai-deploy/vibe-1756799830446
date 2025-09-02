'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useFinancialData } from '@/hooks/use-financial-data';
import { formatCurrency, calculateBudgetProgress, getBudgetStatus } from '@/lib/financial-utils';

export default function BudgetsPage() {
  const { data, createBudget, removeBudget } = useFinancialData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for new budget
  const [newBudget, setNewBudget] = useState({
    name: '',
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly',
  });

  // Calculate spent amount for each budget based on transactions
  const budgetsWithSpending = data.budgets.map(budget => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const spent = data.transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'expense' &&
               transaction.category === budget.name &&
               transactionDate >= monthStart &&
               transactionDate <= monthEnd;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { ...budget, spent };
  });

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget.name || !newBudget.amount) {
      return;
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    createBudget({
      name: newBudget.name,
      categoryId: newBudget.categoryId || '1',
      amount: parseFloat(newBudget.amount),
      period: newBudget.period,
      startDate,
      endDate,
    });

    // Reset form
    setNewBudget({
      name: '',
      categoryId: '',
      amount: '',
      period: 'monthly',
    });
    
    setIsAddDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return '✅';
      case 'warning': return '⚠️';
      case 'danger': return '🚨';
      default: return '📊';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Budgets
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your spending limits and stay on budget
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <span className="mr-2">➕</span>
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBudget} className="space-y-4">
                <div>
                  <Label htmlFor="name">Budget Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Food & Dining"
                    value={newBudget.name}
                    onChange={(e) => 
                      setNewBudget(prev => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newBudget.amount}
                      onChange={(e) => 
                        setNewBudget(prev => ({ ...prev, amount: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select 
                      value={newBudget.period}
                      onValueChange={(value: 'monthly' | 'yearly') => 
                        setNewBudget(prev => ({ ...prev, period: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Budget</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budget Overview Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
              <span className="text-xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.budgets.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
              <span className="text-xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <span className="text-xl">💸</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budgets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetsWithSpending.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No budgets created yet
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  Create Your First Budget
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {budgetsWithSpending.map((budget) => {
                  const progress = calculateBudgetProgress(budget);
                  const status = getBudgetStatus(budget);
                  
                  return (
                    <div
                      key={budget.id}
                      className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getStatusIcon(status)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {budget.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {budget.period === 'monthly' ? 'Monthly' : 'Yearly'} budget
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(budget.amount - budget.spent)} remaining
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBudget(budget.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">
                            {(progress * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={progress * 100} 
                          className="h-2"
                        />
                        {status === 'warning' && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            ⚠️ Approaching budget limit
                          </p>
                        )}
                        {status === 'danger' && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            🚨 Budget exceeded by {formatCurrency(budget.spent - budget.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}