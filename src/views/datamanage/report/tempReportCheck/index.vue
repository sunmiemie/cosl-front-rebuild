<script setup>
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  checkTempReportDataApi,
  checkTempReportFeedbackApi,
  checkTempReportPassApi,
  generateDevQuestionUnitApi
} from "@/api/report"
import { useUserStore } from "@/store/modules/user"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import TempReportPreview from "@/components/Check/TempReportPreview.vue"
import { ElMessageBox } from "element-plus"
import { appendJsonFile, buildFeedbackFile, buildQuestionFile, jsonToFile } from "@/utils/report-feedback"

const userStore = useUserStore()
const taskCenterStore = useTaskCenterStoreHook()

const feedbackList = ref([])
const feedbackReason = ref("")
const feedbackVisible = ref(false)
const reportFixed = ref(false)
const errorVisible = ref(false)
const questionVisible = ref(false)
const warnVisible = ref(false)
const questionDialogVisible = ref(false)

const reportJson = ref({})
const hasError = ref(false)
// 存在疑问
const hasQuestion = ref(false)
const hasWarning = ref(false)
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
const updateStatus = () => {
  console.log("update")
  hasError.value = false
  hasQuestion.value = false
  hasWarning.value = false

  if (route.query.type === "弓曲度测试") {
    if (reportJson.value.json.plane.leftPass === 2 || reportJson.value.json.plane.rightPass === 2) {
      hasError.value = true
    }
    if (reportJson.value.json.plane.leftPass === 3 || reportJson.value.json.plane.rightPass === 3) {
      hasQuestion.value = true
    }
  } else if (route.query.type === "3D检测" || route.query.type === "X-Ray测试") {
    reportJson.value.json.tempTest.forEach((item) => {
      if (item.pass === 2 || item.pass === 4) {
        hasError.value = true
      }
      if (item.pass === 3 || item.pass === 4) {
        hasQuestion.value = true
      }
      if ("warn" in item) {
        hasWarning.value = true
      }
    })
  }
}
const getErrorQuestionWarnList = () => {
  errorList.value = []
  questionList.value = []
  warnList.value = []
  stepList.value = []
  reportJson.value.json.tempTest.forEach((item) => {
    item.type = anyObj.type
    if (item.pass === 4 || item.pass === 2) {
      errorList.value.push(item)
    }
    if (item.pass === 4 || item.pass === 3) {
      questionList.value.push(item)
    }
    if ("warn" in item) {
      warnList.value.push(item)
    }
    stepList.value.push(item)
  })
}

// 缺陷项操作
// NOTE 缺陷项通过
const errorPass = (obj) => {
  ElMessageBox.confirm("设置为通过会移除该检测项,确认设置为通过吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).error
    errorList.value.forEach((item, index) => {
      if (item.id === obj.id) {
        errorList.value.splice(index, 1)
      }
    })
    if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 2) {
      reportJson.value.json.tempTest.splice(
        reportJson.value.json.tempTest.findIndex((item) => item.id === obj.id),
        1
      )
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "通过项"
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).desc = "通过"
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 4) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass = 3
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "疑问项"
    }
    if (errorList.value.length === 0) {
      errorVisible.value = false
    }
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
    if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 2) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id)["question"] =
        reportJson.value.json.tempTest.find((item) => item.id === obj.id).error
      delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).error
      errorList.value.forEach((item, index) => {
        if (item.id === obj.id) {
          errorList.value.splice(index, 1)
        }
      })
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 4) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).question.desc +=
        "\n" + reportJson.value.json.tempTest.find((item) => item.id === obj.id).error.desc
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).question.url = reportJson.value.json.tempTest
        .find((item) => item.id === obj.id)
        .question.url.concat(reportJson.value.json.tempTest.find((item) => item.id === obj.id).error.url)
      delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).error
      errorList.value.forEach((item, index) => {
        if (item.id === obj.id) {
          errorList.value.splice(index, 1)
        }
      })
    }
    reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass = 3
    if (errorList.value.length === 0) {
      errorVisible.value = false
    }
  })
}

