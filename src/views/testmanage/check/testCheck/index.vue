<template>
  <div class="app-container">
    <el-card class="test-check">
      <!-- 审核测试工艺 -->
      <h2>审核测试工艺</h2>
      <el-form :inline="true" :model="anyObj" class="demo-form-inline" label-position="top" style="margin: 10px">
        <el-form-item label="工单号" style="width: 13%">
          <el-input v-model="anyObj.id" disabled />
        </el-form-item>
        <el-form-item label="测试名称" style="width: 380px">
          <el-input v-model="anyObj.name" disabled />
        </el-form-item>
        <el-form-item label="创建人" style="width: 14%">
          <el-input v-model="anyObj.user" disabled />
        </el-form-item>
        <el-form-item label="创建日期" style="width: 16%">
          <el-input v-model="anyObj.date" disabled />
        </el-form-item>
      </el-form>
      <div style="display: flex; margin-top: 10px" v-loading="loading">
        <div v-if="anyObj.type === '目检测试'">
          <el-divider style="margin-top: 0; margin-bottom: 10px" />
          <div style="display: flex; width: calc(100vw - 310px)" v-if="processJson.eyesBak.total.url !== ''">
            <div>
              <div style="display: flex; align-items: center">
                <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                    />
                  </svg>
                </el-icon>
                <el-text style="font-size: 18px">目检正面流程预览</el-text>
              </div>
              <process-preview
                style="width: calc(50vw - 155px)"
                v-model:preview-list="processJson.eyes"
                :has-plane="true"
              />
            </div>
            <div>
              <div style="display: flex; align-items: center">
                <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                    />
                  </svg>
                </el-icon>
                <el-text style="font-size: 18px">目检背面流程预览</el-text>
              </div>
              <process-preview
                style="width: calc(50vw - 155px)"
                v-model:preview-list="processJson.eyesBak"
                :has-plane="false"
              />
            </div>
          </div>
          <div style="display: flex; width: calc(100vw - 310px)" v-else>
            <div>
              <div style="display: flex; align-items: center">
                <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                    />
                  </svg>
                </el-icon>
                <el-text style="font-size: 18px">目检正面流程预览</el-text>
              </div>
              <process-preview
                style="width: calc(100vw - 310px)"
                v-model:preview-list="processJson.eyes"
                :has-plane="true"
              />
            </div>
          </div>
        </div>
        <div v-if="anyObj.type === 'X-Ray测试'">
          <div style="display: flex; align-items: center; padding: 6px">
            <div style="display: flex; align-items: center">
              <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                  />
                </svg>
              </el-icon>
              <el-text style="font-size: 18px">Xray流程预览</el-text>
            </div>
          </div>
          <el-divider style="margin-top: 0; margin-bottom: 0" />
          <div style="display: flex; width: calc(100vw - 310px)">
            <process-preview
              style="width: calc(100vw - 310px)"
              v-model:preview-list="processJson.xray"
              :has-plane="false"
            />
          </div>
        </div>
        <div v-if="anyObj.type === '功能性测试'">
          <div style="display: flex; align-items: center; padding: 6px">
            <div style="display: flex; align-items: center">
              <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                  />
                </svg>
              </el-icon>
              <el-text style="font-size: 18px">功能性测试程序下载</el-text>
            </div>
          </div>
          <el-divider style="margin-top: 0; margin-bottom: 0" />
        </div>
      </div>
      <el-button type="success" icon="Check" size="large" @click="handleCheckPass">审核通过</el-button>
      <el-button type="danger" size="large" icon="Close" @click="reasonVisiable = true">审核未通过</el-button>
    </el-card>
    <el-dialog align-center title="未通过理由" v-model="reasonVisiable">
      <el-input type="textarea" v-model="reason" :autosize="{ minRows: 4, maxRows: 4 }" />
      <template #footer>
        <el-button type="primary" @click="handleCheckBack">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue"
import ProcessPreview from "@/components/Check/ProcessPreview.vue"
import { useRoute, useRouter } from "vue-router"
import { checkEyesDataApi, checkXrayDataApi, checkFuncDataApi, checkPassApi } from "@/api/check"
import { useUserStore } from "@/store/modules/user"
import {ElMessageBox} from "element-plus";

const userStore = useUserStore()
const reason = ref("")
const reasonVisiable = ref(false)
const processJson = ref({
  eyes: {
    plane: {
      size: ""
    },
    total: {
      url: "",
      step: [],
      pic: []
    },
    area: []
  },
  eyesBak: {
    total: {
      url: "",
      step: [],
      pic: []
    },
    area: []
  },
  xray: {
    total: {
      url: "",
      step: [],
      pic: []
    },
    area: []
  }
})
const loading = ref(false)
const route = useRoute()
const router = useRouter()
const anyObj = reactive({
  id: "",
  type: "",
  name: "",
  user: "",
  date: ""
})
onMounted(() => {
  anyObj.type = route.query.process_type
  anyObj.id = route.query.testprocess_id
  anyObj.name = route.query.testprocess_name
  anyObj.user = route.query.user_name
  anyObj.date = route.query.testprocess_date
  console.log(route.query)
  if (anyObj.type === "目检测试") {
    loading.value = true
    checkEyesDataApi({ id: route.query.testprocess_id }).then((res) => {
      processJson.value = res.data
      loading.value = false
    })
  } else if (anyObj.type === "X-Ray测试") {
    loading.value = true
    checkXrayDataApi({ id: route.query.testprocess_id }).then((res) => {
      processJson.value = res.data
      loading.value = false
    })
  } else if (anyObj.type === "功能性测试") {
    loading.value = true
    checkFuncDataApi({ id: route.query.testprocess_id }).then((res) => {
      loading.value = false
    })
  }
})
const handleCheckPass = () => {
  ElMessageBox.confirm("确认审核通过吗？", "审核确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    checkPassApi({
      id: route.query.testprocess_id,
      user: userStore.userid,
      pass: true
    }).then(() => {
      router.push("/testmanage/check")
    })
  })
}
const handleCheckBack = () => {
  ElMessageBox.confirm("确认审核不通过吗？", "审核确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    checkPassApi({
      id: route.query.testprocess_id,
      pass: false,
      user: userStore.userid,
      reason: reason.value
    }).then(() => {
      router.push("/testmanage/check")
    })
  })
}
</script>
<style scoped lang="scss">
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

.test-check {
  position: relative;
}

.check-file {
  margin-top: 20px;
  width: 15vw;
  height: 200px;
  border: 1px dashed #ccc;
}
</style>
