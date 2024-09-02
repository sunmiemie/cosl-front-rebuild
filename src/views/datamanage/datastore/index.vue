<template>
  <div class="app-container">
    <el-card style="height: 80vh">
      <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleClick">
        <el-form ref="searchFormRef" :inline="true" :model="searchData">
          <el-form-item label="名称">
            <el-input v-model="searchData.activeName" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="数据状态">
            <el-select v-model="searchData.TestStatus" placeholder="请选择" style="width: 150px">
              <el-option label="未归档" value="0" />
              <el-option label="已归档" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="生成时间">
            <el-date-picker
              unlink-panels
              v-model="searchData['Daterange'] as any"
              end-placeholder="结束日期"
              range-separator="至"
              start-placeholder="开始日期"
              type="daterange"
              value-format="YYYY/MM/DD"
            />
          </el-form-item>
<!--          <el-form-item label="生成时间">-->
<!--            <el-select v-model="searchData.startTime" placeholder="请选择" style="width: 150px">-->
<!--              <el-option label="2023/01/05" value="2023/01/05" />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        <el-tab-pane label="历史测试报告数据" name="first">
          <TableComponent :tableData="TableData" :column-data="headers" stripe border>
            <template #status="{ row }">
              <el-tag v-if="row.status === '0'" type="warning"> 未归档 </el-tag>
              <el-tag v-if="row.status === '1'" type="success"> 已归档 </el-tag>
            </template>

            <template #link="{ row }">
              <el-link
                v-for="i in row.link"
                :key="i"
                type="primary"
                class="el-link"
                style="margin-right: 10px"
                @click="handleLink(row, i)"
                >{{ i }}</el-link
              >
            </template>
          </TableComponent>
        </el-tab-pane>
        <el-tab-pane label="故障工单数据" name="second">Config</el-tab-pane>
<!--        <el-tab-pane label="日志数据" name="third">Role</el-tab-pane>-->
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import type { TabsPaneContext } from "element-plus"
import TableComponent from "@/components/Table/index.vue"
import { Search, Refresh } from "@element-plus/icons-vue"

const activeName = ref<any>("first")

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
// 历史测试报告
const defineLink = (status: any) => {
  switch (status) {
    case "0":
      return { 1: "查看", 2: "数据归档" }
    case "1":
      return { 1: "查看", 2: "数据归档" }
  }
}
const getTableData = () => {
  for (let i = 0; i < TableData.value.length; i++) {
    TableData.value[i].link = defineLink(TableData.value[i].status)
  }
}
const headers = ref<any>([
  { prop: "name", label: "测试名称", align: "center" },
  { prop: "starttime", label: "生成时间", align: "center" },
  { prop: "status", label: "数据状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<any>([
  {
    name: "Test",
    starttime: "2023/01/05",
    status: "0",
    type: "1123213"
  },
  {
    name: "Test",
    starttime: "2023/01/05",
    status: "1",
    type: "1123213"
  }
])

const searchData = reactive<any>({
  activeName: "",
  TestStatus: "",
  Daterange: ""
  // startTime: ""
})

// 重置
const resetSearch = () => {
  console.log(searchData)

  searchData.activeName = ""
  searchData.TestStatus = ""
  searchData.startTime = ""
}
// 查询
const handleSearch = () => {}

// link
const handleLink = (data: any, i: any) => {
  console.log(i, data)
}

getTableData()
</script>

<style lang="scss">
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
