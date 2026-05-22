import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
} from './mockData';
import {
  ActivityItem,
  AttendanceRecord,
  AppUser,
  Customer,
  DeliveryEntry,
  Employee,
  ExpenseEntry,
  Invoice,
  Product,
  Supplier,
} from '../types';

type SessionRow = {
  key: string;
  value: string;
};

type InvoiceRow = {
  id: string;
  customerId: string;
  customerName: string;
  paymentMode: Invoice['paymentMode'];
  reference: string | null;
  total: number;
  createdAt: string;
  lines: string;
};

export type AppSnapshot = {
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
};

type WebDatabaseState = {
  users: AppUser[];
  sessionUserId: string;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  deliveries: DeliveryEntry[];
  expenses: ExpenseEntry[];
  invoices: Invoice[];
  activities: ActivityItem[];
  employees: Employee[];
  attendance: AttendanceRecord[];
};

type SQLiteDatabase = {
  execAsync: (source: string) => Promise<void>;
  runAsync: (source: string, ...params: Array<string | number | null>) => Promise<unknown>;
  getFirstAsync: <T>(source: string, ...params: Array<string | number | null>) => Promise<T | null>;
  getAllAsync: <T>(source: string, ...params: Array<string | number | null>) => Promise<T[]>;
};

const WEB_STORAGE_KEY = 'klentec-bms-web-db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

function getDefaultState(): WebDatabaseState {
  return {
    users: demoUsers,
    sessionUserId: '',
    products: initialProducts,
    customers: initialCustomers,
    suppliers: initialSuppliers,
    deliveries: todayDeliveries,
    expenses: initialExpenses,
    invoices: initialInvoices,
    activities: recentActivities,
    employees: initialEmployees,
    attendance: initialAttendance,
  };
}

async function loadWebState() {
  const rawValue = await AsyncStorage.getItem(WEB_STORAGE_KEY);

  if (!rawValue) {
    const defaultState = getDefaultState();
    await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }

  return {
    ...getDefaultState(),
    ...(JSON.parse(rawValue) as Partial<WebDatabaseState>),
  } as WebDatabaseState;
}

async function saveWebState(state: WebDatabaseState) {
  await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(state));
}

async function getDatabase() {
  if (Platform.OS === 'web') {
    throw new Error('SQLite database is not used on web.');
  }

  if (!databasePromise) {
    databasePromise = import('expo-sqlite').then((sqlite) => sqlite.openDatabaseAsync('klentec-bms.db'));
  }

  return databasePromise;
}

async function replaceTableRows<T>(
  database: SQLiteDatabase,
  tableName: string,
  query: string,
  items: T[],
  bindValues: (item: T) => Array<string | number | null>
) {
  await database.execAsync(`DELETE FROM ${tableName};`);

  for (const item of items) {
    await database.runAsync(query, ...bindValues(item));
  }
}

export async function initializeDatabase() {
  if (Platform.OS === 'web') {
    await loadWebState();
    return null;
  }

  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      roleId TEXT NOT NULL,
      label TEXT NOT NULL,
      pin TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      stockLeft INTEGER NOT NULL,
      minimumStock INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      outstandingBalance REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      contactPerson TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      category TEXT NOT NULL,
      materials TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY NOT NULL,
      customer TEXT NOT NULL,
      items TEXT NOT NULL,
      assignee TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY NOT NULL,
      customerId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      paymentMode TEXT NOT NULL,
      reference TEXT,
      total REAL NOT NULL,
      createdAt TEXT NOT NULL,
      lines TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      paymentMode TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      note TEXT NOT NULL,
      time TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      salary REAL NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY NOT NULL,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS session_state (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const existingProducts = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM products;'
  );
  const existingSuppliers = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM suppliers;'
  );
  const existingEmployees = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM employees;'
  );

  if ((existingProducts?.count ?? 0) === 0) {
    await seedDatabase(database);
  } else {
    if ((existingSuppliers?.count ?? 0) === 0) {
      await replaceTableRows(
        database,
        'suppliers',
        'INSERT INTO suppliers (id, name, contactPerson, phone, address, category, materials, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        initialSuppliers,
        (item) => [item.id, item.name, item.contactPerson, item.phone, item.address, item.category, item.materials, item.status]
      );
    }
    if ((existingEmployees?.count ?? 0) === 0) {
      await replaceTableRows(
        database,
        'employees',
        'INSERT INTO employees (id, name, phone, role, salary, status) VALUES (?, ?, ?, ?, ?, ?);',
        initialEmployees,
        (item) => [item.id, item.name, item.phone, item.role, item.salary, item.status]
      );
    }
  }

  return database;
}

