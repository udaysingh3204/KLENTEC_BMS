import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('docs', 'KLENTEC_BMS_Phase1_Delivery_Report.pdf');
fs.mkdirSync(path.resolve('docs'), { recursive: true });

const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: false });
doc.pipe(fs.createWriteStream(out));

// ── colours ──────────────────────────────────────────────────────────────────
const NAVY   = '#1B4F8A';
const ORANGE = '#FF6B35';
const GREEN  = '#16A34A';
const RED    = '#DC2626';
const AMBER  = '#F59E0B';
const MUTED  = '#64748B';
const TEXT   = '#1A2332';
const BORDER = '#DDE3EC';
const BGLIGHT= '#F5F6FA';
const BGGREEN= '#F0FDF4';
const BGRED  = '#FFF5F5';
const WHITE  = '#FFFFFF';
const APK    = 'https://expo.dev/artifacts/eas/ezf3J9x1bx4XU2LuULFQ3J.apk';
const DATE   = 'May 18, 2026';

// ── helpers ──────────────────────────────────────────────────────────────────
const W = 595 - 100; // usable width

const newPage = () => {
  doc.addPage();
  doc.x = 50; doc.y = 50;
};

const h1 = (t) => {
  doc.moveDown(0.5)
     .font('Helvetica-Bold').fontSize(20).fillColor(NAVY)
     .text(t, { underline: false });
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
  doc.moveDown(0.4);
};

const h2 = (t) => {
  doc.moveDown(0.4)
     .font('Helvetica-Bold').fontSize(14).fillColor(NAVY)
     .text(t);
  doc.moveDown(0.2);
};

const h3 = (t) => {
  doc.moveDown(0.3)
     .font('Helvetica-Bold').fontSize(12).fillColor(TEXT)
     .text(t);
  doc.moveDown(0.15);
};

const para = (t, color = TEXT) => {
  doc.font('Helvetica').fontSize(10).fillColor(color)
     .text(t, { lineGap: 3 });
  doc.moveDown(0.2);
};

const bul = (t, color = TEXT) => {
  const x = doc.x;
  doc.font('Helvetica').fontSize(10).fillColor(color)
     .text('•  ' + t, x + 10, doc.y, { lineGap: 2, width: W - 10 });
  doc.moveDown(0.1);
};

const note = (t) => {
  const y = doc.y;
  doc.rect(50, y, W, 28).fill('#FFF7ED').stroke(AMBER);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#92400E')
     .text('⚠  ' + t, 60, y + 8, { width: W - 20 });
  doc.y = y + 36;
  doc.moveDown(0.2);
};

// table: cols = [{label, width, color?}], rows = [[cell,...]]
const table = (cols, rows) => {
  const totalW = cols.reduce((s, c) => s + c.width, 0);
  const rowH   = 22;
  const startX = 50;

  // header
  let x = startX;
  const hY = doc.y;
  doc.rect(startX, hY, totalW, rowH).fill('#EEF4FF').stroke(BORDER);
  cols.forEach((col) => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY)
       .text(col.label, x + 5, hY + 6, { width: col.width - 10, ellipsis: true });
    x += col.width;
  });
  doc.y = hY + rowH;

  // rows
  rows.forEach((row, ri) => {
    // check page space
    if (doc.y + rowH > 790) { newPage(); }
    const rY = doc.y;
    const bg = ri % 2 === 0 ? WHITE : '#F8FAFD';
    doc.rect(startX, rY, totalW, rowH).fill(bg).stroke(BORDER);
    x = startX;
    row.forEach((cell, ci) => {
      const col = cols[ci];
      const color = cell.color || TEXT;
      const bold  = cell.bold  || false;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(9).fillColor(color)
         .text(typeof cell === 'string' ? cell : cell.text, x + 5, rY + 6,
               { width: col.width - 10, ellipsis: true });
      x += col.width;
    });
    doc.y = rY + rowH;
  });
  doc.moveDown(0.5);
};

