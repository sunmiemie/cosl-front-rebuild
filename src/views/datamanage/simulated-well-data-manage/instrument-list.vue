<template>
  <div class="simwell-page">
    <div class="header">
      <h1 class="header-title">仪器管理 Instrument Management</h1>
      <div class="header-actions">
        <el-button type="primary">新增仪器</el-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">86</div><div class="stat-label">仪器总数</div></div>
      <div class="stat-card"><div class="stat-value">71</div><div class="stat-label">正常使用</div></div>
      <div class="stat-card"><div class="stat-value warning">9</div><div class="stat-label">即将到期</div></div>
      <div class="stat-card"><div class="stat-value danger">6</div><div class="stat-label">已到期</div></div>
    </div>

    <el-card class="filter-card" shadow="never">
      <template #header><div class="card-title">筛选条件</div></template>
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="SN号">
          <el-input v-model="filterForm.sn" placeholder="请输入SN号" clearable />
        </el-form-item>
        <el-form-item label="仪器名称">
          <el-input v-model="filterForm.name" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="型号">
          <el-select v-model="filterForm.model" placeholder="全部" clearable style="width: 180px">
            <el-option label="HCAL61XA" value="HCAL61XA" />
            <el-option label="CBMT61XA" value="CBMT61XA" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 180px">
            <el-option label="正常" value="正常" />
            <el-option label="即将到期" value="即将到期" />
            <el-option label="已到期" value="已到期" />
            <el-option label="维修中" value="维修中" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header><div class="card-title">仪器列表 Instrument List</div></template>
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="sn" label="SN号" width="170" />
        <el-table-column prop="name" label="仪器名称" min-width="160" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="制造商" width="140" />
        <el-table-column prop="model" label="型号" width="140" />
        <el-table-column prop="usedCount" label="使用次数" width="110" align="center" />
        <el-table-column prop="remainCount" label="剩余可用次数" width="130" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default>
            <el-link type="primary" class="el-link">查看</el-link>
            <el-link type="warning" class="el-link">编辑</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue"

const filterForm = reactive({
  sn: "",
  name: "",
  model: "",
  status: ""
})

const tableData = [
  {
    sn: "SN-2025-0001",
    name: "井径测井仪",
    status: "正常",
    manufacturer: "某某厂商",
    model: "HCAL61XA",
    usedCount: 12,
    remainCount: 38,
    createdAt: "2025-01-11 10:20:00"
  },
  {
    sn: "SN-2025-0009",
    name: "水泥胶结成像测井仪",
    status: "即将到期",
    manufacturer: "某某厂商",
    model: "CBMT61XA",
    usedCount: 35,
    remainCount: 5,
    createdAt: "2025-01-08 09:10:00"
  }
]

const statusTagType = (status: string): "success" | "warning" | "danger" | "info" => {
  if (status === "正常") return "success"
  if (status === "即将到期") return "warning"
  if (status === "已到期") return "danger"
  return "info"
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #2b6fb0;
}
.stat-value.warning {
  color: #e6a23c;
}
.stat-value.danger {
  color: #f56c6c;
}
.stat-label {
  margin-top: 4px;
  color: #606266;
  font-size: 13px;
}
.filter-card {
  margin-bottom: 16px;
}
.card-title {
  font-weight: 600;
}
.el-link {
  margin-right: 8px;
}
</style>
