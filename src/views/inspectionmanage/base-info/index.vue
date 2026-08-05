<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form label-width="132px" class="inspection-form">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="巡检设备名称" required>
              <el-select v-model="formData.device_name" placeholder="请选择" @change="handleDeviceNameChange">
                <el-option v-for="item in deviceOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡检设备SN号" required>
              <el-select
                v-model="formData.device_sn"
                placeholder="请选择SN号"
                :loading="snLoading"
                clearable
                filterable
                @change="handleDeviceSnChange"
              >
                <el-option v-for="host in hostDeviceOptions" :key="host.sn" :label="host.sn" :value="host.sn">
                  <span>{{ host.sn }}</span>
                  <span class="host-option-name">{{ host.hostName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="主机名称">
              <el-text class="selected-host-name" truncated>{{ selectedHostDeviceName || "-" }}</el-text>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="toolbar-wrapper">
        <div class="toolbar-title">巡检内容</div>
        <div class="toolbar-actions">
          <el-button type="primary" @click="openCreateDialog">新增</el-button>
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="formData.items" border stripe class="inspection-table" v-loading="contentLoading">
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="content" label="巡检内容" min-width="280" />
          <el-table-column label="是否需要拍照" width="140" align="center">
            <template #default="{ row }">
              {{ row.requirePhoto ? "是" : "否" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :disabled="Boolean(deletingItemId)" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                :loading="deletingItemId === row.id"
                :disabled="Boolean(deletingItemId)"
                @click="handleDeleteItem(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="460px"
      :close-on-click-modal="!itemSaving"
      :close-on-press-escape="!itemSaving"
      :show-close="!itemSaving"
    >
      <el-form label-width="96px">
        <el-form-item label="巡检内容" required>
          <el-input v-model="editingItem.content" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="需要拍照">
          <el-switch v-model="editingItem.requirePhoto" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="itemSaving" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="itemSaving" @click="handleConfirmItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import { inspectionDeviceOptions, type InspectionItem } from "../shared"
import { getDeviceInstanceListApi } from "@/api/device-instance"
import type { DeviceInstanceData } from "@/api/device-instance/types"
import { getHostModelDisplayName } from "@/views/devicemanage/device/psi/model-options"
import {
  deleteInspectionBaseItemApi,
  getInspectionBaseInfoDetailApi,
  getInspectionBaseInfoListApi,
  saveInspectionBaseItemApi
} from "@/api/inspection-base"
import type { InspectionBaseInfoDetail } from "@/api/inspection-base/types"
import { useUserStore } from "@/store/modules/user"
import { getInspectionInspector } from "./inspection-save"

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

type InspectionHostDeviceOption = {
  sn: string
  hostName: string
  modelName: string
}

const deviceOptions = inspectionDeviceOptions
const hostDeviceOptions = ref<InspectionHostDeviceOption[]>([])
const snLoading = ref(false)
const itemSaving = ref(false)
const deletingItemId = ref("")
const contentLoading = ref(false)
let snRequestId = 0
let hostDeviceCache: InspectionHostDeviceOption[] | null = null

const formData = reactive({
  id: "",
  inspection_no: "",
  device_name: "",
  device_sn: "",
  inspector: "",
  status: "正常" as "正常" | "维保中" | "维修中",
  items: [] as InspectionItem[],
  created_at: "",
  updated_at: ""
})

const selectedHostDeviceName = computed(() => {
  return hostDeviceOptions.value.find((item) => item.sn === formData.device_sn)?.hostName || ""
})

function normalizeDeviceInstanceList(data: any): DeviceInstanceData[] {
  const payload = data?.data ?? data ?? {}
  return Array.isArray(payload) ? payload : payload.list ?? payload.records ?? payload.results ?? payload.items ?? []
}

function getDeviceInstanceName(row: DeviceInstanceData) {
  return row.deviceName ?? row.device_name ?? row.psi_name ?? ""
}

function getDeviceInstanceSn(row: DeviceInstanceData) {
  return row.serialNumber ?? row.serial_number ?? row.psi_serialnumber ?? ""
}

function getDeviceInstanceModelName(row: DeviceInstanceData) {
  return (
    getHostModelDisplayName(row as unknown as Record<string, unknown>) ||
    row.modelName ||
    row.model_name ||
    row.psimodel_name ||
    row.model ||
    ""
  )
}

function normalizeSearchText(value: string) {
  return value.replace(/\s+/g, "").replace(/&/g, "").toLowerCase()
}

function matchesInspectionDeviceGroup(row: InspectionHostDeviceOption, deviceName: string) {
  const group = normalizeSearchText(deviceName)
  const text = normalizeSearchText([row.hostName, row.modelName, row.sn].join(" "))
  if (!group || !text) return false
  if (/halt|hass/i.test(deviceName)) return /halt|hass/i.test(text)
  if (deviceName.includes("高温箱")) return text.includes("高温箱")
  if (deviceName.includes("高温高压")) return text.includes("高温高压") || text.includes("高压井")
  if (deviceName.includes("水循环")) return text.includes("水循环")
  if (deviceName.includes("振动")) return text.includes("振动")
  if (deviceName.includes("模拟")) return text.includes("模拟")
  return text.includes(group)
}

async function loadHostDeviceList() {
  if (hostDeviceCache) return hostDeviceCache
  const res = await getDeviceInstanceListApi({ currentPage: 1, size: 2000 })
  const seen = new Set<string>()
  hostDeviceCache = normalizeDeviceInstanceList(res)
    .map((row) => {
      const sn = getDeviceInstanceSn(row).trim()
      const hostName = getDeviceInstanceName(row).trim()
      const modelName = getDeviceInstanceModelName(row).trim()
      return { sn, hostName, modelName }
    })
    .filter((item) => {
      if (!item.sn || seen.has(item.sn)) return false
      seen.add(item.sn)
      return true
    })
  return hostDeviceCache
}

async function getInspectionDeviceGroupHosts(deviceName: string) {
  const hosts = await loadHostDeviceList()
  return hosts.filter((item) => matchesInspectionDeviceGroup(item, deviceName))
}

function getAssistantEquipmentType(deviceName: string) {
  if (/halt|hass/i.test(deviceName)) return "1"
  if (deviceName.includes("高温箱")) return "2"
  if (deviceName.includes("高温高压")) return "3"
  if (deviceName.includes("水循环")) return "4"
  if (deviceName.includes("振动")) return "5"
  if (deviceName.includes("电路板")) return "6"
  if (deviceName.includes("模拟")) return "7"
  return "3"
}

async function loadSnOptions(deviceName: string, keepSn = "") {
  const requestId = ++snRequestId
  if (!deviceName) {
    hostDeviceOptions.value = keepSn ? [{ sn: keepSn, hostName: "", modelName: "" }] : []
    return
  }
  snLoading.value = true
  try {
    const options = await getInspectionDeviceGroupHosts(deviceName)
    if (requestId !== snRequestId) return
    const existsKeepSn = keepSn && options.some((item) => item.sn === keepSn)
    hostDeviceOptions.value =
      existsKeepSn || !keepSn ? options : [{ sn: keepSn, hostName: "", modelName: "" }, ...options]
  } catch {
    if (requestId !== snRequestId) return
    hostDeviceOptions.value = keepSn ? [{ sn: keepSn, hostName: "", modelName: "" }] : []
    ElMessage.error("加载设备SN号失败")
  } finally {
    if (requestId === snRequestId) {
      snLoading.value = false
    }
  }
}

function handleDeviceNameChange() {
  formData.id = ""
  formData.inspection_no = ""
  formData.device_sn = ""
  formData.items = []
  void replaceRouteInspectionId()
  void loadSnOptions(formData.device_name)
}

function handleDeviceSnChange() {
  void loadExistingContentForSelection()
}

function applyDetail(detail: InspectionBaseInfoDetail) {
  formData.id = String(detail.id)
  formData.inspection_no = detail.inspection_no
  formData.device_name = detail.device_name
  formData.device_sn = detail.device_sn
  formData.inspector = detail.inspector
  formData.status = detail.status
  formData.items = (detail.items || []).map((it) => ({
    id: String(it.id),
    content: it.content,
    requirePhoto: Boolean(it.require_photo)
  }))
  formData.created_at = detail.created_at || ""
  formData.updated_at = detail.updated_at || ""
}

async function loadInspectionDetailById(id: number, syncRoute = false) {
  const res = await getInspectionBaseInfoDetailApi(id)
  applyDetail(res.data)
  await loadSnOptions(formData.device_name, formData.device_sn)
  if (syncRoute && String(route.query.id || "") !== String(id)) {
    await replaceRouteInspectionId(id)
  }
}

async function replaceRouteInspectionId(id?: number) {
  const query = { ...route.query }
  if (id) {
    query.id = String(id)
  } else {
    delete query.id
    delete query.base_id
    delete query.baseId
    delete query.baseID
  }
  await router.replace({
    path: route.path,
    query
  })
}

async function loadExistingContentForSelection() {
  if (!formData.device_name || !formData.device_sn) return
  contentLoading.value = true
  try {
    const res = await getInspectionBaseInfoListApi({
      currentPage: 1,
      pageSize: 1,
      device_name: formData.device_name,
      device_sn: formData.device_sn
    })
    const matched = res.data.list?.[0]
    if (!matched) {
      formData.id = ""
      formData.inspection_no = ""
      formData.items = []
      await replaceRouteInspectionId()
      return
    }
    await loadInspectionDetailById(matched.id, true)
  } catch {
    ElMessage.error("加载已有巡检内容失败")
  } finally {
    contentLoading.value = false
  }
}

async function fetchDetail() {
  const raw =
    (route.query.id as any) ??
    (route.query.base_id as any) ??
    (route.query.baseId as any) ??
    (route.query.baseID as any)
  const val = Array.isArray(raw) ? raw[0] : raw
  if (val === undefined || val === null || val === "") return
  const id = Number(val)
  if (!Number.isFinite(id)) return
  try {
    contentLoading.value = true
    await loadInspectionDetailById(id)
  } catch (e) {
    ElMessage.error("加载巡检明细失败")
  } finally {
    contentLoading.value = false
  }
}

watch(() => route.fullPath, fetchDetail, { immediate: true })

const dialogVisible = ref(false)
const dialogTitle = ref("新增巡检内容")
const editingItem = reactive<InspectionItem>({
  id: "",
  content: "",
  requirePhoto: false
})

function openCreateDialog() {
  if (!formData.device_name || !formData.device_sn) {
    ElMessage.warning("请先选择巡检设备名称和SN号")
    return
  }
  dialogTitle.value = "新增巡检内容"
  editingItem.id = ""
  editingItem.content = ""
  editingItem.requirePhoto = false
  dialogVisible.value = true
}

function openEditDialog(item: InspectionItem) {
  dialogTitle.value = "编辑巡检内容"
  editingItem.id = item.id
  editingItem.content = item.content
  editingItem.requirePhoto = item.requirePhoto
  dialogVisible.value = true
}

async function handleConfirmItem() {
  if (itemSaving.value) return
  if (!formData.device_name || !formData.device_sn) {
    ElMessage.warning("请先选择巡检设备名称和SN号")
    return
  }
  const content = editingItem.content.trim()
  if (!content) {
    ElMessage.warning("请输入巡检内容")
    return
  }

  const isEditing = Boolean(editingItem.id)
  const itemIndex = isEditing ? formData.items.findIndex((item) => item.id === editingItem.id) : -1
  const itemId = Number(editingItem.id)
  const inspector = getInspectionInspector({
    inspector: formData.inspector,
    nickName: userStore.nickName,
    username: userStore.username
  })
  itemSaving.value = true
  try {
    const res = await saveInspectionBaseItemApi({
      base_id: formData.id ? Number(formData.id) : undefined,
      item_id: isEditing && Number.isFinite(itemId) ? itemId : undefined,
      device_name: formData.device_name,
      device_sn: formData.device_sn,
      inspector,
      status: formData.status,
      assistant_equipment_type: getAssistantEquipmentType(formData.device_name),
      sort_no: itemIndex >= 0 ? itemIndex + 1 : undefined,
      content,
      require_photo: Boolean(editingItem.requirePhoto)
    })

    const savedBaseId = Number(res.data?.id)
    if (Number.isFinite(savedBaseId)) {
      formData.id = String(savedBaseId)
      formData.inspection_no = res.data.inspection_no || formData.inspection_no
      formData.inspector = inspector
      if (String(route.query.id || "") !== String(savedBaseId)) {
        await replaceRouteInspectionId(savedBaseId)
      }
    }

    const savedItem = res.data?.item
    const normalizedItem: InspectionItem = {
      id: String(savedItem.id),
      content: savedItem.content,
      requirePhoto: Boolean(savedItem.require_photo)
    }
    if (itemIndex >= 0) {
      formData.items.splice(itemIndex, 1, normalizedItem)
    } else {
      formData.items.push(normalizedItem)
    }
    dialogVisible.value = false

    const actionText = isEditing ? "编辑" : "新增"
    if (res.data?.assistantSync?.success === true) {
      ElMessage.success(`${actionText}成功，已推送小助手`)
    } else {
      ElMessage.warning(res.data?.assistantSync?.message || `${actionText}成功，但推送小助手失败`)
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.response?.data?.msg || "保存巡检项失败")
  } finally {
    itemSaving.value = false
  }
}

async function handleDeleteItem(id: string) {
  if (deletingItemId.value) return
  try {
    await ElMessageBox.confirm("确定删除该巡检内容吗？删除后立即生效。", "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    })
  } catch {
    return
  }

  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    ElMessage.error("巡检项ID无效，请刷新后重试")
    return
  }
  deletingItemId.value = id
  try {
    await deleteInspectionBaseItemApi(itemId)
    formData.items = formData.items.filter((item) => item.id !== id)
    ElMessage.success("删除成功")
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.response?.data?.msg || "删除巡检项失败")
  } finally {
    deletingItemId.value = ""
  }
}

function handleClose() {
  router.push("/inspectionmanage/view")
}
</script>

<style scoped lang="scss">
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.inspection-form {
  margin-bottom: 4px;

  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}

.host-option-name {
  float: right;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.selected-host-name {
  display: inline-flex;
  max-width: 100%;
  min-height: 32px;
  align-items: center;
  color: var(--el-text-color-regular);
}

.toolbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar-title {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.table-wrapper {
  margin-bottom: 8px;
}
</style>