const statusBadge = (status) => {
  const map = {
    'Complete':    { color: GREEN, bg: BGGREEN },
    'Phase 2':     { color: NAVY,  bg: '#EEF4FF' },
    'High':        { color: RED,   bg: BGRED },
    'Medium':      { color: AMBER, bg: '#FFFBEB' },
    'Low':         { color: MUTED, bg: BGLIGHT },
  };
  return { text: status, color: (map[status]||{color:MUTED}).color, bold: true };
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE 1 – COVER
// ════════════════════════════════════════════════════════════════════════════
newPage();

doc.rect(0, 0, 595, 200).fill(NAVY);
doc.font('Helvetica-Bold').fontSize(38).fillColor(WHITE)
   .text('KLENTEC', 50, 60, { align: 'center', width: 495 });
doc.font('Helvetica-Bold').fontSize(18).fillColor(ORANGE)
   .text('Business Management System', 50, 108, { align: 'center', width: 495 });
doc.font('Helvetica').fontSize(13).fillColor('#B0C4DE')
   .text('Phase 1 — Client Delivery Report', 50, 140, { align: 'center', width: 495 });

doc.y = 230;
doc.font('Helvetica').fontSize(11).fillColor(MUTED)
   .text('Prepared on', { align: 'center' });
doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT)
   .text(DATE, { align: 'center' });

