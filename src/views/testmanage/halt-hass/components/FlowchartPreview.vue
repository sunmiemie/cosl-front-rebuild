<!-- 流程图预览组件（静态展示） -->

<script lang="ts" setup>
import { computed } from "vue"
import type { FlowchartData, FlowchartNode } from "@/api/halt-hass/types"

const props = defineProps<{
  flowchart: FlowchartData
}>()

// 获取节点类型显示名称
const getNodeTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    hardware: "硬件节点",
    data: "数据节点",
    visualization: "可视化节点",
    ctrlflow: "控制流节点",
    default: "默认节点"
  }
  return typeMap[type] || type
}

// 获取节点类型标签颜色
const getNodeTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    hardware: "warning",
    data: "primary",
    visualization: "success",
    ctrlflow: "danger",
    default: "info"
  }
  return colorMap[type] || "info"
}

// 节点列表
const nodeList = computed(() => {
  return props.flowchart?.nodes || []
})

// 边列表
const edgeList = computed(() => {
  return props.flowchart?.edges || []
})

// 统计信息
const stats = computed(() => {
  const nodes = props.flowchart?.nodes || []
  const edges = props.flowchart?.edges || []

  // 按类型分组统计
  const typeCount: Record<string, number> = {}
  nodes.forEach((node) => {
    const type = node.type || "default"
    typeCount[type] = (typeCount[type] || 0) + 1
  })

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    typeCount
  }
})
</script>

<template>
  <div class="flowchart-preview">
    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-statistic title="节点总数" :value="stats.totalNodes" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="连接总数" :value="stats.totalEdges" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="节点类型" :value="Object.keys(stats.typeCount).length" />
      </el-col>
    </el-row>

    <!-- 类型分布 -->
    <div class="type-distribution">
      <h4>节点类型分布</h4>
      <div class="type-tags">
        <el-tag
          v-for="(count, type) in stats.typeCount"
          :key="type"
          :type="getNodeTypeColor(type as string)"
          size="large"
          class="type-tag"
        >
          {{ getNodeTypeLabel(type as string) }}: {{ count }}
        </el-tag>
      </div>
    </div>

    <!-- 节点列表 -->
    <div class="node-list">
      <h4>节点列表</h4>
      <el-table :data="nodeList" stripe border max-height="400">
        <el-table-column prop="id" label="节点ID" width="150" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getNodeTypeColor(row.type)" size="small">
              {{ getNodeTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="名称/标签">
          <template #default="{ row }">
            {{ row.data?.label || row.data?.name || row.data?.block_name || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="位置" width="150">
          <template #default="{ row }">
            ({{ Math.round(row.position?.x || 0) }}, {{ Math.round(row.position?.y || 0) }})
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 连接列表 -->
    <div v-if="edgeList.length > 0" class="edge-list">
      <h4>连接列表</h4>
      <el-table :data="edgeList" stripe border max-height="300">
        <el-table-column prop="id" label="连接ID" width="200" />
        <el-table-column prop="source" label="源节点" />
        <el-table-column prop="target" label="目标节点" />
      </el-table>
    </div>

    <!-- 提示信息 -->
    <el-alert
      title="完整流程图请在客户端查看"
      description="管理端仅提供节点和连接的静态列表展示，如需查看完整的可视化流程图，请使用 COSL 客户端。"
      type="info"
      show-icon
      :closable="false"
      style="margin-top: 20px"
    />
  </div>
</template>

<style lang="scss" scoped>
.flowchart-preview {
  padding: 16px;

  .stats-row {
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 8px;
  }

  .type-distribution {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #303133;
    }

    .type-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .type-tag {
        font-size: 14px;
      }
    }
  }

  .node-list,
  .edge-list {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #303133;
    }
  }
}
</style>
