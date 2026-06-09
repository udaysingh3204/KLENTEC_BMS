import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument({ margin: 40, bufferPages: true });
const output = fs.createWriteStream('./docs/KLENTEC_BMS_Phase2_Sprint1_Report.pdf');

doc.pipe(output);

// Helper functions
const heading1 = (text) => doc.fontSize(24).font('Helvetica-Bold').text(text).moveDown(0.5);
const heading2 = (text) => doc.fontSize(16).font('Helvetica-Bold').text(text).moveDown(0.3);
const heading3 = (text) => doc.fontSize(13).font('Helvetica-Bold').text(text).moveDown(0.2);
const para = (text) => doc.fontSize(11).font('Helvetica').text(text, { align: 'left' }).moveDown(0.3);
const bullet = (text) => doc.fontSize(11).font('Helvetica').text(`• ${text}`).moveDown(0.15);
const divider = () => doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke().moveDown(0.3);

// Page 1: Cover
doc.fontSize(32).font('Helvetica-Bold').text('KLENTEC BMS', { align: 'center' }).moveDown(0.2);
doc.fontSize(14).font('Helvetica').text('Phase 2 Sprint 1 Development Report', { align: 'center' }).moveDown(0.5);
doc.fontSize(12).text('Full Edit/Delete CRUD Implementation', { align: 'center' }).moveDown(3);

doc.fontSize(11).font('Helvetica').text(`Date: June 5, 2026`, { align: 'center' }).moveDown(0.2);
doc.text(`Status: READY FOR CLIENT TESTING`, { align: 'center', color: '10B981' }).moveDown(1);

divider();
doc.moveDown(0.5);

para('This report summarizes Phase 2 Sprint 1 development, which adds comprehensive Edit/Delete functionality across all major modules while maintaining the professional EZO/OKCredit-inspired UI.');

doc.addPage();

// Page 2: Executive Summary
heading2('Executive Summary');
para('Phase 2 Sprint 1 focuses on completing CRUD workflows by implementing Edit and Delete functionality across Inventory, Billing, Customers, and Deliveries modules.');

heading3('Key Achievements:');
bullet('✅ Full Edit/Delete for 4 core modules');
bullet('✅ Smart validation and data protection');
bullet('✅ Stock reversal on invoice deletion');
bullet('✅ Clean, minimal UI (EZO/OKCredit style)');
bullet('✅ Zero TypeScript errors');
bullet('✅ New APK ready for download');

doc.moveDown(0.5);
heading3('APK Download:');
doc.fontSize(10).font('Helvetica').text('https://expo.dev/artifacts/eas/qGQi3hiC7tNeYZwekuwtpD.apk', { color: '1B4F8A' });

doc.addPage();

// Page 3: Inventory Changes
heading2('Module 1: INVENTORY');
heading3('✎ EDIT:');
bullet('Product name, category, unit');
bullet('Price (in ₹), opening stock, minimum stock');
bullet('Modal dialog with form fields');

heading3('🗑 DELETE:');
bullet('Remove product with confirmation');
bullet('Activity log records deletion');

heading3('Testing Steps:');
bullet('1. Go to Inventory → Product List');
bullet('2. Click ✎ on any product');
bullet('3. Edit price or name in modal');
bullet('4. Click "Save Changes" — observes update');
bullet('5. Click 🗑 on another product');
bullet('6. Confirm deletion — product removed');

para('✓ Key point: Deleted products cannot be recovered — prevents accidental deletes with confirmation.');

doc.addPage();

// Page 4: Billing Changes
heading2('Module 2: BILLING');
heading3('✎ EDIT:');
bullet('Payment Mode (Cash / UPI / Credit)');
bullet('UPI Reference ID / Transaction ID');
bullet('Does NOT edit items (complex stock impacts)');

heading3('🗑 DELETE:');
bullet('Remove invoice and reverse all impacts:');
bullet('  • Stock restored to inventory');
bullet('  • Customer credit balance cleared');
bullet('  • Activity log tracks deletion');

heading3('Testing Steps:');
bullet('1. Go to Billing → Recent Invoices');
bullet('2. Click ✎ on an invoice');
bullet('3. Change payment mode to UPI, add reference');
bullet('4. Click "Update Invoice" — details change');
bullet('5. Click 🗑 on invoice');
bullet('6. Confirm → invoice removed, stock restored');

para('✓ Key point: Deleting an invoice automatically reverses stock impact, maintaining inventory accuracy.');

doc.addPage();

// Page 5: Customers Changes
heading2('Module 3: CUSTOMERS');
heading3('✎ EDIT:');
bullet('Customer name, phone, address');
bullet('Modal dialog for editing contact details');

heading3('🗑 DELETE (Protected):');
bullet('Can ONLY delete if outstanding balance = ₹0');
bullet('Prevents losing credit tracking');
bullet('Shows error if customer owes money');

heading3('Testing Steps:');
bullet('1. Go to Customers → Customer Ledger');
bullet('2. Click ✎ on a customer');
bullet('3. Update phone or address');
bullet('4. Click "Save Changes" — details update');
bullet('5. Try deleting customer with balance');
bullet('6. Error: "Cannot delete (balance outstanding)"');
bullet('7. Collect payment, then delete succeeds');

para('✓ Key point: Smart validation prevents losing unpaid customer balances — data protection.');

