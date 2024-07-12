<script setup>
import { onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { checkReportDataApi } from "@/api/report"
import ReportPreview from "@/components/Check/ReportPreview.vue"

const reportJson = ref({})
const hasError = ref(false)
const hasQuestion = ref(false)
const loading = ref(false)
const loaded = ref(false)
const route = useRoute()
const router = useRouter()
const anyObj = reactive({
  id: "",
  type: "",
  name: "",
  user: "",
  date: ""
})
const hasProperty = (obj, prop) => {
  if (obj === null || typeof obj !== "object") {
    return false
  }
  if (Object.prototype.hasOwnProperty.call(obj, prop)) {
    return true
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (hasProperty(obj[key], prop)) {
        return true
      }
    }
  }
  return false
}
const generateQuestionList = (obj, path = []) => {
  let paths = []
  if (obj === null || typeof obj !== "object") {
    return paths
  }
  if (Object.prototype.hasOwnProperty.call(obj, "questionList")) {
    paths.push([...path, "questionList"])
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "object") {
      paths = paths.concat(generateQuestionList(obj[key], [...path, key]))
    }
  }
  return paths
}
const generateErrorList = (obj, path = []) => {
  let paths = []
  if (obj === null || typeof obj !== "object") {
    return paths
  }
  if (Object.prototype.hasOwnProperty.call(obj, "errorList")) {
    paths.push([...path, "errorList"])
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "object") {
      paths = paths.concat(generateErrorList(obj[key], [...path, key]))
    }
  }
  return paths
}

const getNestedValue = (obj, path) => {
  return path.reduce((acc, key) => {
    if (acc && acc[key] !== undefined) {
      return acc[key]
    }
    return undefined
  }, obj)
}

onMounted(() => {
  anyObj.type = route.query.type
  anyObj.id = route.query.id
  anyObj.name = route.query.name
  anyObj.user = route.query.user
  anyObj.date = route.query.date
  console.log(route.query)
  checkReportDataApi({ id: route.query.id }).then((res) => {
    loaded.value = true
    loading.value = false
    hasError.value = hasProperty(res.data, "errorList")
    hasQuestion.value = hasProperty(res.data, "questionList")
    generateErrorList(res.data).forEach((item) => {
      console.log(getNestedValue(res.data, item))
    })
    generateQuestionList(res.data).forEach((item) => {
      console.log(getNestedValue(res.data, item))
    })
    console.log(hasError.value, hasQuestion.value)
    reportJson.value = res.data
  })
  if (anyObj.type === "目检测试") {
    loading.value = true
  } else if (anyObj.type === "X-Ray测试") {
    loading.value = true
  } else if (anyObj.type === "功能性测试") {
    loading.value = true
  }
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" class="test-check">
      <!-- 审核测试工艺 -->
      <h2>审核测试报告</h2>
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
      <el-text v-if="!hasQuestion && !hasError" size="large" style="color: green">测试正常</el-text>
      <el-text v-if="hasError" size="large" style="color: red; margin-right: 20px">有缺陷</el-text>
      <el-text v-if="hasQuestion" size="large" style="color: orange">有疑问</el-text>
      <div style="display: flex; margin-top: 10px; border: #c0c4cc 1px solid; margin-bottom: 10px">
        <report-preview v-if="loaded" v-model:preview-list="reportJson" mode="check" style="width: 100vw" />
      </div>
      <div v-if="!hasQuestion">
        <el-button icon="Check" size="large" type="success" @click="">审核通过</el-button>
        <el-button icon="Close" size="large" type="danger" @click="">审核未通过</el-button>
      </div>
      <div v-if="hasQuestion">
        <el-button size="large" type="warning" @click="">? 生成疑问工单</el-button>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped></style>
