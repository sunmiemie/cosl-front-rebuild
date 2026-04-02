<script lang="ts" setup>
import { reactive, ref, watch, type Ref, onMounted, computed } from "vue"
import { ElMessage, ElTree, type FormInstance, type FormRules } from "element-plus"
import type { CheckboxValueType } from "element-plus"
import TableComponent from "@/components/Table/index.vue"
import { generateDevBatchReport, getboardsinfoForBugReport } from "@/api/report"
import { getDevTestTypeDataApi } from "@/api/testtype"
import { getTransactionTree } from "@/api/report"
import { Search } from "@element-plus/icons-vue"
import { getBoardDataBySn } from "@/api/board"

const emit = defineEmits(["close-dialog", "fetch-batch-reports"])

const currentRow = ref<any>()
const showFlags = ref<any>(true)
const showProcess = ref<any>(true)
const testTypeList = ref<any>([])
const boardInfoLoading = ref(false)

const selectedRows = ref<any>([])
const addHeaders = ref([
  { prop: "id", label: "电路板ID", align: "center" },
  { prop: "serial_num", label: "电路板序列号", align: "center" },
  { prop: "info", label: "电路板型号名称", align: "center" }
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

const tempTableRef = ref<InstanceType<typeof TableComponent> | null>(null)

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

  const result = await getboardsinfoForBugReport({
    batchId: Batch.value,
    instrumentName: CircuitBoardModel.value,
    instrumentId: CircuitBoardModelId.value,
    tempBatch: true
  })

  boardTableData.value = result.data
  boardInfoLoading.value = false
  getTestTypeData()
}

const getTestTypeData = () => {
  const board_ids = selectedRows.value.map((board) => parseInt(board.id, 10))
  getDevTestTypeDataApi({
    board_ids,
    transaction_id: Batch.value
  }).then((res) => {
    testTypeList.value = res.test_types
  })
}

const filterText = ref("")
const treeRef = ref<InstanceType<typeof ElTree>>()

const defaultProps = {
  children: "children",
  label: "label"
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
const tempTreeData: Ref<any[]> = ref([])
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

const tempTreeLoading = ref(false)

async function getTempTreeData() {
  tempTreeLoading.value = true

  try {
    const result = await getTransactionTree()
    tempTreeData.value = result.Pathdata
  } catch (error) {
    console.error("Failed to fetch tree data:", error)
  } finally {
    tempTreeLoading.value = false // 请求结束，停止加载
  }
}
const clearTableSelection = () => {
  if (tempTableRef.value) {
    tempTableRef.value.clearSelection()
  }
}

const formRules: FormRules = reactive({
  testType: [{ required: true, trigger: "blur", message: "请选择测试类型" }],
  testUnitType: [{ required: true, trigger: "blur", message: "请输入测试类别" }],
  testUnitDesc: [{ required: true, trigger: "blur", message: "请输入测试内容" }],
  consignor: [{ required: true, trigger: "blur", message: "请输入委托人" }]
})
// const emit = defineEmits(["add-order"])

const handleCreate = async () => {
  // 确保选中项和测试类型有效
  if (selectedRows.value.length === 0 || value.value.length === 0) {
    ElMessage.warning("请至少选择一块电路板和一个测试类型")
    return
  }

  // 通知父组件关闭这个弹窗
  emit("close-dialog")

  const boards = selectedRows.value.map((board) => {
    return {
      boardId: board.id,
      isProdBoard: board.is_prod_board
    }
  })
  generateDevBatchReport({
    transactionId: Batch.value,
    boards,
    testTypes: value.value
  })
    .then(() => {
      ElMessage.success(`成功生成批次报告`)
      emit("fetch-batch-reports")
    })
    .catch(() => {
      ElMessage.error(`报告生成失败`)
    })
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
  boardSerialNumber.value = ""
  clearTableSelection()
  value.value = []
  showFlags.value = true
  emit("close-dialog")
}

const boardSerialNumber = ref("")

const searchSerialNumber = async () => {
  // <el-text>{{ CircuitBoardModel }}</el-text>
  // <el-text>流水号：{{ Batch }}</el-text>
  // <el-text>流水：{{ CircuitBatch }}</el-text>
  try {
    const res = await getBoardDataBySn(boardSerialNumber.value)
    tempTreeData.value = res.data
  } catch (error) {
    ElMessage.error(error.response.data.errormessage)
  }
}

const resetTree = () => {
  boardSerialNumber.value = ""
  filterText.value = ""
  getTempTreeData()
}

// 显式暴露方法供父组件调用
defineExpose({ resetTree, getTempTreeData, clearOrderInfo, clearTableSelection, cancelGenerateReport })

onMounted(getTempTreeData)
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card shadow="never" v-loading="tempTreeLoading">
        <template #header>
          <div style="margin-bottom: 5px; display: flex; gap: 3px">
            <el-input v-model="boardSerialNumber" clearable placeholder="搜索 SN 号" />
            <el-button
              :disabled="boardSerialNumber.trim() === ''"
              @click="searchSerialNumber"
              type="primary"
              :icon="Search"
              style="opacity: 0.7"
            />
            <el-button @click="resetTree" type="primary" style="opacity: 0.7" plain>重置</el-button>
          </div>
          <el-input v-model="filterText" clearable placeholder="搜索目录" />
        </template>
        <el-scrollbar max-height="600px">
          <el-tree
            ref="treeRef"
            :data="tempTreeData"
            :filter-node-method="filterNode"
            :props="defaultProps"
            default-expand-all
            @node-click="clickNode"
          />
        </el-scrollbar>
      </el-card>
    </el-col>

    <el-col :span="18">
      <el-card shadow="never">
        <div v-if="showFlags">请先在左侧选择流水</div>

        <div v-else>
          <div class="info-header">
            <el-card shadow="never">
              <el-space :size="10" spacer="|">
                <el-text>{{ CircuitBoardModel }}</el-text>
                <el-text>流水号：{{ Batch }}</el-text>
                <el-text>流水：{{ CircuitBatch }}</el-text>
                <el-text v-if="selectedRowCount > 0" class="mx-1">已选择 {{ selectedRowCount }} 项</el-text>
              </el-space>
            </el-card>
          </div>
          <div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card
                  v-if="showProcess"
                  shadow="never"
                  style="margin-top: 10px; margin-bottom: 10px"
                  v-loading="boardInfoLoading"
                >
                  <div class="table-wrapper">
                    <TableComponent
                      ref="tempTableRef"
                      :column-data="addHeaders"
                      :table-data="boardTableData"
                      selection
                      stripe
                      @selection-change="handleSelectionChange"
                    />
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="never" style="margin-top: 10px; margin-bottom: 10px">
                  <el-form
                    ref="searchFormRef"
                    :model="orderInfo"
                    label-position="left"
                    label-width="auto"
                    :rules="formRules"
                  >
                    <el-form-item label="测试类型" prop="testType">
                      <el-select
                        multiple
                        clearable
                        popper-class="custom-header"
                        v-model="value"
                        placeholder="请选择"
                        filterable
                        @visible-change="getTestTypeData"
                      >
                        <template #header>
                          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
                            选择所有
                          </el-checkbox>
                        </template>
                        <el-option
                          v-for="item in testTypeList"
                          :label="item.name"
                          :value="item.number"
                          :key="item.id"
                        />
                      </el-select>
                    </el-form-item>
                    <div style="margin-top: 30px; display: flex; justify-content: flex-end; gap: 10px">
                      <el-button @click="cancelGenerateReport">取消</el-button>
                      <el-button type="primary" @click="handleCreate" :disabled="selectedRows.length <= 0"
                        >生成批次报告</el-button
                      >
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
</style>
