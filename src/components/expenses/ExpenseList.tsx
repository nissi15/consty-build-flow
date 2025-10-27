import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Receipt, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { getCategoryColor } from '@/constants/expenseCategories';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const getCategoryBadgeColor = (category: string) => {
    const color = getCategoryColor(category, 0);
    // Convert hex to tailwind classes
    switch (category) {
      case 'Labor':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Materials':
        return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
      case 'Equipment':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Transport':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Utilities':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#111827] rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <Receipt className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Expenses Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            No expenses match your current filters. Try adjusting the date range or category.
          </p>
        </div>
      </Card>
    );
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Expense Records
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            RWF {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {(onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => (
              <motion.tr
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(expense.date), 'EEEE')}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${getCategoryBadgeColor(expense.category)} capitalize`}
                  >
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {expense.description || '-'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      RWF {Number(expense.amount).toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(expense.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </p>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              RWF {totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}




