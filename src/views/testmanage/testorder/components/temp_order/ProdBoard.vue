<script lang="ts" setup>
import { reactive, ref, watch, type Ref, onMounted } from "vue"
import { ElTree, type FormInstance, type FormRules } from "element-plus"
import TableComponent from "@/components/Table/index.vue"
import { getboardsinfoForTempOrder, getTestMangePath } from "@/api/testMangelist"
import { getTestTypeDataApi } from "@/api/testtype"

const currentRow = ref<any>()
const showFlags = ref<any>(true)
const showProcess = ref<any>(true)
const testTypeList = ref<any>([])
const boardInfoLoading = ref(false)

const addProdBoard = true
const selectedRows = ref<any>([])
const addHeaders = ref([
  { prop: "id", label: "电路板ID", align: "center" },
  { prop: "serial_num", label: "电路板序列号", align: "center" }
])

const searchFormRef = ref<FormInstance | null>(null)

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
  getTestTypeDataApi({
    currentPage: 1,
    size: 9999999
  }).then((res) => {
    testTypeList.value = res.data.list
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
// 显式暴露方法供父组件调用
defineExpose({ getTreeData, clearOrderInfo, clearTableSelection })

const formRules: FormRules = reactive({
  testType: [{ required: true, trigger: "blur", message: "请选择测试类型" }],
  testUnitType: [{ required: true, trigger: "blur", message: "请输入测试类别" }],
  testUnitDesc: [{ required: true, trigger: "blur", message: "请输入测试内容" }],
  consignor: [{ required: true, trigger: "blur", message: "请输入委托人" }]
})

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
        <el-tree
          ref="treeRef"
          :data="treeData"
          :filter-node-method="filterNode"
          :props="defaultProps"
          default-expand-all
          @node-click="clickNode"
        />
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
                      ref="tableRef"
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
                <el-card shadow="never" style="margin-top: 10px">
                  <el-form
                    ref="searchFormRef"
                    :model="orderInfo"
                    label-position="left"
                    label-width="auto"
                    :rules="formRules"
                  >
                    <el-form-item label="测试类型" prop="testType">
                      <el-select
                        v-model="orderInfo.testType"
                        placeholder="请选择"
                        filterable
                        @visible-change="getTestTypeData"
                      >
                        <el-option
                          v-for="item in testTypeList"
                          :label="item.name"
                          :value="item.number"
                          :key="item.id"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item prop="testUnitType" label="测试类别">
                      <el-input v-model="orderInfo.testUnitType" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item prop="testUnitDesc" label="测试内容">
                      <el-input v-model="orderInfo.testUnitDesc" type="textarea" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item prop="consignor" label="委托人">
                      <el-input v-model="orderInfo.consignor" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item prop="orderNo" label="委托单号">
                      <el-input v-model="orderInfo.orderNo" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item style="margin-top: 30px">
                      <el-button @click="$emit('stop-adding-order')">取消</el-button>
                      <el-button
                        type="primary"
                        @click="$emit('add-order', addProdBoard, selectedRows, orderInfo)"
                        :disabled="selectedRows.length <= 0"
                      >添加工单</el-button
                      >
                    </el-form-item>
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
