export type Role = {
  id: 'admin' | 'employee' | 'delivery';
  label: string;
  summary: string;
};

export type PaymentMode = 'Cash' | 'UPI' | 'Credit';

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  direction: 'up' | 'down' | 'flat';
  caption: string;
};

export type ModuleDefinition = {
  id: string;
  title: string;
  owner: string;
  description: string;
  status: 'planned' | 'in-progress' | 'ready';
};

export type LowStockProduct = {
  id: string;
  name: string;
  unit: string;
  stockLeft: number;
  minimumStock: number;
};

export type PaymentEntry = {
  mode: PaymentMode;
  amount: string;
};

export type DeliveryEntry = {
  id: string;
  customer: string;
  items: string;
  assignee: string;
  status: 'Pending' | 'Dispatched' | 'Delivered';
};

export type ActivityItem = {
  id: string;
  title: string;
  note: string;
  time: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stockLeft: number;
  minimumStock: number;
  measurementUnit?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  outstandingBalance: number;
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  category: string;
  materials: string;
  status: 'Active' | 'Inactive';
};

export type InvoiceLine = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  actualPrice?: number;
  adminPrice?: number;
  lineTotal: number;
  volume?: number;
  volumeUnit?: string;
  profit?: number;
  materialDetails?: string;
};

export type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMode: PaymentMode;
  reference?: string;
  lines: InvoiceLine[];
  total: number;
  createdAt: string;
  amountPaid?: number;
  discrepancy?: number;
  discrepancyMarkedResolved?: boolean;
  priceVariance?: number;
  priceVariancePercentage?: number;
  bhada?: number;
  influencerName?: string;
  influencerContact?: string;
};

export type AppUser = {
  id: string;
  roleId: Role['id'];
  label: string;
  pin: string;
};

export type ExpenseCategory = 'Shop' | 'Labour' | 'Delivery' | 'Purchase' | 'Purchase Bills' | 'Cash Management' | 'Misc';

export type ExpenseEntry = {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
  createdAt: string;
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day';

export type Employee = {
  id: string;
  name: string;
  phone: string;
  role: string;
  salary: number;
  status: 'Active' | 'Inactive';
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
};

export type GoodsPurchase = {
  id: string;
  itemName: string;
  description: string;
  purchaseAmount: number;
  purchaseDate: string;
  notes?: string;
};

export type GoodsSale = {
  id: string;
  purchaseId: string;
  itemName: string;
  saleAmount: number;
  saleDate: string;
  status: 'Partial' | 'Full';
  notes?: string;
};
