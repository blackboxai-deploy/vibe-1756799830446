'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useFinancialData } from '@/hooks/use-financial-data';
import { 
  formatCurrency, 
  getMonthlyReport, 
  getMonthlyTrend, 
  getCategoryBreakdown,
  generateFinancialInsights,
  exportToCSV
} from '@/lib/financial-utils';
import { useState } from 'react';

export default function ReportsPage() {
  const { data } = useFinancialData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentMonthReport = getMonthlyReport(data.transactions, selectedMonth, selectedYear);
  const monthlyTrend = getMonthlyTrend(data.transactions, 12);
  const insights = generateFinancialInsights(data.transactions, data.budgets);

  const handleExport = () => {
    const csvData = exportToCSV(data.transactions);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - i
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'value' ? 'Net' : entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Detailed insights into your financial data
            </p>
          </div>
          
          <Button onClick={handleExport} variant="outline">
            <span className="mr-2">📊</span>
            Export Data
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Income vs Expenses Trend */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    Income vs Expenses (12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="name" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
                      <span className="font-semibold">{data.transactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Active Budgets</span>
                      <span className="font-semibold">{data.budgets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Savings Goals</span>
                      <span className="font-semibold">{data.savingsGoals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Categories Used</span>
                      <span className="font-semibold">
                        {new Set(data.transactions.map(t => t.category)).size}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🏷️</span>
                    Top Expense Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getCategoryBreakdown(data.transactions, 'expense')
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)
                      .map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="font-semibold text-sm">
                            {formatCurrency(category.value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monthly Report Tab */}
          <TabsContent value="monthly">
            <div className="space-y-6">
              {/* Month/Year Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Report Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Select 
                      value={selectedMonth.toString()} 
                      onValueChange={(value) => setSelectedMonth(parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={selectedYear.toString()}
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <span className="text-xl">💰</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(currentMonthReport.totalIncome)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <span className="text-xl">💸</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(currentMonthReport.totalExpenses)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                    <span className="text-xl">🎯</span>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      currentMonthReport.netSavings >= 0 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(currentMonthReport.netSavings)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Category Breakdown - {monthNames[selectedMonth]} {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentMonthReport.categoryBreakdown
                      .sort((a, b) => b.amount - a.amount)
                      .map((category) => (
                        <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{category.category}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {(category.percentage * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold ml-4">
                            {formatCurrency(category.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Monthly Savings Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="name" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="value" 
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    Financial Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🤔</div>
                      <p className="text-gray-500 dark:text-gray-400">
                        No insights available yet. Add more transactions to get personalized recommendations!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {insights.map((insight, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            insight.type === 'achievement'
                              ? 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500'
                              : insight.type === 'warning'
                              ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500'
                              : 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">
                              {insight.type === 'achievement' ? '🎉' : 
                               insight.type === 'warning' ? '⚠️' : '💡'}
                            </span>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {insight.title}
                              </h3>
                              <p className="text-gray-700 dark:text-gray-300 mt-1">
                                {insight.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}