# KLENTEC BMS — PHASE 2-3 ROADMAP (EZO/OKCredit/Vyapar Aligned)

**Goal:** Transform from "AI-generated" to "Real Business App"

---

## **PHASE 2 SPRINT 2 (HIGH PRIORITY) — DAILY LEDGER + CUSTOMER CREDIT**

### 🎯 **Sprint 2A: Daily Balance Ledger (Critical)**

**What it does:**
- Shows opening balance from yesterday
- Lists all transactions (invoices, payments, expenses) today
- Calculates closing balance
- Profit/loss summary

**Like:** EZO Books' Daily Summary + Vyapar's Daily Report

**Features:**
1. **Dashboard Enhancement:**
   - Replace generic KPI cards with REAL ledger view
   - Opening Balance (yesterday's closing)
   - + Today's Sales (sum of invoices)
   - - Today's Expenses (sum of expenses)
   - = Closing Balance (with color: green if profit, red if loss)

2. **Daily Ledger Screen (New):**
   - Date selector (Today, Yesterday, Custom date)
   - Transaction list (invoices, payments, expenses)
   - Running balance calculation
   - Export to PDF option

3. **Data shown:**
   ```
   Opening Balance:     ₹10,000
   
   Invoices Today:      +₹25,000 (5 invoices)
   Payments In:         +₹15,000 (3 payments)
   Expenses Out:        -₹3,000 (utilities, delivery)
   
   Closing Balance:     ₹47,000 ✅
   ```

**Time:** 2-3 days
**Effort:** Medium
**Impact:** HIGH ⭐⭐⭐⭐⭐

---

### 🎯 **Sprint 2B: Customer Ledger (Critical)**

**What it does:**
- Shows detailed transaction history PER CUSTOMER
- Like OKCredit's Udhar system
- Customer pays → settled
- Customer doesn't pay → outstanding

**Like:** OKCredit's Party Ledger + EZO's Customer Statement

**Features:**
1. **Customer Ledger Screen:**
   - Select customer from list
   - Show all transactions with that customer:
     - Invoice date, amount, due date
     - Payment date, amount, method
     - Running balance
   
2. **Customer Card:**
   ```
   SHARMA CONSTRUCTION
   
   Opening Balance: ₹5,000 (from last month)
   
   Transactions:
   10 Jun | Invoice #001 | ₹25,000 | Outstanding
   12 Jun | Payment     | -₹15,000 | Cash
   14 Jun | Invoice #002 | ₹8,000  | Outstanding
   
   Current Balance: ₹23,000 (Due)
   ```

3. **Quick Actions:**
   - Collect Payment button (1 tap)
   - Send Payment Reminder
   - View Invoice PDF

**Time:** 2-3 days
**Effort:** Medium
**Impact:** HIGH ⭐⭐⭐⭐⭐

---

### 🎯 **Sprint 2C: Quick Invoice Creation**

**What it does:**
- Create invoice in 3 taps (like Vyapar)
- Not full form, just fast entry

**Like:** Vyapar's Quick Invoice

**Features:**
1. **Quick Invoice Workflow:**
   - Tap "New Invoice"
   - Select customer (1 tap)
   - Add item (search products, enter qty, done)
   - Choose payment mode
   - Create

2. **Or Full Invoice:**
   - If customer needs multiple items or details

**Time:** 1-2 days
**Effort:** Low
**Impact:** MEDIUM ⭐⭐⭐⭐

---

## **PHASE 2 SPRINT 3 — REPORTS + ALERTS**

### 🎯 **Sprint 3A: Real Reports (Business Intelligence)**

**What it does:**
- Daily summary report
- Customer outstanding report
- Inventory movement report
- Payment mode breakdown

**Like:** EZO Books' Reports + Vyapar's Insights

**Reports to Build:**

1. **Daily Summary Report:**
   - Sales today, this month, this year
   - Expenses breakdown by category
   - Cash vs Online payment split
   - Top customers today
   - Stock levels alert

2. **Customer Outstanding Report:**
   - All customers with balance
   - Sort by: amount, days overdue
   - Quick payment collection
   - Send reminders (bulk)

3. **Inventory Report:**
   - Low stock items (urgent)
   - Fast-moving items
   - Dead stock (not moved in X days)
   - Stock value total

4. **Payment Report:**
   - Cash on hand
   - Online payments (UPI/Bank)
   - Credit given (pending collection)
   - Payment trend graph

**Time:** 3-4 days
**Effort:** Medium-High
**Impact:** HIGH ⭐⭐⭐⭐⭐

---

### 🎯 **Sprint 3B: Alerts & Notifications**

**What it does:**
- Low stock alert
- Payment due reminder
- Outstanding balance warning
- Daily closing notification

**Like:** EZO's reminders + OKCredit's notifications

**Alerts:**
1. Low Stock Alert
   - When product hits minimum level
   - Show in red on Inventory screen
   - Notification in app

2. Payment Due Reminder
   - When customer payment is 3+ days overdue
   - Show on Dashboard
   - Badge on Customers screen

3. Daily Closing Alert
   - At 6 PM: "Record today's closing balance?"
   - Shows: Opening balance, today's sales, expenses
   - Quick confirm/edit

**Time:** 1-2 days
**Effort:** Low
**Impact:** MEDIUM ⭐⭐⭐

---

## **PHASE 3 — ADVANCED FEATURES**

### 🎯 **Phase 3A: Expense Management (Like EZO)**

**Features:**
- 8-10 expense categories (Shop, Labour, Utilities, Delivery, etc.)
- Daily expense tracking with photos
- Expense vs Income graphs
- Expense reports
- Bulk expense entry

**Time:** 2-3 days
**Effort:** Low-Medium

---

### 🎯 **Phase 3B: Tax/GST Integration**

**Features:**
- GST rate per product (5%, 12%, 18%)
- GST calculation in invoice
- GST summary report
- Tax compliance

**Time:** 1-2 days
**Effort:** Low

---

### 🎯 **Phase 3C: Supplier Ledger & Purchase Orders**

**Features:**
- Like Customer ledger but for suppliers
- Purchase order creation
- Stock receipt tracking
- Supplier payment history

**Time:** 2-3 days
**Effort:** Medium

---

## **IMPLEMENTATION PRIORITY** 

### **DO THIS FIRST (Next 2 weeks):**

**Week 1-2: Phase 2 Sprint 2**
1. Daily Balance Ledger ← **START HERE**
2. Customer Ledger ← **CRITICAL**
3. Quick Invoice Creation

**Then: Phase 2 Sprint 3**
4. Real Reports
5. Alerts & Notifications

**Why:**
- These 5 features make the app look REAL (like EZO/OKCredit/Vyapar)
- Client will immediately see the difference
- Removes "AI-generated" feel
- Matches competitor apps' core features

---

## **WHAT CLIENTS NOTICE**

### Current (Looks AI-generated):
❌ Generic dashboard with KPI cards
❌ Just CRUD operations (add, edit, delete)
❌ No real business workflows
❌ Feels empty/not practical

### After Phase 2 Sprint 2:
✅ Daily ledger (opening → closing balance)
✅ Customer-wise ledger (who paid what)
✅ Real profit/loss calculation
✅ Looks like a REAL business app

### After Phase 2 Sprint 3:
✅ Business reports (insights)
✅ Automatic alerts
✅ Matches EZO/OKCredit/Vyapar
✅ Production ready

---

## **ESTIMATED TIMELINE**

| Phase | Features | Days | Status |
|-------|----------|------|--------|
| 1 | 10 modules (Inventory, Billing, etc.) | ✅ Done | Complete |
| 2 Sprint 1 | Edit/Delete CRUD | ✅ Done | Complete |
| **2 Sprint 2** | **Daily Ledger + Customer Ledger** | **5-6** | **START NOW** |
| **2 Sprint 3** | **Reports + Alerts** | **4-5** | **Next** |
| 3 | Advanced (GST, Suppliers, Expenses) | 3-4 | Later |

---

## **YOUR CALL**

Tell me which one to prioritize:

**Option A (Recommended):**
Start with **Daily Balance Ledger** → This is THE feature that makes the app look real

**Option B:**
Start with **Customer Ledger** → Client credit tracking (business survival)

**Option C:**
Build **Both in parallel** → Takes 5-6 days, maximum impact

What should I start coding? 🚀
