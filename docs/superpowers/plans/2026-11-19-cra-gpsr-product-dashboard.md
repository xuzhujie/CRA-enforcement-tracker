# CRA / GPSR Product Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a source-aware React + Vite product dashboard that shares Brand / Model / Market fields while keeping CRA reporting / remediation and GPSR / Safety Gate alerts / recalls as two separate evidence lines.

**Architecture:** A small typed data layer owns product records, per-track event arrays, filters, metric derivation, and timeline projections. A single React screen owns mode, filter, language, and selected-product state, and delegates rendering to focused components: header, mode tabs, metric strip, filter bar, product register, detail rail, dual-lane timeline, and sources. CSS follows the approved DSA/DMA-inspired blue/slate system with a responsive single-track mobile layout.

**Tech Stack:** React + TypeScript + Vite, `lucide-react` for icons, plain CSS for the design system, Node `tsx --test` for pure data-layer tests, Vite build for type / bundle verification.

**Spec:** `docs/superpowers/specs/2026-11-19-cra-gpsr-product-dashboard-design.md`

## Global Constraints

- Use `AS_OF_DATE = 2026-11-19` as the v1 verification baseline; dates are date-only and do not calculate live countdowns.
- Keep `cra.events[]` and `safetyGate.events[]` independent; cross-line correlation may only mean “same product match,” never causation or penalty equivalence.
- `safetyGate` missing means “no public record found in the curated dataset,” not “no alert exists anywhere”; support `coverage: 'recorded' | 'checked-no-record' | 'not-reviewed'`.
- `CRA 关注产品` counts de-duplicated products with CRA status `attention`, `in-progress`, or `overdue`.
- `Safety Gate alerts` counts de-duplicated products with a published Safety Gate record (`alert`, `withdrawal`, or `recall`).
- `整改期限` counts open CRA deadlines due within 30 days of `AS_OF_DATE` or already overdue.
- `公开召回` counts de-duplicated products with a Safety Gate recall measure.
- Demo records must visibly carry `illustrative-demo` provenance; they may link to general official explainer pages but must not appear as official case data.
- CRA, GPSR / Safety Gate, and ENISA SRP source links must be real external links supplied by the approved spec.
- Do not add backend, authentication, external API fetching, real ENISA SRP access, or live Safety Gate ingestion in v1.
- Use the sibling DSA / DMA projects as visual and dependency references; do not import code across projects.
- Keep UI text and controls code-native; do not ship the concept image as the application UI.
- The current workspace is not a Git repository; commit steps below are conditional and should be skipped if Git is still unavailable.

## Review Focus

- **Mode boundaries:** Switching to CRA or GPSR / Safety Gate must change visible metrics, table track, detail evidence section, and timeline without mixing the other line. Test in Task 4 and browser-check in Task 7.
- **Missing-track coverage:** An absent Safety Gate record must render as “未发现公开记录 / no public record found in the curated dataset,” not as a universal claim. Test in Task 2 and Task 5.
- **Metric semantics:** Deadline counts must include overdue and next-30-day open deadlines but exclude later deadlines; alerts and recalls must be product-deduplicated. Test in Task 2.
- **Product selection state:** Selecting a row must update the detail rail and timeline while preserving filters; closing the rail must not reset the selected product or mode. Test in Task 5 and browser-check in Task 7.
- **Responsive separation:** Mobile must retain shared product identity and let the user switch between the two lines without horizontal overflow or collapsed unreadable table cells. Test in Task 6 and browser-check in Task 7.

---

### Task 1: Scaffold the standalone React + Vite app

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/vite-env.d.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/App.css`

**Interfaces:**
- Produces the Vite entry point `src/main.tsx`, which renders `App` into `#root`.
- Produces scripts `dev`, `build`, `lint`, `test`, and `preview`; later tasks rely on `npm run build` and `npm test`.

