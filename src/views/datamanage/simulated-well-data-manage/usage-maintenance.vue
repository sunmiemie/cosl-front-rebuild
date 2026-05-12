<template>
  <div class="simwell-page">
    <div class="header">
      <h1 class="header-title">使用与维保</h1>
      <div class="header-actions">
        <el-button @click="handleExport('all')">导出数据</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="使用记录" name="usage">
          <div class="panel-section">
            <div class="filter-card">
              <div class="filter-title">筛选条件</div>
              <el-form :inline="true" :model="usageFilters" class="filter-form">
                <el-form-item label="仪器型号">
                  <el-input v-model="usageFilters.model" placeholder="请输入型号" clearable />
                </el-form-item>
                <el-form-item label="SN号">
                  <el-input v-model="usageFilters.sn" placeholder="请输入SN号" clearable />
                </el-form-item>
                <el-form-item label="作业ID">
                  <el-input v-model="usageFilters.jobId" placeholder="请输入作业ID" clearable />
                </el-form-item>
                <el-form-item label="使用日期">
                  <el-date-picker
                    v-model="usageFilters.date"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择使用日期"
                    clearable
                  />
                </el-form-item>
              </el-form>
              <div class="filter-actions">
                <el-button type="primary">查询</el-button>
                <el-button @click="resetUsageFilters">重置</el-button>
                <el-button @click="handleExport('usage')">导出数据</el-button>
              </div>
            </div>

            <div class="section-header">
              <h2 class="section-heading">使用记录列表</h2>
            </div>
          </div>

          <el-table :data="filteredUsageData" stripe border style="width: 100%" :header-cell-style="headerCellStyle">
            <el-table-column prop="id" label="记录ID" width="100" />
            <el-table-column prop="model" label="仪器型号" min-width="160" />
            <el-table-column prop="sn" label="SN号" min-width="160" />
            <el-table-column prop="jobId" label="作业ID" min-width="120" />
            <el-table-column prop="date" label="使用日期" min-width="120" />
            <el-table-column prop="temperature" label="下井温度(℃)" min-width="120" align="center" />
            <el-table-column prop="duration" label="使用时长(h)" min-width="120" align="center" />
            <el-table-column prop="status" label="使用状态" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'warning'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default>
                <el-link type="primary">查看</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="维保周期配置" name="cycle">
          <div class="panel-section">
            <div class="note-card">
              <div class="note-title">周期计算说明</div>
              <ul class="note-list">
                <li>高温下井 1 次 = 非高温下井 5 次（默认换算系数）</li>
                <li>维保周期按型号统一配置</li>
                <li>可根据实际情况调整高温换算系数</li>
                <li>达到维保周期后需及时安排维护保养</li>
              </ul>
            </div>

            <div class="section-header">
              <h2 class="section-heading">维保周期配置</h2>
            </div>
          </div>

          <el-table :data="cycleData" stripe border style="width: 100%" :header-cell-style="headerCellStyle">
            <el-table-column prop="id" label="配置ID" width="100" />
            <el-table-column prop="model" label="仪器型号" min-width="180" />
            <el-table-column prop="normal" label="非高温维保周期(次)" min-width="180" align="center" />
            <el-table-column prop="high" label="高温维保周期(次)" min-width="160" align="center" />
            <el-table-column prop="coef" label="高温换算系数" min-width="140" align="center" />
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template #default>
                <el-link type="warning" class="el-link">编辑</el-link>
                <el-link type="danger">删除</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="维保记录" name="record">
          <div class="panel-section">
            <div class="filter-card">
              <div class="filter-title">筛选条件</div>
              <el-form :inline="true" :model="maintenanceFilters" class="filter-form">
                <el-form-item label="仪器型号">
                  <el-input v-model="maintenanceFilters.model" placeholder="请输入型号" clearable />
                </el-form-item>
                <el-form-item label="SN号">
                  <el-input v-model="maintenanceFilters.sn" placeholder="请输入SN号" clearable />
                </el-form-item>
                <el-form-item label="维保类型">
                  <el-select v-model="maintenanceFilters.type" placeholder="全部" clearable>
                    <el-option label="常规维保" value="常规维保" />
                    <el-option label="大修" value="大修" />
                  </el-select>
                </el-form-item>
                <el-form-item label="维保日期">
                  <el-date-picker
                    v-model="maintenanceFilters.date"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择维保日期"
                    clearable
                  />
                </el-form-item>
              </el-form>
              <div class="filter-actions">
                <el-button type="primary">查询</el-button>
                <el-button @click="resetMaintenanceFilters">重置</el-button>
                <el-button @click="handleExport('maintenance')">导出数据</el-button>
              </div>
            </div>

            <div class="section-header">
              <h2 class="section-heading">维保记录列表</h2>
              <el-button type="success" plain>新增维保记录</el-button>
            </div>
          </div>

          <el-table :data="filteredMaintainData" stripe border style="width: 100%" :header-cell-style="headerCellStyle">
            <el-table-column prop="id" label="记录ID" width="100" />
            <el-table-column prop="model" label="仪器型号" min-width="160" />
            <el-table-column prop="sn" label="SN号" min-width="160" />
            <el-table-column prop="date" label="维保日期" min-width="140" />
            <el-table-column prop="type" label="维保类型" min-width="120" />
            <el-table-column prop="person" label="维保人员" min-width="120" />
            <el-table-column prop="result" label="维保结果" min-width="120" align="center" />
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default>
                <el-link type="primary">查看</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="维保提醒" name="alert">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ alertStats.normal }}</div>
              <div class="stat-label">正常仪器</div>
            </div>
            <div class="stat-card">
              <div class="stat-value warning">{{ alertStats.warning }}</div>
              <div class="stat-label">即将到期</div>
            </div>
            <div class="stat-card">
              <div class="stat-value danger">{{ alertStats.danger }}</div>
              <div class="stat-label">已到期</div>
            </div>
            <div class="stat-card">
              <div class="stat-value primary">{{ `${alertThreshold}次` }}</div>
              <div class="stat-label">提醒阈值</div>
            </div>
          </div>

          <div class="panel-section">
            <div class="filter-card">
              <div class="filter-title">筛选条件</div>
              <el-form :inline="true" :model="alertFilters" class="filter-form">
                <el-form-item label="仪器型号">
                  <el-input v-model="alertFilters.model" placeholder="请输入型号" clearable />
                </el-form-item>
                <el-form-item label="SN号">
                  <el-input v-model="alertFilters.sn" placeholder="请输入SN号" clearable />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="alertFilters.status" placeholder="全部" clearable>
                    <el-option label="正常" value="正常" />
                    <el-option label="即将到期" value="即将到期" />
                    <el-option label="已到期" value="已到期" />
                  </el-select>
                </el-form-item>
              </el-form>
              <div class="filter-actions">
                <el-button type="primary">查询</el-button>
                <el-button @click="resetAlertFilters">重置</el-button>
                <el-button type="success" @click="thresholdDialogVisible = true">设置阈值</el-button>
              </div>
            </div>

            <div class="section-header">
              <h2 class="section-heading">维保提醒列表</h2>
            </div>
          </div>

          <el-table :data="filteredAlertData" stripe border style="width: 100%" :header-cell-style="headerCellStyle">
            <el-table-column prop="model" label="仪器型号" min-width="180" />
            <el-table-column prop="sn" label="SN号" min-width="180" />
            <el-table-column prop="used" label="已使用(次)" min-width="120" align="center" />
            <el-table-column prop="cycle" label="维保周期(次)" min-width="130" align="center" />
            <el-table-column prop="remain" label="剩余次数" min-width="120" align="center" />
            <el-table-column prop="status" label="状态" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : row.status === '即将到期' ? 'warning' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default>
                <el-link type="primary">查看</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="thresholdDialogVisible" title="维保提醒阈值设置" width="420px">
      <el-form label-position="top">
        <el-form-item label="提醒阈值(剩余次数)">
          <el-input-number v-model="thresholdForm.value" :min="1" style="width: 100%" />
          <div class="field-tip">当剩余可用次数低于此值时，系统显示“即将到期”提醒。</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="thresholdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveThreshold">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { ElMessage } from "element-plus"

