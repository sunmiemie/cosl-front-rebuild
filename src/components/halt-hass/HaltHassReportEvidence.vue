<script setup lang="ts">
import { computed } from "vue"
import type { HaltHassReportJson } from "@/api/halt-hass/types"

const props = defineProps<{ reportJson?: HaltHassReportJson | null }>()

const records = computed(() => props.reportJson?.periodicRecords || [])
const images = computed(() => props.reportJson?.chartImages || [])
const boards = computed(() => props.reportJson?.boards || [])
const isRectifierReport = computed(() => props.reportJson?.reportType === "rectifier_regulator")
const rectifierReport = computed(() => props.reportJson?.rectifierReport)
const rectifierRows = computed(() => (rectifierReport.value?.stages || []).flatMap(stage =>
  stage.voltageSteps.flatMap(step => ([
    {
      key: `${stage.stageIdentity}-${step.inputVoltage}-half`,
      stageIndex: stage.stageIndex,
      targetTemperature: stage.targetTemperature,
      actualTemperature: stage.actualTemperature,
      inputVoltage: step.inputVoltage,
      loadType: "半载",
      ...step.halfLoad
    },
    {
      key: `${stage.stageIdentity}-${step.inputVoltage}-full`,
      stageIndex: stage.stageIndex,
      targetTemperature: stage.targetTemperature,
      actualTemperature: stage.actualTemperature,
      inputVoltage: step.inputVoltage,
      loadType: "满载",
      ...step.fullLoad
    }
  ]))
))
const boardConclusions = computed(() => rectifierReport.value?.boardConclusions || [])
const previewImages = computed(() => images.value.map(image => resolveFileUrl(image.fileUrl)))

function formatCurrent(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-"
  const milliamps = props.reportJson?.currentUnit === "mA" ? Number(value) : Number(value) * 1000
  return Number(milliamps.toFixed(6))
}

function resolveFileUrl(value?: string) {
  if (!value) return ""
  if (/^(https?:|data:|blob:)/i.test(value)) return value
  const configuredBase = String(import.meta.env.VITE_BASE_API || "").trim()
  const mediaPath = `/${value.replace(/^\/+/, "")}`
  if (/^https?:/i.test(configuredBase)) {
    return new URL(mediaPath, configuredBase).toString()
  }
  return new URL(mediaPath, window.location.origin).toString()
}

function formatElapsed(seconds: number) {
  const safe = Math.max(0, Math.round(seconds || 0))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const rest = safe % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

function formatNumber(value?: number | null, digits = 3) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-"
  return Number(Number(value).toFixed(digits))
}

function isReportSubject(serial?: string) {
  return Boolean(serial && serial === props.reportJson?.reportSubject?.targetSerial)
}
</script>

