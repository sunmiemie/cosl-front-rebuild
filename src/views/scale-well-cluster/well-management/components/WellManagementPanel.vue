<script setup lang="ts">
import { ref, watch } from "vue"
import { ElMessageBox } from "element-plus"
import WellToolbar from "./WellToolbar.vue"
import WellTable from "./WellTable.vue"
import WellFormDialog from "./WellFormDialog.vue"
import {
  createEmptyWellForm,
  useWellManagement
} from "../composables/use-well-management"
import { wellToForm, type CalibrationWell, type WellFormModel } from "../types"

const props = defineProps<{
  active?: boolean
}>()

const emit = defineEmits<{
  updated: []
}>()

const {
  loading,
  wells,
  total,
  filter,
  fetchWells,
  resetFilter,
  search,
  changePage,
  changePageSize,
  createWell,
  updateWell,
  removeWell
} = useWellManagement()

const formVisible = ref(false)
const formDialogRef = ref<InstanceType<typeof WellFormDialog> | null>(null)
const formMode = ref<"create" | "edit">("create")
const editingId = ref(0)
const formInitial = ref<WellFormModel>(createEmptyWellForm())

const notifyUpdated = () => emit("updated")

watch(
  () => props.active,
  (open) => {
    if (open) fetchWells()
  },
  { immediate: true }
)

const openCreate = () => {
  formMode.value = "create"
  editingId.value = 0
  formInitial.value = createEmptyWellForm()
  formVisible.value = true
}

const openEdit = (well: CalibrationWell) => {
  formMode.value = "edit"
  editingId.value = well.id
  formInitial.value = wellToForm(well)
  formVisible.value = true
}

const handleFormSubmit = async (form: WellFormModel) => {
  try {
    if (formMode.value === "create") {
      await createWell(form)
    } else {
      await updateWell(editingId.value, form)
    }
    formDialogRef.value?.closeOnSuccess()
    notifyUpdated()
  } catch {
    // 错误提示由 request 拦截器处理
  }
}

const handleDelete = async (well: CalibrationWell) => {
  try {
    await ElMessageBox.confirm(`确认删除刻度井「${well.wellNo}」吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消"
    })
    await removeWell(well)
    notifyUpdated()
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="well-management-panel-wrap">
    <div class="well-management-panel__meta">
      <p class="well-management-panel__desc">维护刻度井主数据：井号、API、多传感器、井径与通信参数（多传感器可配置多组通信）</p>
      <el-tag type="info" effect="plain">共 {{ total }} 条</el-tag>
    </div>

    <WellToolbar
      v-model:filter="filter"
      :loading="loading"
      @search="search"
      @reset="resetFilter"
      @create="openCreate"
    />

    <WellTable :wells="wells" :loading="loading" @edit="openEdit" @delete="handleDelete" />

    <div class="well-management-pagination">
      <el-pagination
        v-model:current-page="filter.page"
        v-model:page-size="filter.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="changePage"
        @size-change="changePageSize"
      />
    </div>

    <WellFormDialog
      ref="formDialogRef"
      v-model:visible="formVisible"
      :mode="formMode"
      :initial-form="formInitial"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
@import "../styles/well-management.scss";

.well-management-panel-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.well-management-panel__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.well-management-panel__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
</style>
