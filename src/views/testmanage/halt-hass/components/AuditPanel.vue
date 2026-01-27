<!-- 审核操作面板组件 -->

<script lang="ts" setup>
import { ref } from "vue"
import { ElMessageBox } from "element-plus"
import { Check, Close } from "@element-plus/icons-vue"

const emit = defineEmits<{
  (e: "audit", pass: boolean, reason?: string): void
}>()

const rejectReason = ref("")
const showRejectDialog = ref(false)

// 审核通过
const handlePass = () => {
  ElMessageBox.confirm("确认审核通过该工艺？", "审核通过", {
    confirmButtonText: "确认通过",
    cancelButtonText: "取消",
    type: "success"
  }).then(() => {
    emit("audit", true)
  })
}

// 打开驳回对话框
const handleRejectClick = () => {
  rejectReason.value = ""
  showRejectDialog.value = true
}

// 确认驳回
const confirmReject = () => {
  if (!rejectReason.value.trim()) {
    ElMessageBox.alert("请输入驳回原因", "提示", { type: "warning" })
    return
  }
  emit("audit", false, rejectReason.value)
  showRejectDialog.value = false
}
</script>

<template>
  <div class="audit-panel">
    <el-alert
      title="审核说明"
      description="请仔细查看工艺的基本信息、安装指导和测试流程图内容，确认无误后进行审核操作。"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 24px"
    />

    <div class="audit-actions">
      <el-card shadow="hover" class="action-card pass-card">
        <div class="action-content">
          <el-icon class="action-icon" color="#67c23a" :size="48">
            <Check />
          </el-icon>
          <h3>审核通过</h3>
          <p>工艺内容符合要求，可以投入使用</p>
          <el-button type="success" size="large" @click="handlePass">
            <el-icon><Check /></el-icon>
            通过
          </el-button>
        </div>
      </el-card>

      <el-card shadow="hover" class="action-card reject-card">
        <div class="action-content">
          <el-icon class="action-icon" color="#f56c6c" :size="48">
            <Close />
          </el-icon>
          <h3>审核驳回</h3>
          <p>工艺内容存在问题，需要修改后重新提交</p>
          <el-button type="danger" size="large" @click="handleRejectClick">
            <el-icon><Close /></el-icon>
            驳回
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 驳回原因对话框 -->
    <el-dialog v-model="showRejectDialog" title="填写驳回原因" width="500px">
      <el-form>
        <el-form-item label="驳回原因" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请详细描述驳回原因，以便工艺创建者进行修改..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.audit-panel {
  padding: 16px;

  .audit-actions {
    display: flex;
    gap: 24px;
    justify-content: center;

    .action-card {
      width: 280px;
      cursor: default;

      .action-content {
        text-align: center;
        padding: 20px;

        .action-icon {
          margin-bottom: 16px;
        }

        h3 {
          margin-bottom: 12px;
          color: #303133;
        }

        p {
          margin-bottom: 20px;
          color: #909399;
          font-size: 14px;
        }
      }
    }

    .pass-card {
      border: 2px solid #e8f5e9;

      &:hover {
        border-color: #67c23a;
      }
    }

    .reject-card {
      border: 2px solid #ffebee;

      &:hover {
        border-color: #f56c6c;
      }
    }
  }
}
</style>