async function seedDatabase(database: SQLiteDatabase) {
  await replaceTableRows(
    database,
    'users',
    'INSERT INTO users (id, roleId, label, pin) VALUES (?, ?, ?, ?);',
    demoUsers,
    (item) => [item.id, item.roleId, item.label, item.pin]
  );
  await replaceTableRows(
    database,
    'products',
    'INSERT INTO products (id, name, category, unit, price, stockLeft, minimumStock) VALUES (?, ?, ?, ?, ?, ?, ?);',
    initialProducts,
    (item) => [item.id, item.name, item.category, item.unit, item.price, item.stockLeft, item.minimumStock]
  );
  await replaceTableRows(
    database,
    'customers',
    'INSERT INTO customers (id, name, phone, address, outstandingBalance) VALUES (?, ?, ?, ?, ?);',
    initialCustomers,
    (item) => [item.id, item.name, item.phone, item.address, item.outstandingBalance]
  );
  await replaceTableRows(
    database,
    'suppliers',
    'INSERT INTO suppliers (id, name, contactPerson, phone, address, category, materials, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    initialSuppliers,
    (item) => [item.id, item.name, item.contactPerson, item.phone, item.address, item.category, item.materials, item.status]
  );
  await replaceTableRows(
    database,
    'deliveries',
    'INSERT INTO deliveries (id, customer, items, assignee, status) VALUES (?, ?, ?, ?, ?);',
    todayDeliveries,
    (item) => [item.id, item.customer, item.items, item.assignee, item.status]
  );
  await replaceTableRows(
    database,
    'expenses',
    'INSERT INTO expenses (id, title, category, amount, paymentMode, createdAt) VALUES (?, ?, ?, ?, ?, ?);',
    initialExpenses,
    (item) => [item.id, item.title, item.category, item.amount, item.paymentMode, item.createdAt]
  );
  await replaceTableRows(
    database,
    'invoices',
    'INSERT INTO invoices (id, customerId, customerName, paymentMode, reference, total, createdAt, lines) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    initialInvoices,
    (item) => [
      item.id,
      item.customerId,
      item.customerName,
      item.paymentMode,
      item.reference ?? null,
      item.total,
      item.createdAt,
      JSON.stringify(item.lines),
    ]
  );
  await replaceTableRows(
    database,
    'activities',
    'INSERT INTO activities (id, title, note, time) VALUES (?, ?, ?, ?);',
    recentActivities,
    (item) => [item.id, item.title, item.note, item.time]
  );
  await replaceTableRows(
    database,
    'employees',
    'INSERT INTO employees (id, name, phone, role, salary, status) VALUES (?, ?, ?, ?, ?, ?);',
    initialEmployees,
    (item) => [item.id, item.name, item.phone, item.role, item.salary, item.status]
  );
  await database.runAsync(
    'INSERT OR REPLACE INTO session_state (key, value) VALUES (?, ?);',
    'currentUserId',
    ''
  );
}

export async function loadAppSnapshot(): Promise<AppSnapshot> {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    return {
      users: state.users,
      currentUser: state.users.find((user) => user.id === state.sessionUserId) ?? null,
      products: state.products,
      customers: state.customers,
      suppliers: state.suppliers,
      deliveries: state.deliveries,
      expenses: state.expenses,
      invoices: state.invoices,
      activities: state.activities,
      employees: state.employees ?? initialEmployees,
      attendance: state.attendance ?? [],
    };
  }

  const database = await initializeDatabase();
  if (!database) {
    return {
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
      attendance: [],
    };
  }

  const users = await database.getAllAsync<AppUser>('SELECT * FROM users ORDER BY label ASC;');
  const products = await database.getAllAsync<Product>('SELECT * FROM products ORDER BY name ASC;');
  const customers = await database.getAllAsync<Customer>('SELECT * FROM customers ORDER BY name ASC;');
  const suppliers = await database.getAllAsync<Supplier>('SELECT * FROM suppliers ORDER BY name ASC;');
  const deliveries = await database.getAllAsync<DeliveryEntry>('SELECT * FROM deliveries ORDER BY rowid DESC;');
  const expenses = await database.getAllAsync<ExpenseEntry>('SELECT * FROM expenses ORDER BY createdAt DESC;');
  const invoiceRows = await database.getAllAsync<InvoiceRow>('SELECT * FROM invoices ORDER BY createdAt DESC;');
  const activities = await database.getAllAsync<ActivityItem>('SELECT * FROM activities ORDER BY rowid DESC;');
  const employees = await database.getAllAsync<Employee>('SELECT * FROM employees ORDER BY name ASC;');
  const attendance = await database.getAllAsync<AttendanceRecord>('SELECT * FROM attendance ORDER BY date DESC;');
  const sessionRow = await database.getFirstAsync<SessionRow>(
    'SELECT * FROM session_state WHERE key = ?;',
    'currentUserId'
  );

  const invoices: Invoice[] = invoiceRows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    customerName: row.customerName,
    paymentMode: row.paymentMode,
    reference: row.reference ?? undefined,
    total: row.total,
    createdAt: row.createdAt,
    lines: JSON.parse(row.lines),
  }));

  const currentUser = users.find((user) => user.id === sessionRow?.value) ?? null;

  return {
    users,
    currentUser,
    products,
    customers,
    suppliers,
    deliveries,
    expenses,
    invoices,
    activities,
    employees,
    attendance,
  };
}

