<!-- HALT-HASS 工艺详情页 -->

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { ArrowLeft, Check, Close } from "@element-plus/icons-vue"
import { getHaltHassProcessDetail, checkHaltHassPass, submitHaltHassToCheck } from "@/api/halt-hass"
import type { HaltHassProcessDetail, InstallGuideStep } from "@/api/halt-hass/types"
import InstallGuideViewer from "./components/InstallGuideViewer.vue"
import FlowchartPreview from "./components/FlowchartPreview.vue"
import AuditPanel from "./components/AuditPanel.vue"
import { useUserStore } from "@/store/modules/user"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const processId = computed(() => Number(route.params.id))
const detail = ref<HaltHassProcessDetail | null>(null)

// 当前激活的标签页
const activeTab = ref("basic")

// 获取状态标签类型
const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: "info",
    1: "warning",
    2: "danger",
    3: "success"
  }
  return map[status] || "info"
}

// 获取状态文本
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: "草稿",
    1: "待审核",
    2: "待修改",
    3: "已通过"
  }
  return map[status] || "未知"
}

// 获取详情数据
const fetchDetail = () => {
  loading.value = true
  getHaltHassProcessDetail(processId.value)
    .then((res) => {
      if (res.code === 0) {
        detail.value = res.data
      } else {
        ElMessage.error("获取详情失败")
      }
    })
    .catch(() => {
      ElMessage.error("获取详情失败")
    })
    .finally(() => {
      loading.value = false
    })
}

// 返回列表
const goBack = () => {
  // 如果是从审核页面进入的，返回审核列表
  if (route.query.audit === 'true') {
    router.push("/testmanage/checkprocess")
  } else {
    // 否则返回工艺列表
    router.push("/testmanage/testprocess")
  }
}

// 提交审核
const handleSubmitCheck = () => {
  if (!detail.value) return
  ElMessageBox.confirm(`确认提交工艺「${detail.value.name}」进行审核？`, "提交审核", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(() => {
    submitHaltHassToCheck({ id: detail.value!.id }).then((res: any) => {
      if (res.code === 0) {
        ElMessage.success("提交成功")
        fetchDetail()
      } else {
        ElMessage.error(res.msg || "提交失败")
      }
    })
  })
}

// 审核操作
const handleAudit = (pass: boolean, reason?: string) => {
  if (!detail.value) return
  checkHaltHassPass({
    id: detail.value.id,
    pass,
    user: userStore.userId,
    reason: reason || ""
  }).then((res: any) => {
    if (res.code === 0) {
      ElMessage.success(pass ? "审核通过" : "审核不通过")
      fetchDetail()
    } else {
      ElMessage.error(res.msg || "审核操作失败")
    }
  })
}

// 判断是否可以审核（需要状态为待审核 且 从审核入口进入）
const canAudit = computed(() => {
  return detail.value?.status === 1 && route.query.audit === 'true'
})

// 判断是否可提交审核
const canSubmit = computed(() => {
  return detail.value?.status === 0 || detail.value?.status === 2
})

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="app-container">
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600">HALT-HASS 工艺详情</span>
      </template>
      <template #extra>
        <div class="flex items-center">
          <el-button v-if="canSubmit" type="primary" @click="handleSubmitCheck">提交审核</el-button>
        </div>
      </template>
    </el-page-header>

    <el-card v-loading="loading" shadow="never" style="margin-top: 20px">
      <template v-if="detail">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="工艺ID">{{ detail.id }}</el-descriptions-item>
              <el-descriptions-item label="工艺名称">{{ detail.name }}</el-descriptions-item>
              <el-descriptions-item label="版本">{{ detail.version }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(detail.status)">{{ getStatusText(detail.status) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建人">{{ detail.userName }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="审核次数">{{ detail.auditNum }}</el-descriptions-item>
              <el-descriptions-item label="是否激活">
                <el-tag :type="detail.active === 1 ? 'success' : 'info'">
                  {{ detail.active === 1 ? "已激活" : "未激活" }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="关联电路板组" :span="2">
                <el-tag
                  v-for="bg in detail.boardGroups"
                  :key="bg.id"
                  type="info"
                  size="small"
                  style="margin-right: 8px"
                >
                  {{ bg.name }}
                </el-tag>
                <span v-if="!detail.boardGroups || detail.boardGroups.length === 0">-</span>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 审核意见 -->
            <div v-if="detail.feedback && detail.feedback.length > 0" class="feedback-section">
              <h4>审核意见</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in detail.feedback"
                  :key="index"
                  :type="index === detail.feedback.length - 1 ? 'danger' : 'info'"
                >
                  {{ item }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>

          <!-- 安装指导 -->
          <el-tab-pane label="安装指导" name="installGuide">
            <InstallGuideViewer
              v-if="detail.processJson?.installGuide"
              :install-guide="detail.processJson.installGuide"
            />
            <el-empty v-else description="暂无安装指导内容" />
          </el-tab-pane>

          <!-- 流程图 -->
          <el-tab-pane label="测试流程图" name="flowchart">
            <FlowchartPreview
              v-if="detail.processJson?.flowchart"
              :flowchart="detail.processJson.flowchart"
            />
            <el-empty v-else description="暂无流程图内容" />
          </el-tab-pane>

          <!-- 审核操作 -->
          <el-tab-pane v-if="canAudit" label="审核操作" name="audit">
            <AuditPanel @audit="handleAudit" />
          </el-tab-pane>
        </el-tabs>
      </template>

      <el-empty v-else-if="!loading" description="未找到工艺详情" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.feedback-section {
  margin-top: 24px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;

  h4 {
    margin-bottom: 16px;
    color: #303133;
  }
}
</style>
