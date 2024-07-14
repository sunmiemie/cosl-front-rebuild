<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { questionUnitDataApi, questionOperateDataApi } from "@/api/questionunit"
import { checkReportDataApi, checkReportPassApi, getSingleReportDataApi } from "@/api/report"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"

const router = useRouter()
defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const userStore = useUserStore()
const loading = ref<boolean>(false)
const updateLoading = ref<boolean>(false)
const detailDrawer = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const currentReportId = ref<number>()
// 显示
const operatorDialog = ref<any>(false)
const questionLoading = ref<boolean>(false)
const canUpdate = ref<boolean>(false)
const viewerImg = ref("")
const viewerVisible = ref<boolean>(false)
const headers = ref([
  { prop: "questionunit_id", label: "疑问工单号", align: "center" },
  { prop: "testunit_id", label: "关联测试工单", align: "center" },
  { prop: "questionunit_name", label: "疑问工单名称", align: "center" },
  { prop: "questionunit_starttime", label: "生成时间", align: "center" },
  { prop: "questionunit_endtime", label: "结束时间", align: "center" },
  { prop: "user", label: "创建人", align: "center" },
  { prop: "operator", label: "处理人", align: "center" },
  { prop: "status", label: "工单状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<any>([])
const questionList = ref<any>([])
const reportJson = ref<any>([])
const searchData = reactive({
  id: "",
  status: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "详情", 2: "直接处理" }
    case "1":
      return { 1: "详情" }
    case "2":
      return { 1: "详情", 2: "查看报告" }
  }
}
const getTableData = () => {
  loading.value = true
  questionUnitDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id,
    status: searchData.status
  })
    .then((res) => {
      TableData.value = res.list
      paginationData.total = res.total
      for (let i = 0; i < TableData.value.length; i++) {
        TableData.value[i].link = defineLink(TableData.value[i].status)
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const handleLink = (data: any, i: string) => {
  if (i === "详情") {
    detailDrawer.value = true
    questionLoading.value = true
    questionOperateDataApi({ id: data["questionunit_id"] })
      .then((res) => {
        questionList.value = res.data
      })
      .finally(() => {
        questionLoading.value = false
      })
  } else if (i === "直接处理") {
    operatorDialog.value = true
    questionLoading.value = true
    currentReportId.value = data["report_id"]
    questionOperateDataApi({ id: data["questionunit_id"] })
      .then((res) => {
        questionList.value = res.data
      })
      .finally(() => {
        questionLoading.value = false
      })
  } else if (i === "查看报告") {
    getSingleReportDataApi({ id: data["report_id"] }).then((res) => {
      router.push({ name: "reportView", query: res.data })
    })
  }
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
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
const resetSearch = () => {
  searchData.id = ""
  searchData.status = ""
  handleSearch()
}
const uploadFunc = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/png, image/jpeg, image/gif, image/jpg" // 限制选择的文件类型为 .pdf, .png, .zip, .jpg
    input.style.display = "none"
    document.body.appendChild(input)
    input.click()
    input.onchange = (e) => {
      const file = e.target["files"][0]
      const reader = new FileReader()
      reader.onload = (e) => {
        let data
        if (typeof e.target.result === "object") {
          data = window["URL"].createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        resolve(data)
      }
      reader.onerror = (e) => {
        reject(e)
      }
      reader.readAsDataURL(file)
    }
  })
}
const uploadNew = (index) => {
  if (questionList.value[index].content.question.url.length < 5) {
    uploadFunc().then((data) => {
      questionList.value[index].content.question.url.push(data)
    })
  } else {
    ElMessage.error("最多上传5张图片")
  }
}
const checkCanUpdate = () => {
  canUpdate.value = !questionList.value.every((item) => item.pass !== undefined)
}
const questionPass = (obj) => {
  if (obj.type === "eyes") {
    if (obj.position === "total") {
      reportJson.value.json.threeD.eyes.total.stepList[obj.id - 1].pass = 1
      reportJson.value.json.threeD.eyes.total.questionList.forEach((item, index) => {
        if (item.id === obj.id) {
          if (reportJson.value.json.threeD.eyes.total.questionList.length === 1) {
            delete reportJson.value.json.threeD.eyes.total.questionList
          } else {
            reportJson.value.json.threeD.eyes.total.questionList.splice(index, 1)
          }
        }
      })
    } else if (obj.position === "area") {
      if (obj.areaPosition === "general") {
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList.length === 1) {
              delete reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList
            } else {
              reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList.splice(index, 1)
            }
          }
        })
      } else if (obj.areaPosition === "detail") {
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach(
          (item, index) => {
            if (item.id === obj.id) {
              if (
                reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length ===
                1
              ) {
                delete reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(
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
      reportJson.value.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 1
      reportJson.value.json.threeD.eyesBak.total.questionList.forEach((item, index) => {
        if (item.id === obj.id) {
          if (reportJson.value.json.threeD.eyesBak.total.questionList.length === 1) {
            delete reportJson.value.json.threeD.eyesBak.total.questionList
          } else {
            reportJson.value.json.threeD.eyesBak.total.questionList.splice(index, 1)
          }
        }
      })
    } else if (obj.position === "area") {
      if (obj.areaPosition === "general") {
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.length === 1) {
              delete reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList
            } else {
              reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.splice(index, 1)
            }
          }
        })
      } else if (obj.areaPosition === "detail") {
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach(
          (item, index) => {
            if (item.id === obj.id) {
              if (
                reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
                  .length === 1
              ) {
                delete reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(
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
      reportJson.value.json.xray.total.stepList[obj.id - 1].pass = 1
      reportJson.value.json.xray.total.questionList.forEach((item, index) => {
        if (item.id === obj.id) {
          if (reportJson.value.json.xray.total.questionList.length === 1) {
            delete reportJson.value.json.xray.total.questionList
          } else {
            reportJson.value.json.xray.total.questionList.splice(index, 1)
          }
        }
      })
    } else if (obj.position === "area") {
      if (obj.areaPosition === "general") {
        reportJson.value.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
        reportJson.value.json.xray.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (reportJson.value.json.xray.area[obj.areaId - 1].general.questionList.length === 1) {
              delete reportJson.value.json.xray.area[obj.areaId - 1].general.questionList
            } else {
              reportJson.value.json.xray.area[obj.areaId - 1].general.questionList.splice(index, 1)
            }
          }
        })
      } else if (obj.areaPosition === "detail") {
        reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
        reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1) {
              delete reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
            } else {
              reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
            }
          }
        })
      }
    }
  }
}
const questionError = (obj) => {
  if (obj.type === "eyes") {
    if (obj.position === "total") {
      reportJson.value.json.threeD.eyes.total.stepList[obj.id - 1].pass = 2
      if (reportJson.value.json.threeD.eyes.total.errorList === undefined) {
        reportJson.value.json.threeD.eyes.total["errorList"] = []
      }
      reportJson.value.json.threeD.eyes.total.questionList.forEach((item, index) => {
        if (item.id === obj.id) {
          const { question: error, ...rest } = obj.content
          const newObj = { error, ...rest }
          reportJson.value.json.threeD.eyes.total.errorList.push(newObj)
          if (reportJson.value.json.threeD.eyes.total.questionList.length === 1) {
            delete reportJson.value.json.threeD.eyes.total.questionList
          } else {
            reportJson.value.json.threeD.eyes.total.questionList.splice(index, 1)
          }
        }
      })
    } else if (obj.position === "area") {
      if (obj.areaPosition === "general") {
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
        if (reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.errorList === undefined) {
          reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general["errorList"] = []
        }
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            const { question: error, ...rest } = obj.content
            const newObj = { error, ...rest }
            reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.errorList.push(newObj)
            if (reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList.length === 1) {
              delete reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList
            } else {
              reportJson.value.json.threeD.eyes.area[obj.areaId - 1].general.questionList.splice(index, 1)
            }
          }
        })
      } else if (obj.areaPosition === "detail") {
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
        if (reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
          reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
        }
        reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach(
          (item, index) => {
            if (item.id === obj.id) {
              const { question: error, ...rest } = obj.content
              const newObj = { error, ...rest }
              reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
              if (
                reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length ===
                1
              ) {
                delete reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                reportJson.value.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(
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
      reportJson.value.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 2
      if (reportJson.value.json.threeD.eyesBak.total.errorList === undefined) {
        reportJson.value.json.threeD.eyesBak.total["errorList"] = []
      }
      reportJson.value.json.threeD.eyesBak.total.questionList.forEach((item, index) => {
        if (item.id === obj.id) {
          const { question: error, ...rest } = obj.content
          const newObj = { error, ...rest }
          reportJson.value.json.threeD.eyesBak.total.errorList.push(newObj)
          if (reportJson.value.json.threeD.eyesBak.total.questionList.length === 1) {
            delete reportJson.value.json.threeD.eyesBak.total.questionList
          } else {
            reportJson.value.json.threeD.eyesBak.total.questionList.splice(index, 1)
          }
        }
      })
    } else if (obj.position === "area") {
      if (obj.areaPosition === "general") {
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
        if (reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList === undefined) {
          reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general["errorList"] = []
        }
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            const { question: error, ...rest } = obj.content
            const newObj = { error, ...rest }
            reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.push(newObj)
            if (reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.length === 1) {
              delete reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList
            } else {
              reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.splice(index, 1)
            }
          }
        })
      } else if (obj.areaPosition === "detail") {
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
        if (
          reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined
        ) {
          reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
        }
        reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach(
          (item, index) => {
            if (item.id === obj.id) {
              const { question: error, ...rest } = obj.content
              const newObj = { error, ...rest }
              reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
              if (
                reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
                  .length === 1
              ) {
                delete reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                reportJson.value.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(
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
      reportJson.value.json.xray.total.stepList[obj.id - 1].pass = 2
      if (reportJson.value.json.xray.total.errorList === undefined) {
        reportJson.value.json.xray.total["errorList"] = []
      }
      reportJson.value.json.xray.total.questionList.forEach((item, index) => {
        if (item.id === obj.id) {
          const { question: error, ...rest } = obj.content
          const newObj = { error, ...rest }
          reportJson.value.json.xray.total.errorList.push(newObj)
          if (reportJson.value.json.xray.total.questionList.length === 1) {
            delete reportJson.value.json.xray.total.questionList
          } else {
            reportJson.value.json.xray.total.questionList.splice(index, 1)
          }
        }
      })
    } else if (obj.position === "area") {
      if (obj.areaPosition === "general") {
        reportJson.value.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
        if (reportJson.value.json.xray.area[obj.areaId - 1].general.errorList === undefined) {
          reportJson.value.json.xray.area[obj.areaId - 1].general["errorList"] = []
        }
        reportJson.value.json.xray.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            const { question: error, ...rest } = obj.content
            const newObj = { error, ...rest }
            reportJson.value.json.xray.area[obj.areaId - 1].general.errorList.push(newObj)
            if (reportJson.value.json.xray.area[obj.areaId - 1].general.questionList.length === 1) {
              delete reportJson.value.json.xray.area[obj.areaId - 1].general.questionList
            } else {
              reportJson.value.json.xray.area[obj.areaId - 1].general.questionList.splice(index, 1)
            }
          }
        })
      } else if (obj.areaPosition === "detail") {
        reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
        if (reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
          reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
        }
        reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            const { question: error, ...rest } = obj.content
            const newObj = { error, ...rest }
            reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
            if (reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1) {
              delete reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
            } else {
              reportJson.value.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
            }
          }
        })
      }
    }
  }
}

