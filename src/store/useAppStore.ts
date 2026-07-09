import { create } from 'zustand';

import {
  demoUsers,
  initialAttendance,
  initialCustomers,
  initialEmployees,
  initialExpenses,
  initialInvoices,
  initialProducts,
  initialSuppliers,
  recentActivities,
  todayDeliveries,
} from '../data/mockData';
import {
  loadAppSnapshot,
  persistActivities,
  persistAttendance,
  persistCurrentUser,
  persistCustomers,
  persistDeliveries,
  persistEmployees,
  persistExpenses,
  persistInvoices,
  persistProducts,
  persistSuppliers,
} from '../data/database';
import {
  ActivityItem,
  AttendanceRecord,
  AttendanceStatus,
  AppUser,
  Customer,
  DeliveryEntry,
  Employee,
  ExpenseCategory,
  ExpenseEntry,
  GoodsPurchase,
  GoodsSale,
  Influencer,
  Invoice,
  InvoiceLine,
  PaymentMode,
  Product,
  Supplier,
  UPIAccount,
} from '../types';
import { calculateInvoiceTotal, formatCurrency, isPositiveInteger, normalizeMoney } from '../utils/finance';

type ActionResult = {
  success: boolean;
  message?: string;
};

type CreateInvoiceLine = {
  productId: string;
  quantity: number;
};

type CreateInvoiceInput = {
  customerId: string;
  lines: CreateInvoiceLine[];
  paymentMode: PaymentMode;
  reference?: string;
  bhada?: number;
  dala?: number;
  amountPaid?: number;
  cashPaid?: number;
  upiPaid?: number;
  influencerName?: string;
  influencerContact?: string;
  upiAccount?: UPIAccount;
  employeeName?: string;
  invoiceNumber?: string;
  notes?: string;
};

type CreateDeliveryInput = {
  customer: string;
  items: string;
  assignee: string;
};

type AddGoodsPurchaseInput = {
  itemName: string;
  description: string;
  purchaseAmount: number;
  notes?: string;
};

type AddGoodsSaleInput = {
  purchaseId: string;
  saleAmount: number;
  status: 'Partial' | 'Full';
  notes?: string;
};

type AddInfluencerInput = {
  name: string;
  phone: string;
  email?: string;
  commissionRate: number;
  notes?: string;
};

type UpdateInfluencerInput = {
  name?: string;
  phone?: string;
  email?: string;
  commissionRate?: number;
  status?: 'Active' | 'Inactive';
  notes?: string;
};

type AddProductInput = {
  name: string;
  category: string;
  unit: string;
  price: number;
  stockLeft: number;
  minimumStock: number;
};

type EditProductInput = {
  id: string;
  name?: string;
  category?: string;
  unit?: string;
  price?: number;
  stockLeft?: number;
  minimumStock?: number;
};

type AddCustomerInput = {
  name: string;
  phone: string;
  address: string;
};

type AddSupplierInput = {
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  category: string;
  materials: string;
  status: Supplier['status'];
};

type AddExpenseInput = {
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
};

type AddEmployeeInput = {
  name: string;
  phone: string;
  role: string;
  salary: number;
};

type EditEmployeeInput = {
  name: string;
  phone: string;
  role: string;
  salary: number;
};

type ReceivePaymentInput = {
  customerId: string;
  amount: number;
  paymentMode: PaymentMode;
};

type EditInvoiceInput = {
  invoiceId: string;
  paymentMode?: PaymentMode;
  reference?: string;
};

type EditCustomerInput = {
  customerId: string;
  name?: string;
  phone?: string;
  address?: string;
};

type EditDeliveryInput = {
  deliveryId: string;
  customer?: string;
  items?: string;
  assignee?: string;
  status?: DeliveryEntry['status'];
};

