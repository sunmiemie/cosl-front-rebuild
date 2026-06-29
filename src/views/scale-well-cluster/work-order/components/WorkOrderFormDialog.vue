<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import type { WorkOrderFormModel } from "../types"
import { CALIBRATION_DEVICE_OPTIONS, LOCATION_OPTIONS } from "../constants/options"
import { TOOL_TYPE_OPTIONS, getToolDefaults } from "../constants/tool-params"
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

const rules: FormRules<WorkOrderFormModel> = {
  toolType: [{ required: true, message: "请选择仪器型号", trigger: "change" }],
  serialNumber: [{ required: true, message: "请输入仪器 SN", trigger: "blur" }],
  engineer: [{ required: true, message: "请输入测试人员", trigger: "blur" }],
  location: [{ required: true, message: "请选择地点", trigger: "change" }],
  calibrationDevice: [{ required: true, message: "请选择刻度设备", trigger: "change" }],
  hiWell: [{ required: true, message: "请输入高刻井", trigger: "blur" }],
  loWell: [{ required: true, message: "请输入低刻井", trigger: "blur" }],
  hiApi: [{ required: true, message: "请输入高刻 API", trigger: "blur" }],
  loApi: [{ required: true, message: "请输入低刻 API", trigger: "blur" }],
  planDate: [{ required: true, message: "请选择计划日期", trigger: "change" }]
}

const dialogTitle = () => (props.mode === "create" ? "新建刻度工单" : "编辑刻度工单")

const applyToolDefaults = (toolType: string) => {
  const defaults = getToolDefaults(toolType)
  form.hiWell = defaults.hiWell
  form.loWell = defaults.loWell
  form.hiApi = defaults.hiApi
  form.loApi = defaults.loApi
}

watch(
  () => form.toolType,
  (toolType, prev) => {
    if (!toolType || toolType === prev) return
    applyToolDefaults(toolType)
  }
)

watch(
  () => visible.value,
  (open) => {
    if (!open) return
    Object.assign(form, props.initialForm ?? createEmptyForm())
    formRef.value?.clearValidate()
  }
)

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit("submit", { ...form })
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" :title="dialogTitle()" width="720px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="work-order-form">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="仪器型号" prop="toolType">
            <el-select v-model="form.toolType" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in TOOL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仪器 SN" prop="serialNumber">
            <el-input v-model="form.serialNumber" placeholder="如 DWPR675A-0003" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="测试人员" prop="engineer">
            <el-input v-model="form.engineer" placeholder="姓名" />
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
            <el-input v-model="form.hiWell" placeholder="如 F5" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="低刻井" prop="loWell">
            <el-input v-model="form.loWell" placeholder="如 K5" />
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
