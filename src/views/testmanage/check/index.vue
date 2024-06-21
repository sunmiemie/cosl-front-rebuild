<script lang="ts" setup>
import { reactive, ref, watch, unref } from "vue";
// import { createTableDataApi, deleteTableDataApi, getTableDataApi, updateTableDataApi } from "@/api/table";
// import { type GetTableData } from "@/api/table/types/table"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { useRoute, useRouter } from "vue-router";
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
// 显示与隐藏
const CheckDialog = ref<boolean>(false)
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const router = useRouter()
const route = useRoute()
//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const CheckInfo = reactive({
  name: '',
  version: ''
})
const CheckEquipment = reactive({
  fixture: '',
  host: '',
  other: [{
    number: 123,
    region: "A型号"
  }, {
    number: 123,
    region: "A型号"
  }]
})
const handleCreate = () => {

}
const resetForm = () => {
  currentUpdateId.value = undefined

}


//#region 改
const currentUpdateId = ref<undefined | string>(undefined)


//const tableData = ref<GetTableData[]>([])
interface TableDataType {
  number: string;
  name: string;
  type: string;
  version: string;
  status: string;
  link?: any
}
const headers = ref([
  { prop: "number", label: "工艺ID", align: "center" },
  { prop: "name", label: "工艺名称", align: "center" },
  { prop: "version", label: "测试版本", align: "center" },
  { prop: "type", label: "测试类型", align: "center" },
  { prop: "status", label: "流程状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<Array<TableDataType>>([
  {
    number: "123456782",
    name: "Test",
    type: "X-Ray测试",
    version: "v1.2",
    status: "1"
  }
])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  number: "",
  name: "",
  type: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "1":
      return { 1: "审核" }
  }
}
const getTableData = () => {
  //  getCheckData({
  //    currentPage: paginationData.currentPage,
  //    size: paginationData.pageSize
  //  }).then((res) => {
  //    TableData.value = res.data.list
  for (let i = 0; i < TableData.value.length; i++) {
    TableData.value[i].link = defineLink(TableData.value[i].status)
  }
//})
}
const handleLink = (data: any, i: string) => {
  if (i === '审核') {
    // CheckDialog.value = true
    console.log(data,i)
    router.push({ name: 'checktestlist' })
  }
}
const handleSearch = () => {


  //paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {

}
//#endregion
const buttonRef = ref()
const popoverRef = ref()
const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
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
          <el-select v-model="searchData.type" placeholder="请选择" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe>
          <template #status="{ row }">
            <el-tag v-if="row.status === '1'" type="warning"> 待审核 </el-tag>
          </template>

          <template #link="{ row }">
            <el-link v-for="i in row.link" type="primary" class="el-link" @click="handleLink(row, i)">{{ i }}</el-link>
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
            <el-form :model="CheckInfo" label-position="left" style="margin-top: 20px;">
              <el-form-item label="工艺名称" style="width: 15vw;">
                <el-input disabled></el-input>
              </el-form-item>
              <el-form-item label="工艺版本" style="width: 15vw;">
                <el-input disabled></el-input>
              </el-form-item>
            </el-form>
            <el-text size="large">2.所绑定设备</el-text>
            <el-form :model="CheckEquipment">
              <el-form-item label="绑定夹具" style="width: 15vw;margin-top: 20px;">
                <el-input disabled v-model="CheckEquipment.fixture"></el-input>
              </el-form-item>
              <el-form-item label="绑定主机" style="width: 15vw;">
                <el-input disabled v-model="CheckEquipment.host"></el-input>
              </el-form-item>
              <el-form-item label="其他设备:" style="width: 15vw;">
                <el-input disabled v-for="item in CheckEquipment.other" style="margin: 10px 0;">
                  <template #prefix>
                    {{ item.number }} 型号：{{ item.region }}
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-text size="large">3.测试脚本</el-text>
            <div class="check-file">
              <el-button size="small" style="margin-left: 83.4%;">下载</el-button>
            </div>
          </el-col>
        </el-row>

        <template #footer>
          <el-button type="success" icon="Check" size="large" style="position: absolute;left: 1vw;">审核通过</el-button>
          <el-button type="danger" size="large" icon="Close">审核未通过</el-button>
        </template>

      </el-dialog>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes"
          :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog v-model="dialogVisible" :title="currentUpdateId === undefined ? '新增用户' : '修改用户'" @close="resetForm"
      width="30%">

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
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
