import fs from 'node:fs/promises';
import path from 'node:path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  ShadingType,
} from 'docx';

const outputPath = path.resolve('docs', 'KLENTEC_BMS_Phase1_Delivery_Report.docx');
const generatedOn  = 'May 18, 2026';
const apkLink      = 'https://expo.dev/artifacts/eas/ezf3J9x1bx4XU2LuULFQ3J.apk';
const buildId      = '6deb00f6-f686-426d-820c-e4de6d0a80b6';

const C = {
  navy:'1B4F8A', navyDark:'0D3060', navyLight:'EEF4FF', orange:'FF6B35',
  green:'16A34A', greenBg:'F0FDF4', red:'DC2626', redBg:'FFF5F5',
  amber:'F59E0B', text:'1A2332', muted:'64748B', border:'DDE3EC',
  headerBg:'EEF4FF', rowAlt:'F8FAFD', white:'FFFFFF',
};

const run = (text, opts = {}) => new TextRun({ text, size: 22, color: C.text, ...opts });

const heading1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 140 },
  children: [new TextRun({ text, bold: true, size: 32, color: C.navy })],
});
const heading2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 100 },
  children: [new TextRun({ text, bold: true, size: 26, color: C.navy })],
});
const heading3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 80 },
  children: [new TextRun({ text, bold: true, size: 23, color: C.navyDark })],
});
const body = (text, opts = {}) => new Paragraph({
  spacing: { after: 130, line: 310 }, ...opts,
  children: [run(text)],
});
const bullet = (text, level = 0) => new Paragraph({
  bullet: { level }, spacing: { after: 80, line: 290 },
  children: [run(text)],
});
const spacer = (before = 80) => new Paragraph({ spacing: { before, after: 0 }, children: [run('')] });
const divider = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, color: C.border, size: 6 } },
  children: [run('')],
});
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const cell = (text, widthDxa, { header=false, color=C.text, bg=null, bold:isBold=false, center=false } = {}) =>
  new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    margins: { top: 110, bottom: 110, left: 130, right: 130 },
    shading: bg ? { fill: bg, type: ShadingType.CLEAR, color: 'auto' }
              : header ? { fill: C.headerBg, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    borders: {
      top:    { style: BorderStyle.SINGLE, color: C.border, size: 4 },
      bottom: { style: BorderStyle.SINGLE, color: C.border, size: 4 },
      left:   { style: BorderStyle.SINGLE, color: C.border, size: 4 },
      right:  { style: BorderStyle.SINGLE, color: C.border, size: 4 },
    },
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 0 },
      children: [new TextRun({ text, bold: isBold || header, size: header ? 22 : 21, color })],
    })],
  });

const tableRow = (cells, isHeader = false) => new TableRow({ tableHeader: isHeader, children: cells });
const makeTable = (rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
const statusCell = (status) => {
  const map = {
    'Complete':    { color: C.green, bg: C.greenBg },
    'In Progress': { color: C.amber, bg: 'FFFBEB'  },
    'Planned':     { color: C.muted, bg: C.rowAlt   },
    'Phase 2':     { color: C.navy,  bg: C.navyLight },
  };
  const s = map[status] ?? { color: C.muted, bg: C.rowAlt };
  return cell(status, 1500, { color: s.color, bg: s.bg, bold: true, center: true });
};

// ── Cover page ──────────────────────────────────────────────────────────────
const coverPage = [
  spacer(1200),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [new TextRun({ text: 'KLENTEC', bold: true, size: 72, color: C.navy })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [new TextRun({ text: 'Business Management System', bold: true, size: 40, color: C.orange })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new TextRun({ text: 'Phase 1 — Client Delivery Report', size: 30, color: C.muted })] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, color: C.border, size: 6 }, bottom: { style: BorderStyle.SINGLE, color: C.border, size: 6 } },
    spacing: { before: 100, after: 100 },
    children: [new TextRun({ text: `Prepared on ${generatedOn}  ·  Confidential`, size: 22, color: C.muted, italics: true })],
  }),
  spacer(500),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'Prepared for', size: 22, color: C.muted })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
    children: [new TextRun({ text: 'KLENTEC Building Materials', bold: true, size: 28, color: C.text })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'Developed by', size: 22, color: C.muted })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
    children: [new TextRun({ text: 'KLENTEC BMS Development Team', bold: true, size: 26, color: C.navy })] }),
  pageBreak(),
];