- [ ] **Step 1: Create the package manifest and Vite / TypeScript configuration.**

  Use React, React DOM, Vite, TypeScript, `@vitejs/plugin-react`, `lucide-react`, and `tsx`; keep scripts aligned with the sibling tracker projects. Do not add Tailwind or a component framework because the approved design system is small and plain CSS is easier to audit.

- [ ] **Step 2: Add the minimal render smoke test surface.**

  Create `index.html`, `src/main.tsx`, and a temporary minimal `App` / CSS shell that renders the approved page title without implementing dashboard behavior yet.

- [ ] **Step 3: Install dependencies and run the scaffold checks.**

  Run: `npm install`

  Run: `npm run build`

  Expected: the Vite production build succeeds and emits `dist/` without TypeScript errors.

- [ ] **Step 4: Commit the scaffold.**

  ```bash
  git add package.json package-lock.json index.html vite.config.ts tsconfig*.json src
  git commit -m "chore: scaffold CRA GPSR dashboard"
  ```

### Task 2: Implement typed product data, derived metrics, filters, and pure tests

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/products.ts`
- Create: `src/data/sources.ts`
- Create: `src/lib/dashboard.ts`
- Create: `tests/dashboard.test.ts`

**Interfaces:**
- `src/data/types.ts` exports `Mode`, `Language`, `RecordProvenance`, `RecordCoverage`, `EvidenceRef`, `CraEvent`, `CraRecord`, `SafetyGateEvent`, `SafetyGateRecord`, `ProductRecord`, `ProductFilters`, `DashboardMetrics`, and `TimelineEvent`.
- `TimelineEvent` has `{ id, lane: 'cra' | 'safetyGate', label, date?, state, measure?, sourceUrl?, provenance? }`; `DashboardMetrics` has `{ craFocusCount, safetyGateAlertCount, remediationDeadlineCount, publicRecallCount, reportingNodeCount, regulatoryMeasureCount, seriousRiskCount, withdrawalCount }`.
- `src/data/products.ts` exports `AS_OF_DATE: '2026-11-19'`, `products: ProductRecord[]`, and exactly five illustrative product records with shared fields plus independent CRA / Safety Gate tracks.
- `src/data/sources.ts` exports `officialSources` with `{ key, label, description, url }` for the CRA summary, Safety Gate public alerts, and ENISA SRP pages.
- `src/lib/dashboard.ts` exports:
  - `filterProducts(products: ProductRecord[], filters: ProductFilters): ProductRecord[]`
  - `getDashboardMetrics(products: ProductRecord[], asOfDate: string): DashboardMetrics`
  - `getModeMetrics(metrics: DashboardMetrics, mode: Mode): Array<{ label: string; value: string; note: string; tone: 'blue' | 'amber' | 'red' | 'green' }>`
  - `getTimelineEvents(product: ProductRecord, mode: Mode): TimelineEvent[]`
  - `getUniqueFilterValues(products: ProductRecord[]): { brands: string[]; models: string[]; markets: string[]; productTypes: string[] }`
  - `getBoardStatus(product: ProductRecord): ProductRecord['boardStatus']`

- [ ] **Step 1: Write failing tests for the metric and filter contracts.**

  In `tests/dashboard.test.ts`, cover:

  ```ts
  test('counts CRA attention, in-progress, and overdue products once')
  test('counts Safety Gate alerts and recalls by product, not by event')
  test('counts only open deadlines due within 30 days or already overdue')
  test('treats missing safety gate data as no record in the curated dataset')
  test('filters by brand, model, market, and case-insensitive search')
  test('projects only the selected track into CRA or Safety Gate timelines')
  ```

  Assert concrete values against a small fixture list and `AS_OF_DATE`, including one product with multiple Safety Gate events and a deadline after the 30-day window.

- [ ] **Step 2: Run the focused test to confirm it fails for missing data-layer functions.**

  Run: `npm test -- --test-name-pattern='counts|filters|projects'`

  Expected: FAIL because the types and functions do not exist yet.

- [ ] **Step 3: Implement the shared types and five-record illustrative dataset.**

  Use realistic product-shaped demo names but no real company claims. Every demo track and event must carry `provenance: 'illustrative-demo'`, `coverage`, `lastVerifiedAt`, and a source URL. Include cases for: no Safety Gate record, an active CRA item, a withdrawal, a recall, and an overdue / near-term CRA deadline. Keep the record semantics explicit in the data, not inferred from display copy.

- [ ] **Step 4: Implement `src/lib/dashboard.ts`.**

  Parse date-only strings as UTC calendar dates or use a small integer-day helper so the 30-day calculation is deterministic. Use `Set`-based product deduplication for alerts, recalls, and focus counts. `filterProducts` must treat blank filters as wildcards and search `brand`, `model`, `productName`, `productType`, and all Safety Gate IDs.

- [ ] **Step 5: Run the focused tests to verify the data layer.**

  Run: `npm test -- --test-name-pattern='counts|filters|projects'`

  Expected: PASS with no warnings about unhandled promises or invalid dates.

- [ ] **Step 6: Run the type check and commit the data layer.**

  Run: `npm run lint`

  Expected: PASS.

  ```bash
  git add src/data src/lib/dashboard.ts tests/dashboard.test.ts
  git commit -m "feat: add CRA GPSR product data model"
  ```

### Task 3: Build the app shell, shared design tokens, and language / mode state

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `src/App.css`
- Create: `src/ui/copy.ts`
- Create: `src/ui/icons.tsx` (only if an icon composition is not available directly from `lucide-react`)

**Interfaces:**
- `src/ui/copy.ts` exports `copy: Record<Language, { ... }>` with Chinese-first and English labels for the page title, nav, notice, filters, metric labels, empty states, provenance labels, detail headings, and footer disclaimer.
- `App` owns `mode: Mode`, `language: Language`, `filters: ProductFilters`, `selectedProductId: string`, and `detailOpen: boolean`; later components receive these as props and emit typed callbacks.
- `src/App.css` owns tokens, layout primitives, focus styles, mode-specific semantic colors, and responsive breakpoints; components should not add one-off inline style objects for layout.

- [ ] **Step 1: Define the copy map and UI-state types.**

  Lock visible copy from the approved design: `CRA / GPSR · 共用产品看板`, `总览`, `CRA`, `GPSR / Safety Gate`, `产品状态总览`, the separation warning, official source labels, and the demo-data / research-use disclaimers. Add English equivalents without changing the information architecture.

- [ ] **Step 2: Write the app shell and header / mode tabs.**

  Render a quiet header with title, last-verified / data-as-of text, source shortcuts, language control, and three mode buttons. The active mode must be exposed with `aria-pressed` and a visible active indicator. Add the separation notice immediately below.

- [ ] **Step 3: Add design tokens and base layout CSS.**

  Implement the approved palette: `#f5f7fb` page background, white surfaces, `#0b2a6b` / `#1e56c8` CRA blue, `#b97812` / `#fff2d9` Safety Gate amber, `#c94d5c` recall red, `#25866a` success green, 8–12px radii, low-contrast borders, and Inter / system / Chinese fallbacks. Add keyboard focus outlines and reduced-motion behavior.

