# Work Order Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the confirmed electrical module inspection page and management-side work order scheduling page that persists schedules to the backend fields read by the test client.

**Architecture:** Split the existing test order tabs into two route-level pages, then add a scheduling API facade and a Vue scheduling page that normalizes five equipment order types into a shared calendar model. Schedule mutations call the same backend endpoints already used by the test client so data is shared through the database.

**Tech Stack:** Vue 3.4, TypeScript, Element Plus, Vue Router, Axios request wrapper, Vitest string-regression tests.

---

### Task 1: Split Test Order Tabs

**Files:**
- Modify: `src/views/testmanage/testorder/index.vue`
- Create: `src/views/testmanage/circuit-module-inspection/index.vue`
- Modify: `src/router/index.ts`
- Test: `tests/work-order-navigation.test.ts`

- [ ] Add a failing test that asserts `testorder/index.vue` only imports/renders production and temporary tabs.
- [ ] Add a failing test that asserts the new circuit module inspection page renders moved equipment tabs and the circuit board module tab.
- [ ] Implement the split using existing order components.
- [ ] Add the `CircuitModuleInspection` route under `/testmanage`.
- [ ] Run the targeted test and type check.

### Task 2: Add Schedule API Facade

**Files:**
- Create: `src/api/work-order-schedule/index.ts`
- Test: `tests/work-order-schedule-api.test.ts`

- [ ] Add a failing test for the five backend schedule endpoint paths.
- [ ] Implement typed schedule save/clear functions for water cycle, vibration, high temp box, high temp pressure instrument, and simulated well device.
- [ ] Keep payload fields in snake_case to match the backend and test client.
- [ ] Run the targeted API test.

### Task 3: Build Management Scheduling Page

**Files:**
- Create: `src/views/dashboard/work-order-schedule/index.vue`
- Modify: `src/router/index.ts`
- Test: `tests/work-order-schedule-page.test.ts`

- [ ] Add a failing test that verifies the page uses equipment tabs and does not include a top status-stat tab strip.
- [ ] Implement the Element Plus style page with equipment tabs, left work-order list, week toolbar, calendar grid, and schedule dialog.
- [ ] Load five equipment order lists through existing APIs and normalize them to a shared view model.
- [ ] Persist schedule changes through `src/api/work-order-schedule/index.ts`.
- [ ] Add the `WorkOrderSchedule` route under the home route.
- [ ] Run the targeted page test.

### Task 4: Verification

**Files:**
- No new files unless fixes are needed.

- [ ] Run `pnpm test`.
- [ ] Run `pnpm build:prod`.
- [ ] Start `pnpm dev` and verify the new pages in the browser.
- [ ] Confirm final `git diff --check` is clean.
