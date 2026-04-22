<template>
  <div class="simwell-page">
    <div class="header">
      <h1 class="header-title">仪器型号管理 Instrument Model Management</h1>
      <div class="header-actions">
        <el-button type="primary">新增型号</el-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">24</div>
        <div class="stat-label">型号总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">19</div>
        <div class="stat-label">在用型号</div>
      </div>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="card-title">型号列表 Model List</div>
      </template>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="name" label="型号名称" min-width="180" />
        <el-table-column prop="code" label="型号代号" width="180" />
        <el-table-column prop="desc" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="normalCycle" label="非高温维保周期(次)" width="170" align="center" />
        <el-table-column prop="highCycle" label="高温维保周期(次)" width="160" align="center" />
        <el-table-column prop="coefficient" label="换算系数" width="120" align="center" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default>
            <el-link type="primary" class="el-link">编辑</el-link>
            <el-link type="danger" class="el-link">删除</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const tableData = [
  {
    name: "井径测井仪",
    code: "HCAL61XA",
    desc: "用于井径测量的测井仪器型号",
    normalCycle: 50,
    highCycle: 10,
    coefficient: 5
  },
  {
    name: "水泥胶结成像测井仪",
    code: "CBMT61XA",
    desc: "用于水泥胶结成像检测",
    normalCycle: 40,
    highCycle: 8,
    coefficient: 5
  }
]
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2b6fb0;
}
.stat-label {
  margin-top: 4px;
  color: #606266;
  font-size: 13px;
}
.card-title {
  font-weight: 600;
}
.el-link {
  margin-right: 8px;
}
</style>
