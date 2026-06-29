import { computed, reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import dayjs from "dayjs"
import { MOCK_WORK_ORDERS } from "../constants/mock-data"
import { getToolDefaults } from "../constants/tool-params"
import type { CalibrationWorkOrder, WorkOrderFilter, WorkOrderFormModel, WorkOrderStatus } from "../types"

export function createEmptyForm(): WorkOrderFormModel {
  const defaults = getToolDefaults("675")
  return {
    toolType: "675",
    serialNumber: "",
    engineer: "",
    location: "YJ基地",
    calibrationDevice: "刻度井",
    hiWell: defaults.hiWell,
    loWell: defaults.loWell,
    hiApi: defaults.hiApi,
    loApi: defaults.loApi,
    remark: "",
    planDate: dayjs().format("YYYY-MM-DD")
  }
}

export function formToOrder(form: WorkOrderFormModel, id: string, status: WorkOrderStatus = "pending"): CalibrationWorkOrder {
  return {
    id,
    toolType: form.toolType,
    serialNumber: form.serialNumber.trim(),
    engineer: form.engineer.trim(),
    location: form.location,
    calibrationDevice: form.calibrationDevice,
    hiWell: form.hiWell,
    loWell: form.loWell,
    hiApi: form.hiApi ?? 0,
    loApi: form.loApi ?? 0,
    remark: form.remark.trim(),
    planDate: form.planDate,
    status,
    kc: null
  }
}

export function orderToForm(order: CalibrationWorkOrder): WorkOrderFormModel {
  return {
    toolType: order.toolType,
    serialNumber: order.serialNumber,
    engineer: order.engineer,
    location: order.location,
    calibrationDevice: order.calibrationDevice,
    hiWell: order.hiWell,
    loWell: order.loWell,
    hiApi: order.hiApi,
    loApi: order.loApi,
    remark: order.remark,
    planDate: order.planDate
  }
}

function nextOrderId(list: CalibrationWorkOrder[]) {
  const seq = 46 + list.length
  return `GR-2026-0${seq}`
}

export function useWorkOrder() {
  const loading = ref(false)
  const orders = ref<CalibrationWorkOrder[]>([...MOCK_WORK_ORDERS])

  const filter = reactive<WorkOrderFilter>({
    keyword: "",
    status: "",
    toolType: ""
  })

  const filteredOrders = computed(() => {
    const keyword = filter.keyword.trim().toLowerCase()
    return orders.value.filter((order) => {
      if (filter.status && order.status !== filter.status) return false
      if (filter.toolType && order.toolType !== filter.toolType) return false
      if (!keyword) return true
      return [order.id, order.serialNumber, order.engineer, order.location]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    })
  })

  const pendingCount = computed(() => orders.value.filter((item) => item.status === "pending").length)

  const resetFilter = () => {
    filter.keyword = ""
    filter.status = ""
    filter.toolType = ""
  }

  const createOrder = (form: WorkOrderFormModel) => {
    const order = formToOrder(form, nextOrderId(orders.value))
    orders.value.unshift(order)
    ElMessage.success(`工单 ${order.id} 已创建`)
    return order
  }

  const updateOrder = (id: string, form: WorkOrderFormModel) => {
    const index = orders.value.findIndex((item) => item.id === id)
    if (index === -1) return null
    const prev = orders.value[index]
    orders.value[index] = {
      ...formToOrder(form, id, prev.status),
      kc: prev.kc
    }
    ElMessage.success(`工单 ${id} 已更新`)
    return orders.value[index]
  }

  const removeOrder = (id: string) => {
    orders.value = orders.value.filter((item) => item.id !== id)
    ElMessage.success(`工单 ${id} 已删除`)
  }

  return {
    loading,
    orders,
    filter,
    filteredOrders,
    pendingCount,
    resetFilter,
    createOrder,
    updateOrder,
    removeOrder
  }
}