doc.addPage();

// Page 6: Deliveries Changes
heading2('Module 4: DELIVERIES');
heading3('✎ EDIT:');
bullet('Customer name, items, assignee, status');
bullet('Can edit at any status (Pending/Dispatched/Delivered)');

heading3('🗑 DELETE:');
bullet('Remove delivery from queue');
bullet('Activity log records deletion');

heading3('Testing Steps:');
bullet('1. Go to Deliveries → Delivery Queue');
bullet('2. Click ✎ on a delivery');
bullet('3. Update items or assignee');
bullet('4. Click "Save Changes" — delivery updates');
bullet('5. Click 🗑 to delete');
bullet('6. Confirm → delivery removed from queue');

para('✓ Key point: Edit/Delete work at any delivery status for maximum flexibility.');

doc.addPage();

// Page 7: UI Design
heading2('UI/UX Design Principles');
para('All Edit/Delete interfaces follow EZO/OKCredit design philosophy:');

heading3('Action Buttons:');
bullet('✎ Pencil button = Click to edit');
bullet('🗑 Trash button = Click to delete');
bullet('Located on right side of each row for quick access');
bullet('Small, non-intrusive icons maintain clean layout');

heading3('Edit Modals:');
bullet('Blue header: "Edit [Module Name]"');
bullet('Form fields pre-filled with current data');
bullet('Cancel button (gray) cancels without saving');
bullet('Save button (navy blue) saves changes');

heading3('Delete Confirmations:');
bullet('Browser dialog: "Delete [Name]? This cannot be undone."');
bullet('Prevents accidental deletions');
bullet('Success message confirms deletion');

doc.addPage();

// Page 8: Demo Credentials
heading2('Testing with Demo Accounts');

heading3('Login PINs:');
bullet('Admin: 1234 (full access)');
bullet('Employee: 2222 (operations access)');
bullet('Delivery Staff: 3333 (delivery access)');

heading3('Seed Data Available:');
bullet('Products: UltraTech Cement, TMT Bar, Asian Paints, Tiles');
bullet('Customers: Sharma Construction, Patel Interiors, Shree Developers');
bullet('Deliveries: Pre-created jobs in Pending/Dispatched status');
bullet('Employees: Ramesh, Sunil, Priya, Mohan');

heading3('How to Test:');
bullet('1. Download APK from link above');
bullet('2. Install on Android phone');
bullet('3. Open app, select role (Admin recommended)');
bullet('4. Enter PIN (1234)');
bullet('5. Explore each module using Edit/Delete buttons');
bullet('6. Provide feedback on ease of use');

doc.addPage();

// Page 9: Technical Details
heading2('Technical Implementation');

heading3('Code Quality:');
bullet('TypeScript: 0 compilation errors');
bullet('Zustand Store: 8 new action methods');
bullet('SQLite: Persistent storage with activity logs');
bullet('React Navigation: No route changes needed');

heading3('Modified Files:');
bullet('src/store/useAppStore.ts (+ 100 lines)');
bullet('src/screens/InventoryScreen.tsx (+ 80 lines)');
bullet('src/screens/BillingScreen.tsx (+ 90 lines)');
bullet('src/screens/CustomersScreen.tsx (+ 85 lines)');
bullet('src/screens/DeliveriesScreen.tsx (+ 75 lines)');

heading3('Git Commit:');
doc.fontSize(10).font('Helvetica').text('90cd5cd — feat: Phase 2 Sprint 1 — Full Edit/Delete CRUD');

doc.addPage();

// Page 10: Next Steps
heading2('Phase 2 Sprint 2 — Coming Next');
para('Based on your feedback, Sprint 2 will prioritize:');

heading3('High Priority:');
bullet('Daily Balance Ledger for Customers (track yesterday/today balance)');
bullet('Filtering & Date Ranges (filter invoices by date/customer/mode)');

heading3('Medium Priority:');
bullet('Admin Approval Panel (for price changes)');
bullet('Employee Commission Tracking (calculate & pay commissions)');

heading3('Your Feedback Needed:');
bullet('Which feature is most important for your business?');
bullet('Are Edit/Delete buttons easy to use?');
bullet('Any bugs or issues discovered during testing?');
bullet('Features from other apps you\'d like added?');

doc.addPage();

// Final: Contact & Support
heading2('Support & Quick Reference');

heading3('Installation:');
bullet('Download APK → Open with Android → Install (Allow unknown sources)');

heading3('Offline Mode:');
bullet('Disconnect WiFi after login — app works completely offline');
bullet('Data syncs when reconnected (in future versions)');

heading3('Activity Log:');
bullet('Dashboard → Recent Activity shows all Edit/Delete actions');
bullet('Useful for audit trail and verification');

heading3('Reset:');
bullet('Uninstall app completely to reset all data');
bullet('Reinstall from APK for fresh start');

divider();
doc.moveDown(0.3);
doc.fontSize(9).font('Helvetica').text('Report Generated: June 5, 2026 | Phase 2 Sprint 1 | Ready for Client Testing', { align: 'center', color: '666666' });

doc.end();

output.on('finish', () => {
  console.log('✅ Phase 2 Report PDF generated successfully!');
  console.log('📄 Location: docs/KLENTEC_BMS_Phase2_Sprint1_Report.pdf');
});
