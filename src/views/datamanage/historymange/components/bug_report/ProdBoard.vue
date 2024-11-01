<script lang="ts" setup>
import { reactive, ref, watch, type Ref, onMounted, computed } from "vue"
import { ElMessage, ElTree, type FormInstance, type FormRules } from "element-plus"
import type { CheckboxValueType } from 'element-plus'
import TableComponent from "@/components/Table/index.vue"
import { getboardsinfoForTempOrder, getTestMangePath } from "@/api/testMangelist"
import {getBoardTestTypeDataApi, getBugReportTestTypeDataApi} from "@/api/testtype"
import { generateBugReport } from "@/api/report"
import { useUserStore } from "@/store/modules/user"

// 定义可以发出的事件
const emit = defineEmits(['close-dialog', 'fetch-bug-reports'])

const userId = useUserStore().userid
const currentRow = ref<any>()
const showFlags = ref<any>(true)
const showProcess = ref<any>(true)
const testTypeList = ref<any>([])
const boardInfoLoading = ref(false)

const selectedRows = ref<any>([])
const addHeaders = ref([
  { prop: "id", label: "电路板ID", align: "center" },
  { prop: "serial_num", label: "电路板序列号", align: "center" }
])

const searchFormRef = ref<FormInstance | null>(null)

const selectedRowCount = computed(() => selectedRows.value.length)
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}

const orderInfo = reactive<any>({
  testType: "",
  testUnitType: "",
  testUnitDesc: "",
  consignor: "",
  orderNo: ""
})
const clearOrderInfo = () => {
  Object.keys(orderInfo).forEach((key: any) => (orderInfo[key] = ""))
}

const tableRef = ref<InstanceType<typeof TableComponent> | null>(null)

// 树结构
interface Tree {
  [key: string]: any
}

// 电路板信息 型号和批次ID
const Batch = ref<any>()
const CircuitBatch = ref<any>()
const CircuitBoardModel = ref<any>()
const CircuitBoardModelId = ref<any>()
//  电路板ID和序列号
const boardTableData = ref<any>([])

type NodeData = {
  id: string
}
const clickNode = async (data: NodeData & any, node: any) => {
  // 如果点击的节点有子节点则直接返回
  if (node.data.children) {
    return
  }

  // 点击叶子节点，设置批次ID和型号
  boardInfoLoading.value = true
  currentRow.value = undefined
  selectedRows.value = []
  clearOrderInfo()
  Batch.value = data.id
  CircuitBatch.value = data.label
  CircuitBoardModel.value = node.parent.data.label
  CircuitBoardModelId.value = node.parent.data.id
  showFlags.value = false
  showProcess.value = true

  const result = await getboardsinfoForTempOrder({
    batchId: Batch.value,
    boardModelId: CircuitBoardModelId.value,
    tempBatch: false
  })

  boardTableData.value = result.data
  boardInfoLoading.value = false
  getTestTypeData()
}
const getTestTypeData = () => {
  const board_ids = selectedRows.value.map((board) => parseInt(board.id, 10))
  getBugReportTestTypeDataApi({
    board_ids
  }).then((res) => {
    testTypeList.value = res.test_types
  })
}
// const getTestTypeData = () => {
//   getTestTypeDataApi({
//     currentPage: 1,
//     size: 9999999
//   }).then((res) => {
//     testTypeList.value = res.data.list
//   })
// }

const filterText = ref("")
const treeRef = ref<InstanceType<typeof ElTree>>()

