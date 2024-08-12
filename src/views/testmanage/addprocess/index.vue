<!--新增流程-->

<template>
  <div class="app-container">
    <el-affix :offset="90">
      <el-button v-if="testStore.board_model_id !== ''" type="primary" style="margin-left: 10px"
        >当前编辑电路板：{{ testStore.board_model_name !== "" ? testStore.board_model_name : "未定义" }}</el-button
      >
      <el-button v-if="testStore.test_process_id !== ''" type="primary" style="margin-left: 10px"
        >当前修改工艺ID：{{ testStore.test_process_id }}</el-button
      >
      <div style="display: flex; margin-top: 20px">
        <el-card v-for="(item, index) in feedBackList" :key="item" style="width: 250px; margin-right: 10px">
          <el-text>第{{ index + 1 }}次审核意见:</el-text>
          <br />
          <el-text>{{ item }}</el-text>
        </el-card>
      </div>
    </el-affix>
    <header>
      <el-row class="mb-4">
        <div class="selectTypeBtn">
          <el-button
            v-show="testStore.test_process_id === '' || testType.name === testTypeShow"
            :disabled="testType.name === testTypeShow"
            v-for="testType in testTypeList"
            :key="testType.number"
            :type="testType.name === testTypeShow ? 'success' : ''"
            class="selectBtn"
            @click="TestType(testType.name, testType.number)"
            >{{ testType.name }}
          </el-button>
        </div>
      </el-row>
    </header>
    <div class="test-content">
      <el-card v-if="testTypeShow === ''" class="flex-card" style="margin: 20px">
        <el-empty description="请选择测试类型" />
      </el-card>
      <!-- 功能性测试 -->
      <el-card v-else-if="testTypeShow === '功能性测试'" class="flex-card" style="margin: 20px">
        <el-row>
          <el-col :span="7">
            <el-text size="large">1.填写测试工艺信息</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="工艺名称:">
                <el-input v-model="form.name" placeholder="请填写" style="margin-right: 80px" type="text" />
              </el-form-item>
              <el-form-item label="工艺版本:" prop="version">
                <el-input
                  v-model="form.version"
                  placeholder="请填写"
                  style="margin-right: 80px"
                  type="text"
                  @change="handleVision"
                >
                  <template #prepend>V</template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="8">
            <el-text size="large">2.选择绑定设备</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="绑定夹具:">
                <el-select v-model="form.fixtureId" filterable placeholder="请选择(输入可搜索)" style="width: 190px">
                  <el-option v-for="item in fixtureModelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="绑定主机:">
                <el-select v-model="form.hostId" filterable placeholder="请选择(输入可搜索)" style="width: 190px">
                  <el-option
                    v-for="item in psiModelList"
                    :key="item.psimodel_id"
                    :label="item.psimodel_name"
                    :value="item.psimodel_id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="其他设备:">
                <el-select
                  v-model="form.equipmentId"
                  filterable
                  multiple
                  placeholder="请选择(输入可搜索)"
                  style="width: 190px"
                >
                  <el-option v-for="item in equipmentModelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="8">
            <el-text class="mx-1" size="large">3.上传测试脚本</el-text>
            <el-upload
              v-model:file-list="fileList"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
              :show-file-list="true"
              drag
              style="margin: 10px 0"
            >
              <el-icon class="el-icon--upload">
                <upload-filled />
              </el-icon>
              <div class="el-upload__text">拖拽文件至此或 <em>点击上传文件</em></div>
              <template #tip>
                <div class="el-upload__tip">仅支持上传.robot文件</div>
              </template>
            </el-upload>
          </el-col>
        </el-row>
        <template #footer>
          <div style="display: flex; justify-content: flex-end" v-if="testStore.test_process_id === ''">
            <el-button @click="router.push('/testmanage/testprocess')">取消</el-button>
            <el-button style="margin-left: 10px" type="primary" @click="handleAddFuncProcess">确认新增</el-button>
          </div>
          <div style="display: flex; justify-content: flex-end" v-if="testStore.test_process_id !== ''">
            <el-button @click="router.push('/testmanage/testprocess')">取消</el-button>
            <el-button style="margin-left: 10px" type="primary" @click="handleUpdateFuncProcess">确认修改</el-button>
          </div>
        </template>
      </el-card>
      <!--目检测试编辑-->
      <el-card v-else-if="testTypeShow === '目检测试'" style="margin: 20px">
        <el-row>
          <el-col :span="4">
            <el-text size="large">1.填写测试工艺信息</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="工艺名称:">
                <el-input v-model="form.name" placeholder="请填写" type="text" />
              </el-form-item>
              <el-form-item label="工艺版本:">
                <el-input v-model="form.version" placeholder="请填写" type="text" @change="handleVision">
                  <template #prepend>V</template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <!-- 增加测试工艺步骤 -->
          <el-col :span="18" style="margin-left: 20px; height: auto">
            <el-text size="large">2.增加目检测试工艺</el-text>
            <el-upload
              v-model:file-list="fileList"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
              :show-file-list="true"
              drag
            >
              <el-icon class="el-icon--upload">
                <upload-filled />
              </el-icon>
              <div class="el-upload__text">拖拽文件至此或 <em>点击上传文件</em></div>
              <template #tip>
                <div class="el-upload__tip">仅支持上传JSON文件</div>
              </template>
            </el-upload>
          </el-col>
        </el-row>
        <template #footer>
          <div style="display: flex; justify-content: flex-end" v-if="testStore.test_process_id === ''">
            <el-button @click="router.push('/testmanage/testprocess')">取消</el-button>
            <el-button style="margin-left: 10px" type="primary" @click="handleAddEyesProcess">确认新增</el-button>
          </div>
          <div style="display: flex; justify-content: flex-end" v-if="testStore.test_process_id !== ''">
            <el-button @click="router.push('/testmanage/testprocess')">取消</el-button>
            <el-button style="margin-left: 10px" type="primary" @click="handleUpdateEyesProcess">确认修改</el-button>
          </div>
        </template>
      </el-card>
      <!--X-Ray测试编辑-->
      <el-card v-else-if="testTypeShow === 'X-Ray测试'" style="margin: 20px">
        <el-row>
          <el-col :span="4">
            <el-text size="large">1.填写测试工艺信息</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="工艺名称:">
                <el-input v-model="form.name" placeholder="请填写" type="text" />
              </el-form-item>
              <el-form-item label="工艺版本:">
                <el-input v-model="form.version" placeholder="请填写" type="text" @change="handleVision">
                  <template #prepend>V</template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <!-- 增加测试工艺步骤 -->
          <el-col :span="18" style="margin-left: 20px; height: auto">
            <el-text size="large">2.增加X-Ray测试工艺</el-text>
            <el-upload
              v-model:file-list="fileList"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
              :show-file-list="true"
              drag
            >
              <el-icon class="el-icon--upload">
                <upload-filled />
              </el-icon>
              <div class="el-upload__text">拖拽文件至此或 <em>点击上传文件</em></div>
              <template #tip>
                <div class="el-upload__tip">仅支持上传JSON文件</div>
              </template>
            </el-upload>
          </el-col>
        </el-row>
        <template #footer>
          <div style="display: flex; justify-content: flex-end" v-if="testStore.test_process_id === ''">
            <el-button @click="router.push('/testmanage/testprocess')">取消</el-button>
            <el-button style="margin-left: 10px" type="primary" @click="handleAddXrayProcess">确认新增</el-button>
          </div>
          <div style="display: flex; justify-content: flex-end" v-if="testStore.test_process_id !== ''">
            <el-button @click="router.push('/testmanage/testprocess')">取消</el-button>
            <el-button style="margin-left: 10px" type="primary" @click="handleUpdateXrayProcess">确认修改</el-button>
          </div>
        </template>
      </el-card>
      <!-- 可靠性测试 -->
      <el-card v-else-if="testTypeShow === '可靠性测试'" style="margin: 20px">
        <el-row>
          <el-col :span="4">
            <el-text class="mx-1" size="large">1.填写测试工艺信息</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="工艺名称:">
                <el-input v-model="form.name" placeholder="请填写" style="margin-right: 20px" type="text" />
              </el-form-item>
              <el-form-item label="工艺版本:">
                <el-input v-model="form.version" placeholder="请填写" style="margin-right: 20px" type="text">
                  <template #prepend>V</template>
                </el-input>
              </el-form-item>
              <el-form-item label="其他设备:">
                <el-select v-model="form.equipmentId" filterable placeholder="请选择(输入可搜索)">
                  <el-option v-for="item in equipmentModelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <!-- 增加测试工艺步骤 -->
          <el-col :span="18" style="margin-left: 20px; height: auto">
            <el-text size="large">2.增加测试工艺</el-text>
            <el-card shadow="never" style="margin-top: 10px; width: 110%">
              <el-row>
                <el-col :span="4">
                  <div class="process-left">
                    <div class="mb1">
                      <el-scrollbar ref="stepScrollbarRef" height="620px">
                        <div ref="stepInnerRef">
                          <el-button-group v-for="item in stepinfo" :key="item.step" style="margin: 5px; width: 95%">
                            <el-button :type="activeBtn(item.step)" style="width: 75%" @click="currentStep(item.step)">
                              第{{ item.step }}步
                            </el-button>
                            <el-button
                              :disabled="stepinfo.length == 1"
                              icon="Delete"
                              style="width: 20%"
                              type="danger"
                              @click="removeStep(item.step)"
                            />
                          </el-button-group>
                        </div>
                      </el-scrollbar>
                    </div>
                    <div class="mb1">
                      <el-button class="mb-add" icon="Plus" type="primary" @click="addStep">新增步骤</el-button>
                    </div>
                  </div>
                </el-col>
                <el-col v-if="showprocessRight" :span="20">
                  <el-card shadow="never">
                    <el-row>
                      <el-col :span="24">
                        <el-text style="font-size: 20px; font-weight: bold">当前编辑: 第{{ form.curStep }}步</el-text>
                        <el-form-item label="步骤名称:" style="margin-top: 15px">
                          <el-input
                            v-model="
                              stepinfo.find((item: any) => {
                                return item.step == form.curStep
                              }).info.name
                            "
                            placeholder="请填写"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="24">
                        <el-form-item label="步骤描述:">
                          <el-input
                            v-model="
                              stepinfo.find((item: any) => {
                                return item.step == form.curStep
                              }).info.desc
                            "
                            placeholder="请填写"
                            type="textarea"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="24">
                        <el-row>
                          <el-col :span="3" class="operate">
                            <div>
                              <el-text size="large" style="">增加操作:</el-text>
                            </div>
                            <el-button
                              icon="plus"
                              size="default"
                              style="margin-top: 20px; width: 90%"
                              type="primary"
                              @click="addSteptype('ParaProcess')"
                              >填写参数
                            </el-button>
                            <el-button
                              icon="plus"
                              size="default"
                              style="margin-top: 20px; width: 90%"
                              type="primary"
                              @click="addSteptype('RecordProcess')"
                              >拍照记录
                            </el-button>
                            <el-button
                              icon="plus"
                              size="default"
                              style="margin-top: 20px; width: 90%"
                              type="primary"
                              @click="addSteptype('ScanProcess')"
                              >扫码识别
                            </el-button>
                          </el-col>
                          <el-col :span="21">
                            <el-card shadow="never" style="background: #fafafa">
                              <el-scrollbar ref="scrollbarRef" always height="500px">
                                <div ref="innerRef">
                                  <template
                                    v-for="compontent in stepinfo.find((item: any) => {
                                      return item.step == form.curStep
                                    }).info.tabList"
                                    :key="compontent.id"
                                  >
                                    <component
                                      :is="compontent.com"
                                      @remove-scan="removeCom(compontent.id)"
                                      @remove-record="removeCom(compontent.id)"
                                      @remove-para="removeCom(compontent.id)"
                                    />
                                  </template>
                                </div>
                              </el-scrollbar>
                            </el-card>
                          </el-col>
                        </el-row>
                      </el-col>
                    </el-row>
                  </el-card>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <el-button @click="router.push('/testmanage/testprocess')">取消</el-button>
            <el-button style="margin-left: 10px" type="primary" @click="">确认新增</el-button>
          </div>
        </template>
      </el-card>
      <!--其他通用测试-->
      <el-card v-else>
        <el-empty description="待开发..." />
      </el-card>
    </div>
    <el-dialog v-model="dialogVisible">
      <img :src="dialogImageUrl" alt="Preview Image" w-full />
    </el-dialog>
    <el-dialog v-model="editDialogVisible" title="标注图片" width="80%">
      <div style="margin-top: 30px">
        <img-editor :img-url="editImg" @save="saveEdit" />
      </div>
    </el-dialog>
    <el-dialog
      v-model="confirmDialogVisible"
      :title="'确认提交:' + form.curType"
      align-center
      width="30%"
      @close="captcha?.reset()"
    >
      <div>
        <CaptchaSlider ref="captcha" success-tip="已确认" tip="滑动来进行提交" @success="handleAddFuncProcess" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, onMounted } from "vue"
