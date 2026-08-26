<!-- 报告审核 -->

<script setup>
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  checkReportDataApi,
  checkReportFeedbackApi,
  checkReportPassApi,
  generateQuestionUnitApi,
  retryReportAssistantSyncApi,
  restoreReportSourceApi
} from "@/api/report"
import { useUserStore } from "@/store/modules/user"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import ReportPreview from "@/components/Check/ReportPreview.vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { ReportCheck } from "@/utils/report"
import { appendJsonFile, buildFeedbackFile, buildQuestionFile, jsonToFile } from "@/utils/report-feedback"

const userStore = useUserStore()
const taskCenterStore = useTaskCenterStoreHook()
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
const isRecoveredPlaceholder = ref(false)
const loadError = ref("")
const canRestoreSource = ref(false)
const restoreVisible = ref(false)
const restoring = ref(false)
const restoreFile = ref(null)
const restoreFileList = ref([])
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

const finishReportAudit = async (response) => {
  const syncResult = response?.data?.assistantSync
  if (syncResult?.attempted && !syncResult.success) {
    const reason = syncResult.error || "外部接口暂时不可用"
    try {
      await ElMessageBox.confirm(
        `本地审核结果已保存，但报告尚未同步到小助手：${reason}。是否立即重试？`,
        "报告同步未完成",
        {
          confirmButtonText: "立即重试",
          cancelButtonText: "稍后处理",
          type: "warning"
        }
      )
    } catch {
      ElMessage.warning("审核已保存，报告尚未同步；可在当前页面再次审核以重试")
      return
    }

    loading.value = true
    try {
      const retryResponse = await retryReportAssistantSyncApi({ id: anyObj.id })
      const retryResult = retryResponse?.data?.assistantSync
      if (!retryResult?.success) {
        ElMessage.warning(retryResult?.error || "审核已保存，但报告同步重试仍未成功")
        return
      }
      ElMessage.success(retryResult.message || `审核已完成，已同步 ${retryResult.synced || 0} 份报告`)
    } catch (error) {
      console.error("报告同步重试失败", error)
      ElMessage.warning("审核已保存，但报告同步重试失败，请稍后再次重试")
      return
    } finally {
      loading.value = false
    }
  } else if (syncResult?.attempted) {
    ElMessage.success(syncResult.message || `审核已完成，已同步 ${syncResult.synced || 0} 份报告`)
  } else {
    ElMessage.success("审核完成")
  }

  void taskCenterStore.refresh(true)
  router.push({ name: "reportCheckList" })
}
const checkPass = () => {
  loading.value = true
  const blob = jsonToFile(reportJson.value)
  const data = {
    id: anyObj.id,
    userId: userStore.userid,
    status: !hasError.value ? 2 : 3
  }
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  appendJsonFile(formData, "file", reportFixed.value ? blob : null, "data.json")
  checkReportPassApi(formData)
    .then(async (res) => {
      if (res.msg === "success") {
        await finishReportAudit(res)
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const checkFeedback = () => {
  loading.value = true
  const blob_report = reportFixed.value ? jsonToFile(reportJson.value) : null
  const blob_feedback = buildFeedbackFile(feedbackList.value)

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
  appendJsonFile(formData, "file_report", blob_report, "data_report.json")
  if (route.query.type !== "弓曲度测试" && route.query.type !== "2D留存") {
    appendJsonFile(formData, "file_feedback", blob_feedback, "data_feedback.json")
  }
  checkReportFeedbackApi(formData)
    .then((res) => {
      if (res.msg === "success") {
        loading.value = false
        void taskCenterStore.refresh(true)
        router.push({ name: "reportCheckList" })
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const generateQuestionUnit = () => {
  loading.value = true
  const blob_report = reportFixed.value ? jsonToFile(reportJson.value) : null
  const blob_question = buildQuestionFile(questionList.value)
  const data = {
    id: anyObj.id,
    userId: userStore.userid,
    status: 4
  }
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  appendJsonFile(formData, "file_report", blob_report, "data_report.json")
  appendJsonFile(formData, "file_question", blob_question, "data_question.json")
  generateQuestionUnitApi(formData).then((res) => {
    if (res.msg === "success") {
      loading.value = false
      void taskCenterStore.refresh(true)
      router.push({ name: "reportCheckList" })
    }
  })
}

const handlePass = () => {
  const confirmMessage = isRecoveredPlaceholder.value
    ? "当前报告是根据数据库元数据生成的恢复版，原始检测图片缺失。确认仍通过审核吗？"
    : "确认通过审核吗？"
  ElMessageBox.confirm(confirmMessage, "确认审核", {
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
const resolveLoadFailure = (error) => {
  const payload = error?.response?.data || error?.data || {}
  return {
    message: payload?.msg || payload?.message || error?.message || "读取报告原始数据失败",
    canRestore: Boolean(payload?.data?.canRestore)
  }
}

const fetchReportData = async () => {
  loading.value = true
  loaded.value = false
  loadError.value = ""
  canRestoreSource.value = false
  try {
    const res = await checkReportDataApi({ id: route.query.id })
    reportJson.value = res.data || {}
    isRecoveredPlaceholder.value = Boolean(reportJson.value?.sourceRecovery?.isRecoveredPlaceholder)
    loaded.value = true
    getErrorQuestionWarnList()
  } catch (error) {
    const failure = resolveLoadFailure(error)
    reportJson.value = {}
    isRecoveredPlaceholder.value = false
    loadError.value = failure.message
    canRestoreSource.value = failure.canRestore
    console.error("读取报告原始数据失败", error)
  } finally {
    loading.value = false
  }
}

const reGetReport = async () => {
  reportFixed.value = false
  await fetchReportData()
}

const loadReportData = async () => {
  anyObj.type = route.query.type
  anyObj.id = route.query.id
  anyObj.name = route.query.name
  anyObj.user = route.query.user
  anyObj.date = route.query.date
  await fetchReportData()
}

const clearRestoreFile = () => {
  restoreFile.value = null
  restoreFileList.value = []
}

const openRestoreDialog = () => {
  clearRestoreFile()
  restoreVisible.value = true
}

const handleRestoreFileChange = (file) => {
  const raw = file?.raw
  clearRestoreFile()
  if (!raw) return
  if (!raw.name.toLowerCase().endsWith(".json")) {
    ElMessage.error("仅支持上传 JSON 文件")
    return
  }
  if (raw.size > 200 * 1024 * 1024) {
    ElMessage.error("报告原始 JSON 文件不能超过 200MB")
    return
  }
  restoreFile.value = raw
  restoreFileList.value = [file]
}

const handleRestoreFileExceed = () => {
  ElMessage.warning("每次只能选择一个报告原始 JSON 文件")
}

const submitRestoreSource = async () => {
  if (!restoreFile.value) {
    ElMessage.warning("请先选择报告原始 JSON 文件")
    return
  }

  restoring.value = true
  try {
    const formData = new FormData()
    formData.append("id", String(route.query.id || ""))
    formData.append("file", restoreFile.value)
    await restoreReportSourceApi(formData)
    ElMessage.success("报告原始文件恢复成功")
    restoreVisible.value = false
    clearRestoreFile()
    await fetchReportData()
  } catch (error) {
    console.error("恢复报告原始文件失败", error)
  } finally {
    restoring.value = false
  }
}
onMounted(() => {
  void loadReportData()
  watch([() => reportJson.value], getErrorQuestionWarnList, { immediate: true, deep: true })
})

watch(
  () => route.fullPath,
  () => {
    void loadReportData()
  }
)
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" class="test-check">
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
          <el-text v-if="loaded && isRecoveredPlaceholder" size="large" type="warning">恢复版报告</el-text>
          <el-text v-else-if="loaded && !hasQuestion && !hasError" size="large" style="color: green">测试正常</el-text>
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
        <el-button v-if="reportFixed && loaded" icon="Refresh" @click="reGetReport">重置所有更改</el-button>
      </div>
      <el-alert
        v-if="loaded && isRecoveredPlaceholder"
        class="recovery-warning"
        type="warning"
        :closable="false"
        show-icon
        title="当前显示的是根据数据库元数据生成的恢复版报告"
        :description="
          reportJson.sourceRecovery?.message ||
          '原始报告 JSON 和检测图片缺失。当前内容仅用于恢复页面查看，不能代替原始检测结果。'
        "
      />
      <div v-loading="loading" class="report-preview-shell">
        <report-preview v-if="loaded" v-model:preview-list="reportJson" mode="check" style="width: 100vw" />
        <el-result v-else-if="loadError && !loading" icon="error" title="无法读取报告原始数据" :sub-title="loadError">
          <template #extra>
            <el-button icon="Refresh" @click="reGetReport">重新读取</el-button>
            <el-button v-if="canRestoreSource" type="primary" icon="Upload" @click="openRestoreDialog">
              恢复原始 JSON
            </el-button>
          </template>
        </el-result>
      </div>
      <div style="display: flex; align-items: center">
        <div v-if="!hasQuestion">
          <el-button :disabled="!loaded || loading" icon="Check" size="large" type="success" @click="handlePass">
            审核通过
          </el-button>
          <el-button
            :disabled="!loaded || loading"
            icon="Close"
            size="large"
            type="danger"
            @click="feedbackVisible = true"
          >
            审核未通过
          </el-button>
        </div>
        <div v-else>
          <el-button :disabled="!loaded || loading" size="large" type="warning" @click="questionDialogVisible = true">
            生成疑问工单
          </el-button>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="restoreVisible"
      title="恢复报告原始 JSON"
      width="520px"
      destroy-on-close
      :close-on-click-modal="false"
      @closed="clearRestoreFile"
    >
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="请选择生成该报告时保存的原始 JSON 文件。恢复成功后，系统会重新加载报告内容。"
      />
      <el-upload
        v-model:file-list="restoreFileList"
        class="restore-upload"
        drag
        accept=".json,application/json"
        :auto-upload="false"
        :limit="1"
        :on-change="handleRestoreFileChange"
        :on-exceed="handleRestoreFileExceed"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽 JSON 文件到此处，或<em>点击选择文件</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 UTF-8 编码的 JSON 文件，最大 200MB</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button :disabled="restoring" @click="restoreVisible = false">取消</el-button>
        <el-button type="primary" :loading="restoring" :disabled="!restoreFile" @click="submitRestoreSource">
          恢复并重新读取
        </el-button>
      </template>
    </el-dialog>

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

<style scoped>
.report-preview-shell {
  display: flex;
  min-height: 280px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color);
}

.report-preview-shell :deep(.el-result) {
  width: 100%;
}

.recovery-warning {
  margin-top: 12px;
}

.restore-upload {
  margin-top: 18px;
}

.restore-upload :deep(.el-upload),
.restore-upload :deep(.el-upload-dragger) {
  width: 100%;
}
</style>