type AppState = {
  isReady: boolean;
  users: AppUser[];
  currentUser: AppUser | null;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  deliveries: DeliveryEntry[];
  expenses: ExpenseEntry[];
  invoices: Invoice[];
  activities: ActivityItem[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  goodsPurchases: GoodsPurchase[];
  goodsSales: GoodsSale[];
  influencers: Influencer[];
  initialize: () => Promise<void>;
  signIn: (roleId: AppUser['roleId'], pin: string) => ActionResult;
  signOut: () => void;
  changePIN: (oldPin: string, newPin: string) => ActionResult;
  createBackup: () => Promise<string>;
  restoreBackup: (backupJson: string) => ActionResult;
  addProduct: (input: AddProductInput) => ActionResult;
  editProduct: (input: EditProductInput) => ActionResult;
  deleteProduct: (productId: string) => ActionResult;
  addCustomer: (input: AddCustomerInput) => ActionResult;
  editCustomer: (input: EditCustomerInput) => ActionResult;
  deleteCustomer: (customerId: string) => ActionResult;
  addSupplier: (input: AddSupplierInput) => ActionResult;
  editSupplier: (id: string, input: AddSupplierInput) => ActionResult;
  deleteSupplier: (id: string) => ActionResult;
  addExpense: (input: AddExpenseInput) => ActionResult;
  addEmployee: (input: AddEmployeeInput) => ActionResult;
  editEmployee: (id: string, input: EditEmployeeInput) => ActionResult;
  deleteEmployee: (id: string) => ActionResult;
  adjustProductStock: (productId: string, delta: number) => void;
  createInvoice: (input: CreateInvoiceInput) => ActionResult;
  editInvoice: (input: EditInvoiceInput) => ActionResult;
  deleteInvoice: (invoiceId: string) => ActionResult;
  createDelivery: (input: CreateDeliveryInput) => ActionResult;
  editDelivery: (input: EditDeliveryInput) => ActionResult;
  deleteDelivery: (deliveryId: string) => ActionResult;
  advanceDeliveryStatus: (deliveryId: string) => void;
  receivePayment: (input: ReceivePaymentInput) => ActionResult;
  markAttendance: (employeeId: string, status: AttendanceStatus) => void;
  addGoodsPurchase: (input: AddGoodsPurchaseInput) => ActionResult;
  addGoodsSale: (input: AddGoodsSaleInput) => ActionResult;
  addInfluencer: (input: AddInfluencerInput) => ActionResult;
  updateInfluencer: (id: string, input: UpdateInfluencerInput) => ActionResult;
  deleteInfluencer: (id: string) => ActionResult;
};

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const todayDateString = () => new Date().toISOString().split('T')[0];

const createActivity = (title: string, note: string): ActivityItem => ({
  id: createId('act'),
  title,
  note,
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
});

const persistCore = async (
  state: Pick<AppState, 'currentUser' | 'products' | 'customers' | 'suppliers' | 'deliveries' | 'expenses' | 'invoices' | 'activities'>
) => {
  await Promise.all([
    persistCurrentUser(state.currentUser),
    persistProducts(state.products),
    persistCustomers(state.customers),
    persistSuppliers(state.suppliers),
    persistDeliveries(state.deliveries),
    persistExpenses(state.expenses),
    persistInvoices(state.invoices),
    persistActivities(state.activities),
  ]);
};

export const useAppStore = create<AppState>((set, get) => ({
  isReady: false,
  users: demoUsers,
  currentUser: null,
  products: initialProducts,
  customers: initialCustomers,
  suppliers: initialSuppliers,
  deliveries: todayDeliveries,
  expenses: initialExpenses,
  invoices: initialInvoices,
  activities: recentActivities,
  employees: initialEmployees,
  attendance: initialAttendance,
  goodsPurchases: [],
  goodsSales: [],
  influencers: [],

  initialize: async () => {
    if (get().isReady) return;
    const snapshot = await loadAppSnapshot();

    // Create default admin user on first launch if no users exist
    if (!snapshot.users || snapshot.users.length === 0) {
      const defaultAdmin: AppUser = {
        id: 'admin-default',
        roleId: 'admin',
        label: 'Admin',
        pin: '1234',
      };
      snapshot.users = [defaultAdmin];
    }

    set({ ...snapshot, isReady: true });
  },

  signIn: (roleId, pin) => {
    const matchedUser = get().users.find((user) => user.roleId === roleId && user.pin === pin);
    if (!matchedUser) {
      return { success: false, message: 'Invalid PIN for the selected role.' };
    }
    set({ currentUser: matchedUser });
    void persistCurrentUser(matchedUser);
    return { success: true };
  },

  signOut: () => {
    set({ currentUser: null });
    void persistCurrentUser(null);
  },

  changePIN: (oldPin: string, newPin: string) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (currentUser.pin !== oldPin) {
      return { success: false, message: 'Current PIN is incorrect' };
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return { success: false, message: 'PIN must be 4 digits' };
    }

    const updatedUser = { ...currentUser, pin: newPin };
    set({ currentUser: updatedUser });

    const updatedUsers = get().users.map((u) =>
      u.id === currentUser.id ? updatedUser : u
    );
    set({ users: updatedUsers });

    void persistCurrentUser(updatedUser);

    return { success: true, message: 'PIN changed successfully' };
  },

  createBackup: async () => {
    const state = get();
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        invoices: state.invoices,
        customers: state.customers,
        products: state.products,
        expenses: state.expenses,
        employees: state.employees,
        suppliers: state.suppliers,
        activities: state.activities,
        attendance: state.attendance,
        goodsPurchases: state.goodsPurchases,
        goodsSales: state.goodsSales,
        influencers: state.influencers,
      },
    };

    return JSON.stringify(backup, null, 2);
  },

  restoreBackup: (backupJson: string) => {
    try {
      const backup = JSON.parse(backupJson);

      if (!backup.data || backup.version !== '1.0.0') {
        return { success: false, message: 'Invalid backup file format' };
      }

      set({
        invoices: backup.data.invoices || [],
        customers: backup.data.customers || [],
        products: backup.data.products || [],
        expenses: backup.data.expenses || [],
        employees: backup.data.employees || [],
        suppliers: backup.data.suppliers || [],
        activities: backup.data.activities || [],
        attendance: backup.data.attendance || [],
        goodsPurchases: backup.data.goodsPurchases || [],
        goodsSales: backup.data.goodsSales || [],
        influencers: backup.data.influencers || [],
      });

      void Promise.all([
        persistInvoices(backup.data.invoices || []),
        persistCustomers(backup.data.customers || []),
        persistProducts(backup.data.products || []),
        persistExpenses(backup.data.expenses || []),
        persistEmployees(backup.data.employees || []),
        persistSuppliers(backup.data.suppliers || []),
        persistActivities(backup.data.activities || []),
        persistAttendance(backup.data.attendance || []),
      ]);

      return { success: true, message: 'Backup restored successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to restore backup. Invalid file.' };
    }
  },

  addCustomer: (input) => {
    const state = get();
    if (!input.name || !input.phone || !input.address) {
      return { success: false, message: 'Name, phone, and address are required.' };
    }
    const nextCustomers = [
      { id: createId('cust'), name: input.name, phone: input.phone, address: input.address, outstandingBalance: 0 },
      ...state.customers,
    ];
    const nextActivities = [
      createActivity('Customer added', `${input.name} registered for billing and credit tracking.`),
      ...state.activities,
    ].slice(0, 20);
    set({ customers: nextCustomers, activities: nextActivities });
    void persistCore({ ...state, customers: nextCustomers, activities: nextActivities });
    return { success: true };
  },

  editCustomer: (input) => {
    const state = get();
    const customer = state.customers.find((c) => c.id === input.customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found.' };
    }
    const updated = { ...customer };
    if (input.name !== undefined) updated.name = input.name;
    if (input.phone !== undefined) updated.phone = input.phone;
    if (input.address !== undefined) updated.address = input.address;
    const nextCustomers = state.customers.map((c) => (c.id === input.customerId ? updated : c));
    const nextActivities = [
      createActivity('Customer updated', `${updated.name} contact details modified.`),
      ...state.activities,
    ].slice(0, 20);
    set({ customers: nextCustomers, activities: nextActivities });
    void persistCore({ ...state, customers: nextCustomers, activities: nextActivities });
    return { success: true };
  },

  deleteCustomer: (customerId) => {
    const state = get();
    const customer = state.customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found.' };
    }
    if (customer.outstandingBalance > 0) {
      return { success: false, message: `Cannot delete customer with outstanding balance (${formatCurrency(customer.outstandingBalance)}).` };
    }
    const nextCustomers = state.customers.filter((c) => c.id !== customerId);
    const nextActivities = [
      createActivity('Customer deleted', `${customer.name} removed from directory.`),
      ...state.activities,
    ].slice(0, 20);
    set({ customers: nextCustomers, activities: nextActivities });
    void persistCore({ ...state, customers: nextCustomers, activities: nextActivities });
    return { success: true };
  },

  addSupplier: (input) => {
    const state = get();
    if (!input.name || !input.contactPerson || !input.phone || !input.address || !input.category || !input.materials) {
      return { success: false, message: 'Complete all supplier details before saving.' };
    }
    const nextSuppliers = [
      { id: createId('sup'), ...input },
      ...state.suppliers,
    ];
    const nextActivities = [
      createActivity('Supplier added', `${input.name} added to supplier directory.`),
      ...state.activities,
    ].slice(0, 20);
    set({ suppliers: nextSuppliers, activities: nextActivities });
    void persistCore({ ...state, suppliers: nextSuppliers, activities: nextActivities });
    return { success: true };
  },

  editSupplier: (id, input) => {
    const state = get();
    const supplier = state.suppliers.find((s) => s.id === id);
    if (!supplier) return { success: false, message: 'Supplier not found.' };
    if (!input.name || !input.contactPerson || !input.phone || !input.address || !input.category || !input.materials) {
      return { success: false, message: 'Complete all supplier details before saving.' };
    }
    const nextSuppliers = state.suppliers.map((s) =>
      s.id === id ? { ...s, name: input.name, contactPerson: input.contactPerson, phone: input.phone, address: input.address, category: input.category, materials: input.materials, status: input.status } : s
    );
    const nextActivities = [
      createActivity('Supplier updated', `${input.name} supplier information updated.`),
      ...state.activities,
    ].slice(0, 20);
    set({ suppliers: nextSuppliers, activities: nextActivities });
    void persistCore({ ...state, suppliers: nextSuppliers, activities: nextActivities });
    return { success: true };
  },

  deleteSupplier: (id) => {
    const state = get();
    const supplier = state.suppliers.find((s) => s.id === id);
    if (!supplier) return { success: false, message: 'Supplier not found.' };
    const nextSuppliers = state.suppliers.filter((s) => s.id !== id);
    const nextActivities = [
      createActivity('Supplier removed', `${supplier.name} removed from supplier directory.`),
      ...state.activities,
    ].slice(0, 20);
    set({ suppliers: nextSuppliers, activities: nextActivities });
    void persistCore({ ...state, suppliers: nextSuppliers, activities: nextActivities });
    return { success: true };
  },

  addExpense: (input) => {
    const state = get();
    const normalizedAmount = normalizeMoney(input.amount);
    if (!input.title || !isPositiveInteger(normalizedAmount)) {
      return { success: false, message: 'Title and a positive amount are required.' };
    }
    const nextExpenses = [
      {
        id: createId('exp'),
        title: input.title,
        category: input.category,
        amount: normalizedAmount,
        paymentMode: input.paymentMode,
        createdAt: new Date().toISOString(),
      },
      ...state.expenses,
    ];
    const nextActivities = [
      createActivity('Expense recorded', `${input.title} — ${formatCurrency(normalizedAmount)} via ${input.paymentMode}.`),
      ...state.activities,
    ].slice(0, 20);
    set({ expenses: nextExpenses, activities: nextActivities });
    void persistCore({ ...state, expenses: nextExpenses, activities: nextActivities });
    return { success: true };
  },

  addProduct: (input) => {
    const state = get();
    const normalizedPrice = normalizeMoney(input.price);
    if (!input.name || !input.category || !input.unit) {
      return { success: false, message: 'Name, category, and unit are required.' };
    }
    if (![normalizedPrice, input.stockLeft, input.minimumStock].every(isPositiveInteger)) {
      return { success: false, message: 'Price, stock, and minimum stock must be positive whole numbers.' };
    }
    const nextProducts = [
      { id: createId('prod'), ...input, price: normalizedPrice },
      ...state.products,
    ];
    const nextActivities = [
      createActivity('Product added', `${input.name} added to inventory.`),
      ...state.activities,
    ].slice(0, 20);
    set({ products: nextProducts, activities: nextActivities });
    void persistCore({ ...state, products: nextProducts, activities: nextActivities });
    return { success: true };
  },

  editProduct: (input) => {
    const state = get();
    const product = state.products.find((p) => p.id === input.id);
    if (!product) {
      return { success: false, message: 'Product not found.' };
    }
    const updated = { ...product };
    if (input.name !== undefined) updated.name = input.name;
    if (input.category !== undefined) updated.category = input.category;
    if (input.unit !== undefined) updated.unit = input.unit;
    if (input.price !== undefined) {
      const normalized = normalizeMoney(input.price);
      if (!isPositiveInteger(normalized)) return { success: false, message: 'Price must be a positive whole number.' };
      updated.price = normalized;
    }
    if (input.stockLeft !== undefined) {
      if (!isPositiveInteger(input.stockLeft)) return { success: false, message: 'Stock must be a positive whole number.' };
      updated.stockLeft = input.stockLeft;
    }
    if (input.minimumStock !== undefined) {
      if (!isPositiveInteger(input.minimumStock)) return { success: false, message: 'Minimum stock must be a positive whole number.' };
      updated.minimumStock = input.minimumStock;
    }
    const nextProducts = state.products.map((p) => (p.id === input.id ? updated : p));
    const nextActivities = [
      createActivity('Product updated', `${updated.name} details modified.`),
      ...state.activities,
    ].slice(0, 20);
    set({ products: nextProducts, activities: nextActivities });
    void persistCore({ ...state, products: nextProducts, activities: nextActivities });
    return { success: true };
  },

  deleteProduct: (productId) => {
    const state = get();
    const product = state.products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: 'Product not found.' };
    }
    const nextProducts = state.products.filter((p) => p.id !== productId);
    const nextActivities = [
      createActivity('Product deleted', `${product.name} removed from inventory.`),
      ...state.activities,
    ].slice(0, 20);
    set({ products: nextProducts, activities: nextActivities });
    void persistCore({ ...state, products: nextProducts, activities: nextActivities });
    return { success: true };
  },

  addEmployee: (input) => {
    const state = get();
    if (!input.name || !input.phone || !input.role) {
      return { success: false, message: 'Name, phone, and role are required.' };
    }
    const normalizedSalary = normalizeMoney(input.salary);
    if (!isPositiveInteger(normalizedSalary)) {
      return { success: false, message: 'Salary must be a positive amount.' };
    }
    const nextEmployees = [
      {
        id: createId('emp'),
        name: input.name,
        phone: input.phone,
        role: input.role,
        salary: normalizedSalary,
        status: 'Active' as const,
      },
      ...state.employees,
    ];
    const nextActivities = [
      createActivity('Employee added', `${input.name} (${input.role}) added to team.`),
      ...state.activities,
    ].slice(0, 20);
    set({ employees: nextEmployees, activities: nextActivities });
    void persistEmployees(nextEmployees);
    void persistActivities(nextActivities);
    return { success: true };
  },

  editEmployee: (id, input) => {
    const state = get();
    const employee = state.employees.find((e) => e.id === id);
    if (!employee) return { success: false, message: 'Employee not found.' };
    if (!input.name || !input.phone || !input.role) {
      return { success: false, message: 'Name, phone, and role are required.' };
    }
    const normalizedSalary = normalizeMoney(input.salary);
    if (!isPositiveInteger(normalizedSalary)) {
      return { success: false, message: 'Salary must be a positive amount.' };
    }
    const nextEmployees = state.employees.map((e) =>
      e.id === id ? { ...e, name: input.name, phone: input.phone, role: input.role, salary: normalizedSalary } : e
    );
    const nextActivities = [
      createActivity('Employee updated', `${input.name} (${input.role}) information updated.`),
      ...state.activities,
    ].slice(0, 20);
    set({ employees: nextEmployees, activities: nextActivities });
    void persistEmployees(nextEmployees);
    void persistActivities(nextActivities);
    return { success: true };
  },

  deleteEmployee: (id) => {
    const state = get();
    const employee = state.employees.find((e) => e.id === id);
    if (!employee) return { success: false, message: 'Employee not found.' };
    const nextEmployees = state.employees.filter((e) => e.id !== id);
    const nextActivities = [
      createActivity('Employee removed', `${employee.name} removed from team.`),
      ...state.activities,
    ].slice(0, 20);
    set({ employees: nextEmployees, activities: nextActivities });
    void persistEmployees(nextEmployees);
    void persistActivities(nextActivities);
    return { success: true };
  },

  adjustProductStock: (productId, delta) => {
    const state = get();
    if (!Number.isInteger(delta)) return;
    const nextProducts = state.products.map((product) =>
      product.id === productId
        ? { ...product, stockLeft: Math.max(0, product.stockLeft + delta) }
        : product
    );
    set({ products: nextProducts });
    void persistProducts(nextProducts);
  },

  createInvoice: ({ customerId, lines, paymentMode, reference, bhada, dala, amountPaid, cashPaid, upiPaid, influencerName, influencerContact, upiAccount, employeeName, invoiceNumber, notes }) => {
    const state = get();
    const customer = state.customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, message: 'Select a valid customer.' };
    }
    if (!lines.length) {
      return { success: false, message: 'Add at least one item to the invoice.' };
    }

    const resolvedLines: InvoiceLine[] = [];
    const stockUpdates: Record<string, number> = {};

    for (const line of lines) {
      const product = state.products.find((p) => p.id === line.productId);
      if (!product) {
        return { success: false, message: `Product not found for one of the items.` };
      }
      if (!isPositiveInteger(line.quantity)) {
        return { success: false, message: `Quantity for ${product.name} must be a positive whole number.` };
      }
      const currentStock = product.stockLeft - (stockUpdates[product.id] ?? 0);
      if (line.quantity > currentStock) {
        return { success: false, message: `Not enough stock for ${product.name}. Available: ${currentStock}.` };
      }
      stockUpdates[product.id] = (stockUpdates[product.id] ?? 0) + line.quantity;
      resolvedLines.push({
        productId: product.id,
        productName: product.name,
        quantity: line.quantity,
        unitPrice: product.price,
        lineTotal: calculateInvoiceTotal(product.price, line.quantity),
      });
    }

    const linesTotal = resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const total = linesTotal + (bhada || 0);
    const profit = total;
    const invoice: Invoice = {
      id: createId('inv'),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      paymentMode,
      reference,
      total,
      createdAt: new Date().toISOString(),
      lines: resolvedLines,
      amountPaid,
      bhada,
      dala,
      cashPaid,
      upiPaid,
      influencerName,
      influencerContact,
      upiAccount,
      employeeName,
      invoiceNumber,
      notes,
      profit,
      status: 'Completed',
    };

    const nextInvoices = [invoice, ...state.invoices];
    const nextProducts = state.products.map((p) =>
      stockUpdates[p.id] !== undefined
        ? { ...p, stockLeft: p.stockLeft - (stockUpdates[p.id] ?? 0) }
        : p
    );
    const nextCustomers = state.customers.map((c) =>
      c.id === customer.id && paymentMode === 'Credit'
        ? { ...c, outstandingBalance: c.outstandingBalance + total }
        : c
    );
    const itemSummary = resolvedLines.map((l) => `${l.quantity} ${l.productName}`).join(', ');
    const nextActivities = [
      createActivity(
        'Invoice created',
        `${customer.name} — ${itemSummary} — ${formatCurrency(total)} via ${paymentMode}.`
      ),
      ...state.activities,
    ].slice(0, 20);

    set({ invoices: nextInvoices, products: nextProducts, customers: nextCustomers, activities: nextActivities });
    void persistCore({ ...state, invoices: nextInvoices, products: nextProducts, customers: nextCustomers, activities: nextActivities });
    return { success: true };
  },

  editInvoice: ({ invoiceId, paymentMode, reference }) => {
    const state = get();
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      return { success: false, message: 'Invoice not found.' };
    }
    const updated = { ...invoice };
    if (paymentMode !== undefined) updated.paymentMode = paymentMode;
    if (reference !== undefined) updated.reference = reference;
    const nextInvoices = state.invoices.map((inv) => (inv.id === invoiceId ? updated : inv));
    const nextActivities = [
      createActivity('Invoice updated', `Invoice #${invoice.id.slice(-6)} payment mode updated.`),
      ...state.activities,
    ].slice(0, 20);
    set({ invoices: nextInvoices, activities: nextActivities });
    void persistCore({ ...state, invoices: nextInvoices, activities: nextActivities });
    return { success: true };
  },

  deleteInvoice: (invoiceId) => {
    const state = get();
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      return { success: false, message: 'Invoice not found.' };
    }
    const nextInvoices = state.invoices.filter((inv) => inv.id !== invoiceId);
    const nextProducts = state.products.map((product) => {
      const lineForProduct = invoice.lines.find((l) => l.productId === product.id);
      if (!lineForProduct) return product;
      return { ...product, stockLeft: product.stockLeft + lineForProduct.quantity };
    });
    const nextCustomers = state.customers.map((customer) =>
      customer.id === invoice.customerId && invoice.paymentMode === 'Credit'
        ? { ...customer, outstandingBalance: Math.max(0, customer.outstandingBalance - invoice.total) }
        : customer
    );
    const nextActivities = [
      createActivity('Invoice deleted', `Invoice #${invoice.id.slice(-6)} from ${invoice.customerName} reversed.`),
      ...state.activities,
    ].slice(0, 20);
    set({ invoices: nextInvoices, products: nextProducts, customers: nextCustomers, activities: nextActivities });
    void persistCore({ ...state, invoices: nextInvoices, products: nextProducts, customers: nextCustomers, activities: nextActivities });
    return { success: true };
  },

  createDelivery: ({ assignee, customer, items }) => {
    const state = get();
    if (!customer || !items || !assignee) {
      return { success: false, message: 'Customer, items, and assignee are required.' };
    }
    const nextDeliveries = [
      { id: createId('del'), customer, items, assignee, status: 'Pending' as const },
      ...state.deliveries,
    ];
    const nextActivities = [
      createActivity('Delivery created', `${customer} delivery assigned to ${assignee}.`),
      ...state.activities,
    ].slice(0, 20);
    set({ deliveries: nextDeliveries, activities: nextActivities });
    void persistCore({ ...state, deliveries: nextDeliveries, activities: nextActivities });
    return { success: true };
  },

  editDelivery: ({ deliveryId, customer, items, assignee, status }) => {
    const state = get();
    const delivery = state.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      return { success: false, message: 'Delivery not found.' };
    }
    const updated = { ...delivery };
    if (customer !== undefined) updated.customer = customer;
    if (items !== undefined) updated.items = items;
    if (assignee !== undefined) updated.assignee = assignee;
    if (status !== undefined) updated.status = status;
    const nextDeliveries = state.deliveries.map((d) => (d.id === deliveryId ? updated : d));
    const nextActivities = [
      createActivity('Delivery updated', `Delivery for ${updated.customer} updated.`),
      ...state.activities,
    ].slice(0, 20);
    set({ deliveries: nextDeliveries, activities: nextActivities });
    void persistCore({ ...state, deliveries: nextDeliveries, activities: nextActivities });
    return { success: true };
  },

  deleteDelivery: (deliveryId) => {
    const state = get();
    const delivery = state.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      return { success: false, message: 'Delivery not found.' };
    }
    const nextDeliveries = state.deliveries.filter((d) => d.id !== deliveryId);
    const nextActivities = [
      createActivity('Delivery deleted', `Delivery for ${delivery.customer} removed from queue.`),
      ...state.activities,
    ].slice(0, 20);
    set({ deliveries: nextDeliveries, activities: nextActivities });
    void persistCore({ ...state, deliveries: nextDeliveries, activities: nextActivities });
    return { success: true };
  },

  advanceDeliveryStatus: (deliveryId) => {
    const state = get();
    const nextDeliveries = state.deliveries.map((delivery) => {
      if (delivery.id !== deliveryId) return delivery;
      if (delivery.status === 'Pending') return { ...delivery, status: 'Dispatched' as const };
      if (delivery.status === 'Dispatched') return { ...delivery, status: 'Delivered' as const };
      return delivery;
    });
    set({ deliveries: nextDeliveries });
    void persistDeliveries(nextDeliveries);
  },

  receivePayment: ({ customerId, amount, paymentMode }) => {
    const state = get();
    const customer = state.customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found.' };
    }
    const normalizedAmount = normalizeMoney(amount);
    if (!isPositiveInteger(normalizedAmount)) {
      return { success: false, message: 'Amount must be a positive whole number.' };
    }
    const newBalance = Math.max(0, customer.outstandingBalance - normalizedAmount);
    const nextCustomers = state.customers.map((c) =>
      c.id === customerId ? { ...c, outstandingBalance: newBalance } : c
    );
    const nextActivities = [
      createActivity(
        'Payment received',
        `${customer.name} paid ${formatCurrency(normalizedAmount)} via ${paymentMode}. Balance: ${formatCurrency(newBalance)}.`
      ),
      ...state.activities,
    ].slice(0, 20);
    set({ customers: nextCustomers, activities: nextActivities });
    void persistCustomers(nextCustomers);
    void persistActivities(nextActivities);
    return { success: true };
  },

  markAttendance: (employeeId, status) => {
    const state = get();
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee) return;

    const today = todayDateString();
    const existingIdx = state.attendance.findIndex(
      (a) => a.employeeId === employeeId && a.date === today
    );

    let nextAttendance: AttendanceRecord[];
    if (existingIdx >= 0) {
      nextAttendance = state.attendance.map((a, idx) =>
        idx === existingIdx ? { ...a, status } : a
      );
    } else {
      nextAttendance = [
        { id: createId('att'), employeeId, employeeName: employee.name, date: today, status },
        ...state.attendance,
      ];
    }

    set({ attendance: nextAttendance });
    void persistAttendance(nextAttendance);
  },

  addGoodsPurchase: (input) => {
    const state = get();
    const purchase: GoodsPurchase = {
      id: createId('gp'),
      itemName: input.itemName,
      description: input.description,
      purchaseAmount: input.purchaseAmount,
      purchaseDate: new Date().toISOString(),
      notes: input.notes,
    };

    const nextPurchases = [purchase, ...state.goodsPurchases];
    set({ goodsPurchases: nextPurchases });
    return { success: true };
  },

  addGoodsSale: (input) => {
    const state = get();
    const purchase = state.goodsPurchases.find((p) => p.id === input.purchaseId);
    if (!purchase) {
      return { success: false, message: 'Purchase record not found' };
    }

    const sale: GoodsSale = {
      id: createId('gs'),
      purchaseId: input.purchaseId,
      itemName: purchase.itemName,
      saleAmount: input.saleAmount,
      saleDate: new Date().toISOString(),
      status: input.status,
      notes: input.notes,
    };

    const nextSales = [sale, ...state.goodsSales];
    set({ goodsSales: nextSales });
    return { success: true };
  },

  addInfluencer: (input) => {
    const state = get();
    if (!input.name.trim() || !input.phone.trim()) {
      return { success: false, error: 'Name and phone are required' };
    }

    if (input.commissionRate < 0 || input.commissionRate > 100) {
      return { success: false, error: 'Commission rate must be 0-100' };
    }

    const influencer: Influencer = {
      id: createId('inf'),
      name: input.name,
      phone: input.phone,
      email: input.email,
      commissionRate: input.commissionRate,
      totalReferrals: 0,
      totalCommissionEarned: 0,
      status: 'Active',
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    const nextInfluencers = [influencer, ...state.influencers];
    set({ influencers: nextInfluencers });
    return { success: true };
  },

  updateInfluencer: (id, input) => {
    const state = get();
    const influencer = state.influencers.find((inf) => inf.id === id);
    if (!influencer) {
      return { success: false, error: 'Influencer not found' };
    }

    const updated: Influencer = {
      ...influencer,
      name: input.name ?? influencer.name,
      phone: input.phone ?? influencer.phone,
      email: input.email ?? influencer.email,
      commissionRate: input.commissionRate ?? influencer.commissionRate,
      status: input.status ?? influencer.status,
      notes: input.notes !== undefined ? input.notes : influencer.notes,
    };

    const nextInfluencers = state.influencers.map((inf) => (inf.id === id ? updated : inf));
    set({ influencers: nextInfluencers });
    return { success: true };
  },

  deleteInfluencer: (id) => {
    const state = get();
    const filtered = state.influencers.filter((inf) => inf.id !== id);
    set({ influencers: filtered });
    return { success: true };
  },
}));
