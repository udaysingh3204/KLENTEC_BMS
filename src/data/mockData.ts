import {
  ActivityItem,
  AttendanceRecord,
  AppUser,
  Customer,
  DashboardStat,
  DeliveryEntry,
  Employee,
  ExpenseEntry,
  Invoice,
  LowStockProduct,
  ModuleDefinition,
  PaymentEntry,
  Product,
  Role,
  Supplier,
} from '../types';

export const roles: Role[] = [
  {
    id: 'admin',
    label: 'Admin',
    summary: 'Full operational control across billing, stock, reports, and user accounts.',
  },
  {
    id: 'employee',
    label: 'Employee',
    summary: 'Attendance, limited stock entry, and support tasks on the shop floor.',
  },
  {
    id: 'delivery',
    label: 'Delivery Staff',
    summary: 'Assigned delivery views with status updates only for their own jobs.',
  },
];

// ✅ EMPTY - No demo data
export const dashboardStats: DashboardStat[] = [];

export const moduleDefinitions: ModuleDefinition[] = [
  {
    id: '01',
    title: 'Product & Inventory',
    owner: 'Admin',
    description: 'Products, units, prices, low-stock thresholds, and stock adjustments.',
    status: 'in-progress',
  },
  {
    id: '02',
    title: 'Cash Flow Tracking',
    owner: 'Admin',
    description: 'Income and expense ledger with daily balance and payment mode tags.',
    status: 'planned',
  },
  {
    id: '03',
    title: 'Billing & Invoices',
    owner: 'Admin',
    description: 'Customer selection, itemized billing, printable receipts, and bill history.',
    status: 'planned',
  },
  {
    id: '04',
    title: 'Customer Management',
    owner: 'Admin',
    description: 'Profiles, phone search, purchase history, and credit balance tracking.',
    status: 'planned',
  },
  {
    id: '05',
    title: 'Supplier Records',
    owner: 'Admin',
    description: 'Supplier directory linked to purchases and category-based lookup.',
    status: 'in-progress',
  },
  {
    id: '06',
    title: 'Expense Management',
    owner: 'Admin',
    description: 'Expense categories, daily totals, and cash flow integration.',
    status: 'planned',
  },
  {
    id: '07',
    title: 'Employee & Attendance',
    owner: 'Admin + Employee',
    description: 'Profiles, attendance states, and salary payment log.',
    status: 'planned',
  },
  {
    id: '08',
    title: 'Delivery Log',
    owner: 'Admin + Delivery',
    description: 'Delivery creation, dispatch tracking, and delivery staff updates.',
    status: 'in-progress',
  },
  {
    id: '09',
    title: 'Daily Reports',
    owner: 'Admin',
    description: 'End-of-day summaries, reprints, and stock movement snapshots.',
    status: 'planned',
  },
  {
    id: '10',
    title: 'Payment Modes',
    owner: 'Admin',
    description: 'Cash, UPI, and credit tracking with UPI reference support.',
    status: 'planned',
  },
  {
    id: '11',
    title: 'Role-Based Access',
    owner: 'All Users',
    description: 'PIN-authenticated permissions and role-specific screens.',
    status: 'ready',
  },
  {
    id: '12',
    title: 'Local Deployment',
    owner: 'All Users',
    description: 'Offline device storage, APK install path, and CSV backup export.',
    status: 'ready',
  },
];

// ✅ EMPTY - No demo data
export const lowStockProducts: LowStockProduct[] = [];

// ✅ EMPTY - No demo data
export const paymentBreakdown: PaymentEntry[] = [];

// ✅ EMPTY - No demo data
export const todayDeliveries: DeliveryEntry[] = [];

// ✅ EMPTY - No demo data
export const recentActivities: ActivityItem[] = [];

// ✅ EMPTY - Default admin user with PIN 1234 will be created on first launch
export const demoUsers: AppUser[] = [];

// ✅ EMPTY - All data will be added through the app interface
// Start fresh with clean database

export const initialProducts: Product[] = [];

export const initialCustomers: Customer[] = [];

export const initialSuppliers: Supplier[] = [];

export const initialInvoices: Invoice[] = [];

export const initialEmployees: Employee[] = [];

export const initialAttendance: AttendanceRecord[] = [];

export const initialExpenses: ExpenseEntry[] = [];
