<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox, type UploadFile, type UploadProps, type UploadUserFile } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import {
  deleteUserSignatureApi,
  getSignatureImageApi,
  getSignatureListApi,
  uploadUserSignatureApi
} from "@/api/signature"
import type { SignatureInfo } from "@/api/signature/types"

const searchData = reactive({
  userId: "",
  username: "",
  nickname: "",
  hasSignature: ""
})

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const loading = ref(false)
const tableData = ref<SignatureInfo[]>([])

const uploadDialogVisible = ref(false)
const uploadLoading = ref(false)
const currentRow = ref<SignatureInfo | null>(null)
const uploadFileList = ref<UploadUserFile[]>([])
const uploadFile = ref<File | null>(null)
const uploadPreviewUrl = ref("")
const uploadRemark = ref("")

const previewDialogVisible = ref(false)
const previewLoading = ref(false)
const previewUrl = ref("")
const previewTitle = ref("")

const formatFileSize = (size?: number) => {
  if (!size) return "--"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

const revokeUrl = (url: string) => {
  if (url) URL.revokeObjectURL(url)
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getSignatureListApi({
      ...searchData,
      currentPage: paginationData.currentPage,
      pageSize: paginationData.pageSize
    })
    tableData.value = res.data.list
    paginationData.total = res.data.total
  } catch {
    tableData.value = []
    paginationData.total = 0
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchData.userId = ""
  searchData.username = ""
  searchData.nickname = ""
  searchData.hasSignature = ""
  paginationData.currentPage = 1
  getList()
}

const clearUploadState = () => {
  revokeUrl(uploadPreviewUrl.value)
  uploadPreviewUrl.value = ""
  uploadFile.value = null
  uploadFileList.value = []
  uploadRemark.value = ""
}

const clearUploadFile = () => {
  revokeUrl(uploadPreviewUrl.value)
  uploadPreviewUrl.value = ""
  uploadFile.value = null
  uploadFileList.value = []
}

const openUploadDialog = (row: SignatureInfo) => {
  clearUploadState()
  currentRow.value = row
  uploadRemark.value = row.remark || ""
  uploadDialogVisible.value = true
}

const closeUploadDialog = () => {
  uploadDialogVisible.value = false
  currentRow.value = null
  clearUploadState()
}

const validateUploadFile = (raw: File) => {
  if (!raw.type.startsWith("image/")) {
    ElMessage.error("请上传图片格式的签名文件")
    return false
  }
  if (raw.size / 1024 / 1024 > 5) {
    ElMessage.error("签名图片大小不能超过 5MB")
    return false
  }
  return true
}

const handleUploadChange: UploadProps["onChange"] = (file: UploadFile) => {
  const raw = file.raw
  clearUploadFile()
  if (!raw || !validateUploadFile(raw)) return
  uploadFile.value = raw
  uploadPreviewUrl.value = URL.createObjectURL(raw)
  uploadFileList.value = [
    {
      name: raw.name,
      url: uploadPreviewUrl.value,
      status: "success"
    }
  ]
}

const submitUpload = async () => {
  if (!currentRow.value || !uploadFile.value) {
    ElMessage.warning("请先选择签名图片")
    return
  }
  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append("signature", uploadFile.value)
    formData.append("remark", uploadRemark.value || "")
    await uploadUserSignatureApi(currentRow.value.userId, formData)
    ElMessage.success("签名保存成功")
    closeUploadDialog()
    getList()
  } catch (error) {
    console.error(error)
  } finally {
    uploadLoading.value = false
  }
}

const openPreview = async (row: SignatureInfo) => {
  if (!row.hasSignature) {
    ElMessage.info("该用户尚未上传签名")
    return
  }
  previewLoading.value = true
  previewDialogVisible.value = true
  previewTitle.value = `${row.nickname || row.username} 的电子签名`
  revokeUrl(previewUrl.value)
  previewUrl.value = ""
  try {
    const blob = await getSignatureImageApi(row.userId)
    previewUrl.value = URL.createObjectURL(blob)
  } finally {
    previewLoading.value = false
  }
}

const deleteSignature = async (row: SignatureInfo) => {
  try {
    await ElMessageBox.confirm(`确认删除 ${row.nickname || row.username} 的电子签名吗？`, "删除签名", {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消"
    })
  } catch {
    return
  }
  try {
    await deleteUserSignatureApi(row.userId)
    ElMessage.success("签名已删除")
    getList()
  } catch (error) {
    console.error(error)
  }
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], getList, { immediate: true })

onBeforeUnmount(() => {
  revokeUrl(uploadPreviewUrl.value)
  revokeUrl(previewUrl.value)
})
</script>