import { useRouter } from "vue-router"
import ParaProcess from "@/views/testmanage/addprocess/parametersprocesss/index.vue"
import RecordProcess from "@/views/testmanage/addprocess/recordprocess/index.vue"
import ScanProcess from "@/views/testmanage/addprocess/scanprocess/index.vue"
import { CaptchaExposed, CaptchaSlider } from "vexip-ui"
import imgEditor from "@/components/imgEditor/index.vue"
import { ElScrollbar, ElMessageBox, ElMessage } from "element-plus"
import type { UploadUserFile } from "element-plus"
import { UploadFilled } from "@element-plus/icons-vue"
import { getTestTypeDataApi } from "@/api/testtype"
import { getFixtureModelDataApi } from "@/api/fixturemodel"
import { getEquipmentTypeDataApi } from "@/api/otherModelType"
import { getPsiModelDataApi } from "@/api/psimodel"
import {
  uploadfuncttest,
  uploadeyestest,
  uploadxraytest,
  getProcessById,
  updatexraytest,
  updateeyestest,
  updatefuncttest
} from "@/api/addprocess"
import { useTestStore } from "@/store/modules/test"
import { useUserStore } from "@/store/modules/user"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const testStore = useTestStore()
const userStore = useUserStore()
const router = useRouter()
// 展示的测试类型，默认展示“功能性测试”
const testTypeShow = ref<any>("功能性测试")
const innerRef = ref<HTMLDivElement>()
const stepInnerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const stepScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const captcha = ref<CaptchaExposed>()
const testTypeList = ref<any>([])
const dialogImageUrl = ref<any>("")
const dialogVisible = ref<any>(false)
const editDialogVisible = ref<any>(false)
const confirmDialogVisible = ref<any>(false)
const currentEditImg = ref("")
const editImg = ref<any>("")
const stoppers = ref<any>([])
const fixtureModelList = ref<any>([])
const psiModelList = ref<any>([])
const equipmentModelList = ref<any>([])
const eyesFile = ref<any>(null)
const xrayFile = ref<any>(null)
const fileList = ref<UploadUserFile[]>([])
const showprocessRight = ref<any>(true)
const form = reactive<any>({
  name: "",
  version: "",
  fixtureId: "",
  hostId: "",
  equipmentId: [],
  processName: "",
  processDesc: "",
  curStep: "1",
  curType: "功能性测试",
  curTypeId: 1,
  File: null
})

