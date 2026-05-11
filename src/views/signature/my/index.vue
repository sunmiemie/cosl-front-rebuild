<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"
import { ElMessage, ElMessageBox, type UploadFile, type UploadProps, type UploadUserFile } from "element-plus"
import { deleteMySignatureApi, getMySignatureApi, getSignatureImageApi, uploadMySignatureApi } from "@/api/signature"
import type { SignatureInfo } from "@/api/signature/types"

const signatureInfo = ref<SignatureInfo | null>(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const fileList = ref<UploadUserFile[]>([])
const selectedFile = ref<File | null>(null)
const selectedPreviewUrl = ref("")
const savedPreviewUrl = ref("")
const remark = ref("")

const currentPreviewUrl = computed(() => selectedPreviewUrl.value || savedPreviewUrl.value)
const signatureStateText = computed(() => (signatureInfo.value?.hasSignature ? "已上传" : "未上传"))
const canSave = computed(() => !!selectedFile.value && !saving.value)

const formatFileSize = (size?: number) => {
  if (!size) return "--"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

const revokeUrl = (url: string) => {
  if (url) URL.revokeObjectURL(url)
}

const clearSelectedFile = () => {
  revokeUrl(selectedPreviewUrl.value)
  selectedPreviewUrl.value = ""
  selectedFile.value = null
  fileList.value = []
}

const loadSavedImage = async (info: SignatureInfo | null) => {
  revokeUrl(savedPreviewUrl.value)
  savedPreviewUrl.value = ""
  if (!info?.hasSignature) return
  const blob = await getSignatureImageApi(info.userId)
  savedPreviewUrl.value = URL.createObjectURL(blob)
}

const getSignature = async () => {
  loading.value = true
  try {
    const res = await getMySignatureApi()
    signatureInfo.value = res.data
    remark.value = res.data?.remark || ""
    clearSelectedFile()
    await loadSavedImage(res.data)
  } catch (error) {
    console.error(error)
    ElMessage.error("获取签名信息失败")
  } finally {
    loading.value = false
  }
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

const handleFileChange: UploadProps["onChange"] = (file: UploadFile) => {
  const raw = file.raw
  clearSelectedFile()
  if (!raw || !validateUploadFile(raw)) return
  selectedFile.value = raw
  selectedPreviewUrl.value = URL.createObjectURL(raw)
  fileList.value = [
    {
      name: raw.name,
      url: selectedPreviewUrl.value,
      status: "success"
    }
  ]
}

const saveSignature = async () => {
  if (!selectedFile.value) {
    ElMessage.warning("请先选择签名图片")
    return
  }
  saving.value = true
  try {
    const formData = new FormData()
    formData.append("signature", selectedFile.value)
    formData.append("remark", remark.value || "")
    const res = await uploadMySignatureApi(formData)
    signatureInfo.value = res.data
    await loadSavedImage(res.data)
    clearSelectedFile()
    ElMessage.success("签名保存成功")
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}

const deleteSignature = async () => {
  try {
    await ElMessageBox.confirm("删除后，后续流程将无法读取你的电子签名，确认删除吗？", "删除签名", {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消"
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    const res = await deleteMySignatureApi()
    signatureInfo.value = res.data
    revokeUrl(savedPreviewUrl.value)
    savedPreviewUrl.value = ""
    clearSelectedFile()
    remark.value = ""
    ElMessage.success("签名已删除")
  } catch (error) {
    console.error(error)
  } finally {
    deleting.value = false
  }
}

onBeforeUnmount(() => {
  revokeUrl(selectedPreviewUrl.value)
  revokeUrl(savedPreviewUrl.value)
})

getSignature()
</script>

<template>
  <div class="app-container signature-desk" v-loading="loading">
    <section class="signature-hero">
      <div>
        <p class="eyebrow">Personal Signature Vault</p>
        <h2>我的电子签名</h2>
        <p>上传、替换或删除你的签名图片。系统在需要签名的业务流程中可按用户读取该签名。</p>
      </div>
      <div class="signature-status" :class="{ ready: signatureInfo?.hasSignature }">
        <span>{{ signatureStateText }}</span>
        <strong>{{ signatureInfo?.username || "--" }}</strong>
      </div>
    </section>

    <section class="signature-grid">
      <el-card class="preview-card" shadow="never">
        <template #header>
          <div class="card-head">
            <span>签名预览</span>
            <el-tag :type="signatureInfo?.hasSignature ? 'success' : 'info'" effect="plain">
              {{ signatureStateText }}
            </el-tag>
          </div>
        </template>
        <div class="signature-preview">
          <img v-if="currentPreviewUrl" :src="currentPreviewUrl" alt="签名预览" />
          <div v-else class="empty-signature">
            <span>暂无签名</span>
            <small>建议上传透明底 PNG 或清晰白底 JPG</small>
          </div>
        </div>
        <div class="signature-meta">
          <div>
            <span>文件名</span>
            <strong>{{ signatureInfo?.originalFilename || "--" }}</strong>
          </div>
          <div>
            <span>文件大小</span>
            <strong>{{ formatFileSize(signatureInfo?.fileSize) }}</strong>
          </div>
          <div>
            <span>上传时间</span>
            <strong>{{ signatureInfo?.uploadedAt || "--" }}</strong>
          </div>
        </div>
      </el-card>

      <el-card class="upload-card" shadow="never">
        <template #header>
          <div class="card-head">
            <span>上传签名</span>
            <small>PNG / JPG / WEBP，最大 5MB</small>
          </div>
        </template>
        <el-upload
          v-model:file-list="fileList"
          class="signature-uploader"
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept="image/png,image/jpeg,image/webp"
          :on-change="handleFileChange"
        >
          <div class="upload-inner">
            <span>点击或拖拽签名图片到这里</span>
            <small>选择后可先预览，再点击保存</small>
          </div>
        </el-upload>
        <el-form label-position="top" class="remark-form">
          <el-form-item label="备注">
            <el-input
              v-model="remark"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="可选，例如签名版本或适用说明"
            />
          </el-form-item>
        </el-form>
        <div class="actions">
          <el-button @click="clearSelectedFile" :disabled="!selectedFile">清空选择</el-button>
          <el-button type="primary" :loading="saving" :disabled="!canSave" @click="saveSignature">保存签名</el-button>
          <el-button
            v-if="signatureInfo?.hasSignature"
            type="danger"
            plain
            :loading="deleting"
            @click="deleteSignature"
          >
            删除当前签名
          </el-button>
        </div>
      </el-card>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.signature-desk {
  --signature-ink: #18272f;
  --signature-muted: #6c7a80;
  --signature-line: #d8e2e4;
  --signature-paper: #fbfaf5;
  --signature-copper: #b96d38;
  --signature-blue: #236778;
}

.signature-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding: 22px 24px;
  border: 1px solid var(--signature-line);
  border-radius: 18px;
  color: var(--signature-ink);
  background: linear-gradient(135deg, rgba(251, 250, 245, 0.96), rgba(232, 241, 242, 0.96)),
    radial-gradient(circle at 82% 18%, rgba(185, 109, 56, 0.18), transparent 28%);

  h2 {
    margin: 4px 0 8px;
    font-size: 26px;
    letter-spacing: 0.04em;
  }

  p {
    margin: 0;
    color: var(--signature-muted);
  }
}

.eyebrow {
  margin: 0;
  color: var(--signature-copper);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.signature-status {
  min-width: 150px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(24, 39, 47, 0.12);
  background: rgba(255, 255, 255, 0.72);

  span,
  strong {
    display: block;
  }

  span {
    color: var(--signature-muted);
    font-size: 13px;
  }

  strong {
    margin-top: 10px;
    color: var(--signature-ink);
    font-size: 18px;
  }

  &.ready {
    border-color: rgba(35, 103, 120, 0.38);
    box-shadow: inset 0 0 0 1px rgba(35, 103, 120, 0.12);
  }
}

.signature-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 18px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  span {
    font-weight: 700;
  }

  small {
    color: var(--signature-muted);
  }
}

.signature-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  border: 1px dashed rgba(24, 39, 47, 0.18);
  border-radius: 16px;
  background: linear-gradient(45deg, rgba(24, 39, 47, 0.04) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(24, 39, 47, 0.04) 25%, transparent 25%), var(--signature-paper);
  background-size: 18px 18px;

  img {
    max-width: 86%;
    max-height: 230px;
    object-fit: contain;
    filter: drop-shadow(0 10px 24px rgba(24, 39, 47, 0.12));
  }
}

.empty-signature {
  text-align: center;
  color: var(--signature-muted);

  span,
  small {
    display: block;
  }

  span {
    margin-bottom: 8px;
    color: var(--signature-ink);
    font-weight: 700;
  }
}

.signature-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;

  div {
    padding: 12px;
    border-radius: 12px;
    background: #f5f8f8;
  }

  span,
  strong {
    display: block;
  }

  span {
    margin-bottom: 6px;
    color: var(--signature-muted);
    font-size: 12px;
  }

  strong {
    color: var(--signature-ink);
    word-break: break-all;
  }
}

.signature-uploader {
  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(35, 103, 120, 0.08), rgba(185, 109, 56, 0.08));
  }
}

.upload-inner {
  display: grid;
  gap: 8px;
  padding: 22px 0;

  span {
    color: var(--signature-ink);
    font-weight: 700;
  }

  small {
    color: var(--signature-muted);
  }
}

.remark-form {
  margin-top: 18px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1100px) {
  .signature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .signature-hero,
  .signature-meta {
    display: block;
  }

  .signature-status,
  .signature-meta div {
    margin-top: 12px;
  }
}
</style>