// ── Table of Contents ────────────────────────────────────────────────────────
const tocPage = [
  heading1('Table of Contents'),
  body('1.   Executive Summary'),
  body('2.   What Was Built — Phase 1 Feature List'),
  body('3.   Module-by-Module User Guide'),
  body('     3.1   Login Screen'),
  body('     3.2   Admin Dashboard'),
  body('     3.3   Inventory & Products'),
  body('     3.4   Billing & Invoices'),
  body('     3.5   Customers'),
  body('     3.6   Suppliers'),
  body('     3.7   Cash Flow & Expenses'),
  body('     3.8   Daily Reports'),
  body('     3.9   Deliveries'),
  body('     3.10  Employee & Attendance'),
  body('4.   Role-Based Access — Who Sees What'),
  body('5.   APK Installation Guide'),
  body('6.   Demo Login Credentials'),
  body('7.   Technical Architecture'),
  body('8.   Data & Offline Storage'),
  body('9.   Phase 2 Roadmap'),
  body('10.  Important Notes for Client'),
  pageBreak(),
];

// ── Section 1 ────────────────────────────────────────────────────────────────
const execSummary = [
  heading1('1. Executive Summary'),
  body('KLENTEC BMS is a fully offline-first Android Business Management System built specifically for a building-material retail business. Phase 1 has been successfully completed and the app is ready to install on Android devices.'),
  body('The app covers the complete daily operational cycle: staff login by role, live dashboard with financial KPIs, inventory management, multi-item billing with automatic stock deduction, customer credit tracking, supplier directory, cash flow and expense ledger, delivery management, employee attendance, and daily reports — all working 100% offline without any internet connection after installation.'),
  spacer(),
  makeTable([
    tableRow([cell('Metric', 3000, { header: true }), cell('Detail', 7600, { header: true })], true),
    tableRow([cell('Platform', 3000, { bold: true }), cell('Android (offline-first, no Play Store needed)', 7600)]),
    tableRow([cell('App Type', 3000, { bold: true }), cell('Standalone APK — install directly on device', 7600)]),
    tableRow([cell('Currency', 3000, { bold: true }), cell('Indian Rupee (₹) with Indian number formatting (1,23,456)', 7600)]),
    tableRow([cell('Roles Supported', 3000, { bold: true }), cell('Admin, Employee, Delivery Staff', 7600)]),
    tableRow([cell('Modules Delivered', 3000, { bold: true }), cell('10 fully functional modules', 7600)]),
    tableRow([cell('Data Storage', 3000, { bold: true }), cell('Local SQLite database — zero internet dependency', 7600)]),
    tableRow([cell('Build Date', 3000, { bold: true }), cell(generatedOn, 7600)]),
    tableRow([cell('APK Status', 3000, { bold: true, color: C.green }), cell('✓  Built and ready to install', 7600, { color: C.green })]),
    tableRow([cell('APK Download', 3000, { bold: true }), cell(apkLink, 7600)]),
  ]),
  pageBreak(),
];

