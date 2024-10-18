<script setup>
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { checkReportDataApi, checkReportFeedbackApi, checkReportPassApi, generateQuestionUnitApi } from "@/api/report"
import { useUserStore } from "@/store/modules/user"
import ReportPreview from "@/components/Check/ReportPreview.vue"
import { ElMessageBox } from "element-plus"
import { ReportCheck } from "@/utils/report"

const userStore = useUserStore()
const reportJson = ref({})

const hasError = ref(false)

const feedbackList = ref([])
const feedbackReason = ref("")
const feedbackVisible = ref(false)
const reportFixed = ref(false)
const errorVisible = ref(false)
const questionVisible = ref(false)
const warnVisible = ref(false)
const questionDialogVisible = ref(false)
const hasQuestion = ref(false)
const hasWarn = ref(false)
const loading = ref(false)
const loaded = ref(false)
const route = useRoute()
const router = useRouter()
const errorList = ref([])
const questionList = ref([])
const warnList = ref([])
const stepList = ref([])

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
const generateWarnList = (obj, path = []) => {
  let paths = []
  if (obj === null || typeof obj !== "object") {
    return paths
  }
  if (Object.prototype.hasOwnProperty.call(obj, "warnList")) {
    paths.push([...path, "warnList"])
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "object") {
      paths = paths.concat(generateWarnList(obj[key], [...path, key]))
    }
  }
  return paths
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
const generateStepList = (obj, path = []) => {
  let paths = []
  if (obj === null || typeof obj !== "object") {
    return paths
  }
  if (Object.prototype.hasOwnProperty.call(obj, "stepList")) {
    paths.push([...path, "stepList"])
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "object") {
      paths = paths.concat(generateStepList(obj[key], [...path, key]))
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
// 缺陷项操作
// NOTE 缺陷项通过
const errorPass = (obj) => {
  ElMessageBox.confirm("确认设置为通过吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    reportJson.value = ReportCheck.reportErrorPass(reportJson.value, obj)
  })
}
// NOTE 缺陷项疑问
const errorQuestion = (obj) => {
  ElMessageBox.confirm("确认设置为疑问吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    reportJson.value = ReportCheck.reportErrorQuestion(reportJson.value, obj)
  })
}

// 疑问项操作
// NOTE 疑问项通过
const questionPass = (obj) => {
  ElMessageBox.confirm("确认设置为通过吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    reportJson.value = ReportCheck.reportQuestionPass(reportJson.value, obj)
  })
}
// NOTE 疑问项缺陷
const questionError = (obj) => {
  ElMessageBox.confirm("确认设置为缺陷吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    reportJson.value = ReportCheck.reportQuestionError(reportJson.value, obj)
  })
}

// 制程警示操作
// NOTE 制程警示通过
const warnPass = (obj) => {
  ElMessageBox.confirm("确认设置为通过吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    reportJson.value = ReportCheck.reportWarnPass(reportJson.value, obj)
  })
}
// NOTE 制程警示缺陷
const warnError = (obj) => {
  ElMessageBox.confirm("确认设置为缺陷吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    reportJson.value = ReportCheck.reportWarnError(reportJson.value, obj)
  })
}

