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
  price: number; // Current selling price
  costPrice?: number; // Purchase/cost price (what we bought at)
  stockLeft: number;
  minimumStock: number;
  measurementUnit?: string;
  gadiNumber?: string; // Vehicle/Gaadi number for cost tracking - shown during creation only
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
  unitPrice: number; // Selling price per unit
  costPrice?: number; // Purchase/cost price per unit (at time of sale)
  actualPrice?: number;
  adminPrice?: number;
  lineTotal: number;
  volume?: number;
  volumeUnit?: string;
  profit?: number; // (unitPrice - costPrice) * quantity
  profitMargin?: number; // (profit / lineTotal) * 100
  materialDetails?: string;
};

export type UPIAccount = 'Firm' | 'Personal';

export type EditHistoryEntry = {
  timestamp: string;
  field: string;
  oldValue: any;
  newValue: any;
  editedBy: string;
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
  udhar?: number; // Outstanding balance = total - amountPaid (admin view only, not shown to customer)
  discrepancy?: number;
  discrepancyMarkedResolved?: boolean;
  priceVariance?: number;
  priceVariancePercentage?: number;
  bhada?: number;
  dala?: number;
  influencerName?: string;
  influencerContact?: string;
  amountPaidToInfluencer?: number; // Admin tracks payment made to influencer
  upiAccount?: UPIAccount;
  cashPaid?: number;
  upiPaid?: number;
  employeeName?: string;
  invoiceNumber?: string;
  notes?: string;
  profit?: number;
  status?: 'Pending' | 'Completed' | 'Cancelled';
  editHistory?: EditHistoryEntry[]; // Track all edits for audit trail
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

export type InfluencerPayment = {
  id: string;
  influencerId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  invoiceReference?: string;
};

export type Influencer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  commissionRate: number;
  totalReferrals: number;
  totalCommissionEarned: number;
  totalAmountPaid?: number; // Admin tracks actual payments made to influencer
  status: 'Active' | 'Inactive';
  notes?: string;
  createdAt: string;
  paymentHistory?: InfluencerPayment[];
};
