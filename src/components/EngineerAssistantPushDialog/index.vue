<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import { getEngineerAssistantTestTypesApi } from "@/api/engineer-assistant"
import type { EngineerAssistantTestType } from "@/api/engineer-assistant/types"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    itemCount: number
    itemName: string
    loading?: boolean
  }>(),
  {
    loading: false
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
  (event: "confirm", value: EngineerAssistantTestType): void
}>()

const testTypeLoading = ref(false)
const testTypes = ref<EngineerAssistantTestType[]>([])
const selectedTestTypeId = ref("")

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const loadTestTypes = async () => {
  testTypeLoading.value = true
  try {
    const response = await getEngineerAssistantTestTypesApi()
    testTypes.value = response.data.list || []
    if (selectedTestTypeId.value && !testTypes.value.some((item) => String(item.typeId) === selectedTestTypeId.value)) {
      selectedTestTypeId.value = ""
    }
    if (!selectedTestTypeId.value && testTypes.value.length === 1) {
      selectedTestTypeId.value = String(testTypes.value[0].typeId)
    }
  } catch {
    testTypes.value = []
  } finally {
    testTypeLoading.value = false
  }
}

const confirmPush = () => {
  const selectedType = testTypes.value.find((item) => String(item.typeId) === selectedTestTypeId.value)
  if (!selectedType) {
    ElMessage.warning("请选择小助手测试类型")
    return
  }
  emit("confirm", selectedType)
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) loadTestTypes()
  }
)
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="480px" destroy-on-close>
    <el-form label-width="128px">
      <el-form-item :label="`已选择${itemName}`">
        <span>{{ itemCount }} 项</span>
      </el-form-item>
      <el-form-item label="小助手测试类型" required>
        <el-select
          v-model="selectedTestTypeId"
          :loading="testTypeLoading"
          filterable
          placeholder="请选择测试类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in testTypes"
            :key="item.typeId"
            :label="item.typeName || item.name"
            :value="String(item.typeId)"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="loading" @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        :disabled="testTypeLoading || testTypes.length === 0"
        :loading="loading"
        @click="confirmPush"
      >
        确认推送
      </el-button>
    </template>
  </el-dialog>
</template>
