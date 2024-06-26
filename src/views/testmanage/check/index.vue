<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import { usePagination } from "@/hooks/usePagination"
import { checkListDataApi } from "@/api/check"
import { getTestTypeDataApi } from "@/api/testtype"
import TableComponent from "@/components/Table/index.vue"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const testTypeList = ref<any>([])
const CheckDialog = ref<boolean>(false)
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const router = useRouter()
//#region 增
const dialogVisible = ref<boolean>(false)
const CheckInfo = reactive<any>({
  name: "",
  version: ""
})
const CheckEquipment = reactive<any>({
  fixture: "",
  host: "",
  other: [
    {
      number: 123,
      region: "A型号"
    },
    {
      number: 123,
      region: "A型号"
    }
  ]
})

interface TableDataType {
  number: string
  name: string
  type: string
  version: string
  status: string
  link?: any
}
const headers = ref<any>([
  { prop: "testprocess_id", label: "工艺ID", align: "center" },
  { prop: "testprocess_name", label: "工艺名称", align: "center" },
  { prop: "testprocess_version", label: "测试版本", align: "center" },
  { prop: "process_type", label: "测试类型", align: "center" },
  { prop: "status", label: "流程状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<any>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive<any>({
  number: "",
  name: "",
  type: ""
})
const defineLink = (status: any) => {
  switch (status) {
    case "1":
      return { 1: "审核" }
  }
}
const getTestTypeData = () => {
  getTestTypeDataApi({
    currentPage: 1,
    size: 9999999
  }).then((res) => {
    testTypeList.value = res.data.list
  })
}
const getTableData = () => {
  loading.value = true
  checkListDataApi({
    id: searchData.number,
    name: searchData.name,
    type: searchData.type
  })
    .then((res: any) => {
      TableData.value = res.list
    })
    .finally(() => {
      for (let i = 0; i < TableData.value.length; i++) {
        TableData.value[i].link = defineLink(TableData.value[i].status)
      }
      loading.value = false
    })
}
const handleLink = (data: any, i: string) => {
  if (i === "审核") {
    // CheckDialog.value = true
    console.log(data, i)
    router.push({ name: "checktestlist", query: { data: data } })
  }
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchData.name = ""
  searchData.type = ""
  searchData.number = ""
  getTableData()
}
/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="工艺ID">
          <el-input v-model="searchData.number" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="工艺名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="测试类型">
          <el-select
            @visible-change="getTestTypeData"
            style="width: 150px"
            v-model="searchData.type"
            placeholder="请选择"
          >
            <el-option v-for="item in testTypeList" :value="item.number" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe>
          <template #status="{ row }">
            <el-tag v-if="row.status === '1'" type="warning"> 待审核 </el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row.link" type="primary" @click="handleLink(row, i)" :key="i">{{ i }}</el-link>
          </template>
        </TableComponent>
      </div>
      <!-- 审核测试工艺 -->
      <el-dialog v-model="CheckDialog" width="40%" class="test-check">
        <template #header>
          <h2>审核测试工艺</h2>
          <el-button type="primary">功能性测试</el-button>
        </template>
        <el-row>
          <el-col :span="12">
            <el-text size="large">1.测试工艺基本信息</el-text>
            <el-form :model="CheckInfo" label-position="left" style="margin-top: 20px">
              <el-form-item label="工艺名称" style="width: 15vw">
                <el-input disabled />
              </el-form-item>
              <el-form-item label="工艺版本" style="width: 15vw">
                <el-input disabled />
              </el-form-item>
            </el-form>
            <el-text size="large">2.所绑定设备</el-text>
            <el-form :model="CheckEquipment">
              <el-form-item label="绑定夹具" style="width: 15vw; margin-top: 20px">
                <el-input disabled v-model="CheckEquipment.fixture" />
              </el-form-item>
              <el-form-item label="绑定主机" style="width: 15vw">
                <el-input disabled v-model="CheckEquipment.host" />
              </el-form-item>
              <el-form-item label="其他设备:" style="width: 15vw">
                <el-input disabled v-for="item in CheckEquipment.other" style="margin: 10px 0">
                  <template #prefix> {{ item.number }} 型号：{{ item.region }} </template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-text size="large">3.测试脚本</el-text>
            <div class="check-file">
              <el-button size="small" style="margin-left: 83.4%">下载</el-button>
            </div>
          </el-col>
        </el-row>

        <template #footer>
          <el-button type="success" icon="Check" size="large" style="position: absolute; left: 1vw">审核通过</el-button>
          <el-button type="danger" size="large" icon="Close">审核未通过</el-button>
        </template>
      </el-dialog>
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
  margin-right: 8px;
}

.test-check {
  position: relative;
}

.check-file {
  margin-top: 20px;
  width: 15vw;
  height: 200px;
  border: 1px dashed #ccc;
}
</style>
