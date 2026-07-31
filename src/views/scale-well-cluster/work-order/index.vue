<script setup lang="ts">
import { onMounted, ref } from "vue"
import { ElMessageBox } from "element-plus"
import WorkOrderHeader from "./components/WorkOrderHeader.vue"
import WorkOrderToolbar from "./components/WorkOrderToolbar.vue"
import WorkOrderTable from "./components/WorkOrderTable.vue"
import WorkOrderCardGrid from "./components/WorkOrderCardGrid.vue"
import WorkOrderFormDialog from "./components/WorkOrderFormDialog.vue"
import WorkOrderDetailDialog from "./components/WorkOrderDetailDialog.vue"
import { createEmptyForm, orderToForm, useWorkOrder } from "./composables/use-work-order"
import { getStatusActionLabel } from "./constants/options"
import type { CalibrationWorkOrder, WorkOrderFormModel } from "./types"

const {
  loading,
  filter,
  filteredOrders,
  pendingCount,
  total,
  pagination,
  resetFilter,
  fetchOrders,
  createOrder,
  updateOrder,
  removeOrder,
  publishOrder,
  changeStatus
} = useWorkOrder()

const viewMode = ref<"table" | "card">("table")

const formVisible = ref(false)
const formMode = ref<"create" | "edit">("create")
const editingId = ref(0)
const formInitial = ref<WorkOrderFormModel>(createEmptyForm())

const detailVisible = ref(false)
const currentOrder = ref<CalibrationWorkOrder | null>(null)

const handleSearch = () => {
  pagination.page = 1
  void fetchOrders()
}

const handleReset = () => {
  resetFilter()
  void fetchOrders()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  void fetchOrders()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  void fetchOrders()
}

const openCreate = () => {
  formMode.value = "create"
  editingId.value = 0
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

const handleFormSubmit = async (form: WorkOrderFormModel) => {
  if (formMode.value === "create") {
    await createOrder(form)
    return
  }
  await updateOrder(editingId.value, form)
}

const handleDelete = async (order: CalibrationWorkOrder) => {
  try {
    await ElMessageBox.confirm(`确认删除工单 ${order.taskNumber} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消"
    })
    await removeOrder(order.id, order.taskNumber)
  } catch {
    // 用户取消
  }
}

const handlePublish = async (order: CalibrationWorkOrder) => {
  try {
    await ElMessageBox.confirm(`确认发布工单 ${order.taskNumber} 吗？`, "发布确认", {
      type: "warning"
    })
    await publishOrder(order.id)
  } catch {
    // 用户取消
  }
}

const handleChangeStatus = async (order: CalibrationWorkOrder, status: number) => {
  try {
    await ElMessageBox.confirm(
      `确认将工单 ${order.taskNumber} ${getStatusActionLabel(order.status, status)} 吗？`,
      "状态变更",
      { type: "warning" }
    )
    await changeStatus(order.id, status)
    if (currentOrder.value?.id === order.id) {
      currentOrder.value = filteredOrders.value.find((item) => item.id === order.id) ?? currentOrder.value
    }
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  void fetchOrders()
})
</script>

<template>
  <div class="app-container work-order-page">
    <WorkOrderHeader :pending-count="pendingCount" />

    <el-card shadow="never" class="work-order-panel">
      <WorkOrderToolbar
        v-model:filter="filter"
        :loading="loading"
        @search="handleSearch"
        @reset="handleReset"
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
        @publish="handlePublish"
        @change-status="handleChangeStatus"
      />
      <WorkOrderCardGrid v-else :orders="filteredOrders" @select="openDetail" />

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <WorkOrderFormDialog
      v-model:visible="formVisible"
      :mode="formMode"
      :initial-form="formInitial"
      @submit="handleFormSubmit"
    />

    <WorkOrderDetailDialog
      v-model:visible="detailVisible"
      :order="currentOrder"
      @publish="handlePublish"
      @change-status="handleChangeStatus"
    />
  </div>
</template>

<style scoped lang="scss">
@import "./styles/work-order.scss";

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