// ── Section 2 ────────────────────────────────────────────────────────────────
const featureList = [
  heading1('2. What Was Built — Phase 1 Feature List'),
  heading2('Core Infrastructure'),
  bullet('Expo + React Native + TypeScript — production-grade mobile framework'),
  bullet('Zustand state management with full SQLite offline persistence'),
  bullet('Role-based PIN authentication — Admin (1234), Employee (2222), Delivery Staff (3333)'),
  bullet('Professional Vyapar-inspired light theme — navy blue primary, orange CTA buttons'),
  bullet('INR (₹) currency with Indian locale number formatting throughout (1,23,456)'),
  bullet('Zero TypeScript errors — clean and maintainable codebase'),
  bullet('EAS cloud build — standalone Android APK, no Play Store account required'),
  spacer(),
  heading2('Module Summary'),
  makeTable([
    tableRow([cell('Module', 2800, { header: true }), cell('Key Features Delivered', 6300, { header: true }), cell('Status', 1500, { header: true })], true),
    tableRow([cell('Login', 2800, { bold: true }), cell('Role selector, 4-digit PIN, error feedback, sign-out', 6300), statusCell('Complete')]),
    tableRow([cell('Dashboard', 2800, { bold: true }), cell('4 KPI stat cards, module grid, payment mix, operations, activity feed', 6300), statusCell('Complete')]),
    tableRow([cell('Inventory', 2800, { bold: true }), cell('Add products, Stock In/Out bulk adjust, low-stock badge, search, category/unit/price', 6300), statusCell('Complete')]),
    tableRow([cell('Billing', 2800, { bold: true }), cell('Multi-item invoices, per-line product+qty, live total, Cash/UPI/Credit, auto stock deduction, invoice history', 6300), statusCell('Complete')]),
    tableRow([cell('Customers', 2800, { bold: true }), cell('Add customers, credit balance, collect payment, purchase history, search, color indicators', 6300), statusCell('Complete')]),
    tableRow([cell('Suppliers', 2800, { bold: true }), cell('Supplier directory, add form, Active/Inactive status, search, category and materials', 6300), statusCell('Complete')]),
    tableRow([cell('Cash Flow', 2800, { bold: true }), cell('Record expenses by category, payment mode, net balance hero card (green/red), expense ledger', 6300), statusCell('Complete')]),
    tableRow([cell('Reports', 2800, { bold: true }), cell('Daily sales, expenses, cash-in-hand, payment breakup, low-stock items, pending deliveries', 6300), statusCell('Complete')]),
    tableRow([cell('Deliveries', 2800, { bold: true }), cell('Create delivery, Pending→Dispatched→Delivered, color-coded badges, summary counts', 6300), statusCell('Complete')]),
    tableRow([cell('Employees', 2800, { bold: true }), cell('Add staff, daily attendance (Present/Half Day/Absent), payroll snapshot, employee directory', 6300), statusCell('Complete')]),
  ]),
  pageBreak(),
];

