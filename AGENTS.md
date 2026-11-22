# ShopLedger

## Stack

Node.js CommonJS application using Express 4 and body-parser; the browser UI is static HTML, CSS, and XMLHttpRequest. Application data is stored in `data/db.json`.

## Module map

- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, creation, and cancellation endpoints.
- `routes/products.js` — product catalog and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, validation, discount calculation, and listing.
- `lib/dates.js` — date formatting and normalization helpers.
- `lib/inventory.js` — product lookup, stock checks, reserve/release, and inventory summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, discount, and checkout-total calculation.
- `lib/reports.js` — dashboard and GST-reconciliation calculation.
- `lib/store.js` — JSON database read, write, and audit-log append.
- `lib/tax.js` — GST-rate lookup, slab percentage, and CGST/SGST split.

## Commands

- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test` (no test files are currently present).

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js`; use `lib/tax.js` only if truly needed.
