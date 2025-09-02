import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Personal Finance Dashboard',
  description: 'A comprehensive personal finance management dashboard to track expenses, income, budgets, and savings goals.',
  keywords: ['finance', 'budget', 'savings', 'expenses', 'income', 'dashboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}