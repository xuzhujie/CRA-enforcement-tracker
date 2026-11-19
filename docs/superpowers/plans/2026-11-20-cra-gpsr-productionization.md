# CRA / GPSR Productionization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace illustrative product records with a traceable official Safety Gate snapshot, make the CRA line explicit about its non-public / not-reviewed boundary, add repeatable refresh and validation commands, document the compliance boundary, and verify the published UI on desktop and responsive layouts.

**Architecture:** A build-time data adapter will fetch the European Commission's public Safety Gate weekly XML reports and write a normalized JSON snapshot. Product records will be derived from that snapshot; each imported product will carry an explicit CRA `not-reviewed` coverage record unless a separate reviewed CRA input is supplied. CRA explanatory sources remain public links, while ENISA SRP notifications are never treated as public enforcement records.

**Tech Stack:** React 19, Vite, TypeScript, Node `fetch`, Node test runner, Native CUA browser QA.

**Spec:** `docs/superpowers/specs/2026-11-19-cra-gpsr-product-dashboard-design.md`, extended by the user's productionization request for items 1–5.

## Global Constraints

- Keep CRA and GPSR / Safety Gate as independent tracks; shared brand, model, market, and product fields may be reused.
- A Safety Gate alert is not CRA enforcement; a recall is not a fine; ENISA SRP is not a public penalty database.
- Public Safety Gate records must retain an official detail URL, provenance, report date, and last-verified date.
- Missing CRA evidence must render as `尚未核验`, never as compliant, fined, or an invented enforcement record.
- Do not add a backend, authentication, or private SRP access; the refresh path is build-time and public-data-only.
- Preserve the approved Native visual language and three-mode information architecture.

## Review Focus

- A public Safety Gate alert without a manufacturer or model must remain searchable and must not fabricate shared identity fields.
- A Safety Gate record with multiple measures must count recall and withdrawal independently while displaying one clear primary status.
- A product with no CRA public case must show `尚未核验`, not `无公开记录` as if a public CRA case database existed.
- A stale or malformed feed must fail validation without overwriting the last known-good snapshot.
- Data refresh must remain reproducible offline after a snapshot is committed, so `npm run build` does not require network access.

