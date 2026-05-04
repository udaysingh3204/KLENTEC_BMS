import fs from 'node:fs/promises';
import path from 'node:path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const outputPath = path.resolve('docs', 'KLENTEC_BMS_Project_Status_and_Roadmap.docx');
const generatedOn = 'May 5, 2026';

const sectionTitle = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, color: '0F4C5C', bold: true })],
  });

const bodyText = (text, options = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 300 },
    ...options,
    children: [new TextRun({ text, size: 22, color: '1F2933' })],
  });

const bulletText = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 70, line: 280 },
    children: [new TextRun({ text, size: 22, color: '1F2933' })],
  });

const tableCell = (text, width, header = false) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 110, bottom: 110, left: 110, right: 110 },
    borders: {
      top: { style: BorderStyle.SINGLE, color: 'D9E2EC', size: 1 },
      bottom: { style: BorderStyle.SINGLE, color: 'D9E2EC', size: 1 },
      left: { style: BorderStyle.SINGLE, color: 'D9E2EC', size: 1 },
      right: { style: BorderStyle.SINGLE, color: 'D9E2EC', size: 1 },
    },
    shading: header ? { fill: 'EAF4F4' } : undefined,
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: [
          new TextRun({
            text,
            bold: header,
            size: 21,
            color: header ? '0F4C5C' : '243B53',
          }),
        ],
      }),
    ],
  });

const moduleTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        tableCell('Module', 3300, true),
        tableCell('Current State', 2100, true),
        tableCell('Notes', 5200, true),
      ],
    }),
    new TableRow({ children: [tableCell('Role-based Login', 3300), tableCell('Implemented', 2100), tableCell('Admin, Employee, and Delivery Staff PIN access is live.', 5200)] }),
    new TableRow({ children: [tableCell('Dashboard', 3300), tableCell('Implemented', 2100), tableCell('Operational summary, payment mix, low-stock count, cash-flow snapshot, and activity feed are live.', 5200)] }),
    new TableRow({ children: [tableCell('Inventory', 3300), tableCell('Implemented', 2100), tableCell('Product creation, stock adjustments, low-stock thresholds, and stronger whole-number validation are live.', 5200)] }),
    new TableRow({ children: [tableCell('Billing and Invoices', 3300), tableCell('Implemented', 2100), tableCell('Customer selection, quantity validation, payment mode handling, and invoice total calculation are live.', 5200)] }),
    new TableRow({ children: [tableCell('Customer Management', 3300), tableCell('Implemented', 2100), tableCell('Customer creation and outstanding-balance visibility are live.', 5200)] }),
    new TableRow({ children: [tableCell('Supplier Records', 3300), tableCell('Implemented', 2100), tableCell('Supplier directory, seeded records, add-supplier form, and persistence are now live.', 5200)] }),
    new TableRow({ children: [tableCell('Cash Flow', 3300), tableCell('Implemented', 2100), tableCell('Expense ledger, payment-mode tagging, daily totals, and whole-number money validation are live.', 5200)] }),
    new TableRow({ children: [tableCell('Reports', 3300), tableCell('Implemented', 2100), tableCell('Management summary, payment breakup, low-stock attention items, and delivery status reporting are live.', 5200)] }),
    new TableRow({ children: [tableCell('Deliveries', 3300), tableCell('Implemented', 2100), tableCell('Delivery creation, dispatch progression, and delivered-state workflow are live.', 5200)] }),
    new TableRow({ children: [tableCell('CSV Backup / Thermal Printing / Attendance', 3300), tableCell('Planned', 2100), tableCell('These remain in the next implementation phase and should be delivered before production handover.', 5200)] }),
  ],
});

