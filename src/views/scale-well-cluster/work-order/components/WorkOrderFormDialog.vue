<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { getUserDataApi } from "@/api/user"
import type { GetUserData } from "@/api/user/types/user"
import { getCalibrationModelOptionsApi } from "@/api/calibration-well/model"
import type { ModelOptionItem } from "@/api/calibration-well/types"
import type { WorkOrderFormModel } from "../types"
import { CALIBRATION_DEVICE_OPTIONS, LOCATION_OPTIONS } from "../constants/options"
import { createEmptyForm } from "../composables/use-work-order"

const visible = defineModel<boolean>("visible", { default: false })

const props = defineProps<{
  mode: "create" | "edit"
  initialForm?: WorkOrderFormModel
}>()

const emit = defineEmits<{
  submit: [form: WorkOrderFormModel]
}>()

const formRef = ref<FormInstance>()
const form = reactive<WorkOrderFormModel>(createEmptyForm())
const modelOptions = ref<ModelOptionItem[]>([])
const userOptions = ref<GetUserData[]>([])
const loadingOptions = ref(false)

const selectedModel = computed(() => modelOptions.value.find((item) => item.id === form.modelId) ?? null)

const serialOptions = computed(() => selectedModel.value?.serialNumbers ?? [])

const rules: FormRules<WorkOrderFormModel> = {
  modelId: [{ required: true, message: "请选择仪器型号", trigger: "change" }],
  serialNumber: [{ required: true, message: "请选择仪器 SN", trigger: "change" }],
  testerId: [{ required: true, message: "请选择测试人员", trigger: "change" }],
  location: [{ required: true, message: "请选择地点", trigger: "change" }],
  calibrationDevice: [{ required: true, message: "请选择刻度设备", trigger: "change" }],
  hiWell: [{ required: true, message: "请输入高刻井", trigger: "blur" }],
  loWell: [{ required: true, message: "请输入低刻井", trigger: "blur" }],
  hiApi: [{ required: true, message: "请输入高刻 API", trigger: "blur" }],
  loApi: [{ required: true, message: "请输入低刻 API", trigger: "blur" }],
  planDate: [{ required: true, message: "请选择计划日期", trigger: "change" }]
}

const dialogTitle = () => (props.mode === "create" ? "新建刻度工单" : "编辑刻度工单")

const userLabel = (user: GetUserData) => user.nickname?.trim() || user.username

const applyModelDefaults = (model: ModelOptionItem | null) => {
  if (!model) {
    form.hiWell = ""
    form.loWell = ""
    form.hiApi = null
    form.loApi = null
    form.serialNumber = ""
    return
  }
  form.hiWell = model.hiWellNo
  form.loWell = model.loWellNo
  form.hiApi = model.hiWellApi
  form.loApi = model.loWellApi
  if (!serialOptions.value.includes(form.serialNumber)) {
    form.serialNumber = serialOptions.value[0] || ""
  }
}

const loadOptions = async () => {
  loadingOptions.value = true
  try {
    const [modelRes, userRes] = await Promise.all([
      getCalibrationModelOptionsApi(),
      getUserDataApi({ currentPage: 1, pageSize: 500 })
    ])
    modelOptions.value = modelRes.data?.list ?? []
    userOptions.value = userRes.data?.list ?? []
  } finally {
    loadingOptions.value = false
  }
}

watch(
  () => form.modelId,
  (modelId) => {
    applyModelDefaults(modelOptions.value.find((item) => item.id === modelId) ?? null)
  }
)

watch(
  () => visible.value,
  (open) => {
    if (!open) return
    Object.assign(form, props.initialForm ?? createEmptyForm())
    applyModelDefaults(modelOptions.value.find((item) => item.id === form.modelId) ?? null)
    formRef.value?.clearValidate()
  }
)

onMounted(() => {
  void loadOptions()
})

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit("submit", { ...form })
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" :title="dialogTitle()" width="720px" destroy-on-close>
    <el-form ref="formRef" v-loading="loadingOptions" :model="form" :rules="rules" label-width="96px" class="work-order-form">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="仪器型号" prop="modelId">
            <el-select v-model="form.modelId" placeholder="请选择" filterable style="width: 100%">
              <el-option
                v-for="item in modelOptions"
                :key="item.id"
                :label="item.displayName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仪器 SN" prop="serialNumber">
            <el-select
              v-model="form.serialNumber"
              placeholder="请选择 SN"
              :disabled="!form.modelId"
              filterable
              style="width: 100%"
            >
              <el-option v-for="sn in serialOptions" :key="sn" :label="sn" :value="sn" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="测试人员" prop="testerId">
            <el-select v-model="form.testerId" placeholder="请选择" filterable style="width: 100%">
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="userLabel(user)"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划日期" prop="planDate">
            <el-date-picker v-model="form.planDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地点" prop="location">
            <el-select v-model="form.location" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in LOCATION_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="刻度设备" prop="calibrationDevice">
            <el-select v-model="form.calibrationDevice" placeholder="请选择" style="width: 100%">
              <el-option
                v-for="item in CALIBRATION_DEVICE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="高刻井" prop="hiWell">
            <el-input v-model="form.hiWell" placeholder="选择型号后自动填充，可修改" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="低刻井" prop="loWell">
            <el-input v-model="form.loWell" placeholder="选择型号后自动填充，可修改" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="高刻 API" prop="hiApi">
            <el-input-number v-model="form.hiApi" :precision="1" :step="0.1" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="低刻 API" prop="loApi">
            <el-input-number v-model="form.loApi" :precision="1" :step="0.1" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="备注信息（可选）" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{ mode === "create" ? "创建工单" : "保存修改" }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.work-order-form {
  :deep(.el-input-number) {
    width: 100%;
  }
}
</style>