- [ ] **Step 4: Run the build after shell work.**

  Run: `npm run build`

  Expected: PASS; the page renders a non-empty shell with the active mode, title, and notice.

### Task 4: Add metrics, filters, and mode-specific product overview

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/MetricStrip.tsx`
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/SeparationNotice.tsx` if extracted from the shell
- Modify: `src/App.css`

**Interfaces:**
- `MetricStrip` consumes `items: Array<{ label: string; value: string; note: string; tone: MetricTone }>` and renders four non-interactive metric cells.
- `FilterBar` consumes `filters`, `options`, `language`, and `onChange(next: ProductFilters)` plus `onClear()`; it renders Brand, Model, Market, product type, search, and clear controls.
- `App` calls `filterProducts(products, filters)` and `getDashboardMetrics(filteredProducts, AS_OF_DATE)`; metrics must reflect the current filter, not the full dataset.

- [ ] **Step 1: Write the metric / filter integration assertions.**

  Extend `tests/dashboard.test.ts` with:

  ```ts
  test('filtering a single product recomputes all four overview metrics')
  test('CRA mode returns CRA-only metric labels and values')
  test('Safety Gate mode returns Safety Gate-only metric labels and values')
  ```

- [ ] **Step 2: Implement `MetricStrip` and `FilterBar`.**

  Keep controls code-native, keyboard accessible, and visually aligned with the sibling trackers. Use `<select>` for deterministic filtering and a labeled search input. Do not add pill-heavy filter UI beyond the approved mode tabs.

