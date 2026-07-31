import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import {
  createCalibrationWellApi,
  deleteCalibrationWellApi,
  getCalibrationWellListApi,
  updateCalibrationWellApi
} from "@/api/calibration-well/well"
import {
  createDefaultCommConfigs,
  defaultCoeffRanges,
  formToWellPayload,
  mapWellFromApi,
  type CalibrationWell,
  type WellFilter,
  type WellFormModel
} from "../types"

export function createEmptyWellForm(): WellFormModel {
  const coeff = defaultCoeffRanges("hi", false)
  return {
    wellNo: "",
    wellName: "",
    wellType: "hi",
    apiValue: null,
    dualSensor: false,
    holeDiameter: null,
    commConfigs: createDefaultCommConfigs(false),
    ...coeff,
    status: 1,
    remark: ""
  }
}

export function useWellManagement() {
  const loading = ref(false)
  const wells = ref<CalibrationWell[]>([])
  const total = ref(0)

  const filter = reactive<WellFilter>({
    keyword: "",
    wellType: "",
    status: "",
    page: 1,
    pageSize: 20
  })

  const fetchWells = async () => {
    loading.value = true
    try {
      const res = await getCalibrationWellListApi({
        keyword: filter.keyword.trim() || undefined,
        wellType: filter.wellType || undefined,
        status: filter.status !== "" ? filter.status : undefined,
        page: filter.page,
        pageSize: filter.pageSize
      })
      wells.value = res.data.list.map(mapWellFromApi)
      total.value = res.data.total
    } finally {
      loading.value = false
    }
  }

  const resetFilter = () => {
    filter.keyword = ""
    filter.wellType = ""
    filter.status = ""
    filter.page = 1
    fetchWells()
  }

  const search = () => {
    filter.page = 1
    fetchWells()
  }

  const changePage = (page: number) => {
    filter.page = page
    fetchWells()
  }

  const changePageSize = (size: number) => {
    filter.pageSize = size
    filter.page = 1
    fetchWells()
  }

  const createWell = async (form: WellFormModel) => {
    await createCalibrationWellApi(formToWellPayload(form, false))
    ElMessage.success(`已新增刻度井「${form.wellNo}」`)
    await fetchWells()
  }

  const updateWell = async (id: number, form: WellFormModel) => {
    await updateCalibrationWellApi(id, formToWellPayload(form, true))
    ElMessage.success(`已更新「${form.wellName}」`)
    await fetchWells()
  }

  const removeWell = async (well: CalibrationWell) => {
    const res = await deleteCalibrationWellApi(well.id)
    ElMessage.success(res.msg || `已删除「${well.wellNo}」`)
    await fetchWells()
  }

  return {
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
  }
}
