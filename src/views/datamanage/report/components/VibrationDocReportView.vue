<template>
  <div class="vibration-doc-report">
    <el-empty v-if="!hasReport" description="暂无振动台 doc 报告内容" :image-size="72" />
    <template v-else>
      <div class="doc-head">
        <h3>{{ displayValue(paperReport.title) }}</h3>
        <div class="doc-subtitle">Vibration Test Report</div>
      </div>

      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="Specimen">{{ displayValue(paperReport.specimen) }}</el-descriptions-item>
        <el-descriptions-item label="Operator">{{ displayValue(paperReport.operator) }}</el-descriptions-item>
        <el-descriptions-item label="Date of Test Start">{{
          displayValue(paperReport.date_of_test_start)
        }}</el-descriptions-item>
        <el-descriptions-item label="Date of Test End">{{
          displayValue(paperReport.date_of_test_end)
        }}</el-descriptions-item>
        <el-descriptions-item label="State of Test completed" :span="2">{{
          displayValue(paperReport.state_of_test_completed)
        }}</el-descriptions-item>
        <el-descriptions-item label="Comment" :span="2">{{ displayValue(paperReport.comment) }}</el-descriptions-item>
      </el-descriptions>

      <section class="doc-section">
        <h4>Test Condition</h4>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="加速度">{{ displayValue(testCondition.acceleration) }}</el-descriptions-item>
          <el-descriptions-item label="速度">{{ displayValue(testCondition.velocity) }}</el-descriptions-item>
          <el-descriptions-item label="位移">{{ displayValue(testCondition.displacement) }}</el-descriptions-item>
          <el-descriptions-item label="扩张容差" :span="3">{{
            displayValue(testCondition.expansion_tolerance)
          }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="psdPoints" border size="small" class="doc-table">
          <el-table-column prop="no" label="No." width="70" align="center" />
          <el-table-column prop="frequency" label="Frequency" min-width="150" />
          <el-table-column
            prop="acceleration_spectral_density"
            label="Acceleration Spectral Density"
            min-width="220"
          />
        </el-table>
        <el-descriptions :column="3" border size="small" class="doc-table">
          <el-descriptions-item label="中断上限(dB)">{{ displayValue(tolerance.abort_upper_db) }}</el-descriptions-item>
          <el-descriptions-item label="中断下限(dB)">{{ displayValue(tolerance.abort_lower_db) }}</el-descriptions-item>
          <el-descriptions-item label="中断允许宽度(Hz)">{{
            displayValue(tolerance.abort_allowed_width_hz)
          }}</el-descriptions-item>
          <el-descriptions-item label="警告上限(dB)">{{ displayValue(tolerance.warning_upper_db) }}</el-descriptions-item>
          <el-descriptions-item label="警告下限(dB)">{{ displayValue(tolerance.warning_lower_db) }}</el-descriptions-item>
          <el-descriptions-item label="警告允许宽度(Hz)">{{
            displayValue(tolerance.warning_allowed_width_hz)
          }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="doc-section">
        <h4>Input Condition</h4>
        <el-table :data="inputCondition" border size="small" class="doc-table">
          <el-table-column prop="position" label="位置" min-width="110" />
          <el-table-column prop="channel" label="通道" min-width="100" />
          <el-table-column prop="input_type" label="输入类型" min-width="170" />
          <el-table-column prop="sensitivity" label="输入灵敏度" min-width="130" />
          <el-table-column prop="polarity" label="极性" width="80" align="center" />
          <el-table-column prop="category" label="通道类别" min-width="100" />
          <el-table-column prop="average" label="平均化参数" min-width="170" />
        </el-table>
      </section>

      <section class="doc-section">
        <h4>Control Condition</h4>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="控制对象">{{ displayValue(controlCondition.control_target) }}</el-descriptions-item>
          <el-descriptions-item label="频率范围">{{ displayValue(controlCondition.frequency_range) }}</el-descriptions-item>
          <el-descriptions-item label="分析谱线">{{ displayValue(controlCondition.analysis_lines) }}</el-descriptions-item>
          <el-descriptions-item label="Δf">{{ displayValue(controlCondition.delta_f) }}</el-descriptions-item>
          <el-descriptions-item label="帧时间">{{ displayValue(controlCondition.frame_time) }}</el-descriptions-item>
          <el-descriptions-item label="试验时间">{{ displayValue(controlCondition.test_time) }}</el-descriptions-item>
          <el-descriptions-item label="初始输出量级">{{
            displayValue(controlCondition.initial_output_level)
          }}</el-descriptions-item>
          <el-descriptions-item label="量级增减值">{{ displayValue(controlCondition.level_step) }}</el-descriptions-item>
          <el-descriptions-item label="自动开始">{{ displayValue(controlCondition.auto_start) }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="doc-section">
        <h4>Graph of Test Result</h4>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="视频文件">{{ displayValue(graphResult.source_video_name) }}</el-descriptions-item>
          <el-descriptions-item label="图像路径">{{ displayValue(graphResult.image_path || imageAttachmentPath) }}</el-descriptions-item>
        </el-descriptions>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

type Dict = Record<string, any>

const props = defineProps<{
  reportJson?: Record<string, unknown>
  attachments?: Array<Record<string, unknown>>
}>()

const paperReport = computed<Dict>(() => {
  const json = (props.reportJson || {}) as Dict
  return (json.vibration_doc_report || json.paper_report || {}) as Dict
})
const hasReport = computed(() => Object.keys(paperReport.value).length > 0)
const testCondition = computed<Dict>(() => paperReport.value.test_condition || {})
const tolerance = computed<Dict>(() => testCondition.value.tolerance || {})
const psdPoints = computed<Dict[]>(() => (Array.isArray(testCondition.value.psd_points) ? testCondition.value.psd_points : []))
const inputCondition = computed<Dict[]>(() =>
  Array.isArray(paperReport.value.input_condition) ? paperReport.value.input_condition : []
)
const controlCondition = computed<Dict>(() => paperReport.value.control_condition || {})
const graphResult = computed<Dict>(() => paperReport.value.graph_of_test_result || {})
const imageAttachmentPath = computed(() => {
  const item = (props.attachments || []).find((attachment) => String(attachment.type || "") === "image")
  return String(item?.file_url || item?.local_path || "")
})

const displayValue = (value: unknown) => {
  const text = String(value ?? "").trim()
  return text || "-"
}
</script>

<style lang="scss" scoped>
.vibration-doc-report {
  border: 1px solid #dce6ee;
  border-radius: 8px;
  padding: 18px;
  background: #ffffff;
}
.doc-head {
  text-align: center;
  margin-bottom: 18px;
}
.doc-head h3 {
  margin: 0;
  color: #1f2d3d;
  font-size: 20px;
  font-weight: 700;
}
.doc-subtitle {
  margin-top: 4px;
  color: #6b7785;
  font-size: 13px;
}
.doc-section {
  margin-top: 18px;
}
.doc-section h4 {
  margin: 0 0 10px;
  color: #24323a;
  font-size: 15px;
}
.doc-table {
  margin-top: 10px;
}
</style>
