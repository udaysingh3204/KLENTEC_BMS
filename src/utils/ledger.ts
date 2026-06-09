import { Invoice, ExpenseEntry } from '../types';

/**
 * Daily Ledger Transaction (for display)
 */
export type DailyTransaction = {
  id: string;
  type: 'invoice' | 'payment' | 'expense';
  time: string;
  description: string;
  amount: number;
  runningBalance: number;
  metadata?: {
    customerName?: string;
    invoiceNo?: string;
    paymentMode?: string;
    expenseCategory?: string;
  };
};

/**
 * Daily Ledger Summary
 */
export type DailyLedgerSummary = {
  date: string;
  openingBalance: number;
  closingBalance: number;
  totalSales: number;
  totalPaymentsReceived: number;
  totalExpenses: number;
  netChange: number;
  transactions: DailyTransaction[];
};

/**
 * Get all transactions for a specific date
 */
export function getTransactionsForDate(
  invoices: Invoice[],
  expenses: ExpenseEntry[],
  dateString: string
): { invoices: Invoice[]; expenses: ExpenseEntry[] } {
  const dayInvoices = invoices.filter((inv) => {
    const invDate = new Date(inv.createdAt).toISOString().split('T')[0];
    return invDate === dateString;
  });

  const dayExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.createdAt).toISOString().split('T')[0];
    return expDate === dateString;
  });

  return { invoices: dayInvoices, expenses: dayExpenses };
}

/**
 * Calculate opening balance (closing balance from previous day)
 */
export function calculateOpeningBalance(
  invoices: Invoice[],
  expenses: ExpenseEntry[],
  targetDate: string
): number {
  // For demo: starting balance is 0
  // In production: would load from previous day snapshot or database

  // Calculate balance up to but not including targetDate
  const upToDate = invoices.filter((inv) => {
    const invDate = new Date(inv.createdAt).toISOString().split('T')[0];
    return invDate < targetDate;
  });

  const upToExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.createdAt).toISOString().split('T')[0];
    return expDate < targetDate;
  });

  const totalSales = upToDate.reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = upToExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return totalSales - totalExpenses;
}

/**
 * Calculate daily balance with running totals
 */
export function calculateDailyLedger(
  invoices: Invoice[],
  expenses: ExpenseEntry[],
  dateString: string
): DailyLedgerSummary {
  const { invoices: dayInvoices, expenses: dayExpenses } = getTransactionsForDate(
    invoices,
    expenses,
    dateString
  );

  const openingBalance = calculateOpeningBalance(invoices, expenses, dateString);

  // Combine and sort transactions chronologically
  const allTransactions: Array<{
    id: string;
    type: 'invoice' | 'expense';
    time: string;
    amount: number;
    data: Invoice | ExpenseEntry;
  }> = [];

  dayInvoices.forEach((inv) => {
    allTransactions.push({
      id: inv.id,
      type: 'invoice',
      time: new Date(inv.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount: inv.total,
      data: inv,
    });
  });

  dayExpenses.forEach((exp) => {
    allTransactions.push({
      id: exp.id,
      type: 'expense',
      time: new Date(exp.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount: exp.amount,
      data: exp,
    });
  });

  // Sort by createdAt (earliest first)
  allTransactions.sort((a, b) => {
    const aTime = a.data.createdAt;
    const bTime = b.data.createdAt;
    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });

  // Calculate running balances
  let runningBalance = openingBalance;
  const transactions: DailyTransaction[] = [];

  allTransactions.forEach((txn) => {
    if (txn.type === 'invoice') {
      const inv = txn.data as Invoice;
      runningBalance += inv.total;
      transactions.push({
        id: inv.id,
        type: 'invoice',
        time: txn.time,
        description: `Invoice from ${inv.customerName}`,
        amount: inv.total,
        runningBalance,
        metadata: {
          customerName: inv.customerName,
          invoiceNo: inv.id.slice(-6),
          paymentMode: inv.paymentMode,
        },
      });
    } else if (txn.type === 'expense') {
      const exp = txn.data as ExpenseEntry;
      runningBalance -= exp.amount;
      transactions.push({
        id: exp.id,
        type: 'expense',
        time: txn.time,
        description: `Expense: ${exp.title}`,
        amount: exp.amount,
        runningBalance,
        metadata: {
          expenseCategory: exp.category,
        },
      });
    }
  });

  // Calculate totals
  const totalSales = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPaymentsReceived = dayInvoices
    .filter((inv) => inv.paymentMode === 'Cash' || inv.paymentMode === 'UPI')
    .reduce((sum, inv) => sum + inv.total, 0);

  const closingBalance = runningBalance;
  const netChange = totalSales - totalExpenses;

  return {
    date: dateString,
    openingBalance,
    closingBalance,
    totalSales,
    totalPaymentsReceived,
    totalExpenses,
    netChange,
    transactions,
  };
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get formatted date for display
 */
export function getFormattedDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get date string for today
 */
export function getTodayString(): string {
  return getDateString(new Date());
}

/**
 * Get previous day string
 */
export function getPreviousDayString(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  return getDateString(date);
}

/**
 * Get next day string
 */
export function getNextDayString(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  return getDateString(date);
}
