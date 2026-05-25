<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form label-width="110px" class="inspection-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="巡检设备名称" required>
              <el-select v-model="formData.device_name" placeholder="请选择">
                <el-option v-for="item in deviceOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巡检设备SN号" required>
              <el-input v-model="formData.device_sn" placeholder="请输入设备SN号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="formData.status">
                <el-radio label="正常">正常</el-radio>
                <el-radio label="维保中">维保中</el-radio>
                <el-radio label="维修中">维修中</el-radio>
              </el-radio-group>
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
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="formData.items" border stripe class="inspection-table">
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="content" label="巡检内容" min-width="280" />
          <el-table-column label="是否需要拍照" width="140" align="center">
            <template #default="{ row }">
              {{ row.requirePhoto ? "是" : "否" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteItem(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="460px">
      <el-form label-width="96px">
        <el-form-item label="巡检内容" required>
          <el-input v-model="editingItem.content" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="需要拍照">
          <el-switch v-model="editingItem.requirePhoto" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import { inspectionDeviceOptions, type InspectionItem } from "../shared"
import { getInspectionBaseInfoDetailApi, saveInspectionBaseInfoApi } from "@/api/inspection-base"
import type { InspectionBaseInfoDetail } from "@/api/inspection-base/types"

const router = useRouter()
const route = useRoute()

const createItemId = () => `item-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const deviceOptions = inspectionDeviceOptions

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
    const res = await getInspectionBaseInfoDetailApi(id)
    applyDetail(res.data)
  } catch (e) {
    ElMessage.error("加载巡检明细失败")
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

function handleConfirmItem() {
  const content = editingItem.content.trim()
  if (!content) {
    ElMessage.warning("请输入巡检内容")
    return
  }
  if (editingItem.id) {
    const target = formData.items.find((item) => item.id === editingItem.id)
    if (target) {
      target.content = content
      target.requirePhoto = editingItem.requirePhoto
    }
  } else {
    formData.items.push({
      id: createItemId(),
      content,
      requirePhoto: editingItem.requirePhoto
    })
  }
  dialogVisible.value = false
}

function handleDeleteItem(id: string) {
  ElMessageBox.confirm("确定删除该巡检内容吗？", "提示", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  }).then(() => {
    formData.items = formData.items.filter((item) => item.id !== id)
    ElMessage.success("删除成功")
  })
}

async function handleSave() {
  if (!formData.device_name || !formData.device_sn) {
    ElMessage.warning("请完善巡检基础信息")
    return
  }
  if (formData.items.length === 0) {
    ElMessage.warning("请至少新增一条巡检内容")
    return
  }
  const payload = {
    id: formData.id ? Number(formData.id) : undefined,
    device_name: formData.device_name,
    device_sn: formData.device_sn,
    inspector: formData.inspector.trim(),
    status: formData.status,
    items: formData.items.map((it, idx) => ({
      sort_no: idx + 1,
      content: it.content,
      require_photo: Boolean(it.requirePhoto)
    }))
  }
  const res = await saveInspectionBaseInfoApi(payload)
  ElMessage.success(res.msg || "保存成功")
  router.push("/inspectionmanage/view")
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
