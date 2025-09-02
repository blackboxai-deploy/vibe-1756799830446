'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import SummaryCards from '@/components/dashboard/summary-cards';
import FinancialCharts from '@/components/charts/financial-charts';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { useFinancialData } from '@/hooks/use-financial-data';
import { initializeSampleData } from '@/data/sample-data';

export default function DashboardPage() {
  const { data, loading, financialSummary } = useFinancialData();

  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCards summary={financialSummary} loading={loading} />

        {/* Charts and Transactions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FinancialCharts transactions={data.transactions} />
          </div>
          <div>
            <RecentTransactions transactions={data.transactions} loading={loading} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Total Transactions
              </h3>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.transactions.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All time
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎯</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Active Goals
              </h3>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.savingsGoals.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              In progress
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📈</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Active Budgets
              </h3>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.budgets.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This month
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}