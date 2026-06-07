# High Temp Box Order Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the high-temperature-box order creation contract with the requested application, project, instrument, and environmental fields, and keep the operator client able to display and process pending orders.

**Architecture:** Store application/project/environment fields on `HighTempBoxOrder`, and keep instrument name plus multiple SN values in existing `HighTempBoxOrderInstrument` rows. Preserve older fields by deriving them from the new payload so existing list/detail/status/report flows remain compatible.

**Tech Stack:** Django shared models and DRF serializers, Vue 3 + TypeScript + Element Plus, Tauri operator Vue client.

---

### Task 1: Backend Data Contract

**Files:**
- Modify: `D:/Users/Desktop/cnooc-backend/shared_models/models.py`
- Create: `D:/Users/Desktop/cnooc-backend/shared_models/migrations/0023_high_temp_box_order_application_fields.py`
- Modify: `D:/Users/Desktop/cnooc-backend/test_management_app/serializers.py`
- Modify: `D:/Users/Desktop/cnooc-backend/test_management_app/views.py`

- [ ] Add `entrusting_unit`, `applicant_phone`, `application_date`, `research_number`, `project_budget_number`, `project_name`, `specification`, `max_temperature`, `slope`, `hold_time`, and `humidity` to `HighTempBoxOrder`.
- [ ] Add an idempotent migration depending on `0022_sim_instrument_maintenance_record`.
- [ ] Keep `HighTempBoxOrderInstrument.instrument_name` and `sn_numbers` as the instrument storage.
- [ ] Add serializer normalization so new payloads can omit legacy fields; derive `test_platform`, `test_date`, `run_time`, `device_name`, `device_number`, `task_number`, and `target_temp`.
- [ ] Fix `high_temp_box_order_change_status` to parse running/completed instrument ids before using them, update per-instrument status, and avoid undefined variables.
- [ ] Verify with `python manage.py check`.

### Task 2: Web Admin Order Form

**Files:**
- Modify: `D:/Users/Desktop/cosl-front-rebuild/src/api/high-temperature/types/index.ts`
- Modify: `D:/Users/Desktop/cosl-front-rebuild/src/api/high-temperature/index.ts`
- Modify: `D:/Users/Desktop/cosl-front-rebuild/src/views/testmanage/testorder/components/HighTemperatureOrder.vue`

- [ ] Extend API snake/camel mappings for the new high-temperature-box fields and instruments.
- [ ] Replace the create dialog with grouped fields for application info, project info, instrument info, and test parameters.
- [ ] Use a specification select with `475`, `675`, `800`, `950`.
- [ ] Require applicant, application date, specification, instrument name, SN numbers, max temperature, hold time, and humidity.
- [ ] Show the new fields in list/detail views.
- [ ] Verify with `pnpm build:prod`.

### Task 3: Operator Client Display

**Files:**
- Modify: `D:/Users/Desktop/cosl-operator-tauri/src/services/high-temp-box-order-api.ts`
- Modify: `D:/Users/Desktop/cosl-operator-tauri/src/views/high-temp-box/composables/useHighTempBox.ts`
- Modify: `D:/Users/Desktop/cosl-operator-tauri/src/views/high-temp-box/components/HighTempBoxDashboard.vue`
- Modify: `D:/Users/Desktop/cosl-operator-tauri/src/views/high-temp-box/components/HighTempBoxTestFlow.vue`

- [ ] Extend DTO and mapped work-order types with the new fields.
- [ ] Keep pending order filtering by `status=1` and active instruments from `instruments`.
- [ ] Show new fields in pending-order details and report basic information.
- [ ] Keep selected instruments flowing through start/finish status calls.
- [ ] Verify with the operator frontend build command available in the repo.

### Task 4: Integration Checks

**Files:**
- Review all changed files.

- [ ] Confirm backend serializer output includes `instruments` and new order fields.
- [ ] Confirm admin create payload sends the new fields and instrument row.
- [ ] Confirm operator mapping displays multiple SN values from `sn_numbers`.
- [ ] Run `git diff --check` in each edited repo.
