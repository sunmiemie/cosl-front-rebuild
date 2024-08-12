<!--缺陷项库列表-->

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from "vue"
import { ElMessage, ElTree, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import {
  createDefectItemApi,
  createFirstLevelDirectoryApi,
  createSecondLevelDirectoryApi,
  getDefectItemApi,
  getDirectoryApi,
  getFirstLevelDirectoryApi,
  updateDefectItemApi
} from "@/api/defect-item"
import { CirclePlus } from "@element-plus/icons-vue"
import { FirstLevelDirectory, CheckItem } from "@/api/check-item/types/check-item"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)

const treeLoading = ref<boolean>(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const dialogVisible = ref<boolean>(false)

const headers = ref<any>([
  { prop: "id", label: "缺陷项ID", align: "center" },
  { prop: "name", label: "缺陷项名称", align: "center" },
  { prop: "problem_desc", label: "问题描述", align: "center" },
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
  getDefectItemApi({
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
  problem_desc: ""
})
const formRules: FormRules = reactive({})
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.name = ""
  formData.problem_desc = ""
  getTableData()
}
const tableData = ref<CheckItem[]>([])
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createDefectItemApi({ ...formData, secondLevelDirectoryId: secondLevelDirectoryId.value! })
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateDefectItemApi({
          id: currentUpdateId.value,
          name: formData.name,
          problem_desc: formData.problem_desc
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
  // console.log("index", val)
  selectedRows.value = val
}

// 编辑
const handleLink = (data: any) => {
  currentUpdateId.value = data.id
  formData.name = data.name
  formData.problem_desc = data.problem_desc
  dialogVisible.value = true
}

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}
//#endregion

const directoryDialogVisible = ref<boolean>(false)
const directoryFormRef = ref<FormInstance | null>(null)
const directoryFormData = reactive<any>({
  firstLevelDirectoryId: "",
  secondLevelDirectoryName: ""
})
const directoryFormRules: FormRules = reactive({
  firstLevelDirectoryId: [{ required: true, trigger: "blur", message: "请选择一级目录" }],
  secondLevelDirectoryName: [{ required: true, trigger: "blur", message: "请输入二级目录" }]
})
const resetDirectoryForm = () => {
  directoryFormData.firstLevelDirectoryId = ""
  directoryFormData.secondLevelDirectoryName = ""
}

const firstLevelDirectory = ref<FirstLevelDirectory[]>([])
getFirstLevelDirectoryApi({ currentPage: 1, size: 999999 }).then((res) => {
  firstLevelDirectory.value = res.data.list
})

const isAdding = ref(false)

const optionName = ref("")
const onConfirm = () => {
  if (optionName.value) {
    createFirstLevelDirectoryApi({ name: optionName.value }).then((res) => {
      firstLevelDirectory.value = [{ id: res.id, name: res.name }, ...firstLevelDirectory.value]
      directoryFormData.firstLevelDirectoryId = res.id
      clear()

      const selectComponent = directorySelect.value as any
      if (selectComponent) {
        selectComponent.blur()
      }

      nextTick(() => {
        directoryFormRef.value?.validateField("firstLevelDirectoryId")
      })
    })
  }
}

const clear = () => {
  optionName.value = ""
  isAdding.value = false
}

const createSecondLevelDirectory = () => {
  directoryFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      console.log(directoryFormData)
      createSecondLevelDirectoryApi({
        name: directoryFormData.secondLevelDirectoryName,
        firstLevelDirectoryId: directoryFormData.firstLevelDirectoryId
      })
        .then(() => {
          ElMessage.success("新增成功")
          getTreeData()
        })
        .finally(() => {
          directoryDialogVisible.value = false
        })
    } else {
      ElMessage.error("请填写完整")
    }
  })
}

const directorySelect = ref(null)
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
            <el-button style="width: 100%" type="primary" icon="circle-plus" @click="directoryDialogVisible = true"
            >新建检测类型
            </el-button>
          </template>
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
          <el-empty description="请选择缺陷类型" />
        </el-card>
      </el-col>
      <el-col v-else :span="19">
        <el-card v-loading="loading" shadow="never">
          <div class="toolbar-wrapper">
            <div>
              <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增缺陷项</el-button>
            </div>
            <!-- <div>-->
            <!--   <el-tooltip content="刷新当前页">-->
            <!--     <el-button type="primary" icon="refresh-right" circle @click="getTableData" />-->
            <!--   </el-tooltip>-->
            <!-- </div>-->
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
        :title="currentUpdateId === undefined ? '新增缺陷项' : '修改缺陷项'"
        @close="resetForm"
        width="30%"
      >
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
          <el-form-item prop="name" label="缺陷项名称">
            <el-input v-model="formData.name" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="problem_desc" label="问题描述">
            <el-input v-model="formData.problem_desc" placeholder="请输入" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">确认</el-button>
        </template>
      </el-dialog>
    </el-row>

    <!-- 新建缺陷类型 -->
    <el-dialog v-model="directoryDialogVisible" title="新建缺陷类型" @close="resetDirectoryForm" width="30%">
      <el-form
        ref="directoryFormRef"
        :model="directoryFormData"
        :rules="directoryFormRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="firstLevelDirectoryId" label="一级目录">
          <el-select ref="directorySelect" v-model="directoryFormData.firstLevelDirectoryId" placeholder="请选择">
            <el-option
              v-for="directory in firstLevelDirectory"
              :label="directory.name"
              :value="directory.id"
              :key="directory.id"
            />
            <template #footer>
              <el-button v-if="!isAdding" text bg size="small" @click="showInput"> 新建目录 </el-button>
              <template v-else>
                <el-input
                  ref="newDirInput"
                  v-model="optionName"
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