- [ ] **Step 3: Wire filter and mode state in `App`.**

  Use controlled state. Reset `selectedProductId` only when the selected product is no longer in the filtered result; otherwise preserve selection across filter and mode changes. In `CRA` and `GPSR / Safety Gate`, show mode-specific metrics; in `总览`, show the four shared metrics from the spec.

- [ ] **Step 4: Run the focused tests and build.**

  Run: `npm test -- --test-name-pattern='filtering|CRA mode|Safety Gate mode'`

  Expected: PASS.

  Run: `npm run build`

  Expected: PASS.

### Task 5: Implement the product register and selected-product detail rail

**Files:**
- Create: `src/components/ProductRegister.tsx`
- Create: `src/components/ProductRow.tsx`
- Create: `src/components/TrackStatusCell.tsx`
- Create: `src/components/ProductDetailRail.tsx`
- Create: `src/components/EvidenceSection.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Interfaces:**
- `ProductRegister` consumes `products`, `mode`, `selectedProductId`, `language`, and `onSelect(productId: string)`; it renders shared columns plus CRA / Safety Gate track columns according to mode.
- `ProductDetailRail` consumes `product: ProductRecord | null`, `mode`, `language`, `open`, and `onClose()`; it renders shared identity plus mode-appropriate evidence sections and the explicit “same product match, not the same proceeding” copy in overview.
- `EvidenceSection` consumes `title`, `tone`, `status`, `items`, and `provenance` fields and renders source / verification metadata without implying penalties.
- `TrackStatusCell` consumes either `CraRecord` or `SafetyGateRecord` via discriminated props and renders status, measure / deadline, IDs, and no-record coverage text.

- [ ] **Step 1: Implement the shared table anatomy.**

  Build a semantic `<table>` on desktop with `#`, Brand, Model, Market, and two grouped track headers. Use `data-track` attributes for mode CSS and stable `aria` labels. Selected rows must expose `aria-selected` and a visible left border.

- [ ] **Step 2: Implement track-specific cells.**

  CRA cells show reporting / regulatory status and the remediation deadline. Safety Gate cells show alert status, risk / measure, and Safety Gate ID. A missing record shows the curated-dataset coverage explanation, never a generic “compliant” label.

- [ ] **Step 3: Implement the detail rail and evidence sections.**

  The rail opens from the selected row, shows `看板状态（非法律结论）`, shared product fields, and independent CRA / Safety Gate evidence. In line-specific modes, render only the selected line’s detailed evidence while retaining shared product fields.

- [ ] **Step 4: Verify selection behavior in the browser after the app is wired.**

  Start the dev server with `npm run dev -- --host 127.0.0.1` and verify: clicking a row changes the selected state and detail content; closing the rail leaves the filter and selected ID intact; switching mode changes the visible track but not the shared product row.

- [ ] **Step 5: Run build and commit the register / detail surface.**

  Run: `npm run build`

  Expected: PASS.

  ```bash
  git add src/components src/App.tsx src/App.css
  git commit -m "feat: add shared product register and evidence rail"
  ```

### Task 6: Add dual-lane timeline, source rail, footer, and responsive behavior

