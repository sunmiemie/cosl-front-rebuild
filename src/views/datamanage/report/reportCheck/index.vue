<script setup>
import { onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { checkReportDataApi } from "@/api/report"
import ReportPreview from "@/components/Check/ReportPreview.vue"
import { ElMessageBox } from "element-plus"

const reportJson = ref({})
const hasError = ref(false)
const errorVisible = ref(false)
const questionVisible = ref(false)
const hasQuestion = ref(false)
const loading = ref(false)
const loaded = ref(false)
const route = useRoute()
const router = useRouter()
const errorList = ref([])
const questionList = ref([])
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
const errorPass = async (obj, index_) => {
  ElMessageBox.confirm("确认设置为通过吗？", "通过确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (obj.type === "eyes") {
      if (obj.position === "total") {
        errorList.value.splice(index_, 1)
        reportJson.value.json.threeD.eyes.total.stepList[obj.id - 1].pass = 1
        reportJson.value.json.threeD.eyes.total.errorList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (reportJson.value.json.threeD.eyes.total.errorList.length === 1) {
              reportJson.value.json.threeD.eyes.total.errorList = undefined
            } else {
              reportJson.value.json.threeD.eyes.total.errorList.splice(index, 1)
            }
          }
        })
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          errorList.value.splice(index_, 1)
          reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.errorList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.errorList.length === 1) {
                reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.errorList = undefined
              } else {
                reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
            }
          })
        } else if (obj.areaPosition === "detail") {
          errorList.value.splice(index_, 1)
          reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach(
            (item, index) => {
              if (item.id === obj.id) {
                if (
                  reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1
                ) {
                  reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList = undefined
                } else {
                  reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(
                    index,
                    1
                  )
                }
              }
            }
          )
        }
      }
    } else if (obj.type === "eyesBak") {
      if (obj.position === "total") {
        errorList.value.splice(index_, 1)
        reportJson.value.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 1
        reportJson.value.json.threeD.eyesBak.total.errorList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (reportJson.value.json.threeD.eyesBak.total.errorList.length === 1) {
              reportJson.value.json.threeD.eyesBak.total.errorList = undefined
            } else {
              reportJson.value.json.threeD.eyesBak.total.errorList.splice(index, 1)
            }
          }
        })
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          errorList.value.splice(index_, 1)
          reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.length === 1) {
                reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList = undefined
              } else {
                reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
            }
          })
        } else if (obj.areaPosition === "detail") {
          errorList.value.splice(index_, 1)
          reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass =
            1
          reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach(
            (item, index) => {
              if (item.id === obj.id) {
                if (
                  reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                    .length === 1
                ) {
                  reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList =
                    undefined
                } else {
                  reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(
                    index,
                    1
                  )
                }
              }
            }
          )
        }
      }
    } else if (obj.type === "xray") {
      if (obj.position === "total") {
        errorList.value.splice(index_, 1)
        reportJson.value.json.xray.total.stepList[obj.id - 1].pass = 1
        reportJson.value.json.xray.total.errorList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (reportJson.value.json.xray.total.errorList.length === 1) {
              reportJson.value.json.xray.total.errorList = undefined
            } else {
              reportJson.value.json.xray.total.errorList.splice(index, 1)
            }
          }
        })
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          errorList.value.splice(index_, 1)
          reportJson.value.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          reportJson.value.json.xray.area[obj.areaId - 1].general.errorList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (reportJson.value.json.xray.area[obj.areaId - 1].general.errorList.length === 1) {
                reportJson.value.json.xray.area[obj.areaId - 1].general.errorList = undefined
              } else {
                reportJson.value.json.xray.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
            }
          })
        } else if (obj.areaPosition === "detail") {
          errorList.value.splice(index_, 1)
          reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1) {
                reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList = undefined
              } else {
                reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(index, 1)
              }
            }
          })
        }
      }
    }
  })
}
const errorQuestion = (obj, index) => {
  console.log(obj)
}
const questionPass = (obj, index) => {
  console.log(obj)
}
const questionError = (obj, index) => {
  console.log(obj)
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
      if (item.includes("eyes")) {
        if (item.includes("total")) {
          getNestedValue(res.data, item).forEach((value) => {
            errorList.value.push({ type: "eyes", position: "total", id: value.id, content: value })
          })
        }
        if (item.includes("area")) {
          if (item.includes("general")) {
            getNestedValue(res.data, item).forEach((value) => {
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
            getNestedValue(res.data, item).forEach((value) => {
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
          getNestedValue(res.data, item).forEach((value) => {
            errorList.value.push({ type: "eyesBak", position: "total", id: value.id, content: value })
          })
        }
        if (item.includes("area")) {
          if (item.includes("general")) {
            getNestedValue(res.data, item).forEach((value) => {
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
            getNestedValue(res.data, item).forEach((value) => {
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
          getNestedValue(res.data, item).forEach((value) => {
            errorList.value.push({ type: "xray", position: "total", id: value.id, content: value })
          })
        }
        if (item.includes("area")) {
          if (item.includes("general")) {
            getNestedValue(res.data, item).forEach((value) => {
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
            getNestedValue(res.data, item).forEach((value) => {
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
    generateQuestionList(res.data).forEach((item) => {
      if (item.includes("eyes")) {
        if (item.includes("total")) {
          getNestedValue(res.data, item).forEach((value) => {
            questionList.value.push({ type: "eyes", position: "total", id: value.id, content: value })
          })
        }
        if (item.includes("area")) {
          if (item.includes("general")) {
            getNestedValue(res.data, item).forEach((value) => {
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
            getNestedValue(res.data, item).forEach((value) => {
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
          getNestedValue(res.data, item).forEach((value) => {
            questionList.value.push({ type: "eyesBak", position: "total", id: value.id, content: value })
          })
        }
        if (item.includes("area")) {
          if (item.includes("general")) {
            getNestedValue(res.data, item).forEach((value) => {
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
            getNestedValue(res.data, item).forEach((value) => {
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
          getNestedValue(res.data, item).forEach((value) => {
            questionList.value.push({ type: "xray", position: "total", id: value.id, content: value })
          })
        }
        if (item.includes("area")) {
          if (item.includes("general")) {
            getNestedValue(res.data, item).forEach((value) => {
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
            getNestedValue(res.data, item).forEach((value) => {
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
    console.log(errorList.value, questionList.value)
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
      <el-link
        v-if="hasError"
        :underline="false"
        size="large"
        style="font-size: 18px; margin-right: 20px"
        type="danger"
        @click="errorVisible = true"
        >存在缺陷
      </el-link>
      <el-link
        v-if="hasQuestion"
        :underline="false"
        size="large"
        style="font-size: 18px"
        type="warning"
        @click="questionVisible = true"
        >存在疑问
      </el-link>
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
    <el-dialog v-model="errorVisible" title="缺陷操作" width="80%">
      <el-table :data="errorList">
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
            <el-image v-for="img in scope.row.content.error.url" :key="img" :src="img" />
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作">
          <template #default="scope">
            <el-button type="success" @click="errorPass(scope.row, scope.$index)">通过</el-button>
            <el-button type="warning" @click="errorQuestion(scope.row, scope.$index)">疑问</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog v-model="questionVisible" title="疑问操作" width="80%">
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
            <el-image v-for="img in scope.row.content.question.url" :key="img" :src="img" />
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作">
          <template #default="scope">
            <el-button type="success" @click="questionPass(scope.row, scope.$index)">通过</el-button>
            <el-button type="danger" @click="questionError(scope.row, scope.$index)">缺陷</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
