<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import type { WellFormModel } from "../types"
import { defaultCoeffRanges, normalizeCommConfigs } from "../types"
import { createEmptyWellForm } from "../composables/use-well-management"
import WellCommConfigList from "./WellCommConfigList.vue"

const visible = defineModel<boolean>("visible", { default: false })

const props = defineProps<{
  mode: "create" | "edit"
  initialForm?: WellFormModel
}>()

const emit = defineEmits<{
  submit: [form: WellFormModel]
}>()

const formRef = ref<FormInstance>()
const form = reactive<WellFormModel>(createEmptyWellForm())

const rules: FormRules<WellFormModel> = {
  wellNo: [{ required: true, message: "请输入井号", trigger: "blur" }],
  wellName: [{ required: true, message: "请输入井名称", trigger: "blur" }],
  wellType: [{ required: true, message: "请选择井类型", trigger: "change" }]
}

const dialogTitle = computed(() => (props.mode === "create" ? "新增刻度井" : "编辑刻度井"))
const wellNoDisabled = computed(() => props.mode === "edit")

watch(
  () => form.dualSensor,
  (dual) => {
    form.commConfigs = normalizeCommConfigs(dual, form.commConfigs)
    if (dual) {
      if (form.kaMin === 0 && form.kaMax === 0) {
        form.kaMin = form.kbMin
        form.kaMax = form.kbMax
        form.baLimit = form.bbLimit
      }
    } else {
      form.kbMin = form.kaMin
      form.kbMax = form.kaMax
      form.bbLimit = form.baLimit
    }
  }
)

watch(
  () => form.wellType,
  (wellType) => {
    const coeff = defaultCoeffRanges(wellType, form.dualSensor)
    form.refMin = coeff.refMin
    form.refMax = coeff.refMax
  }
)

watch(
  () => visible.value,
  (open) => {
    if (!open) return
    Object.assign(form, props.initialForm ?? createEmptyWellForm())
    form.commConfigs = normalizeCommConfigs(form.dualSensor, form.commConfigs)
    formRef.value?.clearValidate()
  }
)

const submitting = ref(false)

const handleSubmit = async () => {
  if (submitting.value) return
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.warning("请完善表单必填项")
    return
  }
  submitting.value = true
  try {
    emit("submit", {
      ...form,
      commConfigs: form.commConfigs.map((item) => ({ ...item }))
    })
  } finally {
    submitting.value = false
  }
}

const closeOnSuccess = () => {
  visible.value = false
}

