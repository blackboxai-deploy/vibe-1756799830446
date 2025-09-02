'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFinancialData } from '@/hooks/use-financial-data';
import { clearAllData, importData } from '@/lib/data-storage';

export default function SettingsPage() {
  const { data, refreshData, createCategory } = useFinancialData();
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6',
  });
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handlePreferencesUpdate = (key: string, value: any) => {
    // This would normally update preferences in the data storage
    console.log('Updating preference:', key, value);
    // For now, we'll just log it since we have a basic implementation
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name) {
      return;
    }

    createCategory({
      name: newCategory.name,
      type: newCategory.type,
      color: newCategory.color,
    });

    setNewCategory({
      name: '',
      type: 'expense',
      color: '#3B82F6',
    });
    
    setIsAddCategoryOpen(false);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      refreshData();
      alert('All data has been cleared.');
    }
  };

  const handleImportData = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string;
        const lines = csvData.split('\n');
        
        // Simple CSV parsing for transactions
        const transactions = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              date: new Date(values[0]),
              type: values[1] as 'income' | 'expense',
              amount: parseFloat(values[2]),
              category: values[3],
              description: values[4] || 'Imported transaction',
            };
          });

        importData({ transactions });
        refreshData();
        alert(`Imported ${transactions.length} transactions successfully!`);
        setImportFile(null);
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(importFile);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your preferences and account settings
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Categories Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏷️</span>
                Manage Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have {data.categories.length} categories
                </p>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">Add Category</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div>
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          placeholder="e.g., Coffee & Snacks"
                          value={newCategory.name}
                          onChange={(e) => 
                            setNewCategory(prev => ({ ...prev, name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryType">Type</Label>
                        <Select 
                          value={newCategory.type}
                          onValueChange={(value: 'income' | 'expense') => 
                            setNewCategory(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="categoryColor">Color</Label>
                        <Input
                          id="categoryColor"
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => 
                            setNewCategory(prev => ({ ...prev, color: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setIsAddCategoryOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Category</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Separator />
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {category.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when approaching budget limits
                  </p>
                </div>
                <Switch 
                  id="budgetAlerts"
                  checked={data.preferences.notifications.budgetAlerts}
                  onCheckedChange={(checked) => 
                    handlePreferencesUpdate('notifications.budgetAlerts', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="goalReminders">Goal Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reminders for savings goal deadlines
                  </p>
                </div>
                <Switch 
                  id="goalReminders"
                  checked={data.preferences.notifications.goalReminders}
                  onCheckedChange={(checked) => 
                    handlePreferencesUpdate('notifications.goalReminders', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="monthlyReports">Monthly Reports</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monthly financial summary emails
                  </p>
                </div>
                <Switch 
                  id="monthlyReports"
                  checked={data.preferences.notifications.monthlyReports}
                  onCheckedChange={(checked) => 
                    handlePreferencesUpdate('notifications.monthlyReports', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* General Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                General Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={data.preferences.currency}
                  onValueChange={(value) => handlePreferencesUpdate('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select 
                  value={data.preferences.dateFormat}
                  onValueChange={(value) => handlePreferencesUpdate('dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={data.preferences.theme}
                  onValueChange={(value) => handlePreferencesUpdate('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">💾</span>
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="importFile" className="text-sm font-medium">
                    Import Data (CSV)
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Upload a CSV file with columns: Date, Type, Amount, Category, Description
                  </p>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  {importFile && (
                    <Button onClick={handleImportData} className="mt-2" size="sm">
                      Import File
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium">Clear All Data</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    This will permanently delete all your financial data
                  </p>
                  <Button onClick={handleClearData} variant="destructive" size="sm">
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm font-medium">Version</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Transactions</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{data.transactions.length}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Data Storage</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Local Browser Storage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}