<!--检测项库列表-->

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import {ElMessage, ElTree, type FormInstance, type FormRules} from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import {createCheckItemApi, getCheckItemApi, getDirectoryApi, updateCheckItemApi} from "@/api/check-item";
import {CirclePlus} from "@element-plus/icons-vue";
import {GetCheckItem} from "@/api/check-item/types/check-item";

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)

const treeLoading = ref<boolean>(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const modelId = ref<string>("")
const dialogVisible = ref<boolean>(false)

ref([
  { id: "0", name: "待测试" },
  { id: "1", name: "测试正常" },
  { id: "2", name: "测试异常" }
])

const headers = ref<any>([
  { prop: "id", label: "检测项ID", align: "center" },
  { prop: "name", label: "检测项名称", align: "center" },
  { prop: "operation_desc", label: "操作描述", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "right" }
])

const defaultProps = {
  children: "children",
  label: "label"
}

const TreeData = ref<any>([])

const getTreeData = () => {
  treeLoading.value = true
  getDirectoryApi({
    currentPage: 1,
    size: 999999,
    isTree: true
  })
    .then((res) => {
      TreeData.value = res.data.list
    })
    .catch(() => {
      TreeData.value = []
    })
    .finally(() => {
      treeLoading.value = false
    })
}

const secondLevelDirectoryId = ref<string | undefined>(undefined)

const handleNodeClick = (data: any) => {
  if (data.children === undefined) {
    secondLevelDirectoryId.value = data.id
    getTableData()
  }
}

const getTableData = () => {
  loading.value = true
  getCheckItemApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    secondLevelDirectoryId: secondLevelDirectoryId.value!
  })
    .then((res) => {
      paginationData.total = res.data.total
      tableData.value = res.data.list
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const currentUpdateId = ref<undefined | string>(undefined)

const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  name: "",
  operation_desc: "",
})
const formRules: FormRules = reactive({})
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.name = ""
  formData.operation_desc = ""
  getTableData()
}
const tableData = ref<GetCheckItem[]>([])
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createCheckItemApi({...formData, secondLevelDirectoryId: secondLevelDirectoryId.value!})
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateCheckItemApi({
          id: currentUpdateId.value,
          name: formData.name,
          operation_desc: formData.operation_desc
        })
          .then(() => {
            ElMessage.success("修改成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      }
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

const selectedRows = ref([])

const handleSelectionChange = (val: any) => {
  console.log("index", val)
  selectedRows.value = val
}

// 编辑
const handleLink = (data: any) => {
  currentUpdateId.value = data.id
  formData.name = data.name
  formData.operation_desc = data.operation_desc
  dialogVisible.value = true
}

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}
//#endregion

onMounted(() => {
  watch([() => paginationData.currentPage, () => paginationData.pageSize], getTreeData, { immediate: true })
  /** 监听分页参数的变化 */
  watch([() => paginationData.currentPage, () => paginationData.pageSize, () => modelId], getTableData, {
    immediate: false
  })
})
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card v-loading="treeLoading" shadow="never" style="height: 100%">
          <el-tree
            class="filter-tree"
            :data="TreeData"
            :props="defaultProps"
            node-key="id"
            :default-expanded-keys="[1]"
            accordion
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col v-if="secondLevelDirectoryId === undefined" :span="19">
        <el-card shadow="never" style="height: 100%">
          <el-empty description="请选择检测类型" />
        </el-card>
      </el-col>
      <el-col v-else :span="19">
        <el-card v-loading="loading" shadow="never">
          <div class="toolbar-wrapper">
            <div>
              <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增检测项</el-button>
            </div>
<!--            <div>-->
<!--              <el-tooltip content="刷新当前页">-->
<!--                <el-button type="primary" icon="refresh-right" circle @click="getTableData" />-->
<!--              </el-tooltip>-->
<!--            </div>-->
          </div>
          <div class="table-wrapper">
            <TableComponent
              :tableData="tableData"
              :column-data="headers"
              stripe
              @selection-change="handleSelectionChange"
            >
              <template #link="{ row }">
                <el-link type="primary" class="el-link" @click="handleLink(row)">编辑</el-link>
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
      </el-col>
      <!-- 新增/修改 -->
      <el-dialog
        v-model="dialogVisible"
        :title="currentUpdateId === undefined ? '新增检测项' : '修改检测项'"
        @close="resetForm"
        width="30%"
      >
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
          <el-form-item prop="name" label="检测项名称">
            <el-input v-model="formData.name" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="operation_desc" label="操作描述">
            <el-input v-model="formData.operation_desc" placeholder="请输入" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">确认</el-button>
        </template>
      </el-dialog>
    </el-row>
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

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.addbutton {
  width: 10vw;
}

.drawer-head {
  height: 5%;
}
</style>