// 疑问项操作
// NOTE 疑问项通过
const questionPass = (obj) => {
  ElMessageBox.confirm("设置为通过会移除该检测项,确认设置为通过吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).question
    questionList.value.forEach((item, index) => {
      if (item.id === obj.id) {
        questionList.value.splice(index, 1)
      }
    })
    if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 3) {
      reportJson.value.json.tempTest.splice(
        reportJson.value.json.tempTest.findIndex((item) => item.id === obj.id),
        1
      )
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 4) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass = 2
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "缺陷项"
    }
    if (questionList.value.length === 0) {
      questionVisible.value = false
    }
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
    if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 3) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id)["error"] = reportJson.value.json.tempTest.find(
        (item) => item.id === obj.id
      ).question
      delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).question
      questionList.value.forEach((item, index) => {
        if (item.id === obj.id) {
          questionList.value.splice(index, 1)
        }
      })
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 4) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).error.desc +=
        "\n" + reportJson.value.json.tempTest.find((item) => item.id === obj.id).question.desc
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).error.url = reportJson.value.json.tempTest
        .find((item) => item.id === obj.id)
        .error.url.concat(reportJson.value.json.tempTest.find((item) => item.id === obj.id).question.url)
      delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).question
      questionList.value.forEach((item, index) => {
        if (item.id === obj.id) {
          questionList.value.splice(index, 1)
        }
      })
    }
    reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass = 2
    reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "缺陷项"
    if (questionList.value.length === 0) {
      questionVisible.value = false
    }
  })
}

//制程警示操作
// NOTE 制程警示通过
const warnPass = (obj) => {
  ElMessageBox.confirm("确认设置为通过吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    reportFixed.value = true
    delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).warn
    warnList.value.forEach((item, index) => {
      if (item.id === obj.id) {
        warnList.value.splice(index, 1)
      }
    })
    if (warnList.value.length === 0) {
      warnVisible.value = false
    }
    if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 1) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "合格项"
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 2) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "缺陷项"
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 3) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "疑问项"
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 4) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "缺陷-疑问项"
    }
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
    if (
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 1 ||
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 3
    ) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id)["error"] = reportJson.value.json.tempTest.find(
        (item) => item.id === obj.id
      ).warn
      delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).warn
      warnList.value.forEach((item, index) => {
        if (item.id === obj.id) {
          warnList.value.splice(index, 1)
        }
      })
    } else {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).error.desc +=
        "\n制程警示:" + reportJson.value.json.tempTest.find((item) => item.id === obj.id).warn.desc
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).error.url = reportJson.value.json.tempTest
        .find((item) => item.id === obj.id)
        .error.url.concat(reportJson.value.json.tempTest.find((item) => item.id === obj.id).warn.url)
      delete reportJson.value.json.tempTest.find((item) => item.id === obj.id).warn
      warnList.value.forEach((item, index) => {
        if (item.id === obj.id) {
          warnList.value.splice(index, 1)
        }
      })
    }
    if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 1) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass = 2
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "缺陷项"
    } else if (reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass === 3) {
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).pass = 4
      reportJson.value.json.tempTest.find((item) => item.id === obj.id).name = "缺陷-疑问项"
    }
    if (warnList.value.length === 0) {
      warnVisible.value = false
    }
  })
}

