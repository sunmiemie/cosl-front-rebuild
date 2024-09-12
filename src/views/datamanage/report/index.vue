<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { type FormInstance } from "element-plus"
import { ElButton } from "element-plus"
import { Refresh, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { getReportCheckDataApi } from "@/api/report"
import { getTestTypeDataApi } from "@/api/testtype"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"

// defineOptions({
//   // 命名当前组件
//   name: "ElementPlus"
// })
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const router = useRouter()
const DialogCheck = ref<boolean>(false)

interface TestCheckType {
  ID?: string
  version?: string
  type?: string
}

const TestCheck = ref<TestCheckType>({
  ID: "",
  version: "",
  type: ""
})

// 提交审核
const onSubmit = () => {
  DialogCheck.value = false
}

const headers1 = ref([
  { prop: "idStr", label: "报告编号", align: "center" },
  { prop: "type", label: "报告类型", align: "center" },
  { prop: "boardSerial", label: "电路板序列号", align: "center" },
  { prop: "user", label: "测试人 ", align: "center" },
  { prop: "date", label: "生成时间", align: "center" },
  { prop: "status", label: "报告状态", type: "tag", align: "center" },
  { prop: "link", label: "操作 ", type: "link" }
])
const TableData = ref<any>([])
const testTypeList = ref<any>([])
const getTestTypeData = () => {
  getTestTypeDataApi({
    currentPage: 1,
    size: 9999999
  }).then((res) => {
    testTypeList.value = res.data.list
  })
}
const searchFormRef = ref<FormInstance | null>(null)
// 查询
const searchData = reactive({
  id: "",
  user: "",
  type: "",
  serial: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "审核" }
  }
}

const userId = useUserStore().userid
const getTableData = () => {
  loading.value = true
  getReportCheckDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id || undefined,
    user: searchData.user || undefined,
    type: searchData.type || undefined,
    serial: searchData.serial || undefined,
    userId
  }).then((res) => {
    TableData.value = res.data.list
    paginationData.total = res.data.total
    for (let i = 0; i < TableData.value.length; i++) {
      TableData.value[i].link = defineLink(TableData.value[i].status)
    }
    loading.value = false
  })
}

const handleLink = (data: any, i: string) => {
  if (i === "审核") {
    if (data.idStr.startsWith("prod")) {
      router.push({name: "checkReport", query: data})
    } else {
      router.push({name: "checkTempReport", query: data})
    }
  } else {
    return
  }
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

/**
 * 重置查询条件
 */
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <el-card v-loading="loading" class="search-wrapper" shadow="never">
          <el-form ref="searchFormRef" :inline="true" :model="searchData">
            <el-form-item label="报告编号">
              <el-input v-model="searchData.id" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="测试人">
              <el-input v-model="searchData.user" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="电路板序列号">
              <el-input v-model="searchData.serial" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="报告类型">
              <el-select
                v-model="searchData.type"
                placeholder="请选择"
                style="width: 200px"
                @visible-change="getTestTypeData"
              >
                <el-option v-for="item in testTypeList" :key="item.id" :label="item.name" :value="item.number" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button :icon="Search" style="margin-right: 10px" type="primary" @click="handleSearch">查询</el-button>
              <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card v-loading="loading" shadow="never">
          <div class="toolbar-wrapper">
            <div />
            <div>
              <el-tooltip content="刷新当前页">
                <el-button circle icon="RefreshRight" type="primary" @click="getTableData" />
              </el-tooltip>
            </div>
          </div>
          <div class="table-wrapper">
            <TableComponent :column-data="headers1" :tableData="TableData" stripe>
              <template #status="{ row }">
                <el-tag v-if="row['status'] === '0'" type="warning"> 测试待审核</el-tag>
                <el-tag v-if="row['status'] === '1'" type="danger"> 测试正常</el-tag>
                <el-tag v-if="row['status'] === '2'" type="danger"> 测试异常</el-tag>
              </template>

              <template #link="{ row }">
                <el-link v-for="i in row['link']" :key="i" class="el-link" type="primary" @click="handleLink(row, i)"
                  >{{ i }}
                </el-link>
              </template>
            </TableComponent>
          </div>

          <div class="pager-wrapper">
            <el-pagination
              :currentPage="paginationData.currentPage"
              :layout="paginationData.layout"
              :page-size="paginationData.pageSize"
              :page-sizes="paginationData.pageSizes"
              :total="paginationData.total"
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>

          <el-dialog v-model="DialogCheck" :title="'提交测试工艺审核'" style="height: 45vh; width: 40vw">
            <template #header>
              <h2>提交测试工艺审核</h2>
            </template>
            <el-form
              :inline="true"
              :model="TestCheck"
              class="demo-form-inline"
              label-position="right"
              style="position: relative"
            >
              <el-form-item label="工艺ID" style="width: 15vw">
                <el-input v-model="TestCheck.ID" disabled />
              </el-form-item>
              <el-form-item label="工艺版本" style="width: 15vw">
                <el-input v-model="TestCheck.version" disabled />
              </el-form-item>
              <el-form-item label="测试类型">
                <el-input v-model="TestCheck.type" disabled />
              </el-form-item>

              <el-button icon="Check" style="position: absolute; top: 120px; left: 41%" type="primary" @click="onSubmit"
                >确认提交
              </el-button>
            </el-form>
          </el-dialog>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.drawer-head {
  height: 60px;
}

:deep(.el-upload-dragger) {
  padding: 5px !important;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.flex-card {
  display: flex !important;
  flex-direction: column;
}

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

header {
  width: 100%;
  height: 50px;
}

// 工艺步骤
.process {
  width: 100%;
  height: 300px;
  background-color: #fafafa;
  margin: 20px;
  border-radius: 20px;

  .process-left {
    width: 15%;
    height: 100%;
    background-color: azure;

    .processRight {
      width: 200px;
      height: 200px;
      border: 1px solid #ccc;
    }
  }

  .processRight {
    width: 200px;
    height: 200px;
    border: 1px solid #ccc;
  }
}

:deep(.el-button + .el-button) {
  margin: 0;
}
</style>
