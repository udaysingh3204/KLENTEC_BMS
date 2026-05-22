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
  Invoice,
  InvoiceLine,
  PaymentMode,
  Product,
  Supplier,
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
};

type CreateDeliveryInput = {
  customer: string;
  items: string;
  assignee: string;
};

type AddProductInput = {
  name: string;
  category: string;
  unit: string;
  price: number;
  stockLeft: number;
  minimumStock: number;
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

type ReceivePaymentInput = {
  customerId: string;
  amount: number;
  paymentMode: PaymentMode;
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
  initialize: () => Promise<void>;
  signIn: (roleId: AppUser['roleId'], pin: string) => ActionResult;
  signOut: () => void;
  addProduct: (input: AddProductInput) => ActionResult;
  addCustomer: (input: AddCustomerInput) => ActionResult;
  addSupplier: (input: AddSupplierInput) => ActionResult;
  addExpense: (input: AddExpenseInput) => ActionResult;
  addEmployee: (input: AddEmployeeInput) => ActionResult;
  adjustProductStock: (productId: string, delta: number) => void;
  createInvoice: (input: CreateInvoiceInput) => ActionResult;
  createDelivery: (input: CreateDeliveryInput) => ActionResult;
  advanceDeliveryStatus: (deliveryId: string) => void;
  receivePayment: (input: ReceivePaymentInput) => ActionResult;
  markAttendance: (employeeId: string, status: AttendanceStatus) => void;
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

  initialize: async () => {
    if (get().isReady) return;
    const snapshot = await loadAppSnapshot();
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

  createInvoice: ({ customerId, lines, paymentMode, reference }) => {
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

    const total = resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const invoice: Invoice = {
      id: createId('inv'),
      customerId: customer.id,
      customerName: customer.name,
      paymentMode,
      reference,
      total,
      createdAt: new Date().toISOString(),
      lines: resolvedLines,
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
}));
