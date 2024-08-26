<template>
  <div class="app-container">
    <TableComponent :column-data="userTableHeaders" :tableData="userTableData" stripe />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
import { GetUserData } from "@/api/user/types/user"
// import { usePagination } from "@/hooks/usePagination"
import { getUserDataApi } from "@/api/user"

const userTableHeaders = ref([
  { prop: "id", label: "ID", align: "center" },
  { prop: "username", label: "用户名", align: "center" }
])

const userTableData = ref<GetUserData[]>([])
const loading = ref<boolean>(false)

// const { paginationData } = usePagination()

const getUserTableData = async () => {
  loading.value = true
  // {
  //   currentPage: paginationData.currentPage,
  //     pageSize: paginationData.pageSize
  // }
  getUserDataApi()
    .then((res) => {
      // paginationData.total = res.data.total
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
