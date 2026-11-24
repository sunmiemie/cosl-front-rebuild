import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { spawnSync } from "node:child_process"
import { beforeAll, describe, expect, it } from "vitest"
import ts from "typescript"

const root = resolve(__dirname, "..")
const page = readFileSync(resolve(root, "src/views/devicemanage/device/psi/index.vue"), "utf8")
const script = page.match(/<script[^>]*>([\s\S]*?)<\/script>/)![1]
const ast = ts.createSourceFile("host.ts", script, ts.ScriptTarget.Latest, true)
const names = new Set([
  "detailData",
  "usageDialogVisible",
  "maintenanceDialogVisible",
  "usageMode",
  "maintenanceMode",
  "editingUsageId",
  "editingMaintenanceId",
  "usageForm",
  "maintenanceForm",
  "currentHostId",
  "todayString",
  "resetUsageForm",
  "resetMaintenanceForm",
  "openUsageCreate",
  "openMaintenanceCreate",
  "openUsageEdit",
  "openMaintenanceEdit",
  "submitUsageRecord",
  "submitMaintenanceRecord"
])
const source = ast.statements
  .filter(
    (node) =>
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.some((declaration) => names.has(declaration.name.getText(ast)))
  )
  .map((node) => node.getText(ast))
  .join("\n")
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText

// 独立进程固定时区，执行原页面函数；不修改 Vitest 宿主的时区，也不请求真实接口。
const childScript = String.raw`
const { readFileSync } = require('node:fs');
const { ref, reactive } = require('vue');
const input = JSON.parse(readFileSync(0, 'utf8'));
const NativeDate = Date;
let instant;
class ClockDate extends NativeDate {
  constructor(...args) { super(...(args.length ? args : [instant])); }
  static now() { return new NativeDate(instant).getTime(); }
}
function createState() {
  const calls = [];
  const capture = (kind) => async (...args) => calls.push({ kind, args });
  const state = new Function('ref', 'reactive', 'Date', 'ElMessage',
    'createHostUsageRecordApi', 'createHostMaintenanceRecordApi',
    'updateHostUsageRecordApi', 'updateHostMaintenanceRecordApi', 'loadHostMaintenanceData',
    input.compiled + '\nreturn { detailData, usageForm, maintenanceForm, openUsageCreate, openMaintenanceCreate, openUsageEdit, openMaintenanceEdit, submitUsageRecord, submitMaintenanceRecord };'
  )(ref, reactive, ClockDate, { warning: (text) => { throw new Error(text); }, success: () => {} },
    capture('createUsage'), capture('createMaintenance'), capture('updateUsage'), capture('updateMaintenance'), async () => {});
  state.detailData.value = { id: 'offline-host' };
  return { state, calls };
}
async function submitBoth(state) {
  state.usageForm.duration_hours = 1;
  await state.submitUsageRecord();
  await state.submitMaintenanceRecord();
}
function dates(state) { return [state.usageForm.usage_date, state.maintenanceForm.maintenance_date]; }
(async () => {
  const created = [];
  for (const time of input.instants) {
    instant = time;
    const { state, calls } = createState();
    state.openUsageCreate();
    state.openMaintenanceCreate();
    const defaults = dates(state);
    await submitBoth(state);
    created.push({ defaults, calls, offset: new ClockDate().getTimezoneOffset() });
  }
  instant = input.instants[0];
  const edited = [];
  for (const field of ['primary', 'legacy', 'missing']) {
    const { state, calls } = createState();
    const explicit = '2026-10-09';
    const usage = { id: 11, duration_hours: 1 };
    const maintenance = { id: 12 };
    if (field === 'primary') { usage.usage_date = explicit; maintenance.maintenance_date = explicit; }
    if (field === 'legacy') { usage.date = explicit; maintenance.date = explicit; }
    state.openUsageEdit(usage);
    state.openMaintenanceEdit(maintenance);
    const defaults = dates(state);
    await submitBoth(state);
    edited.push({ defaults, calls });
  }
  const { state, calls } = createState();
  instant = input.midnight[0];
  state.openUsageCreate();
  state.openMaintenanceCreate();
  const before = dates(state);
  await submitBoth(state);
  instant = input.midnight[1];
  state.openUsageCreate();
  state.openMaintenanceCreate();
  const after = dates(state);
  await submitBoth(state);
  process.stdout.write(JSON.stringify({ created, edited, reopened: { before, after, calls } }));
})().catch(error => { console.error(error); process.exitCode = 1; });
`