const handleExceed = () => {
  ElMessage.warning("最多只能上传一个文件！")
}
const handleVision = () => {
  if (testStore.versionArr.length === 0) {
    ElMessage.success("该版本号可使用")
  } else {
    for (let i = 0; i < testStore.versionArr.length; i++) {
      if (testStore.versionArr[i].type === form.curType) {
        const versionList = testStore.versionArr.find((item: any) => {
          return item.type === form.curType
        }).versionList
        for (let i = 0; i < versionList.length; i++) {
          if (versionList[i].version === form.version) {
            ElMessage.error("该版本号已存在")
            form.version = ""
            return
          }
        }
        ElMessage.success("该版本号可使用")
        return
      }
    }
    ElMessage.success("该版本号可使用")
  }
}
const getTestTypeData = () => {
  getTestTypeDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    // const list = res.data.list
    // const list1 = list.filter(item => item.name === "弓曲度测试" || item.name === "2D留存" || item.name === "3D检测")
    // testTypeList.value = res.data.list
    // console.log(res.data.list)

    // 将“弓曲度测试”视为“目检测试”，移除“2D留存”和“3D检测”
    testTypeList.value = res.data.list.filter((item) => {
      if (item.name === "弓曲度测试") {
        item.name = "目检测试"
        return true
      } else if (item.name === "2D留存" || item.name === "3D检测") return false

      return true
    })
  })
}
const getFixtureModelData = () => {
  getFixtureModelDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    fixtureModelList.value = res.data.list
  })
}
const getPsiModelModelData = () => {
  getPsiModelDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    psiModelList.value = res.data.list
  })
}
const getEquipmentModelData = () => {
  getEquipmentTypeDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    equipmentModelList.value = res.data.list
  })
}
const testId = ref<number>()
const TestType = (type: string, id: number): void => {
  ElMessageBox.confirm("更换工艺类型会导致已编辑的数据被清除，是否更换？", "更改确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    testId.value = id
    testTypeShow.value = type
    form.curType = type
    form.curTypeId = id
    form.name = ""
    form.version = ""
    fileList.value = []
  })
}
const stepinfo = reactive<any>([
  {
    step: "1",
    info: {
      name: "",
      desc: "",
      tabList: [],
      operate: []
    }
  }
])
let stepNumber = 1
const addStep = async () => {
  stepNumber++
  stepinfo.push({
    step: String(stepNumber),
    info: {
      name: "",
      desc: "",
      tabList: [],
      operate: []
    }
  })
  // 重置表单
  form.processName = ""
  form.processDesc = ""
  form.curStep = String(stepNumber)
  await nextTick()
  stepScrollbarRef.value!.scrollTo(0, stepInnerRef.value!.scrollHeight)
}
const currentStep = (stepCur: any) => {
  form.curStep = stepCur
  const result = stepinfo.find((item: any) => {
    return item.step == stepCur
  })
  // 填充表单
  form.processName = result.info.name
  form.processDesc = result.info.desc
}
let idCounter = 0
const addSteptype = async (type: any) => {
  const comId = idCounter++
  if (type === "ParaProcess") {
    stepinfo
      .find((item: any) => {
        return item.step == form.curStep
      })
      .info.tabList.push({ com: ParaProcess, id: comId })
  } else if (type === "RecordProcess") {
    stepinfo
      .find((item: any) => {
        return item.step == form.curStep
      })
      .info.tabList.push({ com: RecordProcess, id: comId })
  } else {
    stepinfo
      .find((item: any) => {
        return item.step == form.curStep
      })
      .info.tabList.push({ com: ScanProcess, id: comId })
  }
  await nextTick()
  scrollbarRef.value!.scrollTo(0, innerRef.value!.scrollHeight)
}
const removeCom = (val: any) => {
  ElMessageBox.confirm("是否删除该操作", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  }).then(() => {
    stepinfo.find((item: any) => {
      return item.step == form.curStep
    }).info.tabList = stepinfo
      .find((item: any) => {
        return item.step == form.curStep
      })
      .info.tabList.filter((component: any) => component.id !== val)
  })
}
const removeStep = (val: any) => {
  form.curStep = val
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认:第" + val + "步", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  }).then(() => {
    const index = stepinfo.findIndex((item: any) => item.step == val)
    console.log(index)
    if (index !== -1) {
      stepinfo.splice(index, 1)
    }
    for (let i = 0; i < stepinfo.length; i++) {
      stepinfo[i].step = `${i + 1}`
    }
    form.curStep = String(val - 1)
    stepNumber = stepinfo.length
  })
}
const activeBtn = (val: any) => {
  if (val == form.curStep) {
    return "success"
  } else {
    return null
  }
}
const saveEdit = async (data: any) => {
  currentEditImg.value = data
  editDialogVisible.value = false
  await nextTick()
  stoppers.value.forEach((stop: any) => stop())
  stoppers.value.splice(0, stoppers.value.length)
}
//选择文件
const handleFileChange = (file: any) => {
  form.File = file.raw
  eyesFile.value = file.raw
  xrayFile.value = file.raw
  fileList.value.push({ name: file.name, url: URL.createObjectURL(file.raw) })
}
const handleAddEyesProcess = () => {
  ElMessageBox.confirm("确认提交工艺吗？", "提交确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const data: any = {
      name: form.name,
      version: form.version,
      file: eyesFile.value,
      board_model_id: testStore.board_model_id,
      testtype: form.curTypeId,
      userId: userStore.userid
    }
    const fromData = new FormData()
    for (const key in data) {
      fromData.append(key, data[key])
    }
    uploadeyestest(fromData).then((res) => {
      if (res.code == 0) {
        ElMessage.success("新增成功")
        router.push("/testmanage/testprocess")
        testStore.test_process_id = ""
      }
    })
  })
}
const handleAddXrayProcess = () => {
  ElMessageBox.confirm("确认提交工艺吗？", "提交确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const data: any = {
      name: form.name,
      version: form.version,
      file: xrayFile.value,
      board_model_id: testStore.board_model_id,
      testtype: form.curTypeId,
      userId: userStore.userid
    }
    const fromData = new FormData()
    for (const key in data) {
      fromData.append(key, data[key])
    }
    uploadxraytest(fromData).then((res) => {
      if (res.code == 0) {
        ElMessage.success("新增成功")
        router.push("/testmanage/testprocess")
        testStore.test_process_id = ""
      }
    })
  })
}
const handleAddFuncProcess = () => {
  ElMessageBox.confirm("确认提交工艺吗？", "提交确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const data: any = {
      name: form.name,
      version: form.version,
      fixtureId: form.fixtureId,
      hostId: form.hostId,
      equipmentId: JSON.stringify(form.equipmentId),
      file: form.File,
      board_model_id: testStore.board_model_id,
      testtype: form.curTypeId,
      userId: userStore.userid
    }
    const fromData = new FormData()
    for (const key in data) {
      fromData.append(key, data[key])
    }
    uploadfuncttest(fromData).then((res) => {
      if (res.code == 0) {
        ElMessage.success("新增成功")
        router.push("/testmanage/testprocess")
        testStore.test_process_id = ""
      }
    })
  })
}