<template>
  <div class="app-container signature-admin">
    <section class="signature-admin-hero">
      <div>
        <p class="eyebrow">Signature Registry</p>
        <h2>签名管理</h2>
        <p>集中查看、替换和删除所有用户上传的电子签名。该页面只对拥有签名管理权限的角色开放。</p>
      </div>
      <div class="hero-stamp">
        <span>权限编码</span>
        <strong>SIGNATURE_MANAGE</strong>
      </div>
    </section>

    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchData" label-width="76px">
        <el-form-item label="用户 ID">
          <el-input v-model="searchData.userId" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchData.username" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchData.nickname" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="签名状态">
          <el-select v-model="searchData.hasSignature" placeholder="全部" clearable style="width: 130px">
            <el-option label="全部" value="" />
            <el-option label="已上传" value="1" />
            <el-option label="未上传" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="getList">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <span>共 {{ paginationData.total }} 位用户</span>
        <el-button type="primary" icon="RefreshRight" circle @click="getList" />
      </div>
      <el-table :data="tableData" stripe border class="signature-table">
        <el-table-column prop="userId" label="用户 ID" width="100" align="center" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="nickname" label="昵称" min-width="140">
          <template #default="{ row }">
            {{ row.nickname || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="签名状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hasSignature ? 'success' : 'info'" effect="plain">
              {{ row.hasSignature ? "已上传" : "未上传" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="originalFilename" label="文件名" min-width="190">
          <template #default="{ row }">
            <span class="filename">{{ row.originalFilename || "--" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="110" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploadedAt" label="上传时间" min-width="170">
          <template #default="{ row }">
            {{ row.uploadedAt || "--" }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180">
          <template #default="{ row }">
            {{ row.remark || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="210" align="center">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="!row.hasSignature" @click="openPreview(row)">预览</el-button>
            <el-button link type="primary" @click="openUploadDialog(row)">
              {{ row.hasSignature ? "替换" : "上传" }}
            </el-button>
            <el-button link type="danger" :disabled="!row.hasSignature" @click="deleteSignature(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pager-wrapper"
        background
        :layout="paginationData.layout"
        :page-sizes="paginationData.pageSizes"
        :total="paginationData.total"
        :page-size="paginationData.pageSize"
        :currentPage="paginationData.currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      v-model="uploadDialogVisible"
      :title="currentRow ? `维护 ${currentRow.nickname || currentRow.username} 的签名` : '维护签名'"
      width="560px"
      @closed="closeUploadDialog"
    >
      <div v-loading="uploadLoading" class="upload-dialog-body">
        <el-upload
          v-model:file-list="uploadFileList"
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept="image/png,image/jpeg,image/webp"
          :on-change="handleUploadChange"
        >
          <div class="upload-dialog-drop">
            <img v-if="uploadPreviewUrl" :src="uploadPreviewUrl" alt="签名预览" />
            <template v-else>
              <span>点击或拖拽签名图片</span>
              <small>支持 PNG / JPG / WEBP，最大 5MB</small>
            </template>
          </div>
        </el-upload>
        <el-form label-position="top" class="remark-form">
          <el-form-item label="备注">
            <el-input
              v-model="uploadRemark"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="可选"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="closeUploadDialog">取消</el-button>
        <el-button type="primary" :loading="uploadLoading" :disabled="!uploadFile" @click="submitUpload"
          >保存</el-button
        >
      </template>
    </el-dialog>

    <el-dialog v-model="previewDialogVisible" :title="previewTitle" width="620px" @closed="revokeUrl(previewUrl)">
      <div v-loading="previewLoading" class="preview-dialog-body">
        <img v-if="previewUrl" :src="previewUrl" alt="签名预览" />
        <el-empty v-else description="暂无预览" />
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.signature-admin {
  --registry-ink: #1d2a2f;
  --registry-muted: #6d7d82;
  --registry-line: #d7e1e4;
  --registry-blue: #235f73;
  --registry-copper: #b56b32;
}

.signature-admin-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
  padding: 20px 24px;
  border: 1px solid var(--registry-line);
  border-radius: 18px;
  color: var(--registry-ink);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(235, 243, 245, 0.96)),
    repeating-linear-gradient(135deg, rgba(35, 95, 115, 0.05) 0 1px, transparent 1px 12px);

  h2 {
    margin: 4px 0 8px;
    font-size: 26px;
  }

  p {
    margin: 0;
    color: var(--registry-muted);
  }
}

.eyebrow {
  margin: 0;
  color: var(--registry-copper);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-stamp {
  min-width: 190px;
  padding: 14px 16px;
  border: 1px solid rgba(35, 95, 115, 0.24);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.76);

  span,
  strong {
    display: block;
  }

  span {
    color: var(--registry-muted);
    font-size: 12px;
  }

  strong {
    margin-top: 10px;
    color: var(--registry-blue);
    font-size: 16px;
    letter-spacing: 0.04em;
  }
}

.search-wrapper {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  color: var(--registry-muted);
}

.filename {
  word-break: break-all;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.upload-dialog-body {
  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(35, 95, 115, 0.08), rgba(181, 107, 50, 0.08));
  }
}

.upload-dialog-drop {
  display: flex;
  min-height: 190px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;

  img {
    max-width: 92%;
    max-height: 170px;
    object-fit: contain;
  }

  span {
    color: var(--registry-ink);
    font-weight: 700;
  }

  small {
    color: var(--registry-muted);
  }
}

.remark-form {
  margin-top: 18px;
}

.preview-dialog-body {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(45deg, rgba(29, 42, 47, 0.04) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(29, 42, 47, 0.04) 25%, transparent 25%), #fbfaf5;
  background-size: 18px 18px;

  img {
    max-width: 90%;
    max-height: 240px;
    object-fit: contain;
    filter: drop-shadow(0 12px 28px rgba(29, 42, 47, 0.14));
  }
}

@media (max-width: 760px) {
  .signature-admin-hero {
    display: block;
  }

  .hero-stamp {
    margin-top: 12px;
  }
}
</style>
