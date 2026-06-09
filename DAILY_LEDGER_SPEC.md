# DAILY BALANCE LEDGER — DETAILED SPECIFICATION

**Professional Business App Standard**

---

## **FEATURE OVERVIEW**

A Daily Ledger shows the complete financial position for a specific day:

```
OPENING BALANCE (from yesterday's closing)
├── Invoices Created Today (+ Sales)
├── Payments Received (+ Cash In)
├── Expenses Recorded (- Cash Out)
└── CLOSING BALANCE (calculated)
```

---

## **DATA REQUIREMENTS**

### **What we need to calculate:**

1. **Opening Balance**
   - Yesterday's closing balance (or system startup date)
   - Formula: `previous_day_closing = previous_invoices - previous_payments - previous_expenses`
   - For first day: Get from initial state or user input

2. **Today's Transactions**
   - All invoices created today
   - All payments received today
   - All expenses recorded today
   - All deliveries (not financial, but for context)

3. **Running Balance**
   - Start with opening balance
   - For each transaction (chronologically):
     - Invoice: opening + invoice_total
     - Payment: balance - payment_amount
     - Expense: balance - expense_amount
   - End with closing balance

---

## **SCREEN LAYOUT**

### **Daily Ledger Screen Structure:**

```
┌─────────────────────────────────────────────┐
│ DAILY LEDGER                                │
│ < 9 Jun | Today | 10 Jun >                 │
├─────────────────────────────────────────────┤
│ OPENING BALANCE                   ₹10,000   │
├─────────────────────────────────────────────┤
│ TRANSACTIONS (Chronological)                │
│                                             │
│ 09:30 AM  Sharma Invoice #001               │
│           Cement 25 bags          +₹25,000  │
│           Balance:                 ₹35,000  │
│                                             │
│ 11:15 AM  Payment from Patel                │
│           Cash collected          -₹15,000  │
│           Balance:                 ₹20,000  │
│                                             │
│ 02:00 PM  Expense - Shop Rent               │
│           Rent payment             -₹2,000  │
│           Balance:                 ₹18,000  │
│                                             │
│ 04:45 PM  Shree Dev Invoice #002            │
│           Tiles 50 pcs            +₹8,000   │
│           Balance:                 ₹26,000  │
│                                             │
├─────────────────────────────────────────────┤
│ SUMMARY                                     │
│ Total Sales:           ₹33,000              │
│ Total Received:        ₹15,000              │
│ Total Expenses:        -₹2,000              │
│ Net Change:            ₹31,000              │
├─────────────────────────────────────────────┤
│ CLOSING BALANCE                   ₹26,000   │
│ Status: All recorded ✅                     │
└─────────────────────────────────────────────┘
```

---

## **FEATURES**

### **1. Date Navigation**
- Left/Right arrows to go to previous/next day
- "Today" button to jump to current date
- Show current date prominently
- Format: "June 9, 2026"

### **2. Transaction List**
- Sorted chronologically (earliest to latest)
- Shows: Time, description, amount, running balance
- Color coding:
  - Green: Invoices (income)
  - Orange: Payments (cash in)
  - Red: Expenses (cash out)
- Each transaction shows balance AFTER that transaction

### **3. Summary Cards**
- **Opening Balance:** Starting point
- **Total Sales:** Sum of all invoices
- **Total Received:** Sum of all payments
- **Total Expenses:** Sum of all expenses
- **Net Change:** Sales + Payments - Expenses
- **Closing Balance:** Opening + Net Change (color: green if profit, red if loss)

### **4. Transaction Details (on tap)**
- Full invoice/payment/expense details
- Option to view/edit original document
- Quick payment collection (if payment pending)

---

## **CALCULATIONS**

### **Formula (for any date)**

```
Opening Balance = Closing Balance of (Date - 1)

For each transaction on the date (chronological order):
  - Invoice: Balance += Invoice Total
  - Payment: Balance -= Payment Amount
  - Expense: Balance -= Expense Amount

Closing Balance = Final Balance after all transactions

Net Daily Change = Sum(Invoices) - Sum(Payments) - Sum(Expenses)
                 = Closing Balance - Opening Balance
```

### **Edge Cases**

1. **First day of app:**
   - Opening Balance = 0
   - Or get from user setup

2. **No transactions:**
   - Opening = Closing
   - Net change = 0

3. **Future dates:**
   - Show "No data" or "No transactions yet"

4. **Past dates:**
   - Read-only view (show completed data)

---

## **DATA SOURCES**

| Data | Source | Field | Date Filter |
|------|--------|-------|------------|
| Invoices | Store.invoices | createdAt | today |
| Payments | Store.invoices | createdAt + payment received | today |
| Expenses | Store.expenses | createdAt | today |
| Balance history | Derived from above | N/A | All time |

---

## **IMPLEMENTATION STEPS**

### **Step 1: Add helper functions to store**
- `getTodayTransactions(date)` → Get all invoices, payments, expenses for a date
- `calculateBalance(date)` → Calculate opening and closing balance
- `getRunningBalance(transactions)` → Calculate balance after each transaction

### **Step 2: Create Daily Ledger screen**
- Date navigation UI
- Transaction list rendering
- Summary cards

### **Step 3: Wire up to data**
- Connect to Zustand store
- Calculate balances on date change
- Handle timezone (use local date, not UTC)

### **Step 4: Polish UI**
- Color coding for transactions
- Time formatting (HH:MM AM/PM)
- Currency formatting (₹)
- Responsive layout

### **Step 5: Test**
- Create invoices/payments/expenses
- Switch dates
- Verify balance calculations
- Check edge cases

---

## **SUCCESS CRITERIA**

✅ Accurate balance calculation (matches manual calculation)
✅ Chronological transaction ordering
✅ Real-time updates (new transaction = immediate ledger update)
✅ Clean, professional UI (like EZO Books)
✅ Date navigation working
✅ Summary calculations correct
✅ Zero TypeScript errors
✅ Performance: loads within 1 second

---

## **RELATED SCREENS TO ENHANCE**

1. **Dashboard**
   - Show daily summary in hero card
   - "View full ledger" link

2. **Customers Screen**
   - Add "Customer Ledger" tab (shows individual customer balance)
   - Link from Daily Ledger

3. **Reports Screen**
   - Add "Daily Summary Report"
   - Export Daily Ledger to PDF

---

## **ESTIMATED EFFORT**

- Step 1 (Helper functions): 1-2 hours
- Step 2-3 (Screen + data): 2-3 hours
- Step 4 (Polish): 1-2 hours
- Step 5 (Testing): 1-2 hours
- **Total: 5-9 hours (1 day work)**

---

## **NEXT: Customer Ledger (After Daily Ledger)**

Customer Ledger will show the same concept but per-customer:
- Customer opening balance
- Customer's transactions (invoices from them, payments from them)
- Customer closing balance
- Outstanding amount

This will be built in parallel after Daily Ledger is working.
