<template>
  <div class="app-container">
    <el-card class="test-check">
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
      <div v-loading="loading" style="display: flex; margin-top: 10px">
        <div v-if="anyObj.type === '目检测试'">
          <el-divider style="margin-top: 0; margin-bottom: 10px" />
          <div v-if="processJson.eyesBak.total.url !== ''" style="display: flex; width: calc(100vw - 310px)">
            <div>
              <div style="display: flex; align-items: center">
                <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                      d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                    />
                  </svg>
                </el-icon>
                <el-text style="font-size: 18px">目检正面流程预览</el-text>
              </div>
              <process-preview
                v-model:preview-list="processJson.eyes"
                :has-plane="true"
                style="width: calc(50vw - 155px)"
              />
            </div>
            <div>
              <div style="display: flex; align-items: center">
                <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                      d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                    />
                  </svg>
                </el-icon>
                <el-text style="font-size: 18px">目检背面流程预览</el-text>
              </div>
              <process-preview
                v-model:preview-list="processJson.eyesBak"
                :has-plane="false"
                style="width: calc(50vw - 155px)"
              />
            </div>
          </div>
          <div v-else style="display: flex; width: calc(100vw - 310px)">
            <div>
              <div style="display: flex; align-items: center">
                <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                      d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                    />
                  </svg>
                </el-icon>
                <el-text style="font-size: 18px">目检正面流程预览</el-text>
              </div>
              <process-preview
                v-model:preview-list="processJson.eyes"
                :has-plane="true"
                style="width: calc(100vw - 310px)"
              />
            </div>
          </div>
        </div>
        <div v-if="anyObj.type === 'X-Ray测试'">
          <div style="display: flex; align-items: center; padding: 6px">
            <div style="display: flex; align-items: center">
              <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none" />
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
              v-model:preview-list="processJson.xray"
              :has-plane="false"
              style="width: calc(100vw - 310px)"
            />
          </div>
        </div>
        <div v-if="anyObj.type === '功能性测试'">
          <div style="display: flex; align-items: center; padding: 6px">
            <div style="display: flex; align-items: center">
              <div style="display: flex; flex-direction: column">
                <div>
                  <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path
                        d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"
                      />
                    </svg>
                  </el-icon>
                  <el-text style="font-size: 18px">功能性测试程序查看</el-text>
                </div>
                <v-ace-editor v-model:value="codeContent" :options="options" class="edit_box" lang="json" />
              </div>
            </div>
          </div>
          <el-divider style="margin-top: 10px; margin-bottom: 10px" />
        </div>
      </div>
      <el-button icon="Check" size="large" type="success" @click="handleCheckPass">审核通过</el-button>
      <el-button icon="Close" size="large" type="danger" @click="reasonVisiable = true">审核未通过</el-button>
    </el-card>
    <el-dialog v-model="reasonVisiable" align-center title="未通过理由">
      <el-input v-model="reason" :autosize="{ minRows: 4, maxRows: 4 }" type="textarea" />
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
import { ElMessageBox } from "element-plus"
import { VAceEditor } from "vue3-ace-editor"
import "./vace.config"

const codeContent = ref("")
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
const options = reactive({
  useWorker: true, // 启用语法检查,必须为true
  enableBasicAutocompletion: true, // 自动补全
  enableLiveAutocompletion: true, // 智能补全
  enableSnippets: true, // 启用代码段
  showPrintMargin: false, // 去掉灰色的线，printMarginColumn
  highlightActiveLine: true, // 高亮行
  highlightSelectedWord: true, // 高亮选中的字符
  tabSize: 4, // tab锁进字符
  fontSize: 14, // 设置字号
  wrap: false, // 是否换行
  readOnly: true, // 是否可编辑
  minLines: 1, // 最小行数，minLines和maxLines同时设置之后，可以不用给editor再设置高度
  maxLines: 25 // 最大行数
})
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
  if (anyObj.type === "目检测试") {
    loading.value = true
    checkEyesDataApi({ id: route.query.testprocess_id }).then((res) => {
      processJson.value = res.data.json
      loading.value = false
    })
  } else if (anyObj.type === "X-Ray测试") {
    loading.value = true
    checkXrayDataApi({ id: route.query.testprocess_id }).then((res) => {
      processJson.value = res.data.json
      loading.value = false
    })
  } else if (anyObj.type === "功能性测试") {
    loading.value = true
    checkFuncDataApi({ id: route.query.testprocess_id }).then((res) => {
      console.log(res)
      codeContent.value = res.data
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
<style lang="scss" scoped>
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

.edit_box {
  margin-top: 20px;
  width: calc(100vw - 310px);
  .ace_scroller .ace_content .ace_placeholder {
    color: var(--grey-text-color1) !important;
  }
}
</style>
