'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/financial-utils';
import { FinancialSummary } from '@/lib/types';

interface SummaryCardsProps {
  summary: FinancialSummary;
  loading?: boolean;
}

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(summary.totalBalance),
      icon: '💰',
      change: summary.totalBalance >= 0 ? '+0.00%' : '-0.00%',
      trend: summary.totalBalance >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(summary.monthlyIncome),
      icon: '📈',
      change: '+0.00%',
      trend: 'positive',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(summary.monthlyExpenses),
      icon: '📉',
      change: '-0.00%',
      trend: 'negative',
    },
    {
      title: 'Savings Rate',
      value: formatPercentage(summary.savingsRate),
      icon: '🎯',
      change: formatPercentage(summary.savingsRate),
      trend: summary.savingsRate > 0.1 ? 'positive' : 'neutral',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {card.title}
            </CardTitle>
            <span className="text-2xl">{card.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  card.trend === 'positive'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : card.trend === 'negative'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {card.trend === 'positive' ? '↗' : card.trend === 'negative' ? '↘' : '→'} {card.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}