<template>
  <div class="report-evidence">
    <section>
      <div class="section-title"><span>本次扫码板卡</span><small>共 {{ boards.length }} 块；仅目标板生成独立审核报告</small></div>
      <el-table :data="boards" size="small" border max-height="260" row-key="serial">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="slotNo" label="板位" width="70" align="center"><template #default="{ row }">{{ row.slotNo ?? "-" }}</template></el-table-column>
        <el-table-column prop="serial" label="SN" min-width="170"><template #default="{ row }"><span class="serial-cell">{{ row.serial }}<el-tag v-if="isReportSubject(row.serial)" size="small" type="warning">当前审核SN</el-tag></span></template></el-table-column>
        <el-table-column prop="boardModelName" label="型号" min-width="130"><template #default="{ row }">{{ row.boardModelName || "-" }}</template></el-table-column>
        <el-table-column label="测试角色" width="130" align="center"><template #default="{ row }"><el-tag :type="row.role === 'target' ? 'primary' : 'info'">{{ row.role === "target" ? "目标板" : "陪测/非目标板" }}</el-tag></template></el-table-column>
      </el-table>
    </section>

    <section v-if="isRectifierReport">
      <div class="section-title"><span>整流稳压采点记录</span><small>按 MQTT 温度阶段及工艺输入电压顺序记录；电流单位 A</small></div>
      <el-table :data="rectifierRows" size="small" border max-height="430" row-key="key">
        <el-table-column prop="stageIndex" label="阶段" width="64" align="center" />
        <el-table-column label="目标/实际温度（℃）" width="145" align="center"><template #default="{ row }">{{ formatNumber(row.targetTemperature, 1) }} / {{ formatNumber(row.actualTemperature, 1) }}</template></el-table-column>
        <el-table-column prop="inputVoltage" label="输入电压（V）" width="110" align="center" />
        <el-table-column prop="loadType" label="负载阶段" width="84" align="center" />
        <el-table-column label="48V负载（Ω）" width="105" align="center"><template #default="{ row }">{{ formatNumber(row.load48Ohm, 2) }}</template></el-table-column>
        <el-table-column label="48V实测（V / A）" min-width="150" align="center"><template #default="{ row }">{{ formatNumber(row.output48Voltage) }} / {{ formatNumber(row.output48CurrentA) }}</template></el-table-column>
        <el-table-column label="48V结论" width="96" align="center"><template #default="{ row }"><el-tag :type="row.output48Result?.result === '合格' ? 'success' : 'danger'">{{ row.output48Result?.result || "-" }}</el-tag></template></el-table-column>
        <el-table-column label="90V负载（Ω）" width="105" align="center"><template #default="{ row }">{{ formatNumber(row.load90Ohm, 2) }}</template></el-table-column>
        <el-table-column label="90V实测（V / A）" min-width="150" align="center"><template #default="{ row }">{{ formatNumber(row.output90Voltage) }} / {{ formatNumber(row.output90CurrentA) }}</template></el-table-column>
        <el-table-column label="90V结论" width="96" align="center"><template #default="{ row }"><el-tag :type="row.output90Result?.result === '合格' ? 'success' : 'danger'">{{ row.output90Result?.result || "-" }}</el-tag></template></el-table-column>
        <el-table-column label="采集说明" min-width="180"><template #default="{ row }">{{ row.missingReasons?.join("；") || "-" }}</template></el-table-column>
      </el-table>
      <el-empty v-if="!rectifierRows.length" description="暂无整流稳压采点记录" :image-size="64" />
    </section>

    <section v-if="isRectifierReport">
      <div class="section-title"><span>逐板结论</span><small>程序原判只读；测试人员确认结论随报告提交</small></div>
      <el-table :data="boardConclusions" size="small" border max-height="280" row-key="serial">
        <el-table-column prop="slotNo" label="板位" width="70" align="center" />
        <el-table-column prop="serial" label="SN" min-width="170"><template #default="{ row }"><span class="serial-cell">{{ row.serial }}<el-tag v-if="isReportSubject(row.serial)" size="small" type="warning">当前审核SN</el-tag></span></template></el-table-column>
        <el-table-column prop="boardModelName" label="型号" min-width="150" />
        <el-table-column label="角色" width="100" align="center"><template #default="{ row }">{{ row.role === "target" ? "目标板" : "陪测板" }}</template></el-table-column>
        <el-table-column prop="originalResult" label="程序原判" width="110" align="center" />
        <el-table-column label="测试人员结论" width="130" align="center"><template #default="{ row }"><el-tag :type="row.result === '合格' ? 'success' : 'danger'">{{ row.result }}</el-tag></template></el-table-column>
      </el-table>
    </section>

    <section v-else>
      <div class="section-title"><span>三分钟测试记录</span><small>末值由程序生成，结束不足三分钟时补录一条</small></div>
      <el-table :data="records" size="small" border max-height="340">
        <el-table-column prop="intervalIndex" label="序号" width="60" align="center" />
        <el-table-column label="运行时间" width="125"><template #default="{ row }">{{ formatElapsed(row.elapsedSeconds) }}{{ row.isPartialInterval ? "（补录）" : "" }}</template></el-table-column>
        <el-table-column prop="temperature" label="温度" width="90"><template #default="{ row }">{{ row.temperature ?? "-" }}</template></el-table-column>
        <el-table-column prop="vibration" label="振动" width="90"><template #default="{ row }">{{ row.vibration ?? "-" }}</template></el-table-column>
        <el-table-column prop="current48v" label="48V电流（mA）" width="125"><template #default="{ row }">{{ formatCurrent(row.current48v) }}</template></el-table-column>
        <el-table-column prop="current90v" label="90V电流（mA）" width="125"><template #default="{ row }">{{ formatCurrent(row.current90v) }}</template></el-table-column>
        <el-table-column prop="communications.interfaceBoard" label="接口板" width="85" />
        <el-table-column prop="communications.controlBoard" label="控制板" width="85" />
        <el-table-column prop="communications.storageBoard" label="存储板" width="85" />
        <el-table-column prop="pulserSummary" label="脉冲器" width="85" />
        <el-table-column label="采集说明" min-width="180"><template #default="{ row }">{{ row.missingReasons?.join("；") || "-" }}</template></el-table-column>
      </el-table>
      <el-empty v-if="!records.length" description="暂无三分钟记录" :image-size="64" />
    </section>

    <section>
      <div class="section-title"><span>曲线图片</span><small>由客户端按完整测试时段生成并随报告上传</small></div>
      <div v-if="images.length" class="chart-image-grid">
        <figure v-for="(image, index) in images" :key="image.chartType" class="chart-image-card">
          <el-image :src="resolveFileUrl(image.fileUrl)" :alt="image.title" :preview-src-list="previewImages" :initial-index="index" fit="contain" lazy />
          <figcaption><strong>{{ image.title }}</strong><span>{{ image.startAt }} 至 {{ image.endAt }}</span></figcaption>
        </figure>
      </div>
      <el-empty v-else description="暂无曲线图片" :image-size="64" />
    </section>
  </div>
</template>

<style scoped>
.report-evidence{display:grid;gap:22px}.section-title{display:flex;align-items:baseline;gap:12px;margin-bottom:10px;font-size:15px;font-weight:600;color:#303133}.section-title small{font-size:12px;font-weight:400;color:#909399}.serial-cell{display:flex;align-items:center;gap:8px}.chart-image-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.chart-image-card{margin:0;padding:10px;border:1px solid #e4e7ed;border-radius:8px;background:#fafafa}.chart-image-card :deep(.el-image){width:100%;height:260px;background:#fff}.chart-image-card figcaption{display:flex;justify-content:space-between;gap:12px;margin-top:8px;color:#606266;font-size:12px}.chart-image-card figcaption span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(max-width:1100px){.chart-image-grid{grid-template-columns:1fr}}
</style>
