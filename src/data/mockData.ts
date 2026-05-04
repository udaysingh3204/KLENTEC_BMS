import {
  ActivityItem,
  AppUser,
  Customer,
  DashboardStat,
  DeliveryEntry,
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
    value: 'NGN 184,500',
    direction: 'up',
    caption: '12 invoices issued today',
  },
  {
    id: 'expenses',
    label: 'Expenses',
    value: 'NGN 39,200',
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
    value: 'NGN 91,000',
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
  { id: 'cement-1', name: 'Dangote Cement', unit: 'Bag', stockLeft: 18, minimumStock: 30 },
  { id: 'rod-1', name: '12mm Iron Rod', unit: 'Piece', stockLeft: 24, minimumStock: 40 },
  { id: 'paint-1', name: 'Gloss Paint White', unit: 'Can', stockLeft: 6, minimumStock: 12 },
];

export const paymentBreakdown: PaymentEntry[] = [
  { mode: 'Cash', amount: 'NGN 96,500' },
  { mode: 'UPI', amount: 'NGN 58,000' },
  { mode: 'Credit', amount: 'NGN 30,000' },
];

export const todayDeliveries: DeliveryEntry[] = [
  {
    id: 'del-01',
    customer: 'Apex Builders',
    items: '25 bags cement',
    assignee: 'Musa Lawal',
    status: 'Pending',
  },
  {
    id: 'del-02',
    customer: 'Rita Interiors',
    items: '12 paint cans',
    assignee: 'Samuel Eze',
    status: 'Dispatched',
  },
  {
    id: 'del-03',
    customer: 'Omni Works',
    items: '40 iron rods',
    assignee: 'Musa Lawal',
    status: 'Delivered',
  },
];

export const recentActivities: ActivityItem[] = [
  {
    id: 'act-01',
    title: 'Invoice INV-1042 closed',
    note: 'Customer Chinedu Hardware paid via UPI and stock updated automatically.',
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
    name: 'Dangote Cement',
    category: 'Cement',
    unit: 'Bag',
    price: 10500,
    stockLeft: 18,
    minimumStock: 30,
  },
  {
    id: 'prod-rod',
    name: '12mm Iron Rod',
    category: 'Iron Rod',
    unit: 'Piece',
    price: 7800,
    stockLeft: 24,
    minimumStock: 40,
  },
  {
    id: 'prod-paint',
    name: 'Gloss Paint White',
    category: 'Paint',
    unit: 'Can',
    price: 12500,
    stockLeft: 6,
    minimumStock: 12,
  },
  {
    id: 'prod-tiles',
    name: 'Ceramic Floor Tile',
    category: 'Tiles',
    unit: 'Carton',
    price: 16800,
    stockLeft: 32,
    minimumStock: 15,
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-apex',
    name: 'Apex Builders',
    phone: '08031234567',
    address: 'Lekki Site Yard',
    outstandingBalance: 20000,
  },
  {
    id: 'cust-rita',
    name: 'Rita Interiors',
    phone: '08039876543',
    address: 'Ikeja GRA',
    outstandingBalance: 0,
  },
  {
    id: 'cust-omni',
    name: 'Omni Works',
    phone: '08035550123',
    address: 'Ajah Trade Hub',
    outstandingBalance: 71000,
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-dangote',
    name: 'Dangote Bulk Depot',
    contactPerson: 'Ahmed Sule',
    phone: '08034445566',
    address: 'Apapa Cement Terminal',
    category: 'Cement',
    materials: 'Dangote Cement 32.5R, Dangote Cement 42.5R',
    status: 'Active',
  },
  {
    id: 'sup-steel',
    name: 'Prime Steel Hub',
    contactPerson: 'Kelechi Obi',
    phone: '08027778899',
    address: 'Ikorodu Industrial Layout',
    category: 'Iron Rod',
    materials: '10mm, 12mm, and 16mm iron rods',
    status: 'Active',
  },
  {
    id: 'sup-finishes',
    name: 'ColorCraft Finishes',
    contactPerson: 'Rukayat Bello',
    phone: '08145556677',
    address: 'Mile 12 Paint Market',
    category: 'Paint',
    materials: 'Interior paint, gloss finish, primer, and thinner',
    status: 'Inactive',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1042',
    customerId: 'cust-apex',
    customerName: 'Apex Builders',
    paymentMode: 'UPI',
    reference: 'UPI-1042',
    total: 52500,
    createdAt: '2026-05-04T10:42:00.000Z',
    lines: [
      {
        productId: 'prod-cement',
        productName: 'Dangote Cement',
        quantity: 5,
        unitPrice: 10500,
        lineTotal: 52500,
      },
    ],
  },
];

export const initialExpenses: ExpenseEntry[] = [
  {
    id: 'exp-001',
    title: 'Shop diesel refill',
    category: 'Shop',
    amount: 12000,
    paymentMode: 'Cash',
    createdAt: '2026-05-05T08:15:00.000Z',
  },
  {
    id: 'exp-002',
    title: 'Loader labour payout',
    category: 'Labour',
    amount: 8500,
    paymentMode: 'Cash',
    createdAt: '2026-05-05T09:10:00.000Z',
  },
  {
    id: 'exp-003',
    title: 'Urgent paint restock transport',
    category: 'Delivery',
    amount: 6000,
    paymentMode: 'UPI',
    createdAt: '2026-05-05T11:25:00.000Z',
  },
];