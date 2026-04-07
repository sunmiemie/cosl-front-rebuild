<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { CirclePlus, Delete, Refresh, Search, View } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import {
  changeHaltHassVersion,
  deleteHaltHassProcess,
  getHaltHassProcessList,
  submitHaltHassToCheck
} from "@/api/halt-hass"
import type { HaltHassProcessListItem } from "@/api/halt-hass/types"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined

const router = useRouter()
const loading = ref(false)
const tableData = ref<HaltHassProcessListItem[]>([])
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const searchData = reactive({
  name: "",
  status: ""
})

const statusOptions = [
  { label: "全部", value: "" },
  { label: "草稿", value: "0" },
  { label: "待审核", value: "1" },
  { label: "待修改", value: "2" },
  { label: "已通过", value: "3" }
]

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

const getTableData = async () => {
  loading.value = true
  try {
    const res = await getHaltHassProcessList({
      currentPage: paginationData.currentPage,
      pageSize: paginationData.pageSize,
      name: searchData.name || undefined,
      status: searchData.status || undefined
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      paginationData.total = res.data.total
    } else {
      tableData.value = []
    }
  } catch (error) {
    console.error(error)
    tableData.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  paginationData.currentPage = 1
  getTableData()
}

const resetSearch = () => {
  searchData.name = ""
  searchData.status = ""
  handleSearch()
}

const handleView = (row: HaltHassProcessListItem) => {
  router.push(`/testmanage/halt-hass/detail/${row.id}`)
}

const handleSubmitCheck = async (row: HaltHassProcessListItem) => {
  await ElMessageBox.confirm(`确认提交工艺“${row.name}”进行审核吗？`, "提交审核", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  })

  try {
    const res = await submitHaltHassToCheck({ id: row.id })
    if (res.code === 0) {
      ElMessage.success("提交成功")
      getTableData()
    } else {
      ElMessage.error(res.msg || "提交失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("提交失败")
  }
}

const handleDelete = async (row: HaltHassProcessListItem) => {
  await ElMessageBox.confirm(`确认删除工艺“${row.name}”吗？删除后不可恢复。`, "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })

  try {
    const res = await deleteHaltHassProcess(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      getTableData()
    } else {
      ElMessage.error(res.msg || "删除失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("删除失败")
  }
}

const handleActivate = async (row: HaltHassProcessListItem) => {
  await ElMessageBox.confirm(`确认将工艺“${row.name} v${row.version}”设为当前激活版本吗？`, "激活版本", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  })

  try {
    const res = await changeHaltHassVersion({ ID: row.id, version: row.version })
    if (res.code === 0) {
      ElMessage.success("激活成功")
      getTableData()
    } else {
      ElMessage.error(res.msg || "激活失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("激活失败")
  }
}

const canDelete = (status: number) => status === 0 || status === 2
const canSubmit = (status: number) => status === 0 || status === 2
const canActivate = (row: HaltHassProcessListItem) => row.status === 3 && row.active !== 1

watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="search-wrapper">
        <el-form :inline="true" :model="searchData">
          <el-form-item label="工艺名称">
            <el-input v-model="searchData.name" placeholder="请输入工艺名称" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchData.status" placeholder="请选择状态" clearable style="width: 140px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" type="primary" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar-wrapper">
        <el-tooltip content="HALT-HASS 工艺需在客户端创建和编辑">
          <el-button :icon="CirclePlus" type="primary" disabled>新增工艺</el-button>
        </el-tooltip>
        <el-button :icon="Refresh" circle type="primary" @click="getTableData" />
      </div>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="tableData" stripe border>
          <el-table-column prop="id" label="工艺 ID" align="center" width="90" />
          <el-table-column prop="name" label="工艺名称" align="center" min-width="160" />
          <el-table-column prop="version" label="版本" align="center" width="100" />
          <el-table-column label="关联板组" align="center" min-width="180">
            <template #default="{ row }">
              <el-tag v-for="boardGroup in row.boardGroups" :key="boardGroup.id" type="info" size="small" style="margin: 2px">
                {{ boardGroup.name }}
              </el-tag>
              <span v-if="!row.boardGroups?.length">-</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="激活" align="center" width="90">
            <template #default="{ row }">
              <el-tag :type="row.active === 1 ? 'success' : 'info'">
                {{ row.active === 1 ? "已激活" : "未激活" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="创建人" align="center" width="100" />
          <el-table-column prop="createdAt" label="创建时间" align="center" width="180" />
          <el-table-column prop="auditNum" label="审核次数" align="center" width="90" />
          <el-table-column label="操作" align="center" width="260" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="handleView(row)">详情</el-button>
              <el-button v-if="canActivate(row)" type="success" link @click="handleActivate(row)">激活</el-button>
              <el-button v-if="canSubmit(row.status)" type="warning" link @click="handleSubmitCheck(row)">提交审核</el-button>
              <el-button v-if="canDelete(row.status)" type="danger" link :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
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
