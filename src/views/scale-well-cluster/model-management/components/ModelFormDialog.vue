<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import type { DeviceModelFormModel } from "../types"
import type { WellOptionItem } from "@/api/calibration-well/types"
import { TOOL_PARAMS, TOOL_TYPE_OPTIONS } from "../../work-order/constants/tool-params"
import { createEmptyForm } from "../composables/use-model-management"

const visible = defineModel<boolean>("visible", { default: false })

const props = defineProps<{
  mode: "create" | "edit"
  initialForm?: DeviceModelFormModel
  hiWellOptions: WellOptionItem[]
  loWellOptions: WellOptionItem[]
}>()

const emit = defineEmits<{
  submit: [form: DeviceModelFormModel]
}>()

const formRef = ref<FormInstance>()
const form = reactive<DeviceModelFormModel>(createEmptyForm())

const rules: FormRules<DeviceModelFormModel> = {
  displayName: [{ required: true, message: "请输入型号名称", trigger: "blur" }],
  hiWellId: [{ required: true, message: "请选择高刻井", trigger: "change" }],
  loWellId: [{ required: true, message: "请选择低刻井", trigger: "change" }]
}

const dialogTitle = computed(() => (props.mode === "create" ? "新增型号" : "编辑型号"))

const formatWellOptionLabel = (item: WellOptionItem) => {
  const api = item.apiValue != null ? item.apiValue.toFixed(2) : "—"
  return `${item.wellNo} · API ${api}`
}
const selectedHiWell = computed(() => props.hiWellOptions.find((w) => w.id === form.hiWellId))
const selectedLoWell = computed(() => props.loWellOptions.find((w) => w.id === form.loWellId))

const formatWellCoeff = (well: WellOptionItem | undefined, role: "hi" | "lo") => {
  if (!well) return ""
  const dual = well.dualSensor ?? false
  if (dual) {
    if (role === "hi") {
      return `Ka [${well.kaMin ?? "—"}, ${well.kaMax ?? "—"}] · Ba ±${well.baLimit ?? "—"}`
    }
    return `Kb [${well.kbMin ?? "—"}, ${well.kbMax ?? "—"}] · Bb ±${well.bbLimit ?? "—"}`
  }
  return `Ka [${well.kaMin ?? "—"}, ${well.kaMax ?? "—"}] · Ba ±${well.baLimit ?? "—"}`
}

watch(
  () => visible.value,
  (open) => {
    if (!open) return
    Object.assign(form, props.initialForm ?? createEmptyForm())
    formRef.value?.clearValidate()
  }
)

const applyQuickFill = (toolType: string) => {
  const cfg = TOOL_PARAMS[toolType as keyof typeof TOOL_PARAMS]
  if (!cfg) return
  form.displayName = cfg.displayName
  const hi = props.hiWellOptions.find((w) => w.wellNo === cfg.hiWell)
  const lo = props.loWellOptions.find((w) => w.wellNo === cfg.loWell)
  if (hi) form.hiWellId = hi.id
  if (lo) form.loWellId = lo.id
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit("submit", { ...form, serialNumbers: [...form.serialNumbers] })
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="640px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="108px" class="model-management-form">
      <el-row :gutter="16">
        <el-col v-if="mode === 'create'" :span="24">
          <el-form-item label="快速填充">
            <el-select placeholder="从预设型号填充" clearable style="width: 100%" @change="applyQuickFill">
              <el-option v-for="item in TOOL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="型号名称" prop="displayName">
            <el-input v-model="form.displayName" placeholder="如 675DWPR" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="仪器 SN">
            <el-select
              v-model="form.serialNumbers"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="输入 SN 后回车，可多个"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="高刻井" prop="hiWellId">
            <el-select v-model="form.hiWellId" placeholder="选择高刻井" style="width: 100%">
              <el-option
                v-for="item in hiWellOptions"
                :key="item.id"
                :label="formatWellOptionLabel(item)"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="低刻井" prop="loWellId">
            <el-select v-model="form.loWellId" placeholder="选择低刻井" style="width: 100%">
              <el-option
                v-for="item in loWellOptions"
                :key="item.id"
                :label="formatWellOptionLabel(item)"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="selectedHiWell || selectedLoWell" :span="24">
          <el-alert type="info" :closable="false" show-icon class="model-well-coeff-alert">
            <template #title>系数合格区间来自刻度井配置</template>
            <div v-if="selectedHiWell" class="model-well-coeff-alert__line">
              高刻 {{ selectedHiWell.wellNo }}：{{ formatWellCoeff(selectedHiWell, "hi") }}
            </div>
            <div v-if="selectedLoWell && selectedHiWell?.dualSensor" class="model-well-coeff-alert__line">
              低刻 {{ selectedLoWell.wellNo }}：{{ formatWellCoeff(selectedLoWell, "lo") }}
            </div>
            <div v-else-if="selectedHiWell && !selectedHiWell.dualSensor" class="model-well-coeff-alert__hint">
              单传感器型号仅使用高刻井传感器 A 区间
            </div>
          </el-alert>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注信息（可选）" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{ mode === "create" ? "新增" : "保存" }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@import "../styles/model-management.scss";

.model-well-coeff-alert {
  margin-bottom: 4px;

  &__line {
    font-size: 12px;
    line-height: 1.6;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  &__hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