const defaultProps = {
  children: "children",
  label: "label"
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
const treeData: Ref<any[]> = ref([])
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

const treeLoading = ref(false)

async function getTreeData() {
  treeLoading.value = true
  try {
    const result = await getTestMangePath()
    treeData.value = result.Pathdata
  } catch (error) {
    console.error("Failed to fetch tree data:", error)
  } finally {
    treeLoading.value = false // 请求结束，停止加载
  }
}
const clearTableSelection = () => {
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
}

const formRules: FormRules = reactive({
  testType: [{ required: true, trigger: "blur", message: "请选择测试类型" }],
  testUnitType: [{ required: true, trigger: "blur", message: "请输入测试类别" }],
  testUnitDesc: [{ required: true, trigger: "blur", message: "请输入测试内容" }],
  consignor: [{ required: true, trigger: "blur", message: "请输入委托人" }]
})

const handleCreate = async () => {
  // 确保选中项和测试类型有效
  if (selectedRows.value.length === 0 || value.value.length === 0) {
    ElMessage.warning("请至少选择一块电路板和一个测试类型")
    return
  }

  // 通知父组件关闭这个弹窗
  emit("close-dialog")

  try {
    // 遍历每块电路板，为每块电路板发送包含所有测试类型的请求
    const requests = selectedRows.value.map((board) =>
      generateBugReport({
        boardId: board.id,
        testTypes: value.value,
        userId: userId
      })
    )

    // 等待所有请求完成
    const responses = await Promise.allSettled(requests)
    const successCount = responses.filter(res => res.status === 'fulfilled' && res.value.success).length;
    const failCount = responses.length - successCount;

    // 只是使用 warning 的黄色
    // ElMessage.warning(`成功生成了 ${successCount} 个缺陷报告，失败 ${failCount} 个`)
    // ElMessage.success({
    //   message: `成功生成了 ${successCount} 个缺陷报告`,
    //   duration: 3000
    // })
    if (successCount > 0) {
      ElMessage.success(`成功生成了 ${successCount} 个缺陷报告`)
    }
    if (failCount > 0) {
      ElMessage.error(`有 ${failCount} 个报告生成失败`)
    }
  } catch (error) {
    // console.error("请求失败：", error)
    ElMessage.error("缺陷报告生成失败")
    // ElMessage.error(error.response.data.error)
  }

  emit("fetch-bug-reports")
}

// 选中所有
const checkAll = ref(false)
const indeterminate = ref(false)
// 选中的测试类型
const value = ref<CheckboxValueType[]>([])
watch(value, (val) => {
  if (val.length === 0) {
    checkAll.value = false
    indeterminate.value = false
  } else if (val.length === testTypeList.value.length) {
    checkAll.value = true
    indeterminate.value = false
  } else {
    indeterminate.value = true
  }
})
const handleCheckAll = (val: CheckboxValueType) => {
  indeterminate.value = false
  if (val) {
    value.value = testTypeList.value.map((_) => _.number)
  } else {
    value.value = []
  }
}

const cancelGenerateReport = () => {
  clearTableSelection()
  value.value = []
  showFlags.value = true
  emit("close-dialog")
}

// 显式暴露方法供父组件调用
defineExpose({ getTreeData, clearOrderInfo, clearTableSelection, cancelGenerateReport })

onMounted(getTreeData)
</script>

<template>
  <!-- 设置列之间的间距 -->
  <el-row :gutter="20">
    <!-- 设置列占据的宽度 -->
    <el-col :span="6">
      <el-card shadow="never" v-loading="treeLoading">
        <template #header>
          <el-input v-model="filterText" placeholder="搜索" />
        </template>
        <el-tree ref="treeRef" :data="treeData" :filter-node-method="filterNode" :props="defaultProps"
          default-expand-all @node-click="clickNode" />
      </el-card>
    </el-col>
    <el-col :span="18">
      <el-card shadow="never">
        <div v-if="showFlags">请先在左侧选择批次</div>
        <div v-else>
          <div class="info-header">
            <el-card shadow="never">
              <el-space :size="10" spacer="|">
                <el-text>电路板型号：{{ CircuitBoardModel }}</el-text>
                <el-text>批次号：{{ Batch }}</el-text>
                <el-text>批次名称：{{ CircuitBatch }}</el-text>
                <el-text v-if="selectedRowCount > 0" class="mx-1">已选择 {{ selectedRowCount }} 项</el-text>
              </el-space>
            </el-card>
          </div>
          <div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card v-if="showProcess" shadow="never" style="margin-top: 10px; margin-bottom: 10px"
                  v-loading="boardInfoLoading">
                  <div class="table-wrapper">
                    <TableComponent ref="tableRef" :column-data="addHeaders" :table-data="boardTableData" selection
                      stripe @selection-change="handleSelectionChange" />
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="never" style="margin-top: 10px">
                  <el-form ref="searchFormRef" :model="orderInfo" label-position="left" label-width="auto"
                    :rules="formRules">
                    <el-form-item label="测试类型" prop="testType">
                      <el-select multiple clearable popper-class="custom-header" v-model="value" placeholder="请选择"
                        filterable @visible-change="getTestTypeData">
                        <template #header>
                          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
                            选择所有
                          </el-checkbox>
                        </template>
                        <el-option v-for="item in testTypeList" :label="item.name" :value="item.number"
                          :key="item.id" />
                      </el-select>
                    </el-form-item>
                    <div style="margin-top: 30px; display: flex; justify-content: flex-end; gap: 10px">
                      <el-button @click="cancelGenerateReport">取消</el-button>
                      <el-button type="primary" @click="handleCreate"
                        :disabled="selectedRows.length <= 0">生成缺陷报告</el-button>
                    </div>
                  </el-form>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.drawer-main {
  margin-top: 40px;
  height: auto;
}

.drawer-footer {
  height: 200px;

  .drawer-jiaju {
    border-radius: 10px;
    width: 50vw;
    height: 7vh;
    background-color: #fafafa;
    display: flex;
    justify-content: space-around;
  }

  .drawer-host {
    border-radius: 10px;

    width: 50vw;
    height: 7vh;
    margin-top: 20px;
    background-color: #fafafa;
    display: flex;
    justify-content: space-around;
  }

  .drawer-other {
    border-radius: 10px;

    width: 50vw;
    height: 7vh;
    background-color: #fafafa;
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.el-link {
  margin-right: 8px;
}

.head-test {
  display: flex;
  width: 100%;
  margin-bottom: -30px;

  .head-ipt {
    margin: 15px;
    width: 350px;
    height: 40px;
  }
}

.custom-header {
  .el-checkbox {
    display: flex;
    height: unset;
  }
}
</style>
