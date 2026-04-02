<!-- HALT-HASS 工艺列表页 -->

<script lang="ts" setup>
import { reactive, ref, watch, computed } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search, View, Delete } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import {
  getHaltHassProcessList,
  deleteHaltHassProcess,
  submitHaltHassToCheck,
  changeHaltHassVersion
} from "@/api/halt-hass"
import type { HaltHassProcessListItem } from "@/api/halt-hass/types"

const router = useRouter()
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 列表数据
const tableData = ref<HaltHassProcessListItem[]>([])

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: "",
  status: ""
})

// 表格列配置
const headers = ref([
  { prop: "id", label: "工艺ID", align: "center", width: 80 },
  { prop: "name", label: "工艺名称", align: "center" },
  { prop: "version", label: "版本", align: "center", width: 100 },
  { prop: "boardGroups", label: "关联电路板组", align: "center", type: "slot" },
  { prop: "status", label: "状态", align: "center", type: "slot", width: 100 },
  { prop: "userName", label: "创建人", align: "center", width: 100 },
  { prop: "createdAt", label: "创建时间", align: "center", width: 160 },
  { prop: "auditNum", label: "审核次数", align: "center", width: 80 },
  { prop: "action", label: "操作", align: "center", type: "slot", width: 200 }
])

// 状态选项
const statusOptions = [
  { label: "全部", value: "" },
  { label: "草稿", value: "0" },
  { label: "待审核", value: "1" },
  { label: "待修改", value: "2" },
  { label: "已通过", value: "3" }
]

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

// 获取列表数据
const getTableData = () => {
  loading.value = true
  getHaltHassProcessList({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    name: searchData.name,
    status: searchData.status
  })
    .then((res) => {
      if (res.code === 0) {
        tableData.value = res.data.list
        paginationData.total = res.data.total
      } else {
        tableData.value = []
      }
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索
const handleSearch = () => {
  paginationData.currentPage = 1
  getTableData()
}

// 重置搜索
const resetSearch = () => {
  searchData.name = ""
  searchData.status = ""
  handleSearch()
}

// 查看详情
const handleView = (row: HaltHassProcessListItem) => {
  router.push(`/testmanage/halt-hass/detail/${row.id}`)
}

// 提交审核
const handleSubmitCheck = (row: HaltHassProcessListItem) => {
  ElMessageBox.confirm(`确认提交工艺「${row.name}」进行审核？`, "提交审核", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(() => {
    submitHaltHassToCheck({ id: row.id }).then((res: any) => {
      if (res.code === 0) {
        ElMessage.success("提交成功")
        getTableData()
      } else {
        ElMessage.error(res.msg || "提交失败")
      }
    })
  })
}

// 删除工艺
const handleDelete = (row: HaltHassProcessListItem) => {
  ElMessageBox.confirm(`确认删除工艺「${row.name}」？删除后不可恢复！`, "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteHaltHassProcess(row.id).then((res: any) => {
      if (res.code === 0) {
        ElMessage.success("删除成功")
        getTableData()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    })
  })
}

// 激活工艺
const handleActivate = (row: HaltHassProcessListItem) => {
  ElMessageBox.confirm(`确认将工艺「${row.name} v${row.version}」设为当前激活版本？`, "激活确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(() => {
    changeHaltHassVersion({ ID: row.id, version: row.version }).then((res: any) => {
      if (res.code === 0) {
        ElMessage.success("激活成功")
        getTableData()
      } else {
        ElMessage.error(res.msg || "激活失败")
      }
    })
  })
}

// 判断是否可删除
const canDelete = (status: number) => {
  return status === 0 || status === 2
}

// 判断是否可提交审核
const canSubmit = (status: number) => {
  return status === 0 || status === 2
}

// 判断是否可激活（已通过且未激活）
const canActivate = (row: HaltHassProcessListItem) => {
  return row.status === 3 && row.active !== 1
}

// 监听分页变化
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true" :model="searchData">
          <el-form-item label="工艺名称">
            <el-input v-model="searchData.name" placeholder="请输入工艺名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchData.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" type="primary" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar-wrapper">
        <div>
          <!-- 新增按钮暂不提供，需在 Tauri 客户端编辑 -->
          <el-tooltip content="HALT-HASS 工艺需在客户端创建和编辑">
            <el-button :icon="CirclePlus" type="primary" disabled>新增工艺</el-button>
          </el-tooltip>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button :icon="RefreshRight" circle type="primary" @click="getTableData" />
          </el-tooltip>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-wrapper">
        <el-table v-loading="loading" :data="tableData" stripe border>
          <el-table-column prop="id" label="工艺ID" align="center" width="80" />
          <el-table-column prop="name" label="工艺名称" align="center" min-width="120" />
          <el-table-column prop="version" label="版本" align="center" width="100" />
          <el-table-column label="关联电路板组" align="center" min-width="150">
            <template #default="{ row }">
              <el-tag v-for="bg in row.boardGroups" :key="bg.id" type="info" size="small" style="margin: 2px">
                {{ bg.name }}
              </el-tag>
              <span v-if="!row.boardGroups || row.boardGroups.length === 0">-</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="激活" align="center" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.active === 1" type="success">已激活</el-tag>
              <el-tag v-else type="info">未激活</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="创建人" align="center" width="100" />
          <el-table-column prop="createdAt" label="创建时间" align="center" width="160" />
          <el-table-column prop="auditNum" label="审核次数" align="center" width="80" />
          <el-table-column label="操作" align="center" width="250" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="handleView(row)">详情</el-button>
              <el-button v-if="canActivate(row)" type="success" link @click="handleActivate(row)"> 激活 </el-button>
              <el-button v-if="canSubmit(row.status)" type="warning" link @click="handleSubmitCheck(row)">
                提交审核
              </el-button>
              <el-button v-if="canDelete(row.status)" type="danger" link :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pager-wrapper">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