const activeTab = ref("usage")
const headerCellStyle = () => ({ whiteSpace: "nowrap" })

const usageData = [
  {
    id: "U001",
    model: "HCAL61XA",
    sn: "SN-1001",
    jobId: "DO-001",
    date: "2025-01-11",
    temperature: 85,
    duration: 2.1,
    status: "正常"
  },
  {
    id: "U002",
    model: "CBMT61XA",
    sn: "SN-1009",
    jobId: "DO-003",
    date: "2025-01-12",
    temperature: 168,
    duration: 3.4,
    status: "高温使用"
  }
]
const cycleData = [
  { id: "C001", model: "HCAL61XA", normal: 50, high: 10, coef: 5 },
  { id: "C002", model: "CBMT61XA", normal: 40, high: 8, coef: 5 }
]
const maintainData = [
  { id: "M001", model: "HCAL61XA", sn: "SN-1001", date: "2025-01-05", type: "常规维保", person: "王工", result: "合格" },
  { id: "M002", model: "CBMT61XA", sn: "SN-1009", date: "2025-01-08", type: "大修", person: "李工", result: "需更换" }
]
const alertBaseData = ref([
  { model: "HCAL61XA", sn: "SN-1001", used: 22, cycle: 50, remain: 28 },
  { model: "CBMT61XA", sn: "SN-1009", used: 36, cycle: 40, remain: 4 },
  { model: "EORT61XB", sn: "SN-2003", used: 41, cycle: 40, remain: -1 }
])