export async function persistProducts(products: Product[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, products });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'products',
    'INSERT INTO products (id, name, category, unit, price, stockLeft, minimumStock) VALUES (?, ?, ?, ?, ?, ?, ?);',
    products,
    (item) => [item.id, item.name, item.category, item.unit, item.price, item.stockLeft, item.minimumStock]
  );
}

export async function persistCustomers(customers: Customer[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, customers });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'customers',
    'INSERT INTO customers (id, name, phone, address, outstandingBalance) VALUES (?, ?, ?, ?, ?);',
    customers,
    (item) => [item.id, item.name, item.phone, item.address, item.outstandingBalance]
  );
}

export async function persistSuppliers(suppliers: Supplier[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, suppliers });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'suppliers',
    'INSERT INTO suppliers (id, name, contactPerson, phone, address, category, materials, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    suppliers,
    (item) => [item.id, item.name, item.contactPerson, item.phone, item.address, item.category, item.materials, item.status]
  );
}

export async function persistDeliveries(deliveries: DeliveryEntry[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, deliveries });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'deliveries',
    'INSERT INTO deliveries (id, customer, items, assignee, status) VALUES (?, ?, ?, ?, ?);',
    deliveries,
    (item) => [item.id, item.customer, item.items, item.assignee, item.status]
  );
}

export async function persistInvoices(invoices: Invoice[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, invoices });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'invoices',
    'INSERT INTO invoices (id, customerId, customerName, paymentMode, reference, total, createdAt, lines) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    invoices,
    (item) => [
      item.id,
      item.customerId,
      item.customerName,
      item.paymentMode,
      item.reference ?? null,
      item.total,
      item.createdAt,
      JSON.stringify(item.lines),
    ]
  );
}

export async function persistExpenses(expenses: ExpenseEntry[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, expenses });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'expenses',
    'INSERT INTO expenses (id, title, category, amount, paymentMode, createdAt) VALUES (?, ?, ?, ?, ?, ?);',
    expenses,
    (item) => [item.id, item.title, item.category, item.amount, item.paymentMode, item.createdAt]
  );
}

export async function persistActivities(activities: ActivityItem[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, activities });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'activities',
    'INSERT INTO activities (id, title, note, time) VALUES (?, ?, ?, ?);',
    activities,
    (item) => [item.id, item.title, item.note, item.time]
  );
}

export async function persistEmployees(employees: Employee[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, employees });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'employees',
    'INSERT INTO employees (id, name, phone, role, salary, status) VALUES (?, ?, ?, ?, ?, ?);',
    employees,
    (item) => [item.id, item.name, item.phone, item.role, item.salary, item.status]
  );
}

export async function persistAttendance(attendance: AttendanceRecord[]) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, attendance });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await replaceTableRows(
    database,
    'attendance',
    'INSERT INTO attendance (id, employeeId, employeeName, date, status) VALUES (?, ?, ?, ?, ?);',
    attendance,
    (item) => [item.id, item.employeeId, item.employeeName, item.date, item.status]
  );
}

export async function persistCurrentUser(currentUser: AppUser | null) {
  if (Platform.OS === 'web') {
    const state = await loadWebState();
    await saveWebState({ ...state, sessionUserId: currentUser?.id ?? '' });
    return;
  }
  const database = await initializeDatabase();
  if (!database) return;
  await database.runAsync(
    'INSERT OR REPLACE INTO session_state (key, value) VALUES (?, ?);',
    'currentUserId',
    currentUser?.id ?? ''
  );
}
