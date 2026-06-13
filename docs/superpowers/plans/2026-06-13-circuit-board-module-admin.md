# Circuit Board Module Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the management-side "电路板模块" tab with real production/temporary board module data and direct QR-code printing.

**Architecture:** Add one focused Vue component under `testmanage/circuit-module-inspection` and one reusable QR print utility. Existing production/temporary batch APIs provide the module list, and existing board detail APIs provide all boards under each module. QR printing reuses `getQRcodeImgApi` and writes returned images to a print window; no `qrcode.vue` dialog is used.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, Element Plus, Vitest, existing COSL API modules.

---

### Task 1: Failing Tests For Circuit Board Module

**Files:**
- Create: `tests/circuit-board-module-admin.test.ts`
- Later modify: `src/views/testmanage/circuit-module-inspection/index.vue`
- Later create: `src/views/testmanage/circuit-module-inspection/components/CircuitBoardModule.vue`
- Later create: `src/utils/printQrcode.ts`

- [ ] **Step 1: Write source-level tests for required behavior**

Create `tests/circuit-board-module-admin.test.ts` with assertions that the tab imports/renders `CircuitBoardModule`, the component uses existing batch/detail APIs, does not contain `开始测试`, does not use `qrcode.vue`, and uses module-level plus row-level direct print handlers.

- [ ] **Step 2: Run the new test and verify RED**

Run: `pnpm test tests/circuit-board-module-admin.test.ts --run`
Expected: FAIL because `CircuitBoardModule.vue` and `printQrcode.ts` do not exist yet.

### Task 2: QR Print Utility

**Files:**
- Create: `src/utils/printQrcode.ts`
- Test: `tests/circuit-board-module-admin.test.ts`

- [ ] **Step 1: Implement a reusable QR print utility**

Create `printBoardQrcodes(rows, options)` and `normalizeBoardForQrcode(row, sourceType)`:

```ts
export type QrcodeBoardSource = "production" | "temporary"

export interface QrcodeBoardRow {
  id?: string | number
  name?: string
  seria?: string
  serialNumber?: string
  serial_num?: string
  startTime?: string
  start_time?: string
}
```

`printBoardQrcodes` validates non-empty rows, calls `getQRcodeImgApi`, opens a blank print window, appends all returned images, calls `print()`, and reports "无法打开打印窗口" when blocked.

- [ ] **Step 2: Run the focused test and verify GREEN for utility expectations**

Run: `pnpm test tests/circuit-board-module-admin.test.ts --run`
Expected: utility source assertions pass; component assertions still fail until Task 3.

### Task 3: CircuitBoardModule Component

**Files:**
- Create: `src/views/testmanage/circuit-module-inspection/components/CircuitBoardModule.vue`
- Test: `tests/circuit-board-module-admin.test.ts`

- [ ] **Step 1: Implement the component shell and data state**

Use a two-column layout:
- left module list with query form, type selector `全部 / 生产电路板 / 临时电路板`, cards, refresh and print actions.
- right selected module detail and board table.

Use APIs:
- `getBatchDataApi` for production modules.
- `getTempBatchDataApi` for temporary modules.
- `getBoardDataApi` for production board details.
- `getBatchTempBoardDataApi` for temporary board details.

- [ ] **Step 2: Implement interactions**

On mount, load modules and select the first module. Clicking a module loads board details. Module-level print loads all board details for that module and passes them to `printBoardQrcodes`. Row-level print passes only the current board. Empty module print shows a warning and does not call the QR API.

- [ ] **Step 3: Run the focused test and verify GREEN**

Run: `pnpm test tests/circuit-board-module-admin.test.ts --run`
Expected: PASS.

### Task 4: Mount Component In Existing Tab

**Files:**
- Modify: `src/views/testmanage/circuit-module-inspection/index.vue`
- Test: `tests/work-order-navigation.test.ts`, `tests/circuit-board-module-admin.test.ts`

- [ ] **Step 1: Replace placeholder with component**

Import `CircuitBoardModule` and replace the current `el-empty` placeholder in the `电路板模块` tab with `<CircuitBoardModule />`.

- [ ] **Step 2: Run navigation and component tests**

Run: `pnpm test tests/work-order-navigation.test.ts tests/circuit-board-module-admin.test.ts --run`
Expected: PASS.

### Task 5: Build And Final Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run focused tests**

Run: `pnpm test tests/circuit-board-module-admin.test.ts tests/work-order-navigation.test.ts --run`
Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `pnpm build:prod`
Expected: exit code 0.

- [ ] **Step 3: Inspect diff**

Run: `git diff -- src/views/testmanage/circuit-module-inspection src/utils/printQrcode.ts tests/circuit-board-module-admin.test.ts`
Expected: only planned implementation changes are present.
