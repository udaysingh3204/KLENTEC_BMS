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
  lineTotal: number;
};

export type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  paymentMode: PaymentMode;
  reference?: string;
  lines: InvoiceLine[];
  total: number;
  createdAt: string;
};

export type AppUser = {
  id: string;
  roleId: Role['id'];
  label: string;
  pin: string;
};

export type ExpenseCategory = 'Shop' | 'Labour' | 'Delivery' | 'Purchase' | 'Misc';

export type ExpenseEntry = {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
  createdAt: string;
};