// ── Section 3: User Guide ────────────────────────────────────────────────────
const userGuide = [
  heading1('3. Module-by-Module User Guide'),
  body('This section explains how to use every screen in the app. This guide can be shared with shop staff and managers.'),

  heading2('3.1  Login Screen'),
  body('The first screen that appears when the app opens.'),
  heading3('How to Login:'),
  bullet('Tap on your role — Admin, Employee, or Delivery Staff.'),
  bullet('Enter your 4-digit PIN.'),
  bullet('Tap "Unlock workspace".'),
  bullet('Wrong PIN shows an error — re-enter the correct PIN.'),
  heading3('Notes:'),
  bullet('Each role gives access to different modules (see Section 4).'),
  bullet('Tap "Sign out" on the top-right of the Dashboard to log out.'),
  spacer(),

  heading2('3.2  Admin Dashboard'),
  body('Home screen after login — shows a live summary of the entire business.'),
  heading3('What you see:'),
  bullet("Today's Sales — total from all invoices. Green arrow = growing."),
  bullet('Pending Deliveries — jobs not yet completed.'),
  bullet('Outstanding Credit — total amount customers owe you.'),
  bullet('Net Cash Flow — sales minus expenses. Green = profit, Red = loss.'),
  bullet('Modules — tap any card to open that module. Greyed-out = not yet active.'),
  bullet('Payment Mix — split of Cash vs UPI vs Credit billing.'),
  bullet('Operations — low-stock products (shown red when any exist), total expenses.'),
  bullet('Recent Activity — live feed of last 5 actions across the app.'),
  spacer(),

  heading2('3.3  Inventory & Products'),
  body('Manage all products — add items, adjust stock, and see low-stock alerts.'),
  heading3('Add a Product:'),
  bullet('Fill in: Name, Category, Unit, Price (₹), Opening stock qty, Minimum stock qty.'),
  bullet('Tap "Save Product".'),
  heading3('Adjust Stock (Stock In / Stock Out):'),
  bullet('Tap "Stock In" (green) to record stock received from supplier.'),
  bullet('Tap "Stock Out" (red) for manual reductions or damage.'),
  bullet('Select the product, enter quantity, tap Confirm.'),
  heading3('Low Stock:'),
  bullet('Products at or below minimum stock show a red "Low stock" badge.'),
  bullet('Dashboard shows the total count of low-stock products.'),
  bullet('Use the search bar to find products by name or category.'),
  spacer(),

  heading2('3.4  Billing & Invoices'),
  body('Create invoices with one or multiple items. Stock deducts automatically.'),
  heading3('Create an Invoice:'),
  bullet('Select the Customer from the chip list.'),
  bullet('Under "Items", select a Product and enter Quantity for Item 1.'),
  bullet('Tap "+ Add Another Item" to add more products to the same invoice.'),
  bullet('Select Payment Mode: Cash, UPI, or Credit.'),
  bullet('For UPI: enter the transaction reference ID.'),
  bullet('Review the Invoice Total in the blue preview box.'),
  bullet('Tap "Create Invoice".'),
  heading3('Automatic actions on invoice creation:'),
  bullet('Stock is deducted for each product line.'),
  bullet('Credit customers have the invoice amount added to their outstanding balance.'),
  bullet('Invoice appears in "Recent Invoices" with date, items, and total.'),
  heading3('Notes:'),
  bullet('Cannot create invoice if quantity exceeds available stock.'),
  bullet('Supports unlimited line items per invoice.'),
  spacer(),

  heading2('3.5  Customers'),
  body('Manage customer profiles, track credit, and collect payments.'),
  heading3('Add a Customer:'),
  bullet('Enter: Name, Mobile number, Address.'),
  bullet('Tap "Save Customer".'),
  heading3('Collect a Payment (Clear Credit):'),
  bullet('"Collect Payment" section appears only when a customer has outstanding balance.'),
  bullet('Select the customer — their balance is shown as a hint.'),
  bullet('Enter the amount received, select Cash or UPI, tap "Collect Payment".'),
  bullet('Balance reduces immediately in the ledger.'),
  heading3('Customer Ledger:'),
  bullet('Red balance + "Credit" badge = money owed. Green + "Clear" = fully paid.'),
  bullet('Last 3 invoices shown under each customer for quick purchase history.'),
  bullet('Search by name, phone, or address.'),
  spacer(),

  heading2('3.6  Suppliers'),
  body('Maintain a directory of all suppliers for restocking.'),
  heading3('Add a Supplier:'),
  bullet('Fill in: Name, Contact person, Mobile, Address, Category, Materials supplied, Status.'),
  bullet('Tap "Save Supplier".'),
  heading3('Directory:'),
  bullet('Active suppliers show green badge; Inactive show red badge.'),
  bullet('Search by name, category, contact person, or materials.'),
  spacer(),

  heading2('3.7  Cash Flow & Expenses'),
  body('Record daily expenses and monitor your net cash position.'),
  heading3('Record an Expense:'),
  bullet('Enter title (e.g., "Generator diesel"), amount in ₹.'),
  bullet('Select Category: Shop / Labour / Delivery / Purchase / Misc.'),
  bullet('Select Payment Mode: Cash, UPI, or Credit.'),
  bullet('Tap "Save Expense".'),
  heading3('Daily Summary:'),
  bullet('Net Balance hero card at top: green = profit, red = loss.'),
  bullet('Total Income (all invoices) minus Total Expenses = Net Balance.'),
  bullet('Expense ledger shows last 8 expenses with amounts in red.'),
  spacer(),

  heading2('3.8  Daily Reports'),
  body('End-of-day business performance summary.'),
  bullet('Cash In Hand — net balance highlighted green (profit) or red (loss).'),
  bullet('Sales, Expenses, Completed Deliveries.'),
  bullet('Payment Mode Breakup — Cash / UPI / Credit with colors.'),
  bullet('Attention Items — low stock products, credit customers, pending deliveries.'),
  spacer(),

  heading2('3.9  Deliveries'),
  body('Create and track customer deliveries from dispatch to completion.'),
  heading3('Create a Delivery (Admin only):'),
  bullet('Enter: Customer name, Items and quantity, Delivery person name.'),
  bullet('Tap "Create Delivery".'),
  heading3('Advance Status:'),
  bullet('Pending (amber) → tap "Advance →" → Dispatched (blue) → tap again → Delivered (green).'),
  bullet('Top cards show live counts of Pending / Dispatched / Delivered.'),
  spacer(),

  heading2('3.10  Employee & Attendance'),
  body('Manage staff and mark daily attendance.'),
  heading3('Add an Employee:'),
  bullet('Enter: Name, Mobile, Salary (₹/month), Role.'),
  bullet('Tap "Add Employee".'),
  heading3('Mark Attendance:'),
  bullet('In "Today\'s Attendance", tap Present / Half Day / Absent for each employee.'),
  bullet('Status saves automatically — no confirmation needed.'),
  bullet('Top summary cards show Present / Half Day / Absent / Unmarked counts.'),
  heading3('Payroll Snapshot:'),
  bullet('Shows total active employees and combined monthly salary in ₹.'),
  pageBreak(),
];

