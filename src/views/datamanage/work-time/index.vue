<script lang="ts" setup>
import { ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
import { GetUserData } from "@/api/user/types/user"
import { usePagination } from "@/hooks/usePagination"
import { getUserDataApi } from "@/api/user"

const userTableHeaders = ref([
  { prop: "id", label: "ID", align: "center" },
  { prop: "username", label: "用户名", align: "center" }
])

const userTableData = ref<GetUserData[]>([])
const loading = ref<boolean>(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const getUserTableData = async () => {
  loading.value = true

  getUserDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  })
    .then((res) => {
      paginationData.total = res.data.total
      userTableData.value = res.data.list
    })
    .catch(() => {
      userTableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

getUserTableData()
</script>

<template>
  <div class="app-container">
    <TableComponent class="table-wrapper" :column-data="userTableHeaders" :tableData="userTableData" stripe />
    <el-pagination
      class="pager-wrapper"
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
</template>

<style lang="scss" scoped>
.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
