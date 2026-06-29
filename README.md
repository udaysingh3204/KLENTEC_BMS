# KLENTEC BMS - Professional Business Management System

A complete, production-ready offline-first Business Management System for local business owners to replace manual record-keeping.

## ✨ Features

**Billing & Invoicing**
- Quantity-based item selling
- Inline customer creation
- Price flexibility (Actual Price × Quantity)
- Delivery fees (Bhada) tracking
- Influencer referral tracking
- Complete customer information capture

**Daily Ledger (Hisaab)**
- Complete daily transaction record
- All payment modes tracked (Cash/UPI/Credit)
- Customer name, phone, and address
- Product details
- Credit amount tracking
- Delivery fees tracking
- Influencer details
- Profit/Loss calculation
- Professional table format

**Inventory & Customers**
- Stock management
- Low-stock alerts
- Customer credit tracking
- Supplier management
- Payment collection

**Expenses & Reports**
- Expense tracking by category
- Payment mode breakdown
- Cash flow analysis
- Comprehensive financial dashboard
- Goods batch tracking (admin-level)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Open in browser (press 'w') or scan QR code with Expo Go
```

**Access at**: http://localhost:8081

## 📱 Default Credentials

- **Admin**: PIN `1234`
- **Employee**: PIN `1111`
- **Delivery**: PIN `2222`

## 📊 Tech Stack

- React Native 0.81.5
- Expo SDK 54
- TypeScript (strict mode)
- Zustand state management
- expo-sqlite (offline storage)
- React Navigation

## 📂 Project Structure

```
src/
├─ screens/          # 12 main screens
├─ components/       # Reusable UI components
├─ navigation/       # Route types & navigator
├─ store/            # Zustand state management
├─ data/             # Mock data & database helpers
├─ utils/            # Finance & ledger calculations
├─ types.ts          # Type definitions
└─ theme.ts          # Color & styling
```

## 🎯 Main Screens

1. **Dashboard** - Overview & quick access
2. **Billing** - Create invoices with items
3. **Daily Ledger** - Complete transaction history
4. **Customer Ledger** - Per-customer tracking
5. **Sales Report** - Filtered sales analysis
6. **Inventory** - Stock management
7. **Customers** - Customer management
8. **Suppliers** - Supplier database
9. **Cash Flow** - Expense tracking
10. **Goods Batch** - Admin batch tracking
11. **Reports** - Comprehensive dashboard
12. **Deliveries** - Delivery management
13. **Employees** - Staff management

## 🎨 Design

- **Primary Color**: Navy Blue (#1B4F8A)
- **Accent**: Orange (#FF6B35)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Background**: Light Gray (#F5F6FA)

Color-coded system for easy data reading:
- 🟢 Green = Income, Cash, Profit
- 🔴 Red = Expenses, Loss, Discount
- 🔵 Blue = Credit, UPI
- 🟠 Orange = Delivery fees, Warnings

## 💾 Data & Offline

- All data stored locally with SQLite
- Auto-save on every transaction
- No cloud dependency
- Perfect for offline-first business

## ✅ What's Included

- ✅ Complete invoicing system
- ✅ Professional daily ledger
- ✅ Inventory management
- ✅ Customer tracking
- ✅ Expense management
- ✅ Financial reports
- ✅ Color-coded UI
- ✅ Offline-first architecture
- ✅ Zero TypeScript errors
- ✅ Production ready

## 🧪 Testing

All features implemented and working:
- Invoicing with all details
- Daily ledger matching manual format
- Price calculations
- Payment tracking
- Credit management
- Expense categories
- Financial summaries

## 📈 Version

**1.0.0** - Production Ready ✅  
**Last Updated**: June 30, 2026

---

For issues or customizations, contact the development team.