// ── Section 4 ────────────────────────────────────────────────────────────────
const roleAccess = [
  heading1('4. Role-Based Access — Who Sees What'),
  body('Each staff role has controlled access to protect sensitive business data.'),
  spacer(),
  makeTable([
    tableRow([cell('Module', 3800, { header: true }), cell('Admin', 2000, { header: true }), cell('Employee', 2000, { header: true }), cell('Delivery Staff', 2800, { header: true })], true),
    tableRow([cell('Login', 3800), cell('✓  Full', 2000, { color: C.green }), cell('✓  Full', 2000, { color: C.green }), cell('✓  Full', 2800, { color: C.green })]),
    tableRow([cell('Dashboard', 3800), cell('✓  All', 2000, { color: C.green }), cell('✓  Limited', 2000, { color: C.amber }), cell('✓  Limited', 2800, { color: C.amber })]),
    tableRow([cell('Inventory', 3800), cell('✓  Add + Adjust', 2000, { color: C.green }), cell('✓  View only', 2000, { color: C.amber }), cell('✗  None', 2800, { color: C.red })]),
    tableRow([cell('Billing', 3800), cell('✓  Full', 2000, { color: C.green }), cell('✓  Full', 2000, { color: C.green }), cell('✗  None', 2800, { color: C.red })]),
    tableRow([cell('Customers', 3800), cell('✓  Full', 2000, { color: C.green }), cell('✓  Full', 2000, { color: C.green }), cell('✗  None', 2800, { color: C.red })]),
    tableRow([cell('Suppliers', 3800), cell('✓  Full', 2000, { color: C.green }), cell('✗  None', 2000, { color: C.red }), cell('✗  None', 2800, { color: C.red })]),
    tableRow([cell('Cash Flow', 3800), cell('✓  Full', 2000, { color: C.green }), cell('✗  None', 2000, { color: C.red }), cell('✗  None', 2800, { color: C.red })]),
    tableRow([cell('Reports', 3800), cell('✓  Full', 2000, { color: C.green }), cell('✗  None', 2000, { color: C.red }), cell('✗  None', 2800, { color: C.red })]),
    tableRow([cell('Deliveries', 3800), cell('✓  Create + Track', 2000, { color: C.green }), cell('✓  View + Advance', 2000, { color: C.amber }), cell('✓  Own jobs only', 2800, { color: C.amber })]),
    tableRow([cell('Employees', 3800), cell('✓  Full', 2000, { color: C.green }), cell('✓  Attendance only', 2000, { color: C.amber }), cell('✗  None', 2800, { color: C.red })]),
  ]),
  pageBreak(),
];

