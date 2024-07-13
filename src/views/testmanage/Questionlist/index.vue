<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { ElMessageBox } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { questionUnitDataApi, questionOperateDataApi } from "@/api/questionunit"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const loading = ref<boolean>(false)
const updateLoading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 显示
const operatorDialog = ref<any>(false)
const questionLoading = ref<boolean>(false)
const canUpdate = ref<boolean>(false)
const dialogVisible2 = ref<any>(false)

const headers = ref([
  { prop: "questionunit_id", label: "疑问工单号", align: "center" },
  { prop: "testunit_id", label: "关联测试工单", align: "center" },
  { prop: "questionunit_name", label: "疑问工单名称", align: "center" },
  { prop: "questionunit_starttime", label: "生成时间", align: "center" },
  { prop: "questionunit_endtime", label: "结束时间", align: "center" },
  { prop: "user", label: "创建人", align: "center" },
  { prop: "operator", label: "处理人", align: "center" },
  { prop: "status", label: "工单状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<any>([])
const questionList = ref<any>([])
const searchData = reactive({
  id: "",
  status: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "详情", 2: "直接处理" }
    case "1":
      return { 1: "详情" }
    case "2":
      return { 1: "详情", 2: "查看报告" }
  }
}
const getTableData = () => {
  loading.value = true
  questionUnitDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id,
    status: searchData.status
  })
    .then((res) => {
      TableData.value = res.list
      paginationData.total = res.total
      for (let i = 0; i < TableData.value.length; i++) {
        TableData.value[i].link = defineLink(TableData.value[i].status)
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const handleLink = (data: any, i: string) => {
  if (i === "详情") {
    dialogVisible2.value = true
  } else if (i === "直接处理") {
    operatorDialog.value = true
    questionLoading.value = true
    questionOperateDataApi({ id: data["questionunit_id"] })
      .then((res) => {
        questionList.value = res.data
      })
      .finally(() => {
        questionLoading.value = false
      })
  }
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

const resetSearch = () => {
  searchData.id = ""
  searchData.status = ""
  handleSearch()
}
const checkCanUpdate = () => {
  canUpdate.value = !questionList.value.every((item) => item.pass !== undefined)
}
const handleOperate = () => {
  ElMessageBox.confirm("确认以该结果处理疑问吗？", "确认处理", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    updateLoading.value = true
  })
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
watch([() => questionList.value], checkCanUpdate, { immediate: true, deep: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="疑问工单号" prop="number">
          <el-input v-model="searchData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="工单状态" prop="username">
          <el-select v-model="searchData.status" placeholder="请选择" style="width: 200px">
            <el-option label="待处理" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="处理完成" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-tooltip content="刷新当前页">
            <el-button icon="RefreshRight" circle type="primary" @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :column-data="headers" :tableData="TableData" stripe>
          <template #status="{ row }">
            <el-tag v-if="row['status'] === '0'" type="warning"> 待处理</el-tag>
            <el-tag v-if="row['status'] === '1'" type="primary"> 处理中</el-tag>
            <el-tag v-if="row['status'] === '2'" type="success"> 处理完成</el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row['link']" class="el-link" type="primary" @click="handleLink(row, i)" :key="i">{{
              i
            }}</el-link>
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
    </el-card>
    <el-dialog v-model="operatorDialog" width="80%" title="直接处理" @close="questionList = []">
      <el-table v-loading="questionLoading" :data="questionList">
        <el-table-column label="测试类型">
          <template #default="scope">
            <el-text>
              {{ scope.row.type === "eyes" ? "3D正面测试" : scope.row.type === "eyesBak" ? "3D背面测试" : "X-Ray检测" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问位置">
          <template #default="scope">
            <el-text> {{ scope.row.position === "total" ? "整体检测" : "区域检测" }}</el-text>
            <el-text v-if="scope.row.areaId !== undefined"> -第{{ scope.row.areaId }}区域</el-text>
            <el-text v-if="scope.row.areaPosition !== undefined">
              -{{ scope.row.areaPosition === "general" ? "通用检测" : "具体检测" }}
            </el-text>
            <el-text v-if="scope.row.detailId !== undefined"> -第{{ scope.row.detailId }}点位</el-text>
          </template>
        </el-table-column>
        <el-table-column label="检测项">
          <template #default="scope">
            <el-text> {{ scope.row.content.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="疑问描述">
          <template #default="scope">
            <el-text> {{ scope.row.content.question.desc }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="center" label="留存图片">
          <template #default="scope">
            <div style="display: flex">
              <el-text style="margin-right: 5px">共{{ scope.row.content.question.url.length }}张</el-text>
              <el-image
                :preview-teleported="true"
                :preview-src-list="scope.row.content.question.url"
                :src="scope.row.content.question.url[0]"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作">
          <template #default="scope">
            <el-button-group is-button>
              <el-button :type="scope.row['pass'] === true ? 'success' : ''" @click="scope.row['pass'] = true"
                >通过</el-button
              >
              <el-button :type="scope.row['pass'] === false ? 'danger' : ''" @click="scope.row['pass'] = false"
                >缺陷</el-button
              >
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="operatorDialog = false">取消</el-button>
        <el-button
          :disabled="canUpdate"
          type="primary"
          @click="handleOperate"
          v-loading.fullscreen.lock="updateLoading"
          element-loading-text="处理中,请勿操作..."
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
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

.fault-img {
  width: 50px;
  height: 50px;
  position: absolute;
  right: 10%;
  top: 26%;
}

.default-success {
  margin-top: 20px;
  width: 80%;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  justify-content: space-around;
}
</style>
