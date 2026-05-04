import { ExpenseEntry, Invoice, PaymentMode } from '../types';

export const emptyPaymentTotals = (): Record<PaymentMode, number> => ({
  Cash: 0,
  UPI: 0,
  Credit: 0,
});

export function normalizeMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value);
}

export function parseWholeNumberInput(value: string) {
  const sanitizedValue = value.replace(/,/g, '').trim();

  if (!sanitizedValue) {
    return null;
  }

  if (!/^\d+$/.test(sanitizedValue)) {
    return null;
  }

  return Number.parseInt(sanitizedValue, 10);
}

export function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

export function formatCurrency(value: number) {
  return `NGN ${normalizeMoney(value).toLocaleString()}`;
}

export function calculateInvoiceTotal(unitPrice: number, quantity: number) {
  return normalizeMoney(unitPrice) * quantity;
}

export function sumInvoiceTotals(invoices: Invoice[]) {
  return invoices.reduce((sum, invoice) => sum + normalizeMoney(invoice.total), 0);
}

export function sumExpenseAmounts(expenses: ExpenseEntry[]) {
  return expenses.reduce((sum, expense) => sum + normalizeMoney(expense.amount), 0);
}

export function buildPaymentTotals(invoices: Invoice[]) {
  return invoices.reduce((totals, invoice) => {
    totals[invoice.paymentMode] += normalizeMoney(invoice.total);
    return totals;
  }, emptyPaymentTotals());
}