const doc = new Document({
  creator: 'GitHub Copilot',
  title: 'KLENTEC BMS Project Status and Roadmap',
  description: 'Current implementation status and next-phase roadmap for KLENTEC BMS.',
  sections: [
    {
      properties: {
        page: {
          margin: { top: 900, right: 900, bottom: 900, left: 900 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'KLENTEC BMS  |  Project Status and Roadmap  |  Page ', size: 18, color: '7B8794' }),
                PageNumber.CURRENT,
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({ text: 'KLENTEC BMS', bold: true, size: 34, color: '0B3C49' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'Project Status and Delivery Roadmap', bold: true, size: 28, color: '0F4C5C' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
          children: [
            new TextRun({ text: `Prepared on ${generatedOn}`, italics: true, size: 22, color: '52606D' }),
          ],
        }),
        bodyText('This document summarizes the current delivery state of the KLENTEC Business Management System, confirms what has already been validated, and outlines the next implementation phase needed for full production readiness.'),

        sectionTitle('Executive Summary'),
        bodyText('KLENTEC BMS is now running as an offline-first Expo React Native application designed for Android deployment in a building-material retail environment. The current build already covers the main operational flow: secure role access, dashboard visibility, inventory handling, customer and supplier records, billing, delivery tracking, expense logging, and reporting.'),
        bodyText('The app has also been hardened in the most sensitive area for this project: business calculations. Shared finance utilities now centralize invoice totals, expense totals, payment summaries, currency formatting, and whole-number validation so operational math behaves consistently across the system.'),

        sectionTitle('Project Objectives'),
        bulletText('Deliver an offline Android-first BMS aligned to the approved KLENTEC proposal.'),
        bulletText('Keep the system simple for staff to use under real shop-floor conditions.'),
        bulletText('Maintain strong calculation integrity for billing, expenses, totals, and reports.'),
        bulletText('Use local persistence suitable for low-connectivity or no-connectivity deployment.'),
        bulletText('Prepare the codebase for CSV backup/export and thermal printing in the next phase.'),

        sectionTitle('Current Delivery Status'),
        moduleTable,

        sectionTitle('Validated Technical State'),
        bulletText('Application stack: Expo SDK 54, React 19, React Native 0.81, TypeScript, Zustand.'),
        bulletText('Persistence strategy: SQLite on native/mobile and AsyncStorage fallback on web preview.'),
        bulletText('Validation completed: npm run typecheck passed after the finance hardening pass and supplier module integration.'),
        bulletText('Build validation completed: npx expo export --platform android passed on the current state.'),
        bulletText('Live preview validation completed: login, dashboard, cash flow, reports, and supplier flow render correctly in the browser preview.'),

        sectionTitle('Calculation and Data Integrity'),
        bulletText('Money logic is centralized in a shared finance utility rather than repeated across screens.'),
        bulletText('Invoice quantity, product pricing, stock thresholds, and expense amounts now use stricter whole-number validation.'),
        bulletText('Payment mode totals and report summaries are computed from one shared source of truth.'),
        bulletText('Supplier persistence was added with backward-compatible migration handling for older saved snapshots.'),

        sectionTitle('Architecture Snapshot'),
        bulletText('Navigation layer: role-gated stack navigation with login and workflow screens.'),
        bulletText('State layer: centralized Zustand store with persisted business actions.'),
        bulletText('Data layer: local database bootstrap, seed loading, snapshot hydration, and save-through persistence.'),
        bulletText('UI layer: reusable screen shell, cards, and operational modules structured for rapid expansion.'),

        sectionTitle('Next Delivery Phase'),
        bulletText('Add Employee and Attendance workflows so the remaining planned staff module becomes operational.'),
        bulletText('Implement CSV backup/export for real offline recovery and handover readiness.'),
        bulletText('Connect supplier records to purchase-entry and stock-replenishment flows.'),
        bulletText('Add receipt-print preparation and thermal printer integration after transaction flows are finalized.'),
        bulletText('Strengthen production readiness with more targeted persistence updates and a formal release checklist.'),

        sectionTitle('Git Recommendation'),
        bodyText('Yes, this is the correct time to start the Git workflow. The project is now beyond a rough prototype and has a coherent baseline: validated build, validated typecheck, stabilized finance logic, and a meaningful feature set.'),
        bodyText('At the moment, the KLENTEC_BMS folder is not yet initialized as its own Git repository. The recommended next Git step is to initialize a repository in this folder, review the first baseline file set, and then create the first commit as the foundation for future client milestones.'),

        sectionTitle('Recommended First Baseline Commit Scope'),
        bulletText('Application scaffold and configuration files.'),
        bulletText('Navigation, screens, state store, persistence layer, and shared finance utilities.'),
        bulletText('Current seed data, supplier module, and documentation artifacts.'),
        bulletText('Validated Android export output only if you intentionally want build artifacts tracked; otherwise keep dist out of Git.'),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
await fs.writeFile(outputPath, buffer);
console.log(`Created ${outputPath}`);