const checkPass = () => {
  loading.value = true
  const jsonString = JSON.stringify(reportJson.value)
  const blob = new Blob([jsonString], { type: "application/json" })
  const data = {
    id: anyObj.id,
    userId: userStore.userid,
    status: hasError.value === false ? 2 : 3
  }
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  appendJsonFile(formData, "file", reportFixed.value ? blob : null, "data.json")
  checkTempReportPassApi(formData).then((res) => {
    if (res.msg === "success") {
      loading.value = false
      void taskCenterStore.refresh(true)
      router.push({ name: "reportCheckList" })
    }
  })
}
const checkFeedback = () => {
  loading.value = true
  const blob_report = reportFixed.value ? jsonToFile(reportJson.value) : null
  const blob_feedback = buildFeedbackFile(feedbackList.value)
  const data = {
    id: anyObj.id,
    status: 1,
    reason: feedbackReason.value
  }
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  appendJsonFile(formData, "file_report", blob_report, "data_report.json")
  appendJsonFile(formData, "file_feedback", blob_feedback, "data_feedback.json")
  checkTempReportFeedbackApi(formData)
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
  generateDevQuestionUnitApi(formData).then((res) => {
    if (res.msg === "success") {
      loading.value = false
      void taskCenterStore.refresh(true)
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
    if (reportFixed.value) {
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
  checkTempReportDataApi({ id: route.query.id }).then((res) => {
    loaded.value = true
    loading.value = false
    reportJson.value = res.data
    getErrorQuestionWarnList()
    updateStatus()
  })
}

const loadReportData = async () => {
  loading.value = true
  anyObj.type = route.query.type
  anyObj.id = route.query.id
  anyObj.name = route.query.name
  anyObj.user = route.query.user
  anyObj.date = route.query.date
  await checkTempReportDataApi({ id: route.query.id }).then((res) => {
    loaded.value = true
    loading.value = false
    reportJson.value = res.data
    updateStatus()
    getErrorQuestionWarnList()
  })
}

onMounted(async () => {
  await loadReportData()
  watch([() => reportJson.value], getErrorQuestionWarnList, { immediate: true, deep: true })
  watch([() => reportJson.value], updateStatus, { immediate: true, deep: true })
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
    <el-card class="test-check">
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
          <el-text v-if="!hasError && !hasQuestion" size="large" style="color: green">测试正常</el-text>
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
            type="primary"
            @click="questionVisible = true"
            >存在疑问
          </el-link>
          <el-link
            v-if="hasWarning"
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
      <div
        v-loading="loading"
        style="
          display: flex;
          margin-top: 10px;
          border: #c0c4cc 1px solid;
          margin-bottom: 10px;
          min-height: 200px;
          width: 100%;
        "
      >
        <temp-report-preview v-if="loaded" v-model:preview-list="reportJson" class="temp-view" />
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
            <el-text
              >{{ errorList.value }}
              {{ scope.row.type }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="缺陷名称">
          <template #default="scope">
            <el-text> {{ scope.row.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="缺陷描述">
          <template #default="scope">
            <el-text> {{ scope.row.error.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="缺陷图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.error.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.error.url"
                :src="scope.row.error.url[0]"
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
              {{ scope.row.type }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="疑问名称">
          <template #default="scope">
            <el-text> {{ scope.row.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问描述">
          <template #default="scope">
            <el-text> {{ scope.row.question.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="疑问图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.question.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.question.url"
                :src="scope.row.question.url[0]"
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
              {{ scope.row.type }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="名称">
          <template #default="scope">
            <el-text> {{ scope.row.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="制程警示描述">
          <template #default="scope">
            <el-text> {{ scope.row.warn.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="制程警示图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.warn.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.warn.url"
                :src="scope.row.warn.url[0]"
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
        <el-button type="danger" :disabled="feedbackReason === ''" @click="handleFeedback">打回</el-button>
      </template>
    </el-dialog>
    <el-dialog v-else v-model="feedbackVisible" title="请选择打回项" width="80%" align-center>
      <el-table :data="stepList" height="400px" @selection-change="handleSelectionChange">
        <el-table-column type="selection" />
        <el-table-column label="测试类型" width="150">
          <template #default="scope">
            <el-text>
              {{ scope.row.type }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项名称">
          <template #default="scope">
            <el-text> {{ scope.row.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="测试结果" fixed="right" align="right">
          <template #default="scope">
            <el-text :type="scope.row.pass === 1 ? 'success' : scope.row.pass === 3 ? 'warning' : 'danger'">
              {{ scope.row.pass === 1 ? "通过" : scope.row.pass === 3 ? "疑问" : "未通过" }}
            </el-text>
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
        <el-button type="danger" :disabled="feedbackReason === '' || feedbackList.length === 0" @click="handleFeedback"
          >打回</el-button
        >
      </template>
    </el-dialog>

    <el-dialog v-model="questionDialogVisible" title="生成确认" width="80%" align-center>
      <el-table :data="questionList" max-height="70vh">
        <el-table-column label="测试类型">
          <template #default="scope">
            <el-text>
              {{ scope.row.type }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项">
          <template #default="scope">
            <el-text> {{ scope.row.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问描述">
          <template #default="scope">
            <el-text> {{ scope.row.question.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="留存图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.question.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.question.url"
                :src="scope.row.question.url[0]"
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
.temp-view {
  width: 100%;
}
</style>
