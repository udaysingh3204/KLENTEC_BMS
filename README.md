# KLENTEC BMS

Offline-first Android Business Management System for a building material retail business.

## Current Baseline

This repository now contains the first interactive application build for the BRD in `KLENTEC_BMS_PROPOSAL.pdf`:

- Expo + React Native + TypeScript project scaffold
- Role-based PIN login flow for Admin, Employee, and Delivery Staff
- Navigation-backed dashboard plus Inventory, Billing, Customer, Supplier, Cash Flow, Reports, and Delivery screens
- Zustand store hydrated from SQLite for offline local state
- Seed data for products, customers, suppliers, invoices, deliveries, and activity feed
- Project metadata aligned with Android-first local deployment

## Run Locally

```bash
npm install
npm run typecheck
npm run android
```

## Suggested Build Order

1. Add offline persistence with SQLite or WatermelonDB.
2. Implement authentication and role-based screen gating.
3. Expand supplier, inventory, billing, customer, and cash flow flows from the current baseline.
4. Add delivery operations, reporting, and CSV export.
5. Integrate Bluetooth thermal printing after transactional flows are stable.

## Near-Term Architecture

- `App.tsx`: app entry wired to navigation
- `src/components`: reusable UI cards
- `src/data/mockData.ts`: seed data mapped from the BRD
- `src/navigation`: stack routing types and navigator
- `src/screens`: login and workflow screens
- `src/store`: persisted Zustand app store
- `src/types.ts`: shared domain types
- `src/theme.ts`: app color system

## Delivery Notes

The current code now includes the first working role-based flows and a real SQLite-backed local persistence layer, but it is still not the full production feature set. The next implementation pass should add customer and reports screens, then integrate printing plus CSV export.