type Call = { kind: string; args: Array<string | number | Record<string, unknown>> }
type RecordResult = { defaults: string[]; calls: Call[]; offset: number }
type Results = {
  created: RecordResult[]
  edited: RecordResult[]
  reopened: { before: string[]; after: string[]; calls: Call[] }
}

const zones = [
  {
    name: "东八区",
    tz: "Asia/Shanghai",
    offset: -480,
    instants: [
      "2026-11-24T07:30:00+08:00",
      "2026-12-01T00:30:00+08:00",
      "2027-01-01T00:30:00+08:00",
      "2026-11-24T12:00:00+08:00"
    ],
    expected: ["2026-11-24", "2026-12-01", "2027-01-01", "2026-11-24"],
    midnight: ["2026-11-24T23:59:00+08:00", "2026-11-25T00:01:00+08:00"]
  },
  {
    name: "西八区",
    tz: "America/Los_Angeles",
    offset: 480,
    instants: [
      "2026-11-24T20:30:00-08:00",
      "2026-11-30T20:30:00-08:00",
      "2026-12-31T20:30:00-08:00",
      "2026-11-24T12:00:00-08:00"
    ],
    expected: ["2026-11-24", "2026-11-30", "2026-12-31", "2026-11-24"],
    midnight: ["2026-11-24T23:59:00-08:00", "2026-11-25T00:01:00-08:00"]
  }
]

function expectSavedDates(calls: Call[], expected: string, mode: "create" | "update") {
  expect(calls.map((call) => call.kind)).toEqual([`${mode}Usage`, `${mode}Maintenance`])
  const payloadIndex = mode === "create" ? 0 : 1
  expect(calls[0].args[payloadIndex]).toMatchObject({ host_id: "offline-host", usage_date: expected })
  expect(calls[1].args[payloadIndex]).toMatchObject({ host_id: "offline-host", maintenance_date: expected })
  if (mode === "update") {
    expect(calls[0].args[0]).toBe(11)
    expect(calls[1].args[0]).toBe(12)
  }
}

for (const zone of zones) {
  describe(`${zone.name}主机使用和维保记录日期`, () => {
    let results: Results
    beforeAll(() => {
      const originalTimezone = process.env.TZ
      const child = spawnSync(process.execPath, ["-e", childScript], {
        cwd: root,
        env: { ...process.env, TZ: zone.tz },
        input: JSON.stringify({ compiled, instants: zone.instants, midnight: zone.midnight }),
        encoding: "utf8",
        timeout: 20_000
      })
      expect(child.error).toBeUndefined()
      expect(child.status, child.stderr).toBe(0)
      expect(process.env.TZ).toBe(originalTimezone)
      results = JSON.parse(child.stdout)
      expect(results.created.every((item) => item.offset === zone.offset)).toBe(true)
    }, 25_000)

    for (const [index, label] of ["普通日期", "跨月", "跨年", "当地与UTC同日对照"].entries()) {
      it(`${label}默认填写当地日期并按原值提交`, () => {
        expect(results.created[index].defaults).toEqual([zone.expected[index], zone.expected[index]])
        expectSavedDates(results.created[index].calls, zone.expected[index], "create")
      })
    }

    for (const [index, label] of ["记录专用日期字段", "历史 date 字段"].entries()) {
      it(`编辑时保留${label}且更新原记录`, () => {
        expect(results.edited[index].defaults).toEqual(["2026-10-09", "2026-10-09"])
        expectSavedDates(results.edited[index].calls, "2026-10-09", "update")
      })
    }

    it("编辑缺日期的记录时回退到当地当天", () => {
      expect(results.edited[2].defaults).toEqual([zone.expected[0], zone.expected[0]])
      expectSavedDates(results.edited[2].calls, zone.expected[0], "update")
    })

    it("跨午夜重新打开新增表单时重新取当天日期", () => {
      expect(results.reopened.before).toEqual(["2026-11-24", "2026-11-24"])
      expect(results.reopened.after).toEqual(["2026-11-25", "2026-11-25"])
      expectSavedDates(results.reopened.calls.slice(0, 2), "2026-11-24", "create")
      expectSavedDates(results.reopened.calls.slice(2), "2026-11-25", "create")
    })
  })
}