defineExpose({ closeOnSuccess })
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="860px"
    destroy-on-close
    class="well-form-dialog"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      label-position="right"
      class="well-management-form"
    >
      <section class="well-form-section">
        <h4 class="well-form-section__title">基本信息</h4>
        <div class="well-form-grid well-form-grid--2">
          <el-form-item label="井号" prop="wellNo">
            <el-input v-model="form.wellNo" :disabled="wellNoDisabled" placeholder="如 F1、K5" />
          </el-form-item>
          <el-form-item label="名称" prop="wellName">
            <el-input v-model="form.wellName" placeholder="刻度井名称" />
          </el-form-item>
        </div>
        <el-form-item label="类型" prop="wellType">
          <el-radio-group v-model="form.wellType">
            <el-radio value="hi">高刻井</el-radio>
            <el-radio value="lo">低刻井</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="well-form-grid well-form-grid--3">
          <el-form-item label="API 值">
            <el-input-number
              v-model="form.apiValue"
              :precision="2"
              :step="0.1"
              :min="0"
              controls-position="right"
              placeholder="标称 API"
            />
          </el-form-item>
          <el-form-item label="井径 (mm)">
            <el-input-number
              v-model="form.holeDiameter"
              :min="0"
              controls-position="right"
              placeholder="可选"
            />
          </el-form-item>
          <el-form-item label="多传感器">
            <div class="well-form-switch">
              <el-switch v-model="form.dualSensor" />
              <span class="well-form-switch__text">{{ form.dualSensor ? "双传感器" : "单传感器" }}</span>
            </div>
          </el-form-item>
        </div>
      </section>

      <section class="well-form-section well-form-section--coeff">
        <h4 class="well-form-section__title">系数合格区间</h4>
        <p class="well-form-section__desc">
          <template v-if="form.dualSensor">Ka/Ba、Kb/Bb 由刻度井配置；Kc/Bc 由客户端自动计算。</template>
          <template v-else>单传感器仅配置传感器 A（Ka/Ba）；Kc/Bc 由客户端自动计算。</template>
        </p>

        <div class="well-coeff-panel">
          <div class="well-coeff-panel__cps">
            <span class="well-coeff-panel__label">CPS 预检参考</span>
            <div class="well-form-range well-form-range--compact">
              <el-input-number v-model="form.refMin" :precision="2" :step="1" controls-position="right" />
              <span class="well-form-range__sep">～</span>
              <el-input-number v-model="form.refMax" :precision="2" :step="1" controls-position="right" />
            </div>
          </div>

          <div
            class="well-coeff-panel__groups"
            :class="{ 'well-coeff-panel__groups--single': !form.dualSensor }"
          >
            <div class="well-coeff-group">
              <div class="well-coeff-group__head">
                <span class="well-coeff-group__title">传感器 A</span>
                <span class="well-coeff-group__tag">Ka · Ba</span>
              </div>
              <div class="well-coeff-group__body">
                <div class="well-coeff-field">
                  <span class="well-coeff-field__label">Ka 区间</span>
                  <div class="well-form-range">
                    <el-input-number v-model="form.kaMin" :precision="3" :step="0.1" controls-position="right" />
                    <span class="well-form-range__sep">～</span>
                    <el-input-number v-model="form.kaMax" :precision="3" :step="0.1" controls-position="right" />
                  </div>
                </div>
                <div class="well-coeff-field">
                  <span class="well-coeff-field__label">Ba 上限</span>
                  <el-input-number
                    v-model="form.baLimit"
                    :precision="3"
                    :step="0.1"
                    :min="0"
                    controls-position="right"
                  />
                  <span class="well-coeff-field__hint">± 绝对值</span>
                </div>
              </div>
            </div>

            <div v-if="form.dualSensor" class="well-coeff-group">
              <div class="well-coeff-group__head">
                <span class="well-coeff-group__title">传感器 B</span>
                <span class="well-coeff-group__tag">Kb · Bb</span>
              </div>
              <div class="well-coeff-group__body">
                <div class="well-coeff-field">
                  <span class="well-coeff-field__label">Kb 区间</span>
                  <div class="well-form-range">
                    <el-input-number v-model="form.kbMin" :precision="3" :step="0.1" controls-position="right" />
                    <span class="well-form-range__sep">～</span>
                    <el-input-number v-model="form.kbMax" :precision="3" :step="0.1" controls-position="right" />
                  </div>
                </div>
                <div class="well-coeff-field">
                  <span class="well-coeff-field__label">Bb 上限</span>
                  <el-input-number
                    v-model="form.bbLimit"
                    :precision="3"
                    :step="0.1"
                    :min="0"
                    controls-position="right"
                  />
                  <span class="well-coeff-field__hint">± 绝对值</span>
                </div>
              </div>
            </div>
          </div>

          <p class="well-coeff-panel__foot">
            <template v-if="form.dualSensor">Kc = (Ka + Kb) / 2 · Bc = (Ba + Bb) / 2 · 客户端自动计算</template>
            <template v-else>Kc = Kb · Bc = Bb · 客户端自动计算</template>
          </p>
        </div>
      </section>

      <section class="well-form-section">
        <h4 class="well-form-section__title">
          通信配置
          <span class="well-form-section__required">*</span>
        </h4>
        <p class="well-form-section__desc">按 USB 适配器与电源分别配置，保存后由工控机服务端解析并连接设备。</p>
        <WellCommConfigList v-model:configs="form.commConfigs" :dual-sensor="form.dualSensor" />
      </section>

      <section class="well-form-section well-form-section--last">
        <h4 class="well-form-section__title">其他</h4>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注（可选）" />
        </el-form-item>
      </section>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ mode === "create" ? "新增" : "保存" }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@import "../styles/well-management.scss";

.well-form-section {
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &--last {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
  }
}

.well-form-section__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.well-form-section__required {
  margin-left: 2px;
  color: var(--el-color-danger);
}

.well-form-section__desc {
  margin: -4px 0 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.well-form-grid {
  display: grid;
  gap: 0 16px;

  &--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.well-form-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
}

.well-form-switch__text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.well-form-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .el-input-number {
    flex: 1;
    min-width: 0;
  }

  &--compact {
    max-width: 280px;
  }
}

.well-form-range__sep {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.well-coeff-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
}

.well-coeff-panel__cps {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.well-coeff-panel__label {
  flex-shrink: 0;
  width: 96px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.well-coeff-panel__groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  &--single {
    grid-template-columns: minmax(0, 1fr);
    max-width: 420px;
  }
}

.well-coeff-group {
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.well-coeff-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.well-coeff-group__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.well-coeff-group__tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}

.well-coeff-group__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.well-coeff-field {
  display: grid;
  grid-template-columns: 72px 1fr;
  grid-template-rows: auto auto;
  column-gap: 10px;
  row-gap: 4px;
  align-items: center;

  .el-input-number,
  .well-form-range {
    grid-column: 2;
    grid-row: 1;
  }
}

.well-coeff-field__label {
  grid-column: 1;
  grid-row: 1;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.well-coeff-field__hint {
  grid-column: 2;
  grid-row: 2;
  font-size: 11px;
  line-height: 1.3;
  color: var(--el-text-color-secondary);
}

.well-coeff-panel__foot {
  margin: 0;
  padding-top: 4px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

:deep(.well-form-section .el-form-item) {
  margin-bottom: 14px;
}

:deep(.well-form-grid .el-input-number),
:deep(.well-coeff-panel .el-input-number) {
  width: 100%;
}

@media (max-width: 720px) {
  .well-form-grid--2,
  .well-form-grid--3 {
    grid-template-columns: 1fr;
  }

  .well-coeff-panel__cps {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .well-coeff-panel__groups {
    grid-template-columns: 1fr;
  }

  .well-form-range--compact {
    max-width: none;
    width: 100%;
  }
}
</style>
