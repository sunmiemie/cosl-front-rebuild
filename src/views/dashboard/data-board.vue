<script setup lang="ts">
import { reactive, ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
import CommpontentEcharts from "@/components/Echarts/echarts.vue"
import deviceIcon from "@/assets/iconimg/shebei.svg"
import faultIcon from "@/assets/iconimg/zhidongxiguzhang.svg"
import orderIcon from "@/assets/iconimg/liuchengceshigongdan.svg"
import auditIcon from "@/assets/iconimg/jihuashenheshuliang.svg"

const headers = ref([
  { prop: "equipment", label: "设备", align: "center" },
  { prop: "testunit_name", label: "测试名称", align: "center" },
  { prop: "user_name", label: "创建人", align: "center" },
  { prop: "progress", label: "测试状态", type: "progress", align: "center" }
])

const tableData = [
  {
    equipment: "三维显微镜",
    user_name: "管理员",
    testunit_name: "电路板外观检测",
    progress: 70
  },
  {
    equipment: "X-RAY检测台",
    user_name: "管理员",
    testunit_name: "焊点缺陷检测",
    progress: 42
  }
]

const summaryCards = [
  { label: "今日新增设备", value: "546", icon: deviceIcon },
  { label: "故障设备", value: "2", icon: faultIcon },
  { label: "测试工单数量", value: "546", icon: orderIcon },
  { label: "审核数量", value: "26", icon: auditIcon }
]

const trendOption = reactive({
  tooltip: { trigger: "axis" },
  grid: { left: "3%", right: "3%", top: "12%", bottom: "6%", containLabel: true },
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  yAxis: { type: "value" },
  series: [
    {
      name: "检测量",
      data: [150, 230, 224, 218, 135, 147, 260],
      type: "line",
      smooth: true,
      areaStyle: {}
    }
  ]
})

const workloadOption = reactive({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" }
  },
  legend: { top: 0 },
  grid: { left: "3%", right: "3%", bottom: "6%", top: "14%", containLabel: true },
  xAxis: [
    {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
  ],
  yAxis: [{ type: "value" }],
  series: [
    {
      name: "测试工单",
      type: "bar",
      stack: "total",
      data: [150, 232, 201, 154, 190, 330, 410]
    },
    {
      name: "报告审核",
      type: "bar",
      stack: "total",
      data: [120, 132, 101, 134, 290, 230, 220]
    },
    {
      name: "巡检任务",
      type: "bar",
      stack: "total",
      data: [80, 92, 86, 104, 130, 120, 142]
    }
  ]
})

const inspectionData = ref({
  "2024-02-21": "已巡检",
  "2024-03-21": "已巡检",
  "2024-04-01": "已巡检",
  "2024-04-02": "待巡检",
  "2024-04-03": "异常"
})
</script>

<template>
  <div class="app-container data-board-page">
    <div class="board-header">
      <div>
        <div class="board-header__eyebrow">DATA BOARD</div>
        <h1>数据看板</h1>
      </div>
    </div>

    <section class="summary-grid">
      <el-card v-for="item in summaryCards" :key="item.label" shadow="never" class="summary-card">
        <div class="summary-card__icon">
          <img :src="item.icon" :alt="item.label" />
        </div>
        <div>
          <div class="summary-card__label">{{ item.label }}</div>
          <div class="summary-card__value">{{ item.value }}</div>
        </div>
      </el-card>
    </section>

    <section class="chart-grid">
      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-title">检测趋势</div>
        </template>
        <CommpontentEcharts :width="'100%'" :height="'320px'" :option="trendOption as any" />
      </el-card>

      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-title">任务负载</div>
        </template>
        <CommpontentEcharts :width="'100%'" :height="'320px'" :option="workloadOption as any" />
      </el-card>
    </section>

    <section class="bottom-grid">
      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-title">测试进度监控</div>
        </template>
        <table-component :tableData="tableData" :columnData="headers" border>
          <template #progress="{ row }">
            <el-progress :text-inside="true" :stroke-width="24" :percentage="row.progress" />
          </template>
        </table-component>
      </el-card>

      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-title">每日巡检</div>
        </template>
        <el-scrollbar height="280px">
          <div class="inspection-list">
            <div v-for="(value, name) in inspectionData" :key="name" class="inspection-item">
              <el-tag :type="value === '已巡检' ? 'success' : value === '待巡检' ? 'warning' : 'danger'">
                {{ value }}
              </el-tag>
              <span>{{ name }}</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </el-scrollbar>
      </el-card>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.data-board-page {
  min-height: calc(100vh - 84px);
  padding: 24px;
}

.board-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 18px;

  h1 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 28px;
    font-weight: 800;
  }
}

.board-header__eyebrow {
  margin-bottom: 6px;
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px;
  }
}

.summary-card__icon {
  display: grid;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  place-items: center;

  img {
    width: 30px;
    height: 30px;
  }
}

.summary-card__label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.summary-card__value {
  margin-top: 6px;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.chart-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.panel-card {
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 16px 18px;
  }
}

.panel-title {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
}

.inspection-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inspection-item {
  display: grid;
  grid-template-columns: 84px 1fr 18px;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .data-board-page {
    padding: 14px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
