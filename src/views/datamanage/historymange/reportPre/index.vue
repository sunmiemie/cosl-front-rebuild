<script setup>
import { onMounted, reactive, ref } from "vue"
import { useRoute } from "vue-router"
import { checkReportDataApi } from "@/api/report"
import ReportPreview from "@/components/Check/ReportPreview.vue"
import FunctionalTestingReportPreview from "@/components/Check/FunctionalTestingReportPreview.vue"

const reportJson = ref({})
const loading = ref(false)
const loaded = ref(false)
const route = useRoute()
const anyObj = reactive({
  id: "",
  type: "",
  name: "",
  user: "",
  date: ""
})

onMounted(() => {
  loading.value = true
  anyObj.type = route.query.type
  anyObj.id = route.query.id
  anyObj.name = route.query.name
  anyObj.user = route.query.user
  anyObj.date = route.query.date
  console.log(route.query)
  checkReportDataApi({ id: route.query.id }).then((res) => {
    loaded.value = true
    loading.value = false
    reportJson.value = res.data
  })
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" class="test-check">
      <h2>测试报告基础信息</h2>
      <el-form :inline="true" :model="anyObj" class="demo-form-inline" label-position="top" style="margin: 10px">
        <el-form-item label="报告编号" style="width: 13%">
          <el-input v-model="anyObj.id" disabled />
        </el-form-item>
        <el-form-item label="报告名称" style="width: 380px">
          <el-input v-model="anyObj.name" disabled />
        </el-form-item>
        <el-form-item label="测试人" style="width: 14%">
          <el-input v-model="anyObj.user" disabled />
        </el-form-item>
        <el-form-item label="测试日期" style="width: 16%">
          <el-input v-model="anyObj.date" disabled />
        </el-form-item>
      </el-form>
      <div style="display: flex; margin-top: 10px; border: #c0c4cc 1px solid; margin-bottom: 10px">
        <report-preview
          v-if="loaded && anyObj.type !== '功能性测试'"
          v-model:preview-list="reportJson"
          mode="preview"
          style="width: 100vw"
        />
        <FunctionalTestingReportPreview
          v-else-if="loaded && anyObj.type === '功能性测试'"
          :previewList="reportJson"
          style="width: 100vw"
        />
      </div>
    </el-card>
  </div>
</template>
