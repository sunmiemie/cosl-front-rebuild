<script setup lang="ts">
import { onMounted, ref } from "vue"
import { ElMessageBox } from "element-plus"
import ModelHeader from "./components/ModelHeader.vue"
import ModelToolbar from "./components/ModelToolbar.vue"
import ModelTable from "./components/ModelTable.vue"
import ModelFormDialog from "./components/ModelFormDialog.vue"
import WellManagementDrawer from "./components/WellManagementDrawer.vue"
import {
  createEmptyForm,
  useModelManagement
} from "./composables/use-model-management"
import { modelToForm, type CalibrationDeviceModel, type DeviceModelFormModel } from "./types"
import { getCalibrationWellOptionsApi } from "@/api/calibration-well/well"
import type { WellOptionItem } from "@/api/calibration-well/types"

const {
  loading,
  models,
  total,
  filter,
  fetchModels,
  resetFilter,
  search,
  changePage,
  changePageSize,
  createModel,
  updateModel,
  removeModel
} = useModelManagement()

const hiWellOptions = ref<WellOptionItem[]>([])
const loWellOptions = ref<WellOptionItem[]>([])

const formVisible = ref(false)
const wellDrawerVisible = ref(false)
const formMode = ref<"create" | "edit">("create")
const editingId = ref(0)
const formInitial = ref<DeviceModelFormModel>(createEmptyForm())

const loadWellOptions = async () => {
  const res = await getCalibrationWellOptionsApi()
  hiWellOptions.value = res.data.hi
  loWellOptions.value = res.data.lo
}

onMounted(async () => {
  await Promise.all([fetchModels(), loadWellOptions()])
})

const handleWellUpdated = async () => {
  await loadWellOptions()
}

const openWellDrawer = () => {
  wellDrawerVisible.value = true
}

const openCreate = () => {
  formMode.value = "create"
  editingId.value = 0
  formInitial.value = createEmptyForm()
  formVisible.value = true
}

const openEdit = (model: CalibrationDeviceModel) => {
  formMode.value = "edit"
  editingId.value = model.id
  formInitial.value = modelToForm(model)
  formVisible.value = true
}

const handleFormSubmit = async (form: DeviceModelFormModel) => {
  if (formMode.value === "create") {
    await createModel(form)
    return
  }
  await updateModel(editingId.value, form)
}

const handleDelete = async (model: CalibrationDeviceModel) => {
  try {
    await ElMessageBox.confirm(`确认停用型号「${model.displayName}」吗？`, "停用确认", {
      type: "warning",
      confirmButtonText: "停用",
      cancelButtonText: "取消"
    })
    await removeModel(model)
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="app-container model-management-page">
    <ModelHeader :total-count="total" />

    <el-card shadow="never" class="model-management-panel">
      <ModelToolbar
        v-model:filter="filter"
        :loading="loading"
        @search="search"
        @reset="resetFilter"
        @create="openCreate"
        @open-wells="openWellDrawer"
      />

      <ModelTable :models="models" :loading="loading" @edit="openEdit" @delete="handleDelete" />

      <div class="model-management-pagination">
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
    </el-card>

    <ModelFormDialog
      v-model:visible="formVisible"
      :mode="formMode"
      :initial-form="formInitial"
      :hi-well-options="hiWellOptions"
      :lo-well-options="loWellOptions"
      @submit="handleFormSubmit"
    />

    <WellManagementDrawer v-model:visible="wellDrawerVisible" @updated="handleWellUpdated" />
  </div>
</template>

<style scoped lang="scss">
@import "./styles/model-management.scss";

.model-management-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
