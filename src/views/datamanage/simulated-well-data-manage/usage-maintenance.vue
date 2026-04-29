<template>
  <div class="simwell-page">
    <div class="header">
      <h1 class="header-title">使用与维保</h1>
      <div class="header-actions">
        <el-button>导出数据</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="使用记录" name="usage">
          <el-table :data="usageData" stripe border style="width: 100%" :header-cell-style="headerCellStyle">
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
          <el-table :data="maintainData" stripe border style="width: 100%" :header-cell-style="headerCellStyle">
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
          <el-table :data="alertData" stripe border style="width: 100%" :header-cell-style="headerCellStyle">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

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
  }
]
const cycleData = [{ id: "C001", model: "HCAL61XA", normal: 50, high: 10, coef: 5 }]
const maintainData = [
  { id: "M001", model: "HCAL61XA", sn: "SN-1001", date: "2025-01-05", type: "常规维保", person: "王工", result: "合格" }
]
const alertData = [{ model: "CBMT61XA", sn: "SN-1009", used: 36, cycle: 40, remain: 4, status: "即将到期" }]
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
.el-link {
  margin-right: 8px;
}
</style>
