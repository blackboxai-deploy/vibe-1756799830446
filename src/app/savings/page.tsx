'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFinancialData } from '@/hooks/use-financial-data';
import { formatCurrency } from '@/lib/financial-utils';

export default function SavingsPage() {
  const { data, createSavingsGoal, removeSavingsGoal, editSavingsGoal } = useFinancialData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  // Form state for new savings goal
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: '',
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
      return;
    }

    createSavingsGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      targetDate: new Date(newGoal.targetDate),
      priority: newGoal.priority,
      description: newGoal.description,
    });

    // Reset form
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      priority: 'medium',
      description: '',
    });
    
    setIsAddDialogOpen(false);
  };

  const handleAddMoney = (goalId: string) => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      const goal = data.savingsGoals.find(g => g.id === goalId);
      if (goal) {
        editSavingsGoal(goalId, {
          currentAmount: goal.currentAmount + amount
        });
      }
      setAddAmount('');
      setSelectedGoal(null);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const totalSavings = data.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTargets = data.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTargets > 0 ? (totalSavings / totalTargets) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Savings Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your progress towards financial goals
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <span className="mr-2">🎯</span>
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Savings Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Emergency Fund"
                    value={newGoal.name}
                    onChange={(e) => 
                      setNewGoal(prev => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      placeholder="10000.00"
                      value={newGoal.targetAmount}
                      onChange={(e) => 
                        setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentAmount">Current Amount</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newGoal.currentAmount}
                      onChange={(e) => 
                        setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => 
                        setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newGoal.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setNewGoal(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your goal..."
                    value={newGoal.description}
                    onChange={(e) => 
                      setNewGoal(prev => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Goal</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <span className="text-xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.savingsGoals.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <span className="text-xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSavings)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Target</CardTitle>
              <span className="text-xl">🏆</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalTargets)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <span className="text-xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Goals List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Savings Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {data.savingsGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No savings goals yet
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  Create Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.savingsGoals
                  .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                  .map((goal) => {
                    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                    const daysRemaining = getDaysRemaining(goal.targetDate);
                    const isOverdue = daysRemaining < 0;
                    
                    return (
                      <div
                        key={goal.id}
                        className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl">{getPriorityIcon(goal.priority)}</span>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {goal.name}
                              </h3>
                              <Badge className={getPriorityColor(goal.priority)}>
                                {goal.priority} priority
                              </Badge>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {goal.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>
                                {isOverdue ? '⏰ Overdue' : `📅 ${daysRemaining} days left`}
                              </span>
                              <span>
                                🎯 {formatCurrency(goal.targetAmount - goal.currentAmount)} to go
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  💰 Add Money
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Money to {goal.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Amount to Add</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="100.00"
                                      value={selectedGoal === goal.id ? addAmount : ''}
                                      onChange={(e) => {
                                        setAddAmount(e.target.value);
                                        setSelectedGoal(goal.id);
                                      }}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedGoal(null);
                                        setAddAmount('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={() => handleAddMoney(goal.id)}>
                                      Add Money
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSavingsGoal(goal.id)}
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Progress: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                            </span>
                            <span className="text-sm font-medium">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          {progress >= 100 && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              🎉 Goal achieved! Congratulations!
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