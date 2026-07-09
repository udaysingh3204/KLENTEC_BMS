import { Invoice, ExpenseEntry } from '../types';
import { formatCurrency } from './finance';

export interface DailyLedgerRow {
  time: string;
  type: 'invoice' | 'expense';
  amount: number;
  mode: string;
  name: string;
  products: string;
  address: string;
  cash: number;
  upi: number;
  udhar: number;
  bhada: number;
  dala: number;
  influencer: string;
}

export interface ExcelExportData {
  date: string;
  rows: DailyLedgerRow[];
  totals: {
    totalAmount: number;
    totalCash: number;
    totalUPI: number;
    totalUdhar: number;
    totalBhada: number;
    totalDala: number;
  };
}

/**
 * Generate CSV format for daily ledger (compatible with Excel)
 */
export function generateDailyLedgerCSV(data: ExcelExportData): string {
  const headers = [
    'समय (Time)',
    'Type',
    'Amount',
    'Mode',
    'Name/Customer',
    'Products',
    'Address',
    'Cash (₹)',
    'UPI (₹)',
    'Udhar (₹)',
    'Bhada (₹)',
    'Dala (₹)',
    'Influencer',
  ];

  const rows = data.rows.map((row) => [
    row.time,
    row.type === 'invoice' ? 'Sale' : 'Expense',
    row.type === 'invoice' ? `+${row.amount}` : `-${row.amount}`,
    row.mode,
    row.name,
    row.products,
    row.address,
    row.cash > 0 ? row.cash : '',
    row.upi > 0 ? row.upi : '',
    row.udhar > 0 ? row.udhar : '',
    row.bhada > 0 ? row.bhada : '',
    row.dala > 0 ? row.dala : '',
    row.influencer,
  ]);

  // Add separator
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);

  // Add totals
  rows.push([
    '📊 TOTAL',
    '',
    `+${data.totals.totalAmount}`,
    '',
    '',
    '',
    '',
    data.totals.totalCash,
    data.totals.totalUPI,
    data.totals.totalUdhar,
    data.totals.totalBhada,
    data.totals.totalDala,
    '',
  ]);

  // Convert to CSV
  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell || '');
          // Escape quotes and wrap in quotes if contains comma
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    )
    .join('\n');

  return csv;
}

/**
 * Generate summary report for daily ledger
 */
export function generateDailyLedgerSummary(data: ExcelExportData): string {
  const date = new Date(data.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const summary = `
Building Material Shop - Daily Ledger Report
Date: ${date}
Generated: ${new Date().toLocaleString('en-IN')}

========================================
DAILY SUMMARY
========================================

Total Invoices/Sales:      ₹${data.totals.totalAmount}
  └─ Cash Received:        ₹${data.totals.totalCash}
  └─ UPI Received:         ₹${data.totals.totalUPI}
  └─ Outstanding (Udhar):  ₹${data.totals.totalUdhar}

Additional Charges:
  └─ Bhada (Delivery):     ₹${data.totals.totalBhada}
  └─ Dala (Labour):        ₹${data.totals.totalDala}

========================================
Transaction Count: ${data.rows.length}
========================================
  `;

  return summary;
}

/**
 * Format data for email/sharing
 */
export function formatLedgerForShare(data: ExcelExportData): string {
  return generateDailyLedgerSummary(data) + '\n\n' + generateDailyLedgerCSV(data);
}
