import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import {
  createCalibrationModelApi,
  deleteCalibrationModelApi,
  getCalibrationModelListApi,
  updateCalibrationModelApi
} from "@/api/calibration-well/model"
import {
  formToModelPayload,
  mapModelFromApi,
  type CalibrationDeviceModel,
  type DeviceModelFilter,
  type DeviceModelFormModel
} from "../types"

export function createEmptyForm(): DeviceModelFormModel {
  return {
    displayName: "",
    serialNumbers: [],
    hiWellId: null,
    loWellId: null,
    status: 1,
    remark: ""
  }
}

export function useModelManagement() {
  const loading = ref(false)
  const models = ref<CalibrationDeviceModel[]>([])
  const total = ref(0)

  const filter = reactive<DeviceModelFilter>({
    keyword: "",
    status: "",
    page: 1,
    pageSize: 20
  })

  const fetchModels = async () => {
    loading.value = true
    try {
      const res = await getCalibrationModelListApi({
        keyword: filter.keyword.trim() || undefined,
        status: filter.status !== "" ? filter.status : undefined,
        page: filter.page,
        pageSize: filter.pageSize
      })
      models.value = res.data.list.map(mapModelFromApi)
      total.value = res.data.total
    } finally {
      loading.value = false
    }
  }

  const resetFilter = () => {
    filter.keyword = ""
    filter.status = ""
    filter.page = 1
    fetchModels()
  }

  const search = () => {
    filter.page = 1
    fetchModels()
  }

  const changePage = (page: number) => {
    filter.page = page
    fetchModels()
  }

  const changePageSize = (size: number) => {
    filter.pageSize = size
    filter.page = 1
    fetchModels()
  }

  const createModel = async (form: DeviceModelFormModel) => {
    await createCalibrationModelApi(formToModelPayload(form))
    ElMessage.success(`已新增「${form.displayName}」`)
    await fetchModels()
  }

  const updateModel = async (id: number, form: DeviceModelFormModel) => {
    await updateCalibrationModelApi(id, formToModelPayload(form))
    ElMessage.success(`已更新「${form.displayName}」`)
    await fetchModels()
  }

  const removeModel = async (model: CalibrationDeviceModel) => {
    const res = await deleteCalibrationModelApi(model.id)
    ElMessage.success(res.msg || `已停用「${model.displayName}」`)
    await fetchModels()
  }

  return {
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
  }
}