const usageFilters = reactive({
  model: "",
  sn: "",
  jobId: "",
  date: ""
})

const maintenanceFilters = reactive({
  model: "",
  sn: "",
  type: "",
  date: ""
})

const alertFilters = reactive({
  model: "",
  sn: "",
  status: ""
})

const alertThreshold = ref(5)
const thresholdDialogVisible = ref(false)
const thresholdForm = reactive({ value: 5 })

const includesText = (source: string | number | undefined, keyword: string) => {
  if (!keyword) return true
  return String(source || "").toLowerCase().includes(keyword.trim().toLowerCase())
}

const filteredUsageData = computed(() => {
  return usageData.filter((item) => {
    return (
      includesText(item.model, usageFilters.model) &&
      includesText(item.sn, usageFilters.sn) &&
      includesText(item.jobId, usageFilters.jobId) &&
      (!usageFilters.date || item.date === usageFilters.date)
    )
  })
})

const filteredMaintainData = computed(() => {
  return maintainData.filter((item) => {
    return (
      includesText(item.model, maintenanceFilters.model) &&
      includesText(item.sn, maintenanceFilters.sn) &&
      (!maintenanceFilters.type || item.type === maintenanceFilters.type) &&
      (!maintenanceFilters.date || item.date === maintenanceFilters.date)
    )
  })
})

const computedAlertData = computed(() => {
  return alertBaseData.value.map((item) => {
    let status = "正常"
    if (item.remain <= 0) status = "已到期"
    else if (item.remain <= alertThreshold.value) status = "即将到期"
    return { ...item, status }
  })
})

const filteredAlertData = computed(() => {
  return computedAlertData.value.filter((item) => {
    return (
      includesText(item.model, alertFilters.model) &&
      includesText(item.sn, alertFilters.sn) &&
      (!alertFilters.status || item.status === alertFilters.status)
    )
  })
})

const alertStats = computed(() => {
  return computedAlertData.value.reduce(
    (acc, item) => {
      if (item.status === "已到期") acc.danger += 1
      else if (item.status === "即将到期") acc.warning += 1
      else acc.normal += 1
      return acc
    },
    { normal: 0, warning: 0, danger: 0 }
  )
})

const resetUsageFilters = () => {
  usageFilters.model = ""
  usageFilters.sn = ""
  usageFilters.jobId = ""
  usageFilters.date = ""
}

const resetMaintenanceFilters = () => {
  maintenanceFilters.model = ""
  maintenanceFilters.sn = ""
  maintenanceFilters.type = ""
  maintenanceFilters.date = ""
}

const resetAlertFilters = () => {
  alertFilters.model = ""
  alertFilters.sn = ""
  alertFilters.status = ""
}

const saveThreshold = () => {
  alertThreshold.value = thresholdForm.value
  thresholdDialogVisible.value = false
  ElMessage.success("维保提醒阈值已更新")
}

const handleExport = (type: string) => {
  ElMessage.success(type === "all" ? "已触发导出数据" : `已触发导出${type === "usage" ? "使用记录" : "维保记录"}数据`)
}
</script>

<style lang="scss" scoped>
.simwell-page {
  padding: 12px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
}

.panel-section {
  margin-top: 8px;
  margin-bottom: 16px;
}

.filter-card,
.note-card {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.filter-title,
.note-title {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.filter-form {
  margin-bottom: 8px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-heading {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.note-list {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
  line-height: 1.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-value.warning {
  color: var(--el-color-warning);
}

.stat-value.danger {
  color: var(--el-color-danger);
}

.stat-value.primary {
  color: var(--el-color-primary);
}

.stat-label {
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.field-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.el-link {
  margin-right: 8px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .header,
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
