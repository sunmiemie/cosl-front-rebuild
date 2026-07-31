import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import dayjs from "dayjs"
import type { ApiCalibrationWorkOrder } from "@/api/calibration-well/types"
import {
  changeCalibrationOrderStatusApi,
  createCalibrationOrderApi,
  deleteCalibrationOrderApi,
  getCalibrationOrderListApi,
  publishCalibrationOrderApi,
  updateCalibrationOrderApi
} from "@/api/calibration-well/order"
import type { CalibrationWorkOrder, WorkOrderFilter, WorkOrderFormModel, WorkOrderStatus } from "../types"

function toNumber(value: string | number | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export function mapApiToOrder(item: ApiCalibrationWorkOrder): CalibrationWorkOrder {
  return {
    id: item.id,
    taskNumber: item.task_number,
    modelId: item.instrument_model_id,
    modelName: item.instrument_model_name,
    serialNumber: item.serial_number,
    testerId: item.tester_id,
    engineer: item.tester_name,
    location: item.location,
    calibrationDevice: item.calibration_device,
    hiWell: item.hi_well_no,
    loWell: item.lo_well_no,
    hiApi: toNumber(item.hi_well_api),
    loApi: toNumber(item.lo_well_api),
    remark: item.remark || "",
    planDate: item.plan_date || "",
    status: item.status as WorkOrderStatus,
    statusText: item.status_text || "",
    kc: item.kc === null || item.kc === undefined || item.kc === "" ? null : toNumber(item.kc)
  }
}

export function mapFormToPayload(form: WorkOrderFormModel) {
  return {
    modelId: form.modelId,
    serialNumber: form.serialNumber.trim(),
    testerId: form.testerId,
    location: form.location,
    calibrationDevice: form.calibrationDevice,
    hiWell: form.hiWell.trim(),
    loWell: form.loWell.trim(),
    hiApi: form.hiApi,
    loApi: form.loApi,
    planDate: form.planDate,
    remark: form.remark.trim()
  }
}

export function createEmptyForm(): WorkOrderFormModel {
  return {
    modelId: null,
    serialNumber: "",
    testerId: null,
    location: "YJ基地",
    calibrationDevice: "刻度井",
    hiWell: "",
    loWell: "",
    hiApi: null,
    loApi: null,
    remark: "",
    planDate: dayjs().format("YYYY-MM-DD")
  }
}

export function orderToForm(order: CalibrationWorkOrder): WorkOrderFormModel {
  return {
    modelId: order.modelId,
    serialNumber: order.serialNumber,
    testerId: order.testerId,
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

export function useWorkOrder() {
  const loading = ref(false)
  const orders = ref<CalibrationWorkOrder[]>([])
  const total = ref(0)
  const pendingCount = ref(0)
  const pagination = reactive({ page: 1, pageSize: 20 })

  const filter = reactive<WorkOrderFilter>({
    keyword: "",
    status: "",
    modelId: ""
  })

  const filteredOrders = orders

  const fetchPendingCount = async () => {
    try {
      const res = await getCalibrationOrderListApi({ status: 1, page: 1, pageSize: 1 })
      pendingCount.value = res.data?.total ?? 0
    } catch {
      pendingCount.value = 0
    }
  }

  const fetchOrders = async () => {
    loading.value = true
    try {
      const res = await getCalibrationOrderListApi({
        keyword: filter.keyword.trim() || undefined,
        status: filter.status === "" ? undefined : filter.status,
        modelId: filter.modelId === "" ? undefined : filter.modelId,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      if (res.code === 0 && res.data) {
        orders.value = res.data.list.map(mapApiToOrder)
        total.value = res.data.total
      } else {
        orders.value = []
        total.value = 0
        ElMessage.error(res.msg || "加载工单失败")
      }
      await fetchPendingCount()
    } catch {
      orders.value = []
      total.value = 0
      ElMessage.error("加载工单失败")
    } finally {
      loading.value = false
    }
  }

  const resetFilter = () => {
    filter.keyword = ""
    filter.status = ""
    filter.modelId = ""
    pagination.page = 1
  }

  const createOrder = async (form: WorkOrderFormModel) => {
    const res = await createCalibrationOrderApi(mapFormToPayload(form))
    if (res.code !== 0) {
      ElMessage.error(res.msg || "创建失败")
      return null
    }
    ElMessage.success(`工单 ${res.data?.task_number || ""} 已创建`)
    await fetchOrders()
    return res.data ? mapApiToOrder(res.data) : null
  }

  const updateOrder = async (id: number, form: WorkOrderFormModel) => {
    const res = await updateCalibrationOrderApi(id, mapFormToPayload(form))
    if (res.code !== 0) {
      ElMessage.error(res.msg || "更新失败")
      return null
    }
    ElMessage.success("工单已更新")
    await fetchOrders()
    return res.data ? mapApiToOrder(res.data) : null
  }

  const removeOrder = async (id: number, taskNumber: string) => {
    const res = await deleteCalibrationOrderApi(id)
    if (res.code !== 0) {
      ElMessage.error(res.msg || "删除失败")
      return false
    }
    ElMessage.success(`工单 ${taskNumber} 已删除`)
    await fetchOrders()
    return true
  }

  const publishOrder = async (id: number) => {
    const res = await publishCalibrationOrderApi(id)
    if (res.code !== 0) {
      ElMessage.error(res.msg || "发布失败")
      return false
    }
    ElMessage.success("工单已发布")
    await fetchOrders()
    return true
  }

  const changeStatus = async (id: number, status: number) => {
    const res = await changeCalibrationOrderStatusApi(id, status)
    if (res.code !== 0) {
      ElMessage.error(res.msg || "状态更新失败")
      return false
    }
    ElMessage.success("状态已更新")
    await fetchOrders()
    return true
  }

  return {
    loading,
    orders,
    total,
    pagination,
    filter,
    filteredOrders,
    pendingCount,
    fetchOrders,
    resetFilter,
    createOrder,
    updateOrder,
    removeOrder,
    publishOrder,
    changeStatus
  }
}