const handleOperate = () => {
  ElMessageBox.confirm("确认以该结果处理疑问吗？", "确认处理", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    updateLoading.value = true
    checkReportDataApi({ id: currentReportId.value }).then((res) => {
      console.log(res.data)
      // 深拷贝res.data
      reportJson.value = JSON.parse(JSON.stringify(res.data))
      questionList.value.forEach((item) => {
        if (item["pass"] === true) {
          delete item["pass"]
          questionPass(item)
        } else if (item["pass"] === false) {
          delete item["pass"]
          questionError(item)
        }
      })
      const jsonString = JSON.stringify(reportJson.value)
      const blob = new Blob([jsonString], { type: "application/json" })
      const data = {
        id: currentReportId.value,
        status: !hasProperty(reportJson.value, "errorList") ? 2 : 3,
        userId: userStore.userid,
        mode: "question"
      }
      const formData = new FormData()
      for (const key in data) {
        formData.append(key, data[key])
      }
      formData.append("file", blob, "data.json")
      checkReportPassApi(formData)
        .then((res) => {
          if (res.msg === "success") {
            loading.value = false
            operatorDialog.value = false
          }
        })
        .finally(() => {
          getTableData()
          updateLoading.value = false
        })
    })
  })
}
const openPreview = (item) => {
  viewerImg.value = item
  viewerVisible.value = true
}
/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
watch([() => questionList.value], checkCanUpdate, { immediate: true, deep: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="疑问工单号" prop="number">
          <el-input v-model="searchData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="工单状态" prop="username">
          <el-select v-model="searchData.status" placeholder="请选择" style="width: 200px">
            <el-option label="待处理" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="处理完成" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-tooltip content="刷新当前页">
            <el-button icon="RefreshRight" circle type="primary" @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :column-data="headers" :tableData="TableData" stripe>
          <template #status="{ row }">
            <el-tag v-if="row['status'] === '0'" type="warning"> 待处理</el-tag>
            <el-tag v-if="row['status'] === '1'" type="primary"> 处理中</el-tag>
            <el-tag v-if="row['status'] === '2'" type="success"> 处理完成</el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row['link']" class="el-link" type="primary" @click="handleLink(row, i)" :key="i">{{
              i
            }}</el-link>
          </template>
        </TableComponent>
      </div>

      <div class="pager-wrapper">
        <el-pagination
          :currentPage="paginationData.currentPage"
          :layout="paginationData.layout"
          :page-size="paginationData.pageSize"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <el-drawer v-model="detailDrawer" title="疑问详情" size="60%" @close="questionList = []">
      <el-table v-loading="questionLoading" :data="questionList">
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
            <el-text style="margin-right: 5px; width: 15px">共{{ scope.row.content.question.url.length }}张</el-text>
            <el-image
              :src="scope.row.content.question.url[0]"
              :preview-src-list="scope.row.content.question.url"
              fit="contain"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
    <el-dialog v-model="operatorDialog" width="80%" title="直接处理" @close="questionList = []">
      <el-table v-loading="questionLoading" :data="questionList">
        <el-table-column label="测试类型" width="120">
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
        <el-table-column align="center" label="留存图片" width="550">
          <template #default="scope">
            <div style="display: flex" v-if="scope.row['pass'] !== true">
              <el-text style="margin-right: 5px; width: 15px">共{{ scope.row.content.question.url.length }}张</el-text>
              <el-link style="margin-left: 5px; width: 10px" :underline="false" @click="uploadNew(scope.$index)"
                >上传新图片</el-link
              >
              <div class="el-upload-list el-upload-list&#45;&#45;picture-card">
                <div
                  v-for="(item, index) in scope.row.content.question.url"
                  :key="item"
                  class="el-upload-list__item is-success animated"
                >
                  <el-image
                    :src="item"
                    alt=""
                    class="el-upload-list__item-thumbnail"
                    fit="contain"
                    :preview-src-list="[item]"
                  />
                  <i class="el-icon-close" />
                  <span class="el-upload-list__item-actions">
                    <!-- 预览 -->
                    <span class="el-upload-list__item-preview" @click="openPreview(item)">
                      <i class="el-icon el-icon--zoom-in">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                          <path
                            fill="currentColor"
                            d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704zm-32-384v-96a32 32 0 0 1 64 0v96h96a32 32 0 0 1 0 64h-96v96a32 32 0 0 1-64 0v-96h-96a32 32 0 0 1 0-64h96z"
                          />
                        </svg>
                      </i>
                    </span>
                    <!-- 删除 -->
                    <span class="el-upload-list__item-delete" @click="scope.row.content.question.url.splice(index, 1)">
                      <i class="el-icon el-icon--zoom-in">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                          <path
                            fill="currentColor"
                            d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                          />
                        </svg>
                      </i>
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <el-text v-else>设置通过无需留存图片</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button-group is-button>
              <el-button :type="scope.row['pass'] === true ? 'success' : ''" @click="scope.row['pass'] = true"
                >通过</el-button
              >
              <el-button :type="scope.row['pass'] === false ? 'danger' : ''" @click="scope.row['pass'] = false"
                >缺陷</el-button
              >
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="operatorDialog = false">取消</el-button>
        <el-button
          :disabled="canUpdate"
          type="primary"
          @click="handleOperate"
          v-loading.fullscreen.lock="updateLoading"
          element-loading-text="处理中,请勿操作..."
          >确定</el-button
        >
      </template>
    </el-dialog>
    <el-dialog v-model="viewerVisible" width="60%">
      <el-image :src="viewerImg" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.el-link {
  margin-right: 8px;
}

.fault-img {
  width: 50px;
  height: 50px;
  position: absolute;
  right: 10%;
  top: 26%;
}

.default-success {
  margin-top: 20px;
  width: 80%;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  justify-content: space-around;
}
</style>
