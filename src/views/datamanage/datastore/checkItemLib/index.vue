<!-- 检测项库列表 -->

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from "vue"
import { ElMessage, ElTree, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus } from "@element-plus/icons-vue"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { FirstLevelDirectory, CheckItem } from "@/api/check-item/types/check-item"
import {
  createCheckItemApi,
  createFirstLevelDirectoryApi,
  createSecondLevelDirectoryApi,
  getCheckItemApi,
  getDirectoryApi,
  getFirstLevelDirectoryApi,
  updateCheckItemApi
} from "@/api/check-item"

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
const addingFirstLevelDirectory = ref(false)
const cancelCreatingFirstLevelDir = () => {
  firstLevelDirectoryName.value = ""
  addingFirstLevelDirectory.value = false
}
const firstLevelDirectorySelectRef = ref(null)
const createFirstLevelDir = () => {
  if (firstLevelDirectoryName.value) {
    createFirstLevelDirectoryApi({ name: firstLevelDirectoryName.value }).then((res) => {
      firstLevelDirectoryList.value = [
        { id: res.id, name: firstLevelDirectoryName.value },
        ...firstLevelDirectoryList.value
      ]
      directoryFormData.firstLevelDirectoryId = res.id
      cancelCreatingFirstLevelDir()

      const selectComponent = firstLevelDirectorySelectRef.value as any
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
const expandedTreeNodeId = ref(1)
const createSecondLevelDirectory = () => {
  directoryFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      createSecondLevelDirectoryApi({ ...directoryFormData })
        .then(() => {
          expandedTreeNodeId.value = directoryFormData.firstLevelDirectoryId
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
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const tableHeaders = ref<any>([
  { prop: "id", label: "检测项 ID", align: "center" },
  { prop: "name", label: "检测项名称", align: "center" },
  { prop: "operation_desc", label: "操作描述", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "center" }
])
const tableData = ref<CheckItem[]>([])
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
const checkItemFormData = reactive({
  name: "",
  operation_desc: ""
})
const checkItemDialogVisible = ref(false)
const createOrUpdateCheckItem = () => {
  checkItemFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (checkItemId.value === undefined) {
        createCheckItemApi({
          ...checkItemFormData,
          secondLevelDirectoryId: secondLevelDirectoryId.value!
        })
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            checkItemDialogVisible.value = false
          })
      } else {
        updateCheckItemApi({
          id: checkItemId.value,
          ...checkItemFormData
        })
          .then(() => {
            ElMessage.success("修改成功")
            getTableData()
          })
          .finally(() => {
            checkItemDialogVisible.value = false
          })
      }
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

const checkItemId = ref<number | undefined>(undefined)
const resetCheckItemForm = () => {
  checkItemId.value = undefined
  checkItemFormData.name = ""
  checkItemFormData.operation_desc = ""
  getTableData()
}
// 编辑检测项
const handleLink = (data: any) => {
  checkItemId.value = data.id
  checkItemFormData.name = data.name
  checkItemFormData.operation_desc = data.operation_desc
  checkItemDialogVisible.value = true
}
const checkItemFormRef = ref<FormInstance | null>(null)

// 搜索树形结构的节点
// const filterNode = (value: string, data: any) => {
//   if (!value) return true
//   return data.label.includes(value)
// }

const newFirstLevelDirInput = ref<HTMLInputElement | null>(null)
const showInput = (): void => {
  addingFirstLevelDirectory.value = true
  nextTick(() => {
    if (newFirstLevelDirInput.value) {
      newFirstLevelDirInput.value.focus()
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
            :data="treeData"
            :props="defaultProps"
            node-key="id"
            :default-expanded-keys="[expandedTreeNodeId]"
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
              <el-button v-permission="['17']" type="primary" :icon="CirclePlus" @click="checkItemDialogVisible = true">
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
            <TableComponent :tableData="tableData" :column-data="tableHeaders" stripe>
              <template #link="{ row }">
                <el-link type="primary" @click="handleLink(row)">编辑</el-link>
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
        v-model="checkItemDialogVisible"
        :title="checkItemId === undefined ? '新增检测项' : '修改检测项'"
        @close="resetCheckItemForm"
        width="30%"
      >
        <el-form ref="checkItemFormRef" :model="checkItemFormData" label-width="auto">
          <el-form-item prop="name" label="检测项名称">
            <el-input v-model="checkItemFormData.name" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="operation_desc" label="操作描述">
            <el-input v-model="checkItemFormData.operation_desc" type="textarea" placeholder="请输入" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="checkItemDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createOrUpdateCheckItem">确认</el-button>
        </template>
      </el-dialog>
    </el-row>

    <!-- 新建检测类型 -->
    <el-dialog v-model="directoryDialogVisible" title="新建检测类型" @close="clearDirectoryFormData" width="30%">
      <el-form ref="directoryFormRef" :model="directoryFormData" :rules="directoryFormRules" label-width="auto">
        <el-form-item prop="firstLevelDirectoryId" label="一级目录">
          <el-select
            ref="firstLevelDirectorySelectRef"
            v-model="directoryFormData.firstLevelDirectoryId"
            placeholder="请选择"
          >
            <el-option
              v-for="directory in firstLevelDirectoryList"
              :label="directory.name"
              :value="directory.id"
              :key="directory.id"
            />
            <template #footer>
              <el-button v-if="!addingFirstLevelDirectory" text bg size="small" @click="showInput">
                新建一级目录
              </el-button>
              <template v-else>
                <el-input
                  ref="newFirstLevelDirInput"
                  v-model="firstLevelDirectoryName"
                  class="option-input"
                  placeholder="请输入"
                  size="small"
                />
                <el-button type="primary" size="small" @click="createFirstLevelDir"> 新建 </el-button>
                <el-button size="small" @click="cancelCreatingFirstLevelDir">取消</el-button>
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
        <el-button type="primary" @click="createSecondLevelDirectory">新建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
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

.option-input {
  width: 100%;
  margin-bottom: 8px;
}
</style>
