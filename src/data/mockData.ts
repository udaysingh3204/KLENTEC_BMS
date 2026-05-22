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

export const dashboardStats: DashboardStat[] = [
  {
    id: 'sales',
    label: "Today's Sales",
    value: '₹1,84,500',
    direction: 'up',
    caption: '12 invoices issued today',
  },
  {
    id: 'expenses',
    label: 'Expenses',
    value: '₹39,200',
    direction: 'down',
    caption: 'Shop, labour, and delivery costs',
  },
  {
    id: 'deliveries',
    label: 'Pending Deliveries',
    value: '08',
    direction: 'flat',
    caption: '3 already dispatched',
  },
  {
    id: 'credit',
    label: 'Outstanding Credit',
    value: '₹91,000',
    direction: 'up',
    caption: '7 customers with active balances',
  },
];

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

export const lowStockProducts: LowStockProduct[] = [
  { id: 'cement-1', name: 'UltraTech Cement', unit: 'Bag', stockLeft: 18, minimumStock: 30 },
  { id: 'rod-1', name: '12mm TMT Bar', unit: 'Piece', stockLeft: 24, minimumStock: 40 },
  { id: 'paint-1', name: 'Asian Paints Apex', unit: 'Can', stockLeft: 6, minimumStock: 12 },
];

export const paymentBreakdown: PaymentEntry[] = [
  { mode: 'Cash', amount: '₹96,500' },
  { mode: 'UPI', amount: '₹58,000' },
  { mode: 'Credit', amount: '₹30,000' },
];

export const todayDeliveries: DeliveryEntry[] = [
  {
    id: 'del-01',
    customer: 'Sharma Construction',
    items: '25 bags cement',
    assignee: 'Ramesh Kumar',
    status: 'Pending',
  },
  {
    id: 'del-02',
    customer: 'Patel Interiors',
    items: '12 paint cans',
    assignee: 'Sunil Yadav',
    status: 'Dispatched',
  },
  {
    id: 'del-03',
    customer: 'Shree Developers',
    items: '40 TMT bars',
    assignee: 'Ramesh Kumar',
    status: 'Delivered',
  },
];

export const recentActivities: ActivityItem[] = [
  {
    id: 'act-01',
    title: 'Invoice INV-1042 closed',
    note: 'Customer Sharma Construction paid via UPI and stock updated automatically.',
    time: '10:42 AM',
  },
  {
    id: 'act-02',
    title: 'Attendance recorded',
    note: '14 staff entries synced for the morning shift check-in.',
    time: '09:05 AM',
  },
  {
    id: 'act-03',
    title: 'CSV backup exported',
    note: 'Daily backup file generated to the device downloads folder.',
    time: 'Yesterday',
  },
];

export const demoUsers: AppUser[] = [
  { id: 'user-admin', roleId: 'admin', label: 'Admin', pin: '1234' },
  { id: 'user-employee', roleId: 'employee', label: 'Employee', pin: '2222' },
  { id: 'user-delivery', roleId: 'delivery', label: 'Delivery Staff', pin: '3333' },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-cement',
    name: 'UltraTech Cement',
    category: 'Cement',
    unit: 'Bag',
    price: 380,
    stockLeft: 18,
    minimumStock: 30,
  },
  {
    id: 'prod-rod',
    name: '12mm TMT Bar',
    category: 'Iron Rod',
    unit: 'Piece',
    price: 65,
    stockLeft: 24,
    minimumStock: 40,
  },
  {
    id: 'prod-paint',
    name: 'Asian Paints Apex',
    category: 'Paint',
    unit: 'Can',
    price: 450,
    stockLeft: 6,
    minimumStock: 12,
  },
  {
    id: 'prod-tiles',
    name: 'Vitrified Floor Tile',
    category: 'Tiles',
    unit: 'Box',
    price: 1200,
    stockLeft: 32,
    minimumStock: 15,
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-sharma',
    name: 'Sharma Construction',
    phone: '9876543210',
    address: 'Sector 15, Gurgaon',
    outstandingBalance: 20000,
  },
  {
    id: 'cust-patel',
    name: 'Patel Interiors',
    phone: '9845123456',
    address: 'MG Road, Bengaluru',
    outstandingBalance: 0,
  },
  {
    id: 'cust-shree',
    name: 'Shree Developers',
    phone: '9933221100',
    address: 'Andheri East, Mumbai',
    outstandingBalance: 71000,
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-ultratech',
    name: 'UltraTech Depot',
    contactPerson: 'Rajesh Sharma',
    phone: '9811223344',
    address: 'NH-8, Gurgaon Industrial Area',
    category: 'Cement',
    materials: 'UltraTech Cement 43G, UltraTech Cement 53G',
    status: 'Active',
  },
  {
    id: 'sup-tata',
    name: 'Tata Steel Hub',
    contactPerson: 'Pradeep Rao',
    phone: '9922334455',
    address: 'MIDC, Pune',
    category: 'Iron Rod',
    materials: '10mm, 12mm, and 16mm TMT bars',
    status: 'Active',
  },
  {
    id: 'sup-asian',
    name: 'Asian Paints Distributor',
    contactPerson: 'Suresh Mehta',
    phone: '9744556677',
    address: 'Tardeo, Mumbai',
    category: 'Paint',
    materials: 'Interior emulsion, exterior Apex, primer, and putty',
    status: 'Inactive',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1042',
    customerId: 'cust-sharma',
    customerName: 'Sharma Construction',
    paymentMode: 'UPI',
    reference: 'UPI-1042',
    total: 1900,
    createdAt: '2026-05-04T10:42:00.000Z',
    lines: [
      {
        productId: 'prod-cement',
        productName: 'UltraTech Cement',
        quantity: 5,
        unitPrice: 380,
        lineTotal: 1900,
      },
    ],
  },
];

export const initialEmployees: Employee[] = [
  { id: 'emp-001', name: 'Ramesh Kumar', phone: '9811234567', role: 'Driver', salary: 18000, status: 'Active' },
  { id: 'emp-002', name: 'Sunil Yadav', phone: '9822345678', role: 'Loader', salary: 12000, status: 'Active' },
  { id: 'emp-003', name: 'Priya Singh', phone: '9833456789', role: 'Cashier', salary: 15000, status: 'Active' },
  { id: 'emp-004', name: 'Mohan Lal', phone: '9844567890', role: 'Salesperson', salary: 14000, status: 'Active' },
];

export const initialAttendance: AttendanceRecord[] = [];

export const initialExpenses: ExpenseEntry[] = [
  {
    id: 'exp-001',
    title: 'Generator diesel refill',
    category: 'Shop',
    amount: 2500,
    paymentMode: 'Cash',
    createdAt: '2026-05-05T08:15:00.000Z',
  },
  {
    id: 'exp-002',
    title: 'Loader labour payout',
    category: 'Labour',
    amount: 3500,
    paymentMode: 'Cash',
    createdAt: '2026-05-05T09:10:00.000Z',
  },
  {
    id: 'exp-003',
    title: 'Vehicle hire for delivery',
    category: 'Delivery',
    amount: 1200,
    paymentMode: 'UPI',
    createdAt: '2026-05-05T11:25:00.000Z',
  },
];