**Files:**
- Create: `src/components/DualLaneTimeline.tsx`
- Create: `src/components/SourceRail.tsx`
- Create: `src/components/FooterNote.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `tests/dashboard.test.ts` if timeline projection coverage needs additional cases

**Interfaces:**
- `DualLaneTimeline` consumes `product: ProductRecord | null`, `mode`, and `language`; it calls `getTimelineEvents(product, mode)` and renders CRA and / or Safety Gate lanes without merging event arrays.
- `SourceRail` consumes `officialSources`, `language`, and `dataAsOf`; every card opens its `sourceUrl` in a new tab with `rel="noreferrer"`.
- `FooterNote` consumes `language` and `dataAsOf` and renders the study-use / official-source disclaimer.

- [ ] **Step 1: Write timeline projection tests for overview and line-specific modes.**

  Assert that overview returns two independently labeled lanes, CRA mode returns no Safety Gate events, and Safety Gate mode returns no CRA events; empty lanes render the explicit no-public-record state.

- [ ] **Step 2: Implement `DualLaneTimeline`.**

  Use a stable horizontal line with event markers and date labels. CRA uses blue; Safety Gate uses amber / red for recall. Do not calculate live countdowns. The component must keep the lane labels visible when there are no events.

- [ ] **Step 3: Implement source rail and footer.**

  Present the three official sources from `src/data/sources.ts`, plus the data date and demo-data disclaimer. Do not add source claims beyond the approved spec.

- [ ] **Step 4: Add responsive CSS.**

  At tablet width, stack the source rail below the main content. At mobile width, keep shared product identity visible and switch the register to one visible track at a time with a horizontal mode control; avoid a card-grid rewrite. Verify no horizontal overflow at 390px.

- [ ] **Step 5: Run tests and build.**

  Run: `npm test`

  Expected: PASS.

  Run: `npm run build`

  Expected: PASS.

### Task 7: Browser visual QA, accessibility smoke checks, and fidelity fixes

**Files:**
- Modify: `src/App.tsx`, `src/App.css`, or focused component files only when a QA mismatch is found.
- Create outside the repository: temporary screenshots / Playwright script if Browser/IAB is unavailable.

**Interfaces:**
- The target flow is: app loads → overview metrics and product register render → user filters by market → selects a product → detail rail and timeline update → switches to CRA and GPSR / Safety Gate modes → mobile layout remains readable.

- [ ] **Step 1: Start the app and identify the validation route.**

  Run: `npm run dev -- --host 127.0.0.1`.

  Use the Browser / IAB path first. If unavailable or unreliable, use Playwright Chromium and record the fallback reason in the final QA report.

- [ ] **Step 2: Verify page identity and console health.**

  Confirm the page title / URL, non-empty DOM, no Vite overlay, and no relevant console errors or warnings.

- [ ] **Step 3: Exercise the target flow.**

  Capture proof after each state: active overview, filtered product list, selected detail rail, CRA-only mode, Safety Gate-only mode, and 390px mobile layout. Confirm filters recompute metrics and mode switches never merge tracks.

- [ ] **Step 4: Compare implementation against the approved concept.**

  Inspect the accepted concept at `docs/superpowers/specs/assets/cra-gpsr-dashboard-concept.png` and the latest browser screenshot with `view_image` in the same QA pass. Check at least: title / mode tabs, color separation, table density, source rail, selected detail rail, dual timeline, responsive continuation, and copy / provenance labels.

- [ ] **Step 5: Fix all material mismatches and rerun checks.**

  Keep a short fidelity ledger in the final response: mismatch, evidence, fix. Do not keep temporary screenshots, reports, or scripts in the repository.

- [ ] **Step 6: Run the final verification commands.**

  Run: `npm test`

  Expected: PASS.

  Run: `npm run build`

  Expected: PASS.

  Run: `git status --short`

  Expected: only intentional source, test, documentation, and approved concept files are present.