doc.moveDown(1.5);
doc.moveTo(150, doc.y).lineTo(445, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
doc.moveDown(1);

doc.font('Helvetica').fontSize(11).fillColor(MUTED).text('Prepared for', { align: 'center' });
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('KLENTEC Building Materials', { align: 'center' });
doc.moveDown(0.6);
doc.font('Helvetica').fontSize(11).fillColor(MUTED).text('Developed by', { align: 'center' });
doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text('KLENTEC BMS Development Team', { align: 'center' });

doc.moveDown(2);
// APK box
const boxY = doc.y;
doc.roundedRect(100, boxY, 395, 52, 8).fill(BGGREEN).stroke(GREEN);
doc.font('Helvetica-Bold').fontSize(10).fillColor(GREEN)
   .text('✓  APK READY TO INSTALL', 110, boxY + 8, { width: 375, align: 'center' });
doc.font('Helvetica').fontSize(8).fillColor(MUTED)
   .text(APK, 110, boxY + 26, { width: 375, align: 'center' });
doc.y = boxY + 64;

doc.font('Helvetica').fontSize(9).fillColor(MUTED)
   .text('Confidential  ·  For internal and client use only', { align: 'center' });

// ════════════════════════════════════════════════════════════════════════════
// PAGE 2 – EXECUTIVE SUMMARY
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('1. Executive Summary');
para('KLENTEC BMS is a fully offline-first Android Business Management System for a building-material retail business. Phase 1 is complete and ready to install on any Android phone.');
para('The app covers the full daily cycle: role-based login, live dashboard, inventory, multi-item billing, customer credit tracking, supplier directory, cash flow, delivery management, employee attendance, and daily reports — all 100% offline.');

doc.moveDown(0.3);
table(
  [{ label: 'Metric', width: 150 }, { label: 'Detail', width: W - 150 }],
  [
    ['Platform',          'Android — offline-first, no Play Store required'],
    ['App Type',          'Standalone APK — install directly on device'],
    ['Currency',          'Indian Rupee (₹) with Indian number formatting (1,23,456)'],
    ['Roles',             'Admin, Employee, Delivery Staff'],
    ['Modules Delivered', '10 fully functional modules'],
    ['Data Storage',      'Local SQLite database — zero internet dependency'],
    ['Build Date',        DATE],
    [{ text: 'APK Status', bold: true }, { text: '✓  Built and ready to install', color: GREEN, bold: true }],
    ['APK Download',      APK],
  ]
);

// ════════════════════════════════════════════════════════════════════════════
// PAGE 3 – FEATURE LIST
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('2. What Was Built — Phase 1 Feature List');

h2('Core Infrastructure');
bul('Expo SDK 54 + React Native 0.81.5 + TypeScript — production-grade mobile app');
bul('Zustand state management with full SQLite offline persistence');
bul('Role-based PIN login — Admin (1234), Employee (2222), Delivery Staff (3333)');
bul('Professional Vyapar-inspired light theme — navy blue + orange CTA');
bul('INR ₹ currency with Indian locale formatting (1,23,456) throughout');
bul('Zero TypeScript errors — clean, maintainable codebase');
bul('EAS cloud build — standalone Android APK, no Play Store account needed');

doc.moveDown(0.4);
h2('Module Summary');
table(
  [{ label: 'Module', width: 110 }, { label: 'Key Features Delivered', width: 310 }, { label: 'Status', width: W - 420 }],
  [
    ['Login',        'Role selector, 4-digit PIN, error feedback, sign-out',                                    statusBadge('Complete')],
    ['Dashboard',    '4 KPI stat cards, module grid, payment mix, operations, activity feed',                   statusBadge('Complete')],
    ['Inventory',    'Add products, Stock In/Out, low-stock badge, search, price tracking',                     statusBadge('Complete')],
    ['Billing',      'Multi-item invoices, live total, Cash/UPI/Credit, auto stock deduction, history',         statusBadge('Complete')],
    ['Customers',    'Add, credit balance, collect payment, purchase history, search',                          statusBadge('Complete')],
    ['Suppliers',    'Directory, add form, Active/Inactive, materials, search',                                 statusBadge('Complete')],
    ['Cash Flow',    'Record expenses by category, net balance hero card (green/red), ledger',                  statusBadge('Complete')],
    ['Reports',      'Sales, expenses, cash-in-hand, payment breakup, attention items',                         statusBadge('Complete')],
    ['Deliveries',   'Create, Pending→Dispatched→Delivered, colour badges, summary counts',                    statusBadge('Complete')],
    ['Employees',    'Add staff, daily attendance (Present/Half Day/Absent), payroll snapshot',                 statusBadge('Complete')],
  ]
);

// ════════════════════════════════════════════════════════════════════════════
// PAGE 4 – USER GUIDE
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('3. Module-by-Module User Guide');
para('Share this section with shop staff and managers. Every screen is covered below.');

h2('3.1  Login Screen');
bul('Tap your role — Admin, Employee, or Delivery Staff.');
bul('Enter your 4-digit PIN and tap "Unlock workspace".');
bul('Wrong PIN shows an error — re-enter the correct PIN.');
bul('Tap "Sign out" on the top-right of the Dashboard to log out.');

h2('3.2  Admin Dashboard');
bul("Today's Sales — total from all invoices. Green = growing.");
bul('Pending Deliveries — jobs not yet completed.');
bul('Outstanding Credit — total owed by customers.');
bul('Net Cash Flow — sales minus expenses. Green = profit, Red = loss.');
bul('Tap any module card to open it. Greyed-out = not yet active.');
bul('Recent Activity — live feed of last 5 actions across the app.');

h2('3.3  Inventory & Products');
bul('Add Product: fill in Name, Category, Unit, Price (₹), Opening stock, Minimum stock → Save.');
bul('Stock In: tap green "Stock In", select product, enter quantity → Confirm Stock In.');
bul('Stock Out: tap red "Stock Out", select product, enter quantity → Confirm Stock Out.');
bul('Low Stock badge (red) appears when stock ≤ minimum. Dashboard shows total count.');
bul('Use the search bar to find products by name or category.');

h2('3.4  Billing & Invoices');
bul('Select a Customer from the chip list at the top.');
bul('Select a Product and enter Quantity for Item 1.');
bul('Tap "+ Add Another Item" for a second or third product on the same invoice.');
bul('Select Payment Mode: Cash, UPI (enter ref ID), or Credit.');
bul('Review the Invoice Total in the blue box → tap "Create Invoice".');
bul('Stock deducts automatically. Credit customers get balance added to their account.');

newPage();
h1('3. User Guide (continued)');

h2('3.5  Customers');
bul('Add Customer: Name, Mobile, Address → Save Customer.');
bul('Collect Payment: select credit customer, enter amount received, select mode → Collect.');
bul('Customer ledger shows red "Credit" or green "Clear" badge per customer.');
bul('Last 3 invoices shown under each customer name for purchase history.');
bul('Search bar filters by name, phone, or address.');

h2('3.6  Suppliers');
bul('Add Supplier: Name, Contact person, Mobile, Address, Category, Materials, Status → Save.');
bul('Active = green badge, Inactive = red badge.');
bul('Search by name, category, contact person, or materials.');

h2('3.7  Cash Flow & Expenses');
bul('Record Expense: title, amount (₹), Category (Shop/Labour/Delivery/Purchase/Misc), Mode → Save.');
bul('Net Balance hero card at top: green = profit, red = loss.');
bul('Total Income (all invoices) − Total Expenses = Net Balance.');

h2('3.8  Daily Reports');
bul('Cash In Hand — net balance, highlighted green or red.');
bul('Sales, Expenses, Completed Deliveries count.');
bul('Payment Mode Breakup — Cash / UPI / Credit with colour coding.');
bul('Attention Items — low stock, credit customers, pending deliveries.');

h2('3.9  Deliveries');
bul('Create Delivery (Admin): Customer name, Items + quantity, Delivery person → Create.');
bul('Advance Status: Pending (amber) → Dispatched (blue) → Delivered (green).');
bul('Top cards show live Pending / Dispatched / Delivered counts.');

h2('3.10  Employee & Attendance');
bul("Add Employee: Name, Mobile, Salary (₹/month), Role → Add Employee.");
bul("Today's Attendance: tap Present / Half Day / Absent for each employee — saves instantly.");
bul('Top summary: Present / Half Day / Absent / Unmarked counts for the day.');
bul('Payroll Snapshot: total active employees and combined monthly salary.');
bul('Employee Directory: all staff with role, phone, salary, and Active/Inactive badge.');

// ════════════════════════════════════════════════════════════════════════════
// PAGE 6 – ROLE ACCESS
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('4. Role-Based Access — Who Sees What');
para('Each staff role has controlled access to protect sensitive business data.');
doc.moveDown(0.3);

table(
  [{ label: 'Module', width: 130 }, { label: 'Admin', width: 100 }, { label: 'Employee', width: 110 }, { label: 'Delivery Staff', width: W - 340 }],
  [
    ['Login',       { text: '✓  Full',          color: GREEN }, { text: '✓  Full',          color: GREEN }, { text: '✓  Full',        color: GREEN }],
    ['Dashboard',   { text: '✓  All modules',   color: GREEN }, { text: '✓  Limited',       color: AMBER }, { text: '✓  Limited',     color: AMBER }],
    ['Inventory',   { text: '✓  Add + Adjust',  color: GREEN }, { text: '✓  View only',     color: AMBER }, { text: '✗  No access',   color: RED   }],
    ['Billing',     { text: '✓  Full',          color: GREEN }, { text: '✓  Full',          color: GREEN }, { text: '✗  No access',   color: RED   }],
    ['Customers',   { text: '✓  Full',          color: GREEN }, { text: '✓  Full',          color: GREEN }, { text: '✗  No access',   color: RED   }],
    ['Suppliers',   { text: '✓  Full',          color: GREEN }, { text: '✗  No access',     color: RED   }, { text: '✗  No access',   color: RED   }],
    ['Cash Flow',   { text: '✓  Full',          color: GREEN }, { text: '✗  No access',     color: RED   }, { text: '✗  No access',   color: RED   }],
    ['Reports',     { text: '✓  Full',          color: GREEN }, { text: '✗  No access',     color: RED   }, { text: '✗  No access',   color: RED   }],
    ['Deliveries',  { text: '✓  Create + Track',color: GREEN }, { text: '✓  View + Advance',color: AMBER }, { text: '✓  Own jobs',    color: AMBER }],
    ['Employees',   { text: '✓  Full',          color: GREEN }, { text: '✓  Attendance',    color: AMBER }, { text: '✗  No access',   color: RED   }],
  ]
);

// ════════════════════════════════════════════════════════════════════════════
// PAGE 7 – APK INSTALL + CREDENTIALS
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('5. APK Installation Guide');
para('Standalone APK — no Play Store or internet needed after install.');

h2('Step 1 — Download on your Android Phone');
bul('Open this link on your phone:');
doc.font('Helvetica').fontSize(9).fillColor(NAVY).text('   ' + APK, { link: APK, underline: true });
doc.moveDown(0.2);
bul('Or send the link to yourself via WhatsApp and tap it from the chat.');

h2('Step 2 — Allow Installation');
bul('Settings → Security → Enable "Install unknown apps" or "Install from unknown sources".');
bul('On Android 10+: tap the APK → Settings → Allow from this source → go back → install.');

h2('Step 3 — Install');
bul('Open Downloads folder, tap the APK file, tap "Install", wait 10–30 seconds.');
bul('Tap "Open" to launch KLENTEC BMS.');

h2('Step 4 — First Launch');
bul('Loading screen for 2–3 seconds while setting up the local database.');
bul('Login screen appears — use the PINs from Section 6 below.');
bul('All data stored locally — no internet required after installation.');

h2('Troubleshooting');
bul('"App not installed" → Enable "Install from unknown sources" in Settings.');
bul('"Parse error" → Re-download the APK and try again.');
bul('App crashes on first open → Uninstall, reinstall, allow all permissions.');

doc.moveDown(0.6);
h1('6. Demo Login Credentials');
note('Change all PINs before deploying to real staff. Do not share the Admin PIN with floor staff.');

doc.moveDown(0.3);
table(
  [{ label: 'Role', width: 110 }, { label: 'PIN', width: 70 }, { label: 'Access Level', width: W - 180 }],
  [
    [{ text: 'Admin',          bold: true }, { text: '1234', color: NAVY, bold: true }, 'Full access to all 10 modules — billing, reports, suppliers, employees, cash flow.'],
    [{ text: 'Employee',       bold: true }, { text: '2222', color: NAVY, bold: true }, 'Dashboard, Billing, Customers, Deliveries, Attendance marking.'],
    [{ text: 'Delivery Staff', bold: true }, { text: '3333', color: NAVY, bold: true }, 'Dashboard and Deliveries only — can advance delivery status.'],
  ]
);

// ════════════════════════════════════════════════════════════════════════════
// PAGE 8 – TECH + DATA
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('7. Technical Architecture');
para('For the development team and technical stakeholders.');
doc.moveDown(0.2);

table(
  [{ label: 'Layer', width: 120 }, { label: 'Technology', width: W - 120 }],
  [
    ['Framework',   'Expo SDK 54 + React Native 0.81.5'],
    ['Language',    'TypeScript 5.9 — strict mode, zero errors'],
    ['UI',          'React Native StyleSheet — Vyapar-inspired light theme, no external UI library'],
    ['State',       'Zustand 5 — centralized store, 13 business actions'],
    ['Persistence', 'expo-sqlite 16 (native Android) + AsyncStorage (web fallback)'],
    ['Navigation',  '@react-navigation/native-stack — role-gated screen routing'],
    ['Build',       'EAS Build cloud — standalone Android APK output'],
    ['Currency',    'INR ₹ via toLocaleString("en-IN") — correct lakh/crore formatting'],
  ]
);

h2('Key Source Files');
bul('src/theme.ts — global colour palette (navy, orange, green, red)');
bul('src/types.ts — all shared TypeScript types (13 types)');
bul('src/utils/finance.ts — money formatting and calculation utilities');
bul('src/data/mockData.ts — Indian seed data (products, customers, suppliers, employees)');
bul('src/data/database.ts — SQLite schema, seeding, snapshot load, all 11 persist functions');
bul('src/store/useAppStore.ts — full Zustand store with all 13 business actions');
bul('src/screens/ — 10 screen files (Login, Dashboard, Inventory, Billing, Customers, Suppliers, CashFlow, Reports, Deliveries, Employees)');
bul('src/components/ — 4 shared components (ScreenShell, SectionCard, StatCard, ModuleCard)');

doc.moveDown(0.4);
h1('8. Data & Offline Storage');
bul('Products, Customers, Suppliers, Invoices, Expenses, Deliveries, Employees, Attendance — all local SQLite.');
bul('Data saved after every action — no manual Save button needed.');
bul('Closing and reopening the app restores all data exactly as it was.');
bul('Data persists across app updates — only lost if app is uninstalled.');
note('Uninstalling the app deletes all local data. Back up key records before uninstalling.');
bul('Phase 2 will add one-tap CSV export to Downloads folder for daily backup.');

// ════════════════════════════════════════════════════════════════════════════
// PAGE 9 – PHASE 2 ROADMAP
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('9. Phase 2 Roadmap');
para('Planned for the next delivery phase. Phase 1 is stable and tested — these features are next.');
doc.moveDown(0.3);

table(
  [{ label: 'Feature', width: 140 }, { label: 'Description', width: 290 }, { label: 'Priority', width: W - 430 }],
  [
    ['CSV Export',           'Export invoices, expenses, stock to Excel CSV in Downloads.',           statusBadge('High')],
    ['Thermal Printing',     'Print receipts to Bluetooth thermal printer from Billing.',             statusBadge('High')],
    ['Edit & Delete',        'Edit or delete products, customers, suppliers, expenses.',              statusBadge('High')],
    ['Purchase Orders',      'Create purchase orders linked to suppliers, update stock on receipt.', statusBadge('Medium')],
    ['Date Filters',         'Filter invoices/expenses by today / this week / custom range.',        statusBadge('Medium')],
    ['Credit History',       'Full ledger of all payments received from credit customers.',          statusBadge('Medium')],
    ['Salary Disbursement',  'Mark monthly salary as paid, linked to expense ledger.',              statusBadge('Medium')],
    ['Stock History',        'Full log of every stock-in and stock-out event per product.',          statusBadge('Low')],
    ['WhatsApp Sharing',     'Share invoice details to customer WhatsApp from Billing screen.',      statusBadge('Low')],
    ['Multi-Device Sync',    'Optional cloud sync so multiple phones share the same data.',          statusBadge('Low')],
  ]
);

// ════════════════════════════════════════════════════════════════════════════
// PAGE 10 – CLIENT NOTES
// ════════════════════════════════════════════════════════════════════════════
newPage();
h1('10. Important Notes for Client');

h2('Before Going Live with Real Data');
bul('Change all staff PINs from demo values (1234, 2222, 3333) to private PINs.');
bul('Replace seed products (UltraTech Cement, TMT Bar etc.) with your actual product catalog.');
bul('Add your real customers, suppliers, and employees using the in-app forms.');
bul('Do a test run: create a sample invoice, record an expense, advance a delivery, mark attendance.');
bul('Confirm Dashboard numbers are correct before using for real transactions.');

h2('Device Requirements');
bul('Android 8.0 or higher (most phones from 2018+ are compatible).');
bul('Any Android phone — Redmi, Realme, Samsung, Vivo, Oppo etc.');
bul('Minimum 2 GB RAM recommended. App size: ~60–80 MB after install.');
bul('No internet connection required after installation.');

h2('Data Backup (Until Phase 2)');
bul('Data is on the device — keep the device safe and charged.');
bul('Do not factory reset without noting key records manually.');
bul('Phase 2 will add one-tap CSV export to Downloads for daily backup.');

h2('Support & Updates');
bul('For bugs or new feature requests — contact the development team.');
bul('For APK reinstall: use the same download link from Section 5.');
bul('For newer APK after updates: a new build link will be shared by the team.');

// ── Footer strip ─────────────────────────────────────────────────────────────
doc.moveDown(2);
doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(9).fillColor(MUTED)
   .text('KLENTEC BMS  ·  Phase 1 Delivery Report  ·  Confidential  ·  ' + DATE, { align: 'center' });

// ── Page numbers ─────────────────────────────────────────────────────────────
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.font('Helvetica').fontSize(8).fillColor(MUTED)
     .text(`Page ${i + 1} of ${range.count}`, 50, 815, { align: 'center', width: 495 });
}

doc.end();
console.log('\n✓ PDF generated: ' + out + '\n');