// ── Section 5 ────────────────────────────────────────────────────────────────
const apkGuide = [
  heading1('5. APK Installation Guide'),
  body('The app is a standalone APK — no Play Store or internet connection required after installation.'),
  spacer(),
  heading2('Step 1 — Download the APK on your Phone'),
  bullet(`Open this link on your Android phone:`),
  bullet(apkLink),
  bullet('Or send the link to yourself via WhatsApp and tap it from the chat.'),
  spacer(),
  heading2('Step 2 — Allow Installation from Unknown Sources'),
  bullet('Go to Settings → Security or Privacy.'),
  bullet('Enable "Install unknown apps" or "Install from unknown sources".'),
  bullet('On Android 10+: when you tap the file, a prompt will appear — tap Settings → Allow from this source → go back and install.'),
  spacer(),
  heading2('Step 3 — Install'),
  bullet('Open your Downloads folder (or Files app) and tap the APK file.'),
  bullet('Tap "Install" and wait 10–30 seconds.'),
  bullet('Tap "Open" to launch KLENTEC BMS.'),
  spacer(),
  heading2('Step 4 — First Launch'),
  bullet('A loading screen appears for 2–3 seconds while setting up the local database.'),
  bullet('Login screen appears — use the PINs from Section 6.'),
  bullet('All data is stored locally — no internet needed.'),
  spacer(),
  heading2('Troubleshooting'),
  bullet('"App not installed" → Enable "Install from unknown sources" in Settings.'),
  bullet('"Parse error" → Re-download the APK and try again.'),
  bullet('App crashes on first open → Uninstall, reinstall, and allow all permissions.'),
  pageBreak(),
];

// ── Section 6 ────────────────────────────────────────────────────────────────
const credentials = [
  heading1('6. Demo Login Credentials'),
  body('Pre-loaded for testing. Change PINs before handing over to real staff.'),
  spacer(),
  makeTable([
    tableRow([cell('Role', 2500, { header: true }), cell('PIN', 1500, { header: true }), cell('Access Level', 6600, { header: true })], true),
    tableRow([cell('Admin', 2500, { bold: true }), cell('1234', 1500, { bold: true, color: C.navy, center: true }), cell('Full access to all 10 modules — billing, reports, suppliers, employees, cash flow.', 6600)]),
    tableRow([cell('Employee', 2500, { bold: true }), cell('2222', 1500, { bold: true, color: C.navy, center: true }), cell('Dashboard, Billing, Customers, Deliveries, Attendance.', 6600)]),
    tableRow([cell('Delivery Staff', 2500, { bold: true }), cell('3333', 1500, { bold: true, color: C.navy, center: true }), cell('Dashboard and Deliveries only — can advance delivery status.', 6600)]),
  ]),
  spacer(),
  body('⚠  Important: Change all PINs before deploying to real staff. Do not share the Admin PIN with floor staff or delivery drivers.'),
  pageBreak(),
];

// ── Section 7 ────────────────────────────────────────────────────────────────
const techArch = [
  heading1('7. Technical Architecture'),
  body('For the development team and technical stakeholders.'),
  spacer(),
  makeTable([
    tableRow([cell('Layer', 2500, { header: true }), cell('Technology', 8100, { header: true })], true),
    tableRow([cell('Framework', 2500, { bold: true }), cell('Expo SDK 54 + React Native 0.81.5', 8100)]),
    tableRow([cell('Language', 2500, { bold: true }), cell('TypeScript 5.9 — strict, zero errors', 8100)]),
    tableRow([cell('UI', 2500, { bold: true }), cell('React Native StyleSheet — Vyapar-inspired professional light theme, no external UI library', 8100)]),
    tableRow([cell('State', 2500, { bold: true }), cell('Zustand 5 — centralized store with action-based mutations', 8100)]),
    tableRow([cell('Persistence', 2500, { bold: true }), cell('expo-sqlite 16 (native Android) + AsyncStorage (web fallback)', 8100)]),
    tableRow([cell('Navigation', 2500, { bold: true }), cell('@react-navigation/native-stack — role-gated screen routing', 8100)]),
    tableRow([cell('Build', 2500, { bold: true }), cell('EAS Build cloud — standalone Android APK output', 8100)]),
    tableRow([cell('Currency', 2500, { bold: true }), cell('INR ₹ via toLocaleString("en-IN") — correct lakh formatting', 8100)]),
  ]),
  spacer(),
  heading2('Key Source Files'),
  bullet('src/theme.ts — global color palette'),
  bullet('src/types.ts — all shared TypeScript types'),
  bullet('src/utils/finance.ts — money formatting and calculation utilities'),
  bullet('src/data/mockData.ts — Indian seed data (products, customers, suppliers, employees)'),
  bullet('src/data/database.ts — SQLite schema, seeding, snapshot load, all persist functions'),
  bullet('src/store/useAppStore.ts — full Zustand store with all 13 business actions'),
  bullet('src/navigation/ — stack navigator + RootStackParamList type definitions'),
  bullet('src/components/ — ScreenShell, SectionCard, StatCard, ModuleCard (4 shared components)'),
  bullet('src/screens/ — 10 screen files (Login, Dashboard, Inventory, Billing, Customers, Suppliers, CashFlow, Reports, Deliveries, Employees)'),
  pageBreak(),
];

