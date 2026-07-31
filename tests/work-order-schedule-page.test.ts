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
    expect(content).toContain("HALT-HASS 工单")
    expect(content).toContain("电路板模块")
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
    expect(content).toContain(
      'const timeSlots = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`)'
    )
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
    expect(content).toContain("filteredOrdersByScheduleState")
    expect(content).toContain("normalizeScheduleListState")
  })

  it("接入 HALT-HASS 和电路板模块发布后的排程数据源", () => {
    expect(content).toContain("getHaltHassOrderList")
    expect(content).toContain("getCircuitModuleApplicationList")
    expect(content).toContain('key: "halt-hass"')
    expect(content).toContain('key: "circuit-board-module"')
    expect(content).toContain("normalizeHaltHassOrders")
    expect(content).toContain("normalizeCircuitBoardModuleOrders")
    expect(content).toContain("syncCircuitBoardModuleSchedule")
    expect(content).toContain("isCircuitModuleScheduleStatus")
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
    expect(content).toContain("syncCalendarToSchedule(parseDateTime(payload.scheduled_start_at) || new Date())")
    expect(content).toMatch(/weekStart\.value\s*=\s*getWeekStart\(date\)/)
    expect(content).toMatch(/pickedDate\.value\s*=\s*formatDate\(date\)/)
  })

  it("按仪器运行状态优先显示测试中，避免已测试工单仍显示已排程", () => {
    expect(content).toContain("isRunningTarget")
    expect(content).toContain("hasRunningScheduleInstrument")
    expect(content).toContain("isRunningTarget: hasRunningScheduleInstrument(item.instruments)")
    expect(content).toContain("isRunningTarget: hasRunningScheduleInstrument([instrument])")
  })

  it("高温高压井排程过滤使用工单发布状态，避免把仪器待排程 0 当成未发布", () => {
    expect(content).toContain("status: order.status")
    expect(content).not.toContain("status: instrument?.instrument_status ?? order.status")
  })

  it("高温高压井工单标题追加设备明细以区分同一工单下的多个排程对象", () => {
    expect(content).toContain("function formatHighTempPressureOrderTitle")
    expect(content).toContain('const testName = getString(order.project_name, order.test_type) || "高温高压井工单"')
    expect(content).toContain(
      "const instrumentName = getString(instrument?.instrument_name, instrument?.instrument_sn)"
    )
    expect(content).toContain("return instrumentName ? `${testName}-${instrumentName}` : testName")
    expect(content).toContain("title: formatHighTempPressureOrderTitle(order, instrument)")
  })

  it("排程弹窗支持一个工单维护多个时间段", () => {
    expect(content).toContain("排程时间段")
    expect(content).toContain("scheduleForm.segments")
    expect(content).toContain("addScheduleSegment")
    expect(content).toContain("removeScheduleSegment")
    expect(content).toContain("getExistingScheduleFormSegments")
    expect(content).toContain("validateScheduleSegments")
    expect(content).toContain("添加时间段")
    expect(content).not.toContain("scheduleForm.durationHours")
    expect(content).not.toContain("addHours(start, scheduleForm.durationHours)")
  })

  it("保存排程时所有设备类型都提交 schedule_segments 多段数据", () => {
    expect(content).toContain("buildSchedulePayload")
    expect(content).toContain("payload.schedule_segments")
    expect(content).toContain("payload.schedule_segments.map")
    expect(content).toContain("saveWorkOrderSchedule(order.scheduleEquipment")
    expect(content).not.toContain('["water-cycle", "vibration-table", "high-temp-pressure", "halt-hass"].includes')
  })

  it("高温箱和模拟井读取后端 schedule_segments 以显示多个日历方块", () => {
    expect(content).toContain("normalizeSnakeSegments(item.schedule_segments")
    expect(content).toContain("normalizeSnakeSegments(device?.schedule_segments")
    expect(content).not.toContain("scheduleSegments: []")
  })

  it("schedule segment controls stay inside the dialog", () => {
    expect(content).toMatch(/\.schedule-segment-row\s*{[^}]*min-width:\s*0/s)
    expect(content).toMatch(
      /\.schedule-segment-row\s*{[\s\S]*:deep\(\.el-date-editor\.el-input\)\s*{[^}]*width:\s*100%/s
    )
    expect(content).toMatch(
      /\.schedule-segment-row\s*{[\s\S]*:deep\(\.el-date-editor\.el-input\)\s*{[^}]*min-width:\s*0/s
    )
    expect(content).toMatch(
      /@media \(max-width:\s*900px\)[\s\S]*\.schedule-segment-row\s*{[^}]*grid-template-columns:\s*1fr 1fr/s
    )
  })

  it("支持从待处理任务中心按 tab 和 keyword 跳转到对应未排期工单", () => {
    expect(content).toContain("useRoute")
    expect(content).toContain("function applyRouteQuery")
    expect(content).toContain("route.query")
    expect(content).toContain("query.tab")
    expect(content).toContain("searchForm.keyword = keyword")
  })

  it("电路板模块左侧只读展示自动排程结果，右侧排序不重复推送", () => {
    expect(content).toContain('panelTitle: "已排程工单"')
    expect(content).toContain('panelSubtitle: "整单发布后自动进入排期顺序"')
    expect(content).toContain("filteredCircuitBoardScheduledOrders")
    expect(content).toContain("order.sequenceOrder > 0")
    expect(content).not.toContain("加入排期")
    expect(content).not.toContain("移除排期顺序")
    expect(content).toContain("if (isCircuitBoardModule.value) return false")
    expect(content).toContain("await persistCircuitBoardPriorityOrders(nextOrders)")
    expect(content).toContain("saveCircuitBoardSequenceBatch")
    expect(content).toContain("order_ids: orderIds")
    expect(content).not.toContain("for (const [index, order] of nextOrders.entries())")
    expect(content).not.toContain("skip_assistant_push: !shouldPushAssistant")
  })

  it("主机名称只在详情中展示，不在外层卡片和悬浮提示中展示", () => {
    expect(content).not.toContain('<el-tag size="small" effect="plain">{{ order.targetName }}</el-tag>')
    expect(content).not.toContain("<span>{{ order.targetName }}</span>")
    expect(content).not.toContain('<el-tag v-if="order.hostDeviceName"')
    expect(content).not.toContain('<span v-if="order.hostDeviceName">{{ order.hostDeviceName }}</span>')
    expect(content).not.toContain('<strong>{{ event.hostDeviceName || "-" }}</strong>')
    expect(content).toContain(
      '<el-descriptions-item label="主机设备">{{ detailHostDeviceName }}</el-descriptions-item>'
    )
    expect(content).toContain('<el-descriptions-item label="设备/对象">{{ detailTargetName }}</el-descriptions-item>')
    expect(content).toContain("function getOrderScheduleDeviceNames")
  })

  it("未排程工单详情不把默认设备名称显示为设备对象", () => {
    expect(content).toContain(
      'return detailScheduleDeviceNames.value.length ? detailScheduleDeviceNames.value.join("、") : "-"'
    )
    expect(content).not.toContain('detailOrder.value.targetName || "-"')
    expect(content).not.toContain('detailOrder.value.hostDeviceName || "-"')
    expect(content).toContain("const name = getSegmentScheduleDevice(order, segment)")
  })

  it("device tabs assign schedule device without narrowing the order panel", () => {
    expect(content).toMatch(/const deviceScopedOrders = computed\(\(\) => stateOrders\.value\)/)
    expect(content).toMatch(
      /const filteredOrders = computed\(\(\) => \{[\s\S]*if \(!keyword\) return deviceScopedOrders\.value/
    )
    expect(content).toContain('activeDeviceTab.value = ""')
    expect(content).toContain('const equipmentId = activeDeviceTab.value || secondaryDeviceTabs.value[0]?.key || ""')
    expect(content).toContain("const useDevice = targetDevice.label")
    expect(content).toContain("equipment_id: equipmentId")
    expect(content).toMatch(/const events = activeOrders\.value\.flatMap<BaseCalendarEvent>/)
    expect(content).toContain("isScheduleSegmentVisibleInActiveDevice(order, segment)")
  })
})