### Task 1: Production data contracts and compliance copy

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/ui/copy.ts`
- Modify: `src/data/sources.ts`
- Modify: `src/components/TrackStatusCell.tsx`
- Modify: `src/components/ProductDetailRail.tsx`
- Modify: `src/components/ProductRegister.tsx`
- Modify: `src/App.tsx`
- Create: `docs/compliance-review.md`
- Test: `tests/dashboard.test.ts`

**Interfaces:**
- Produces `CraStatus = ... | 'not-reviewed'`, optional public product fields, snapshot labels, and compliance-copy keys used by later tasks.
- Keeps `ProductRecord`, `CraRecord`, and `SafetyGateRecord` compatible with the current table, detail rail, timeline, and metric helpers.

- [x] Write failing tests for `not-reviewed` CRA rendering, official snapshot labels, and absence of `illustrative-demo` in the production shell.
- [x] Run the focused test and verify the expected failure.
- [x] Implement the new status/copy/source contracts and the compliance review document; preserve the separation notice and official source links.
- [x] Run the focused and full test suites; verify the new copy is used by the shell, register, track cell, and detail rail.

### Task 2: Official Safety Gate sync and normalized snapshot

**Files:**
- Create: `scripts/sync-safety-gate.ts`
- Create: `src/data/safetyGateSnapshot.ts`
- Create: `src/data/generated/safety-gate-snapshot.json`
- Modify: `package.json`
- Test: `tests/safety-gate-sync.test.ts`

**Interfaces:**
- Produces `SafetyGateSnapshot`, `SafetyGateAlertSnapshot`, and `parseSafetyGateXml()` / `normalizeSafetyGateAlert()` helpers.
- Uses the official weekly-list endpoint `https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/en` and each selected weekly detail XML URL.
- Defaults to the newest four weekly reports and at most 120 alerts; supports `--weeks` and `--limit` for reproducible refreshes.

- [x] Write failing parser tests using a local XML fixture covering CDATA, `xsi:nil`, multiple measures, risk level, product fields, and official alert URL.
- [x] Run the focused test and verify the expected failure.
- [x] Implement fetch, XML extraction, normalization, deduplication, and atomic snapshot writing; never replace the snapshot on a failed fetch or validation.
- [x] Run the focused test and `npm run data:sync -- --weeks=1 --limit=20` against the official endpoint; verify a non-empty official snapshot.

### Task 3: Product adapter and data-quality validation

**Files:**
- Create: `src/data/productData.ts`
- Create: `src/data/craReview.ts`
- Create: `src/lib/dataValidation.ts`
- Create: `scripts/validate-data.ts`
- Modify: `src/data/products.ts`
- Modify: `src/lib/dashboard.ts`
- Modify: `src/components/ProductRow.tsx`
- Modify: `src/components/EvidenceSection.tsx`
- Modify: `src/components/ProductDetailRail.tsx`
- Modify: `src/components/TrackStatusCell.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/SourceRail.tsx`
- Modify: `src/components/FooterNote.tsx`
- Modify: `package.json`
- Test: `tests/data-quality.test.ts`
- Test: `tests/dashboard.test.ts`

**Interfaces:**
- `products` becomes a derived array from the committed official snapshot plus an explicit CRA review manifest.
- `validateProducts(products, snapshot)` returns structured errors for missing source URLs, invalid provenance, stale/malformed dates, missing alert IDs, or accidental demo records.
- CRA review input is optional and empty by default; absent review data creates `coverage: 'not-reviewed'` without creating a CRA case.

- [x] Write failing tests for mapping an official alert into a product, no-fabrication CRA coverage, board status precedence, and data-quality failures.
- [x] Run the focused tests and verify the expected failures.
- [x] Implement the adapter, explicit CRA not-reviewed record, real Safety Gate detail fields, and validation command.
- [x] Run `npm run data:check`, the full test suite, and verify no `illustrative-demo` data remains in the runtime product array.

### Task 4: Refresh/update mechanism and operational documentation

**Files:**
- Modify: `package.json`
- Create: `.github/workflows/safety-gate-refresh.yml`
- Create: `docs/data-operations.md`
- Modify: `docs/superpowers/specs/2026-11-19-cra-gpsr-product-dashboard-design.md`
- Modify: `.superpowers/sdd/2026-11-19-cra-gpsr-product-dashboard/progress.md`

**Interfaces:**
- `npm run data:sync`, `npm run data:check`, and `npm run build:live` are the supported refresh/verification entry points.
- Scheduled workflow runs weekly and on manual dispatch, validates the snapshot, builds offline from the committed artifact, and uploads the generated snapshot/build as an artifact without silently publishing enforcement claims.

- [x] Write the operations checklist and workflow with source URL, cadence, failure behavior, and rollback instructions.
- [x] Run YAML/text checks and execute `npm run data:check` plus `npm run build` from the committed snapshot.
- [x] Record the decision that CRA case data requires an approved internal/public evidence input and is not inferred from Safety Gate.

### Task 5: Release QA and responsive verification

**Files:**
- Modify: `tests/dashboard.test.ts`
- Modify: `docs/data-operations.md`
- Modify: `.superpowers/sdd/2026-11-20-cra-gpsr-productionization/progress.md`

**Interfaces:**
- Native CUA validates `http://127.0.0.1:5175/` in overview, CRA, and GPSR / Safety Gate modes; screenshots cover first viewport, real alert detail, source rail, and responsive CSS behavior.

- [x] Run `npm test`, `npm run data:check`, `npm run build`, and `npm run lint`.
- [x] Reload the Native app, verify page identity/no overlay, switch both tracks, filter/select an imported alert, and inspect its source link and evidence fields.
- [x] Review mobile breakpoints and keyboard-selectable rows; document the exact viewport evidence and any Native CUA limitation.
- [x] Mark the productionization goal complete only after all five requirements have evidence in the ledger.
