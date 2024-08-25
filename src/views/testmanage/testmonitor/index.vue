<template>
  <el-card>
    <el-text>测试进度监控</el-text>
    <TableComponent :tableData="tableData" :columnData="headers">
      <template #progress="{ row }">
        <el-progress :text-inside="true" :stroke-width="26" :percentage="row.progress" />
      </template>
    </TableComponent>
  </el-card>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
const headers = ref([
  { prop: "equipment", label: "设备", align: "center" },
  { prop: "testunit_name", label: "测试名称", align: "center" },
  { prop: "user_name", label: "创建人", align: "center" },
  { prop: "testunit_starttime", label: "创建时间", align: "center" },
  { prop: "testunit_endtime", label: "结束时间", align: "center" },
  { prop: "progress", label: "测试进度", type: "progress", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])

const tableData = [
  {
    equipment: "2016-05-03",
    user_name: "Tom",
    testunit_name: "No. 189,",
    testunit_starttime: "2024-01-12",
    testunit_endtime: "2024-02-02",
    progress: 70
  },
  {
    date: "2016-05-02",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    progress: 20
  }
]
</script>
