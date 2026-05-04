import { create } from 'zustand';

import {
  demoUsers,
  initialCustomers,
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
  persistCurrentUser,
  persistCustomers,
  persistDeliveries,
  persistExpenses,
  persistInvoices,
  persistProducts,
  persistSuppliers,
} from '../data/database';
import {
  ActivityItem,
  AppUser,
  Customer,
  DeliveryEntry,
  ExpenseCategory,
  ExpenseEntry,
  Invoice,
  PaymentMode,
  Product,
  Supplier,
} from '../types';
import { calculateInvoiceTotal, isPositiveInteger, normalizeMoney } from '../utils/finance';

type ActionResult = {
  success: boolean;
  message?: string;
};

type CreateInvoiceInput = {
  customerId: string;
  productId: string;
  quantity: number;
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
  initialize: () => Promise<void>;
  signIn: (roleId: AppUser['roleId'], pin: string) => ActionResult;
  signOut: () => void;
  addProduct: (input: AddProductInput) => void;
  addCustomer: (input: AddCustomerInput) => ActionResult;
  addSupplier: (input: AddSupplierInput) => ActionResult;
  addExpense: (input: AddExpenseInput) => ActionResult;
  adjustProductStock: (productId: string, delta: number) => void;
  createInvoice: (input: CreateInvoiceInput) => ActionResult;
  createDelivery: (input: CreateDeliveryInput) => ActionResult;
  advanceDeliveryStatus: (deliveryId: string) => void;
};

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const createActivity = (title: string, note: string): ActivityItem => ({
  id: createId('act'),
  title,
  note,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

const persistChanges = async (state: Pick<AppState, 'currentUser' | 'products' | 'customers' | 'suppliers' | 'deliveries' | 'expenses' | 'invoices' | 'activities'>) => {
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
  initialize: async () => {
    if (get().isReady) {
      return;
    }

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
      {
        id: createId('cust'),
        name: input.name,
        phone: input.phone,
        address: input.address,
        outstandingBalance: 0,
      },
      ...state.customers,
    ];
    const nextActivities = [
      createActivity('Customer added', `${input.name} is now available for billing and credit tracking.`),
      ...state.activities,
    ].slice(0, 8);

    set({ customers: nextCustomers, activities: nextActivities });
    void persistChanges({
      currentUser: state.currentUser,
      products: state.products,
      customers: nextCustomers,
      suppliers: state.suppliers,
      deliveries: state.deliveries,
      expenses: state.expenses,
      invoices: state.invoices,
      activities: nextActivities,
    });

    return { success: true };
  },
  addSupplier: (input) => {
    const state = get();

    if (!input.name || !input.contactPerson || !input.phone || !input.address || !input.category || !input.materials) {
      return { success: false, message: 'Complete all supplier details before saving.' };
    }

    const nextSuppliers = [
      {
        id: createId('sup'),
        name: input.name,
        contactPerson: input.contactPerson,
        phone: input.phone,
        address: input.address,
        category: input.category,
        materials: input.materials,
        status: input.status,
      },
      ...state.suppliers,
    ];
    const nextActivities = [
      createActivity('Supplier added', `${input.name} is now available for purchase planning.`),
      ...state.activities,
    ].slice(0, 8);

    set({ suppliers: nextSuppliers, activities: nextActivities });
    void persistChanges({
      currentUser: state.currentUser,
      products: state.products,
      customers: state.customers,
      suppliers: nextSuppliers,
      deliveries: state.deliveries,
      expenses: state.expenses,
      invoices: state.invoices,
      activities: nextActivities,
    });

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
      createActivity('Expense recorded', `${input.title} logged under ${input.category}.`),
      ...state.activities,
    ].slice(0, 8);

    set({ expenses: nextExpenses, activities: nextActivities });
    void persistChanges({
      currentUser: state.currentUser,
      products: state.products,
      customers: state.customers,
      suppliers: state.suppliers,
      deliveries: state.deliveries,
      expenses: nextExpenses,
      invoices: state.invoices,
      activities: nextActivities,
    });

    return { success: true };
  },
  addProduct: (input) => {
    const state = get();
    const normalizedPrice = normalizeMoney(input.price);

    if (!input.name || !input.category || !input.unit) {
      return;
    }

    if (![normalizedPrice, input.stockLeft, input.minimumStock].every(isPositiveInteger)) {
      return;
    }

    const nextProducts = [
      {
        id: createId('prod'),
        ...input,
        price: normalizedPrice,
      },
      ...state.products,
    ];
    const nextActivities = [
      createActivity('Product added', `${input.name} is now available in inventory.`),
      ...state.activities,
    ].slice(0, 8);

    set({ products: nextProducts, activities: nextActivities });
    void persistChanges({
      currentUser: state.currentUser,
      products: nextProducts,
      customers: state.customers,
      suppliers: state.suppliers,
      deliveries: state.deliveries,
      expenses: state.expenses,
      invoices: state.invoices,
      activities: nextActivities,
    });
  },
  adjustProductStock: (productId, delta) => {
    const state = get();
    if (!Number.isInteger(delta)) {
      return;
    }

    const nextProducts = state.products.map((product) =>
      product.id === productId
        ? { ...product, stockLeft: Math.max(0, product.stockLeft + delta) }
        : product
    );

    set({ products: nextProducts });
    void persistProducts(nextProducts);
  },
  createInvoice: ({ customerId, paymentMode, productId, quantity, reference }) => {
    const state = get();
    const product = state.products.find((entry) => entry.id === productId);
    const customer = state.customers.find((entry) => entry.id === customerId);

    if (!product || !customer) {
      return { success: false, message: 'Select a valid customer and product.' };
    }

    if (!isPositiveInteger(quantity) || quantity > product.stockLeft) {
      return { success: false, message: 'Quantity must be positive and within available stock.' };
    }

    const total = calculateInvoiceTotal(product.price, quantity);
    const invoice: Invoice = {
      id: createId('inv'),
      customerId: customer.id,
      customerName: customer.name,
      paymentMode,
      reference,
      total,
      createdAt: new Date().toISOString(),
      lines: [
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          lineTotal: total,
        },
      ],
    };

    const nextInvoices = [invoice, ...state.invoices];
    const nextProducts = state.products.map((entry) =>
      entry.id === product.id ? { ...entry, stockLeft: entry.stockLeft - quantity } : entry
    );
    const nextCustomers = state.customers.map((entry) =>
      entry.id === customer.id && paymentMode === 'Credit'
        ? { ...entry, outstandingBalance: entry.outstandingBalance + total }
        : entry
    );
    const nextActivities = [
      createActivity('Invoice created', `${invoice.customerName} billed ${total.toLocaleString()} via ${paymentMode}.`),
      ...state.activities,
    ].slice(0, 8);

    set({
      invoices: nextInvoices,
      products: nextProducts,
      customers: nextCustomers,
      activities: nextActivities,
    });

    void persistChanges({
      currentUser: state.currentUser,
      products: nextProducts,
      customers: nextCustomers,
      suppliers: state.suppliers,
      deliveries: state.deliveries,
      expenses: state.expenses,
      invoices: nextInvoices,
      activities: nextActivities,
    });

    return { success: true };
  },
  createDelivery: ({ assignee, customer, items }) => {
    const state = get();

    if (!customer || !items || !assignee) {
      return { success: false, message: 'Customer, items, and assignee are required.' };
    }

    const nextDeliveries = [
      {
        id: createId('del'),
        customer,
        items,
        assignee,
        status: 'Pending' as const,
      },
      ...state.deliveries,
    ];
    const nextActivities = [
      createActivity('Delivery created', `${customer} delivery assigned to ${assignee}.`),
      ...state.activities,
    ].slice(0, 8);

    set({ deliveries: nextDeliveries, activities: nextActivities });
    void persistChanges({
      currentUser: state.currentUser,
      products: state.products,
      customers: state.customers,
      suppliers: state.suppliers,
      deliveries: nextDeliveries,
      expenses: state.expenses,
      invoices: state.invoices,
      activities: nextActivities,
    });

    return { success: true };
  },
  advanceDeliveryStatus: (deliveryId) => {
    const state = get();
    const nextDeliveries = state.deliveries.map((delivery) => {
      if (delivery.id !== deliveryId) {
        return delivery;
      }

      if (delivery.status === 'Pending') {
        return { ...delivery, status: 'Dispatched' as const };
      }

      if (delivery.status === 'Dispatched') {
        return { ...delivery, status: 'Delivered' as const };
      }

      return delivery;
    });

    set({ deliveries: nextDeliveries });
    void persistDeliveries(nextDeliveries);
  },
}));