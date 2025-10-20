import { format } from 'date-fns';

interface ExportData {
  data: any[];
  filename: string;
  headers?: string[];
}

export function exportToCSV({ data, filename, headers }: ExportData) {
  const csvContent = [
    // Add headers if provided
    ...(headers ? [headers.join(',')] : []),
    // Convert data to CSV rows
    ...data.map(row => 
      Object.values(row)
        .map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"`
            : value
        )
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function prepareExpenseData(expenses: any[]) {
  return expenses.map(expense => ({
    Date: format(new Date(expense.date), 'yyyy-MM-dd'),
    Category: expense.category,
    Amount: formatCurrency(expense.amount),
    Description: expense.description || '',
  }));
}

export function prepareAttendanceData(attendance: any[], workers: any[]) {
  return attendance.map(record => {
    const worker = workers.find(w => w.id === record.worker_id);
    return {
      Date: format(new Date(record.date), 'yyyy-MM-dd'),
      Worker: worker?.name || '',
      Status: record.status,
      'Check In': record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm') : '',
      'Check Out': record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm') : '',
      Hours: record.hours || '',
      'Lunch Money': formatCurrency(record.lunch_money || 0),
    };
  });
}

export function prepareBudgetData(expenses: any[]) {
  const weeklyData = new Map();
  
  expenses.forEach(expense => {
    const week = format(new Date(expense.date), 'yyyy-ww');
    const current = weeklyData.get(week) || { total: 0, categories: {} };
    
    current.total += Number(expense.amount);
    current.categories[expense.category] = (current.categories[expense.category] || 0) + Number(expense.amount);
    
    weeklyData.set(week, current);
  });
  
  return Array.from(weeklyData.entries()).map(([week, data]: [string, any]) => ({
    Week: week,
    'Total Expenses': formatCurrency(data.total),
    ...Object.entries(data.categories).reduce((acc, [category, amount]) => ({
      ...acc,
      [category]: formatCurrency(amount as number),
    }), {}),
  }));
}
