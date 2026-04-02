<!--电路板组管理-->

<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getBoardGroupListApi, createBoardGroupApi, updateBoardGroupApi, deleteBoardGroupApi } from "@/api/boardgroup"
import { getInstrumentDataApi } from "@/api/instrument"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import type { BoardGroup } from "@/api/boardgroup/types/boardgroup"
import { checkPermission } from "@/utils/permission"

const loading = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 表格列定义
const headers = checkPermission(["7"])
  ? ref([
      { prop: "id", label: "ID", align: "center", width: 80 },
      { prop: "name", label: "组名称", align: "center" },
      { prop: "description", label: "描述", align: "center" },
      { prop: "boardNames", label: "包含电路板型号", align: "center" },
      { prop: "createdAt", label: "创建时间", align: "center", width: 180 },
      { prop: "link", label: "操作", type: "link", align: "center", width: 150 }
    ])
  : ref([
      { prop: "id", label: "ID", align: "center", width: 80 },
      { prop: "name", label: "组名称", align: "center" },
      { prop: "description", label: "描述", align: "center" },
      { prop: "boardNames", label: "包含电路板型号", align: "center" },
      { prop: "createdAt", label: "创建时间", align: "center", width: 180 }
    ])

// 表格数据
const tableData = ref<any[]>([])

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: ""
})

// 对话框
const dialogVisible = ref(false)
const formRef = ref<FormInstance | null>(null)
const currentUpdateId = ref<number | undefined>(undefined)
const formData = reactive({
  name: "",
  description: "",
  boardModelIds: [] as number[]
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入组名称" }],
  boardModelIds: [{ required: true, trigger: "change", message: "请选择电路板型号" }]
})

// 电路板型号树
const boardModelTree = ref<any[]>([])
const treeProps = {
  children: "children",
  label: "label"
}

// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    const res = await getBoardGroupListApi({
      currentPage: paginationData.currentPage,
      pageSize: paginationData.pageSize,
      name: searchData.name || undefined
    })
    if (res.code === 0) {
      paginationData.total = res.data.total
      tableData.value = res.data.list.map((item: BoardGroup) => ({
        ...item,
        boardNames: item.boards.map((b) => b.name).join("、")
      }))
    }
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 获取电路板型号树
const getBoardModelTree = async () => {
  try {
    const res = await getInstrumentDataApi({
      currentPage: 1,
      size: 999999,
      isTree: true
    })
    boardModelTree.value = res.data.list
  } catch {
    boardModelTree.value = []
  }
}

// 新增
const handleAdd = async () => {
  currentUpdateId.value = undefined
  formData.name = ""
  formData.description = ""
  formData.boardModelIds = []
  await getBoardModelTree()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: BoardGroup) => {
  currentUpdateId.value = row.id
  formData.name = row.name
  formData.description = row.description
  formData.boardModelIds = row.boards.map((b) => b.id)
  await getBoardModelTree()
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: BoardGroup) => {
  ElMessageBox.confirm(`确定要删除电路板组 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await deleteBoardGroupApi(row.id)
      ElMessage.success("删除成功")
      getTableData()
    } catch {
      ElMessage.error("删除失败")
    }
  })
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (currentUpdateId.value === undefined) {
          await createBoardGroupApi({
            name: formData.name,
            description: formData.description,
            boardModelIds: formData.boardModelIds
          })
          ElMessage.success("新增成功")
        } else {
          await updateBoardGroupApi(currentUpdateId.value, {
            name: formData.name,
            description: formData.description,
            boardModelIds: formData.boardModelIds
          })
          ElMessage.success("修改成功")
        }
        dialogVisible.value = false
        getTableData()
      } catch {
        ElMessage.error(currentUpdateId.value === undefined ? "新增失败" : "修改失败")
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.name = ""
  formData.description = ""
  formData.boardModelIds = []
}

// 搜索
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

// 重置搜索
const resetSearch = () => {
  searchData.name = ""
  getTableData()
}

// 监听分页参数变化
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="组名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button v-permission="['7']" type="primary" icon="CirclePlus" @click="handleAdd"> 新增电路板组 </el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="tableData" :column-data="headers" stripe>
          <template v-if="checkPermission(['7'])" #link="{ row }">
            <el-link type="primary" class="el-link" @click="handleEdit(row)">编辑</el-link>
            <el-link type="danger" class="el-link" @click="handleDelete(row)">删除</el-link>
          </template>
        </TableComponent>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/修改对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增电路板组' : '修改电路板组'"
      @close="resetForm"
      width="50%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="130px" label-position="left">
        <el-form-item prop="name" label="组名称">
          <el-input v-model="formData.name" placeholder="请输入组名称" />
        </el-form-item>
        <el-form-item prop="description" label="描述">
          <el-input type="textarea" v-model="formData.description" placeholder="请输入描述" :rows="3" />
        </el-form-item>
        <el-form-item prop="boardModelIds" label="电路板型号">
          <el-tree-select
            v-model="formData.boardModelIds"
            :data="boardModelTree"
            :props="treeProps"
            multiple
            filterable
            :render-after-expand="false"
            show-checkbox
            check-strictly
            node-key="id"
            placeholder="请选择电路板型号"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
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

.el-link {
  margin-right: 10px;
}
</style>