// ── Section 8 ────────────────────────────────────────────────────────────────
const dataStorage = [
  heading1('8. Data & Offline Storage'),
  body('All data is stored locally on the Android device using SQLite. No cloud, no internet, no subscription.'),
  spacer(),
  heading2('What is stored locally on the device'),
  bullet('Products — name, category, unit, price, stock levels'),
  bullet('Customers — name, phone, address, outstanding balance'),
  bullet('Suppliers — full contact details, category, materials, status'),
  bullet('Invoices — all line items, totals, payment mode, timestamps'),
  bullet('Expenses — title, category, amount, payment mode'),
  bullet('Deliveries — items, assignee, status progression'),
  bullet('Employees — name, role, salary, status'),
  bullet('Attendance — per employee per day records'),
  bullet('Activity log — last 20 actions across the app'),
  bullet('Login session — current role stays logged in across restarts'),
  spacer(),
  heading2('Data Safety Rules'),
  bullet('Data is saved after every single action — no manual "Save" button needed.'),
  bullet('Closing and reopening the app restores all data exactly as it was.'),
  bullet('Data persists across app updates as long as the app is not uninstalled.'),
  bullet('⚠  Uninstalling the app deletes all local data — back up key data before uninstalling.'),
  spacer(),
  heading2('Phase 2 — CSV Backup (Coming Soon)'),
  bullet('Phase 2 will add one-tap CSV export to the device Downloads folder.'),
  bullet('Exported file can be opened in Excel or shared via WhatsApp/email.'),
  bullet('This will act as a daily backup and allows sharing reports with accountants.'),
  pageBreak(),
];

// ── Section 9 ────────────────────────────────────────────────────────────────
const phase2 = [
  heading1('9. Phase 2 Roadmap'),
  body('These features are planned for the next delivery phase, scoped out of Phase 1 to ensure Phase 1 is stable and tested first.'),
  spacer(),
  makeTable([
    tableRow([cell('Feature', 3200, { header: true }), cell('Description', 5600, { header: true }), cell('Priority', 1800, { header: true })], true),
    tableRow([cell('CSV Export', 3200), cell('Export invoices, expenses, stock to Excel-compatible CSV in Downloads folder.', 5600), cell('High', 1800, { color: C.red, bold: true, center: true })]),
    tableRow([cell('Thermal Printing', 3200), cell('Print receipts to Bluetooth thermal printer directly from Billing screen.', 5600), cell('High', 1800, { color: C.red, bold: true, center: true })]),
    tableRow([cell('Edit & Delete', 3200), cell('Edit or delete products, customers, suppliers, and expenses.', 5600), cell('High', 1800, { color: C.red, bold: true, center: true })]),
    tableRow([cell('Purchase Orders', 3200), cell('Create purchase orders linked to suppliers with stock update on receipt.', 5600), cell('Medium', 1800, { color: C.amber, bold: true, center: true })]),
    tableRow([cell('Date Filters', 3200), cell('Filter invoices and expenses by today / this week / custom date range.', 5600), cell('Medium', 1800, { color: C.amber, bold: true, center: true })]),
    tableRow([cell('Credit History', 3200), cell('Full ledger of all payments received from credit customers with dates.', 5600), cell('Medium', 1800, { color: C.amber, bold: true, center: true })]),
    tableRow([cell('Salary Disbursement', 3200), cell('Mark monthly salary as paid per employee, linked to expense ledger.', 5600), cell('Medium', 1800, { color: C.amber, bold: true, center: true })]),
    tableRow([cell('Stock History', 3200), cell('Full log of every stock-in and stock-out event per product.', 5600), cell('Low', 1800, { color: C.muted, bold: true, center: true })]),
    tableRow([cell('WhatsApp Sharing', 3200), cell('Share invoice details directly to customer WhatsApp from Billing.', 5600), cell('Low', 1800, { color: C.muted, bold: true, center: true })]),
    tableRow([cell('Multi-Device Sync', 3200), cell('Optional cloud sync so multiple Android devices share the same data.', 5600), cell('Low', 1800, { color: C.muted, bold: true, center: true })]),
  ]),
  pageBreak(),
];

