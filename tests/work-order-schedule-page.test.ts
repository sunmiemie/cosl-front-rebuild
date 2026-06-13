import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("工单排程页面", () => {
  const content = read("src/views/dashboard/work-order-schedule/index.vue")

  it("设备类型使用系统标准横向标签页", () => {
    expect(content).toContain("el-tabs")
    expect(content).toContain("高温高压井工单")
    expect(content).toContain("振动台工单")
    expect(content).toContain("水循环工单")
    expect(content).toContain("模拟井工单")
    expect(content).toContain("高温箱工单")
  })

  it("不显示排程页大标题并沿用电路模块检验的朴素标签页样式", () => {
    expect(content).not.toContain("schedule-header__eyebrow")
    expect(content).not.toContain("<h1>工单排程</h1>")
    expect(content).not.toContain("schedule-equipment-tabs")
    expect(content).toContain('<el-tabs v-model="activeEquipment" @tab-change="handleEquipmentChange">')
  })

  it("设备选项卡固定显示在排程内容上方", () => {
    expect(content).toMatch(/:deep\(\.el-tabs__header\)\s*{[^}]*order:\s*0/s)
    expect(content).toMatch(/:deep\(\.el-tabs__content\)\s*{[^}]*order:\s*1/s)
  })

  it("周切换工具栏横向平铺显示", () => {
    expect(content).toMatch(/\.week-switcher\s*{[^}]*display:\s*grid/s)
    expect(content).toContain("grid-template-columns: 116px minmax(220px, 300px) minmax(180px, 1fr) 116px")
    expect(content).toMatch(/\.week-label\s*{[^}]*justify-self:\s*center/s)
  })

  it("日历固定展示 06:00 到 22:00 的工作时段", () => {
    expect(content).toContain('const timeSlots = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`)')
    expect(content).toContain("const timeCells = Array.from({ length: 16 }, (_, index) => index)")
    expect(content).toContain("const calendarStartMinutes = 6 * 60")
    expect(content).toContain("const calendarEndMinutes = 22 * 60")
  })

  it("页面固定在当前视口内并让工单列表内部滚动", () => {
    expect(content).toContain("height: calc(100vh - 84px)")
    expect(content).toContain("overflow: hidden")
    expect(content).toContain(".order-scrollbar")
    expect(content).toContain("flex: 1")
  })

  it("不显示顶部状态统计或状态选项卡", () => {
    expect(content).not.toContain("summary-grid")
    expect(content).not.toContain("待排程</el-tab-pane>")
    expect(content).not.toContain("已排程</el-tab-pane>")
    expect(content).not.toContain("进行中</el-tab-pane>")
  })

  it("排程保存走统一 API 并显示同库同步说明", () => {
    expect(content).toContain("saveWorkOrderSchedule")
    expect(content).toContain("clearWorkOrderSchedule")
    expect(content).toContain("与测试端日历使用同一后端排程数据")
  })

  it("排程列表只请求并保留待领取状态工单", () => {
    expect(content).toContain("const PENDING_CLAIM_STATUS = 1")
    expect(content).toContain("status: PENDING_CLAIM_STATUS")
    expect(content).toContain("filterPendingClaimOrders")
    expect(content).toContain("Number(rawOrder?.status ?? order.status) === PENDING_CLAIM_STATUS")
  })

  it("静默轮询后端排程数据，让测试端删除排程后管理端自动刷新", () => {
    expect(content).toContain("onUnmounted")
    expect(content).toContain("const SCHEDULE_AUTO_REFRESH_MS = 5000")
    expect(content).toContain("function startScheduleAutoRefresh")
    expect(content).toContain("function stopScheduleAutoRefresh")
    expect(content).toContain("window.setInterval")
    expect(content).toContain("loadOrders({ silent: true })")
    expect(content).toContain("stopScheduleAutoRefresh()")
  })

  it("保存排程后切换到排程所在周，保证日历方块立即显示", () => {
    expect(content).toContain("function syncCalendarToSchedule")
    expect(content).toContain("syncCalendarToSchedule(start)")
    expect(content).toMatch(/weekStart\.value\s*=\s*getWeekStart\(date\)/)
    expect(content).toMatch(/pickedDate\.value\s*=\s*formatDate\(date\)/)
  })

  it("按仪器运行状态优先显示测试中，避免已测试工单仍显示已排程", () => {
    expect(content).toContain("isRunningTarget")
    expect(content).toContain("hasRunningScheduleInstrument")
    expect(content).toContain("isRunningTarget: hasRunningScheduleInstrument(item.instruments)")
    expect(content).toContain("isRunningTarget: hasRunningScheduleInstrument([instrument])")
  })
})
