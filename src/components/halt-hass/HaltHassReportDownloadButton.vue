<script setup lang="ts">
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { downloadHaltHassReport } from "@/api/halt-hass"

const props = withDefaults(defineProps<{
  reportId: number
  reportNo?: string | null
  reportType?: "drive_control" | "rectifier_regulator"
  link?: boolean
}>(), {
  reportNo: "",
  reportType: "drive_control",
  link: true
})

const loading = ref(false)

async function handleDownload() {
  loading.value = true
  try {
    const content = await downloadHaltHassReport(props.reportId)
    const blob = content instanceof Blob
      ? content
      : new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = href
    const reportName = props.reportType === "rectifier_regulator"
      ? "HSVP整流稳压电路HASS测试记录表"
      : "HSVP驱动控制电路HASS测试记录表"
    anchor.download = `${reportName}-${props.reportNo || props.reportId}.docx`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(href)
  } catch (error) {
    console.error(error)
    ElMessage.error("报告下载失败")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-button type="primary" :link="link" :loading="loading" @click="handleDownload">下载</el-button>
</template>