const handleUpdateEyesProcess = () => {
  ElMessageBox.confirm("确认修改工艺吗？", "提交确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const data: any = {
      id: testStore.test_process_id,
      name: form.name,
      version: form.version,
      file: eyesFile.value
    }
    const fromData = new FormData()
    for (const key in data) {
      fromData.append(key, data[key])
    }
    console.log(fromData)
    updateeyestest(fromData).then((res) => {
      if (res.code == 0) {
        ElMessage.success("修改成功")
        testStore.test_process_id = ""
        router.push("/testmanage/testprocess")
      }
    })
  })
}
const handleUpdateXrayProcess = () => {
  ElMessageBox.confirm("确认修改工艺吗？", "提交确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const data: any = {
      id: testStore.test_process_id,
      name: form.name,
      version: form.version,
      file: xrayFile.value
    }
    const fromData = new FormData()
    for (const key in data) {
      fromData.append(key, data[key])
    }
    console.log(fromData)
    updatexraytest(fromData).then((res) => {
      if (res.code == 0) {
        ElMessage.success("修改成功")
        testStore.test_process_id = ""
        router.push("/testmanage/testprocess")
      }
    })
  })
}
const handleUpdateFuncProcess = () => {
  ElMessageBox.confirm("确认修改工艺吗？", "提交确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const data: any = {
      id: testStore.test_process_id,
      name: form.name,
      version: form.version,
      fixtureId: form.fixtureId,
      hostId: form.hostId,
      equipmentId: JSON.stringify(form.equipmentId),
      file: form.File
    }
    const fromData = new FormData()
    for (const key in data) {
      fromData.append(key, data[key])
    }
    console.log(fromData)
    updatefuncttest(fromData).then((res) => {
      if (res.code == 0) {
        ElMessage.success("修改成功")
        testStore.test_process_id = ""
        router.push("/testmanage/testprocess")
      }
    })
  })
}
getTestTypeData()
getPsiModelModelData()
getFixtureModelData()
getEquipmentModelData()
const feedBackList = ref<any>([])
onMounted(() => {
  if (testStore.test_process_id !== "") {
    form.curTypeId = testStore.test_process_id
    getProcessById({ id: testStore.test_process_id }).then((res) => {
      console.log(res.data)
      form.curType = res.data.testType
      form.version = res.data.version
      feedBackList.value = res.data.feedback
      form.name = res.data.name
      testTypeShow.value = res.data.testType
    })
  }
})
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin: 0;
}

.process-left {
  .mb1 {
    display: flex;
    flex-direction: column;
  }

  .mb-add {
    width: 90%;
    margin: 20px 5px 5px;
  }
}

.operate {
  display: flex;
  flex-direction: column;
}

.selectTypeBtn {
  display: flex;
  justify-content: space-between;
  margin: 15px auto auto auto;
}

.selectBtn + .selectBtn {
  margin-left: 10px;
}

.btn {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 20px 10px 0 0;
  padding: 9px 15px;
  font-size: 14px;
  border-radius: 4px;
  color: #fff;
  background: #63a3f5;
  border: 1px solid #63a3f5;
  transition: all 0.2s ease;
  text-decoration: none;
  user-select: none;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.demo-tabs .custom-tabs-label div {
  margin-left: 4px;
}

.demo-tabs .custom-tabs-label span {
  margin-left: 4px;
}
</style>