const getErrorQuestionWarnList = () => {
  errorList.value = []
  questionList.value = []
  warnList.value = []
  stepList.value = []
  generateErrorList(reportJson.value).forEach((item) => {
    if (item.includes("eyes")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          errorList.value.push({ type: "eyes", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            errorList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            errorList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("eyesBak")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          errorList.value.push({ type: "eyesBak", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            errorList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            errorList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("xray")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          errorList.value.push({ type: "xray", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            errorList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            errorList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
  })
  generateQuestionList(reportJson.value).forEach((item) => {
    if (item.includes("eyes")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          questionList.value.push({ type: "eyes", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            questionList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            questionList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("eyesBak")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          questionList.value.push({ type: "eyesBak", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            questionList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            questionList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("xray")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          questionList.value.push({ type: "xray", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            questionList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            questionList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
  })
  generateWarnList(reportJson.value).forEach((item) => {
    if (item.includes("eyes")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          warnList.value.push({ type: "eyes", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            warnList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            warnList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("eyesBak")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          warnList.value.push({ type: "eyesBak", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            warnList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            warnList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("xray")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          warnList.value.push({ type: "xray", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            warnList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            warnList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
  })
  generateStepList(reportJson.value).forEach((item) => {
    if (item.includes("eyes")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          stepList.value.push({ type: "eyes", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            stepList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            stepList.value.push({
              type: "eyes",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("eyesBak")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          stepList.value.push({ type: "eyesBak", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            stepList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            stepList.value.push({
              type: "eyesBak",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
    if (item.includes("xray")) {
      if (item.includes("total")) {
        getNestedValue(reportJson.value, item).forEach((value) => {
          stepList.value.push({ type: "xray", position: "total", id: value.id, content: value })
        })
      }
      if (item.includes("area")) {
        if (item.includes("general")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            stepList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "general",
              id: value.id,
              content: value
            })
          })
        }
        if (item.includes("detail")) {
          getNestedValue(reportJson.value, item).forEach((value) => {
            stepList.value.push({
              type: "xray",
              position: "area",
              areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
              areaPosition: "detail",
              detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
              id: value.id,
              content: value
            })
          })
        }
      }
    }
  })
  hasError.value = hasProperty(reportJson.value, "errorList")
  hasQuestion.value = hasProperty(reportJson.value, "questionList")
  hasWarn.value = hasProperty(reportJson.value, "warnList")
  if (errorList.value.length === 0) {
    errorVisible.value = false
  }
  if (questionList.value.length === 0) {
    questionVisible.value = false
  }
  if (warnList.value.length === 0) {
    warnVisible.value = false
  }
}

const jsonToFile = (data) => {
  const jsonString = JSON.stringify(data)
  return new Blob([jsonString], { type: "application/json" })
}

const checkPass = () => {
  loading.value = true
  const jsonString = JSON.stringify(reportJson.value)
  const blob = new Blob([jsonString], { type: "application/json" })
  const data = {
    id: anyObj.id,
    userId: userStore.userid,
    status: !hasError.value ? 2 : 3
  }
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  if (reportFixed.value) {
    formData.append("file", blob, "data.json")
  } else {
    formData.append("file", undefined)
  }
  checkReportPassApi(formData).then((res) => {
    if (res.msg === "success") {
      loading.value = false
      router.push({ name: "reportCheckList" })
    }
  })
}
const checkFeedback = () => {
  loading.value = true
  const blob_report = jsonToFile(reportJson.value)
  const blob_feedback = jsonToFile(feedbackList.value)

  const data = {
    id: anyObj.id,
    status: 1,
    userId: userStore.userid,
    reason: feedbackReason.value
  }

  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  if (reportFixed.value) {
    formData.append("file_report", blob_report, "data_report.json")
  } else {
    formData.append("file_report", undefined)
  }
  if (route.query.type !== "弓曲度测试" && route.query.type !== "2D留存") {
    formData.append("file_feedback", blob_feedback, "data_feedback.json")
  }
  // 生产测试报告
  checkReportFeedbackApi(formData).then((res) => {
    // console.log(formData)
    if (res.msg === "success") {
      loading.value = false
      router.push({ name: "reportCheckList" })
    }
  })
}
const generateQuestionUnit = () => {
  loading.value = true
  const blob_report = jsonToFile(reportJson.value)
  const blob_question = jsonToFile(questionList.value)
  const data = {
    id: anyObj.id,
    userId: userStore.userid,
    status: 4
  }
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  if (reportFixed.value === true) {
    formData.append("file_report", blob_report, "data_report.json")
  } else {
    formData.append("file_report", undefined)
  }
  formData.append("file_question", blob_question, "data_question.json")
  generateQuestionUnitApi(formData).then((res) => {
    if (res.msg === "success") {
      loading.value = false
      router.push({ name: "reportCheckList" })
    }
  })
}

const handlePass = () => {
  ElMessageBox.confirm("确认通过审核吗？", "确认审核", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (reportFixed.value) {
      ElMessageBox.confirm("当前报告已被更改,确认以修改后状态通过审核吗？", "确认提交", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        checkPass()
      })
    } else {
      checkPass()
    }
  })
}
const handleFeedback = () => {
  // console.log("hiiiii")
  ElMessageBox.confirm("确认打回吗？", "确认审核", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (reportFixed.value) {
      ElMessageBox.confirm("当前报告已被更改,确认以修改后状态打回吗？", "确认提交", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        checkFeedback()
      })
    } else {
      checkFeedback()
    }
  })
}
const handleQuestion = () => {
  ElMessageBox.confirm("确认生成疑问工单吗？", "确认生成", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (reportFixed.value === true) {
      ElMessageBox.confirm("当前报告已被更改,确认以修改后状态生成疑问工单吗？", "确认提交", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        generateQuestionUnit()
      })
    } else {
      generateQuestionUnit()
    }
  })
}
const handleSelectionChange = (value) => {
  feedbackList.value = stepList.value.filter((item) => value.includes(item))
  console.log(feedbackList.value)
}
const reGetReport = () => {
  loading.value = true
  reportFixed.value = false
  checkReportDataApi({ id: route.query.id }).then((res) => {
    loaded.value = true
    loading.value = false
    getErrorQuestionWarnList()
    reportJson.value = res.data
  })
}
onMounted(() => {
  loading.value = true
  anyObj.type = route.query.type
  anyObj.id = route.query.id
  anyObj.name = route.query.name
  anyObj.user = route.query.user
  anyObj.date = route.query.date
  checkReportDataApi({ id: route.query.id }).then((res) => {
    // console.log("生产测试报告", res)
    loaded.value = true
    loading.value = false
    getErrorQuestionWarnList()
    reportJson.value = res.data
  })
  watch([() => reportJson.value], getErrorQuestionWarnList, { immediate: true, deep: true })
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

      <div style="display: flex; justify-content: space-between; align-items: center">
        <div>
          <el-text v-if="!hasQuestion && !hasError" size="large" style="color: green">测试正常</el-text>
          <el-link
            v-if="hasError"
            :underline="false"
            size="large"
            style="font-size: 18px; margin-right: 20px"
            type="danger"
            :disabled="route.query.type === '弓曲度测试' || route.query.type === '2D留存'"
            @click="errorVisible = true"
            >存在缺陷
          </el-link>
          <el-link
            v-if="hasQuestion"
            :underline="false"
            size="large"
            style="font-size: 18px; margin-right: 20px"
            type="info"
            @click="questionVisible = true"
            >存在疑问
          </el-link>
          <el-link
            v-if="hasWarn"
            :underline="false"
            size="large"
            style="font-size: 18px"
            type="warning"
            @click="warnVisible = true"
            >存在制程警示
          </el-link>
        </div>
        <el-button icon="Refresh" v-if="reportFixed" @click="reGetReport">重置所有更改</el-button>
      </div>
      <div v-loading="loading" style="display: flex; margin-top: 10px; border: #c0c4cc 1px solid; margin-bottom: 10px">
        <report-preview v-if="loaded" v-model:preview-list="reportJson" mode="check" style="width: 100vw" />
      </div>
      <div style="display: flex; align-items: center">
        <div v-if="!hasQuestion">
          <el-button icon="Check" size="large" type="success" @click="handlePass">审核通过</el-button>
          <el-button icon="Close" size="large" type="danger" @click="feedbackVisible = true">审核未通过</el-button>
        </div>
        <div v-else>
          <el-button size="large" type="warning" @click="questionDialogVisible = true">生成疑问工单</el-button>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="errorVisible" title="缺陷操作" align-center width="80%">
      <el-table :data="errorList" max-height="70vh">
        <el-table-column label="测试类型">
          <template #default="scope">
            <el-text>
              {{ scope.row.type === "eyes" ? "3D正面测试" : scope.row.type === "eyesBak" ? "3D背面测试" : "X-Ray检测" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="缺陷位置">
          <template #default="scope">
            <el-text> {{ scope.row.position === "total" ? "整体检测" : "区域检测" }}</el-text>
            <el-text v-if="scope.row.areaId !== undefined"> -第{{ scope.row.areaId }}区域</el-text>
            <el-text v-if="scope.row.areaPosition !== undefined">
              -{{ scope.row.areaPosition === "general" ? "通用检测" : "具体检测" }}
            </el-text>
            <el-text v-if="scope.row.detailId !== undefined"> -第{{ scope.row.detailId }}点位</el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项">
          <template #default="scope">
            <el-text> {{ scope.row.content.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="缺陷描述">
          <template #default="scope">
            <el-text> {{ scope.row.content.error.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="留存图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.content.error.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.content.error.url"
                :src="scope.row.content.error.url[0]"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作">
          <template #default="scope">
            <el-button type="success" @click="errorPass(scope.row)">通过</el-button>
            <el-button type="warning" @click="errorQuestion(scope.row)">疑问</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog v-model="questionVisible" title="疑问操作" width="80%" align-center>
      <el-table :data="questionList" max-height="70vh">
        <el-table-column label="测试类型">
          <template #default="scope">
            <el-text>
              {{ scope.row.type === "eyes" ? "3D正面测试" : scope.row.type === "eyesBak" ? "3D背面测试" : "X-Ray检测" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问位置">
          <template #default="scope">
            <el-text> {{ scope.row.position === "total" ? "整体检测" : "区域检测" }}</el-text>
            <el-text v-if="scope.row.areaId !== undefined"> -第{{ scope.row.areaId }}区域</el-text>
            <el-text v-if="scope.row.areaPosition !== undefined">
              -{{ scope.row.areaPosition === "general" ? "通用检测" : "具体检测" }}
            </el-text>
            <el-text v-if="scope.row.detailId !== undefined"> -第{{ scope.row.detailId }}点位</el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项">
          <template #default="scope">
            <el-text> {{ scope.row.content.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问描述">
          <template #default="scope">
            <el-text> {{ scope.row.content.question.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="留存图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.content.question.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.content.question.url"
                :src="scope.row.content.question.url[0]"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作">
          <template #default="scope">
            <el-button type="success" @click="questionPass(scope.row)">通过</el-button>
            <el-button type="danger" @click="questionError(scope.row)">缺陷</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog v-model="warnVisible" title="制程警示操作" width="80%" align-center>
      <el-table :data="warnList" max-height="70vh">
        <el-table-column label="测试类型">
          <template #default="scope">
            <el-text>
              {{ scope.row.type === "eyes" ? "3D正面测试" : scope.row.type === "eyesBak" ? "3D背面测试" : "X-Ray检测" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="制程警示位置">
          <template #default="scope">
            <el-text> {{ scope.row.position === "total" ? "整体检测" : "区域检测" }}</el-text>
            <el-text v-if="scope.row.areaId !== undefined"> -第{{ scope.row.areaId }}区域</el-text>
            <el-text v-if="scope.row.areaPosition !== undefined">
              -{{ scope.row.areaPosition === "general" ? "通用检测" : "具体检测" }}
            </el-text>
            <el-text v-if="scope.row.detailId !== undefined"> -第{{ scope.row.detailId }}点位</el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项">
          <template #default="scope">
            <el-text> {{ scope.row.content.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="制程警示描述">
          <template #default="scope">
            <el-text> {{ scope.row.content.warn.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="留存图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.content.warn.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.content.warn.url"
                :src="scope.row.content.warn.url[0]"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作">
          <template #default="scope">
            <el-button type="success" @click="warnPass(scope.row)">通过</el-button>
            <el-button type="danger" @click="warnError(scope.row)">缺陷</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      v-if="route.query.type === '弓曲度测试' || route.query.type === '2D留存'"
      v-model="feedbackVisible"
      width="80%"
      align-center
    >
      <el-input
        placeholder="打回理由"
        v-model="feedbackReason"
        type="textarea"
        :autosize="{ minRows: 6, maxRows: 6 }"
        style="margin-top: 10px"
      />
      <template #footer>
        <el-button :disabled="feedbackReason === ''" type="danger" @click="handleFeedback">打回</el-button>
      </template>
    </el-dialog>
    <el-dialog v-else v-model="feedbackVisible" title="请选择打回项" width="80%" align-center>
      <el-table :data="stepList" max-height="70vh" @selection-change="handleSelectionChange">
        <el-table-column type="selection" />
        <el-table-column label="测试类型" width="150">
          <template #default="scope">
            <el-text>
              {{ scope.row.type === "eyes" ? "3D正面测试" : scope.row.type === "eyesBak" ? "3D背面测试" : "X-Ray检测" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测位置">
          <template #default="scope">
            <el-text> {{ scope.row.position === "total" ? "整体检测" : "区域检测" }}</el-text>
            <el-text v-if="scope.row.areaId !== undefined"> -第{{ scope.row.areaId }}区域</el-text>
            <el-text v-if="scope.row.areaPosition !== undefined">
              -{{ scope.row.areaPosition === "general" ? "通用检测" : "具体检测" }}
            </el-text>
            <el-text v-if="scope.row.detailId !== undefined"> -第{{ scope.row.detailId }}点位</el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项名称">
          <template #default="scope">
            <el-text> {{ scope.row.content.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="测试结果" fixed="right" align="right">
          <template #default="scope">
            <el-text
              :type="scope.row.content.pass === 1 ? 'success' : scope.row.content.pass === 3 ? 'warning' : 'danger'"
            >
              {{ scope.row.content.pass === 1 ? "通过" : scope.row.content.pass === 3 ? "疑问" : "未通过" }}</el-text
            >
          </template>
        </el-table-column>
      </el-table>
      <el-input
        placeholder="打回理由"
        v-model="feedbackReason"
        type="textarea"
        :autosize="{ minRows: 6, maxRows: 6 }"
        style="margin-top: 10px"
      />
      <template #footer>
        <el-button :disabled="feedbackReason === '' || feedbackList.length === 0" type="danger" @click="handleFeedback"
          >打回</el-button
        >
      </template>
    </el-dialog>
    <el-dialog v-model="questionDialogVisible" title="生成确认" width="80%" align-center>
      <el-table :data="questionList">
        <el-table-column label="测试类型">
          <template #default="scope">
            <el-text>
              {{ scope.row.type === "eyes" ? "3D正面测试" : scope.row.type === "eyesBak" ? "3D背面测试" : "X-Ray检测" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问位置">
          <template #default="scope">
            <el-text> {{ scope.row.position === "total" ? "整体检测" : "区域检测" }}</el-text>
            <el-text v-if="scope.row.areaId !== undefined"> -第{{ scope.row.areaId }}区域</el-text>
            <el-text v-if="scope.row.areaPosition !== undefined">
              -{{ scope.row.areaPosition === "general" ? "通用检测" : "具体检测" }}
            </el-text>
            <el-text v-if="scope.row.detailId !== undefined"> -第{{ scope.row.detailId }}点位</el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项">
          <template #default="scope">
            <el-text> {{ scope.row.content.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问描述">
          <template #default="scope">
            <el-text> {{ scope.row.content.question.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="留存图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.content.question.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.content.question.url"
                :src="scope.row.content.question.url[0]"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="questionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleQuestion">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>
