<!-- 检测项库列表 -->

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from "vue"
import { ElMessage, ElTree, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import {
  createCheckItemApi,
  createFirstLevelDirectoryApi,
  createSecondLevelDirectoryApi,
  getCheckItemApi,
  getDirectoryApi,
  getFirstLevelDirectoryApi,
  updateCheckItemApi
} from "@/api/check-item"
import { CirclePlus } from "@element-plus/icons-vue"
import { FirstLevelDirectory, CheckItem } from "@/api/check-item/types/check-item"

// 一级目录列表
const firstLevelDirectoryList = ref<FirstLevelDirectory[]>([])
// 获取一级目录列表
getFirstLevelDirectoryApi().then((res) => {
  firstLevelDirectoryList.value = res.data
})

const directoryDialogVisible = ref(false)
const directoryFormRef = ref<FormInstance | null>(null)
const directoryFormData = reactive<any>({
  firstLevelDirectoryId: "",
  secondLevelDirectoryName: ""
})
const clearDirectoryFormData = () => {
  Object.keys(directoryFormData).forEach((key) => (directoryFormData[key] = ""))
}
const directoryFormRules: FormRules = reactive({
  firstLevelDirectoryId: [{ required: true, trigger: "blur", message: "请选择一级目录" }],
  secondLevelDirectoryName: [{ required: true, trigger: "blur", message: "请输入二级目录" }]
})
const firstLevelDirectoryName = ref("")
const isAdding = ref(false)
const clear = () => {
  firstLevelDirectoryName.value = ""
  isAdding.value = false
}
const directorySelectRef = ref(null)
const onConfirm = () => {
  if (firstLevelDirectoryName.value) {
    createFirstLevelDirectoryApi({ name: firstLevelDirectoryName.value })
      .then((res) => {
        firstLevelDirectoryList.value = [
          { id: res.id, name: firstLevelDirectoryName.value },
          ...firstLevelDirectoryList.value
        ]
        directoryFormData.firstLevelDirectoryId = res.id
        clear()

        const selectComponent = directorySelectRef.value as any
        if (selectComponent) {
          selectComponent.blur()
        }
        nextTick(() => {
          directoryFormRef.value?.validateField("firstLevelDirectoryId")
        })
      })
  }
}
// 树形结构展开的节点 ID
const expandTreeNodeId = ref(1)
const createSecondLevelDirectory = () => {
  directoryFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      createSecondLevelDirectoryApi({ ...directoryFormData })
        .then(() => {
          expandTreeNodeId.value = directoryFormData.firstLevelDirectoryId
          ElMessage.success("新增成功")
          getTreeData()
        })
        .finally(() => {
          directoryDialogVisible.value = false
        })
    } else {
      ElMessage.error("请填写完整")
      console.error("表单校验不通过", fields)
    }
  })
}
// 树形控件的默认参数
const defaultProps = {
  children: "children", // 树形结构中的子节点字段
  label: "label" // 节点显示的文本字段
}
const treeData = ref<any>([])
const treeLoading = ref(false)
const getTreeData = () => {
  treeLoading.value = true

  getDirectoryApi()
    .then((res) => {
      treeData.value = res.data
    })
    .catch(() => {
      treeData.value = []
    })
    .finally(() => {
      treeLoading.value = false
    })
}
const secondLevelDirectoryId = ref<number | undefined>(undefined)
const handleNodeClick = (data: any) => {
  if (data.children === undefined) {
    secondLevelDirectoryId.value = data.id
    getTableData()
  }
}
const gettingCheckItems = ref(false)
const getTableData = () => {
  gettingCheckItems.value = true

  getCheckItemApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
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
      gettingCheckItems.value = false
    })
}
const formData = reactive({
  name: "",
  operation_desc: ""
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (checkItemId.value === undefined) {
        createCheckItemApi({
          ...formData,
          secondLevelDirectoryId: secondLevelDirectoryId.value!
        })
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateCheckItemApi({
          id: checkItemId.value,
          ...formData
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

const dialogVisible = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableHeaders = ref<any>([
  { prop: "id", label: "检测项 ID", align: "center" },
  { prop: "name", label: "检测项名称", align: "center" },
  { prop: "operation_desc", label: "操作描述", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "center" }
])

const checkItemId = ref<number | undefined>(undefined)

const resetForm = () => {
  checkItemId.value = undefined
  formData.name = ""
  formData.operation_desc = ""
  getTableData()
}
const tableData = ref<CheckItem[]>([])
const formRef = ref<FormInstance | null>(null)

// 编辑
const handleLink = (data: any) => {
  checkItemId.value = data.id
  formData.name = data.name
  formData.operation_desc = data.operation_desc
  dialogVisible.value = true
}

// const filterNode = (value: string, data: any) => {
//   if (!value) return true
//   return data.label.includes(value)
// }

//#endregion

const newDirInput = ref<HTMLInputElement | null>(null)
const showInput = (): void => {
  isAdding.value = true
  nextTick(() => {
    if (newDirInput.value) {
      newDirInput.value.focus()
    }
  })
}

onMounted(() => {
  watch([() => paginationData.currentPage, () => paginationData.pageSize], getTreeData, { immediate: true })
  /** 监听分页参数的变化 */
  watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, {
    immediate: false
  })
})
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card v-loading="treeLoading" shadow="never" style="height: 100%">
          <template #header>
            <!-- 17 代表添加检测项、缺陷项、疑问项权限 -->
            <el-button
              v-permission="['17']"
              style="width: 100%"
              type="primary"
              icon="circle-plus"
              @click="directoryDialogVisible = true"
              >新建检测类型
            </el-button>
          </template>
          <el-tree
            class="filter-tree"
            :data="treeData"
            :props="defaultProps"
            node-key="id"
            :default-expanded-keys="[expandTreeNodeId]"
            accordion
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
        <el-card v-loading="gettingCheckItems" shadow="never">
          <div class="toolbar-wrapper">
            <div>
              <!-- 17 代表添加检测项、缺陷项、疑问项权限 -->
              <el-button v-permission="['17']" type="primary" :icon="CirclePlus" @click="dialogVisible = true">
                添加检测项
              </el-button>
            </div>
            <div>
              <el-tooltip content="刷新当前页">
                <el-button type="primary" icon="refresh-right" circle @click="getTableData" />
              </el-tooltip>
            </div>
          </div>
          <div class="table-wrapper">
            <TableComponent
              :tableData="tableData"
              :column-data="tableHeaders"
              stripe
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

      <!-- 新增/修改检测项 -->
      <el-dialog
        v-model="dialogVisible"
        :title="checkItemId === undefined ? '新增检测项' : '修改检测项'"
        @close="resetForm"
        width="30%"
      >
        <el-form ref="formRef" :model="formData" label-width="auto">
          <el-form-item prop="name" label="检测项名称">
            <el-input v-model="formData.name" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="operation_desc" label="操作描述">
            <el-input v-model="formData.operation_desc" type="textarea" placeholder="请输入" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">确认</el-button>
        </template>
      </el-dialog>
    </el-row>

    <!-- 新建检测类型 -->
    <el-dialog v-model="directoryDialogVisible" title="新建检测类型" @close="clearDirectoryFormData" width="30%">
      <el-form
        ref="directoryFormRef"
        :model="directoryFormData"
        :rules="directoryFormRules"
        label-width="auto"
      >
        <el-form-item prop="firstLevelDirectoryId" label="一级目录">
          <el-select ref="directorySelectRef" v-model="directoryFormData.firstLevelDirectoryId" placeholder="请选择">
            <el-option
              v-for="directory in firstLevelDirectoryList"
              :label="directory.name"
              :value="directory.id"
              :key="directory.id"
            />
            <template #footer>
              <el-button v-if="!isAdding" text bg size="small" @click="showInput"> 新建目录 </el-button>
              <template v-else>
                <el-input
                  ref="newDirInput"
                  v-model="firstLevelDirectoryName"
                  class="option-input"
                  placeholder="请输入"
                  size="small"
                />
                <el-button type="primary" size="small" @click="onConfirm"> 确认 </el-button>
                <el-button size="small" @click="clear">取消</el-button>
              </template>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="secondLevelDirectoryName" label="二级目录">
          <el-input v-model="directoryFormData.secondLevelDirectoryName" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="directoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createSecondLevelDirectory">确认</el-button>
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

.option-input {
  width: 100%;
  margin-bottom: 8px;
}
</style>