// ── Section 10 ───────────────────────────────────────────────────────────────
const clientNotes = [
  heading1('10. Important Notes for Client'),
  spacer(),
  heading2('Before Going Live with Real Data'),
  bullet('Change all staff PINs from demo values (1234, 2222, 3333) to private PINs you choose.'),
  bullet('Replace the seed products (UltraTech Cement, TMT Bar, etc.) with your actual product catalog.'),
  bullet('Add your real customers, suppliers, and employees using the in-app forms.'),
  bullet('Do a test run: create a sample invoice, record an expense, advance a delivery, mark attendance.'),
  bullet('Confirm the Dashboard numbers look correct before using with real transactions.'),
  spacer(),
  heading2('Device Requirements'),
  bullet('Android 8.0 or higher (most phones from 2018 onwards are compatible).'),
  bullet('Any Android phone: Redmi, Realme, Samsung, Vivo, Oppo, etc.'),
  bullet('Minimum 2 GB RAM recommended for smooth performance.'),
  bullet('App size: approximately 60–80 MB after installation.'),
  bullet('No internet connection required after installation.'),
  spacer(),
  heading2('Data Backup Guidance (Until Phase 2 CSV)'),
  bullet('Data is on the device — keep the device safe and charged.'),
  bullet('Do not factory reset the phone without noting key records (products, customers, prices).'),
  bullet('Phase 2 will add one-tap CSV export for daily backup to Downloads.'),
  spacer(),
  heading2('Support & Updates'),
  bullet('For bugs, issues, or new features — contact the development team.'),
  bullet('For APK reinstall: use the same download link from Section 5.'),
  bullet('For updated APKs after feature additions: a new build link will be shared.'),
  bullet('EAS Build Dashboard: https://expo.dev/accounts/udaysingh3204/projects/klentec-bms/builds/' + buildId),
  spacer(),
  divider(),
  spacer(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [new TextRun({ text: 'KLENTEC BMS — Phase 1 Delivery Complete', bold: true, size: 26, color: C.navy })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
    children: [new TextRun({ text: `Prepared for KLENTEC Building Materials  ·  ${generatedOn}`, size: 20, color: C.muted, italics: true })] }),
];

// ── Assemble ─────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'KLENTEC BMS Dev Team',
  title: 'KLENTEC BMS Phase 1 Delivery Report',
  description: 'Phase 1 delivery report — features, user guide, architecture, roadmap.',
  sections: [{
    properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'KLENTEC BMS  ·  Phase 1 Delivery Report  ·  Confidential  ·  Page ', size: 18, color: C.muted }),
            PageNumber.CURRENT,
          ],
        })],
      }),
    },
    children: [
      ...coverPage, ...tocPage, ...execSummary, ...featureList,
      ...userGuide, ...roleAccess, ...apkGuide, ...credentials,
      ...techArch, ...dataStorage, ...phase2, ...clientNotes,
    ],
  }],
});

await fs.mkdir(path.resolve('docs'), { recursive: true });
const buffer = await Packer.toBuffer(doc);
await fs.writeFile(outputPath, buffer);
console.log('\n✓ Report generated: ' + outputPath + '\n');
