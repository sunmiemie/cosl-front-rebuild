<script setup lang="ts">
import { ref } from "vue"
import { ElMessageBox } from "element-plus"
import WorkOrderHeader from "./components/WorkOrderHeader.vue"
import WorkOrderToolbar from "./components/WorkOrderToolbar.vue"
import WorkOrderTable from "./components/WorkOrderTable.vue"
import WorkOrderCardGrid from "./components/WorkOrderCardGrid.vue"
import WorkOrderFormDialog from "./components/WorkOrderFormDialog.vue"
import WorkOrderDetailDialog from "./components/WorkOrderDetailDialog.vue"
import { createEmptyForm, orderToForm, useWorkOrder } from "./composables/use-work-order"
import type { CalibrationWorkOrder, WorkOrderFormModel } from "./types"

const {
  loading,
  filter,
  filteredOrders,
  pendingCount,
  resetFilter,
  createOrder,
  updateOrder,
  removeOrder
} = useWorkOrder()

const viewMode = ref<"table" | "card">("table")

const formVisible = ref(false)
const formMode = ref<"create" | "edit">("create")
const editingId = ref("")
const formInitial = ref<WorkOrderFormModel>(createEmptyForm())

const detailVisible = ref(false)
const currentOrder = ref<CalibrationWorkOrder | null>(null)

const handleSearch = () => {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 200)
}

const openCreate = () => {
  formMode.value = "create"
  editingId.value = ""
  formInitial.value = createEmptyForm()
  formVisible.value = true
}

const openEdit = (order: CalibrationWorkOrder) => {
  formMode.value = "edit"
  editingId.value = order.id
  formInitial.value = orderToForm(order)
  formVisible.value = true
}

const openDetail = (order: CalibrationWorkOrder) => {
  currentOrder.value = order
  detailVisible.value = true
}

const handleFormSubmit = (form: WorkOrderFormModel) => {
  if (formMode.value === "create") {
    createOrder(form)
    return
  }
  updateOrder(editingId.value, form)
}

const handleDelete = async (order: CalibrationWorkOrder) => {
  try {
    await ElMessageBox.confirm(`确认删除工单 ${order.id} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消"
    })
    removeOrder(order.id)
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="app-container work-order-page">
    <WorkOrderHeader :pending-count="pendingCount" />

    <el-card shadow="never" class="work-order-panel">
      <WorkOrderToolbar
        v-model:filter="filter"
        :loading="loading"
        @search="handleSearch"
        @reset="resetFilter"
        @create="openCreate"
      />

      <div class="view-toggle">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="table">列表视图</el-radio-button>
          <el-radio-button value="card">卡片视图</el-radio-button>
        </el-radio-group>
      </div>

      <WorkOrderTable
        v-if="viewMode === 'table'"
        :orders="filteredOrders"
        :loading="loading"
        @detail="openDetail"
        @edit="openEdit"
        @delete="handleDelete"
      />
      <WorkOrderCardGrid v-else :orders="filteredOrders" @select="openDetail" />
    </el-card>

    <WorkOrderFormDialog
      v-model:visible="formVisible"
      :mode="formMode"
      :initial-form="formInitial"
      @submit="handleFormSubmit"
    />

    <WorkOrderDetailDialog v-model:visible="detailVisible" :order="currentOrder" />
  </div>
</template>

<style scoped lang="scss">
@import "./styles/work-order.scss";
</style>
