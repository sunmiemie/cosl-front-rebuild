<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { checkHaltHassPass, getHaltHassProcessDetail, submitHaltHassToCheck } from "@/api/halt-hass"
import type { HaltHassProcessDetail } from "@/api/halt-hass/types"
import { useUserStore } from "@/store/modules/user"
import AuditPanel from "./components/AuditPanel.vue"
import FlowchartPreview from "./components/FlowchartPreview.vue"
import InstallGuideViewer from "./components/InstallGuideViewer.vue"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref("basic")
const detail = ref<HaltHassProcessDetail | null>(null)

const processId = computed(() => Number(route.params.id))
const canAudit = computed(() => detail.value?.status === 1 && route.query.audit === "true")
const canSubmit = computed(() => detail.value?.status === 0 || detail.value?.status === 2)

const getStatusType = (status: number): TagType => {
  const map: Record<number, TagType> = {
    0: "info",
    1: "warning",
    2: "danger",
    3: "success"
  }
  return map[status] || "info"
}

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: "草稿",
    1: "待审核",
    2: "待修改",
    3: "已通过"
  }
  return map[status] || "未知"
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await getHaltHassProcessDetail(processId.value)
    if (res.code === 0) {
      detail.value = res.data
    } else {
      ElMessage.error("获取工艺详情失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("获取工艺详情失败")
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (route.query.audit === "true") {
    router.push("/testmanage/checkprocess")
    return
  }
  router.push("/testmanage/testprocess")
}

const handleSubmitCheck = async () => {
  if (!detail.value) return

  await ElMessageBox.confirm(`确认提交工艺“${detail.value.name}”进行审核吗？`, "提交审核", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  })

  try {
    const res = await submitHaltHassToCheck({ id: detail.value.id })
    if (res.code === 0) {
      ElMessage.success("提交成功")
      fetchDetail()
    } else {
      ElMessage.error(res.msg || "提交失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("提交失败")
  }
}

const handleAudit = async (pass: boolean, reason?: string) => {
  if (!detail.value || !userStore.userid) return

  try {
    const res = await checkHaltHassPass({
      id: detail.value.id,
      pass,
      user: userStore.userid,
      reason: reason || ""
    })
    if (res.code === 0) {
      ElMessage.success(pass ? "审核通过" : "审核驳回")
      fetchDetail()
    } else {
      ElMessage.error(res.msg || "审核操作失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("审核操作失败")
  }
}

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
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="工艺 ID">{{ detail.id }}</el-descriptions-item>
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
              <el-descriptions-item label="关联板组" :span="2">
                <el-tag
                  v-for="boardGroup in detail.boardGroups"
                  :key="boardGroup.id"
                  type="info"
                  size="small"
                  style="margin-right: 8px"
                >
                  {{ boardGroup.name }}
                </el-tag>
                <span v-if="!detail.boardGroups?.length">-</span>
              </el-descriptions-item>
            </el-descriptions>

            <div v-if="detail.feedback?.length" class="feedback-section">
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

          <el-tab-pane label="安装指引" name="installGuide">
            <InstallGuideViewer
              v-if="detail.processJson?.installGuide"
              :install-guide="detail.processJson.installGuide"
            />
            <el-empty v-else description="暂无安装指引内容" />
          </el-tab-pane>

          <el-tab-pane label="测试流" name="testFlow">
            <FlowchartPreview
              v-if="detail.processJson?.testFlow"
              :flowchart="detail.processJson.testFlow"
            />
            <el-empty v-else description="暂无测试流内容" />
          </el-tab-pane>

          <el-tab-pane label="循环流" name="cycleFlow">
            <FlowchartPreview
              v-if="detail.processJson?.cycleFlow"
              :flowchart="detail.processJson.cycleFlow"
            />
            <el-empty v-else description="暂无循环流内容" />
          </el-tab-pane>

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
