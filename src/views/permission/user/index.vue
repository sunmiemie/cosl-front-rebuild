<script setup lang="ts">
import { reactive, ref } from "vue"
import { ElButton, ElMessage, type FormInstance, type FormRules } from "element-plus"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { GetUserData } from "@/api/user/types/user"
import { createUserDataApi, getUserDataApi, updateUserDataApi } from "@/api/user"
import { getRoleDataApi } from "@/api/role"

const searchData = reactive({
  userId: "",
  username: "",
  nickname: ""
})
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}
const gettingUsers = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const userTableData = ref<GetUserData[]>([])
const getUserTableData = async () => {
  gettingUsers.value = true

  const params = {
    ...searchData,
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  }
  getUserDataApi(params)
    .then((res) => {
      paginationData.total = res.data.total
      userTableData.value = res.data.list
    })
    .catch(() => {
      userTableData.value = []
    })
    .finally(() => {
      gettingUsers.value = false
    })
}
getUserTableData()
const userTableHeaders = ref([
  { prop: "id", label: "用户 ID", align: "center" },
  { prop: "username", label: "用户名", align: "center" },
  { prop: "nickname", label: "昵称", align: "center" },
  { prop: "link", label: "操作 ", type: "link", align: "center" }
])
const resetSearch = () => {
  clearSearchData()
  getUserTableData()
}

const addUserDialogVisible = ref(false)
const userInfoFormData = reactive<any>({
  id: "",
  username: "",
  password: "",
  nickname: "",
  role: "",
  introduction: ""
})
const clearUserInfoFormData = () => {
  Object.keys(userInfoFormData).forEach((key) => (userInfoFormData[key] = ""))
}
const userFormRules: FormRules = reactive({
  username: [{ required: true, trigger: "blur", message: "请填写用户名" }]
})
const handleCloseUserAddDialog = () => {
  addUserDialogVisible.value = false
  clearUserInfoFormData()
}

const addingUser = ref(false)
const addUserFormRef = ref<FormInstance | null>(null)
const addUser = () => {
  addUserFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      addingUser.value = true

      createUserDataApi(userInfoFormData)
        .then(() => {
          ElMessage.success("新增成功")
          clearUserInfoFormData()
          addUserDialogVisible.value = false
          getUserTableData()
        })
        .catch((err) => {
          ElMessage.error(err.response.data.message)
        })
        .finally(() => {
          addingUser.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

const editUserDialogVisible = ref(false)
const handleRowClick = (row: GetUserData) => {
  editUserDialogVisible.value = true
  userInfoFormData.id = row.id
  userInfoFormData.username = row.username
  userInfoFormData.role = row.role
  userInfoFormData.introduction = row.introduction
  userInfoFormData.nickname = row.nickname
}
const handleCloseUserEditDialog = () => {
  editUserDialogVisible.value = false
  clearUserInfoFormData()
}
const editUserFormRef = ref<FormInstance | null>(null)
const updatingUser = ref(false)
const updateUser = () => {
  editUserFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      updatingUser.value = true
      updateUserDataApi(userInfoFormData)
        .then(() => {
          ElMessage.success("更新成功")
          clearUserInfoFormData()
          editUserDialogVisible.value = false
          getUserTableData()
        })
        .catch((err) => {
          ElMessage.error(err.response.data.message)
        })
        .finally(() => {
          updatingUser.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

interface Role {
  id: number
  roleName: string
}
const roleList = ref<Role[]>([])
const getRoleList = () => {
  getRoleDataApi({})
    .then((res) => {
      roleList.value = res.data.list
    })
    .catch((err) => {
      console.error(err.response.data.message)
    })
}
getRoleList()
</script>

<template>
  <div class="app-container">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="用户 ID">
          <el-input v-model="searchData.userId" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchData.nickname" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="getUserTableData">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="gettingUsers" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button icon="CirclePlus" type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getUserTableData" />
          </el-tooltip>
        </div>
      </div>
      <TableComponent class="table-wrapper" :column-data="userTableHeaders" :tableData="userTableData" stripe>
        <template #link="{ row }">
          <el-link type="primary" @click="handleRowClick(row)"> 用户详情 </el-link>
        </template>
      </TableComponent>
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
    </el-card>

    <!-- 添加用户弹窗 -->
    <el-dialog v-model="addUserDialogVisible" title="添加用户" top="5vh">
      <el-card v-loading="addingUser" shadow="never">
        <el-form ref="addUserFormRef" :model="userInfoFormData" label-width="auto" :rules="userFormRules">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="userInfoFormData.username" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input v-model="userInfoFormData.password" type="password" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="nickname" label="昵称">
            <el-input v-model="userInfoFormData.nickname" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="role" label="角色">
            <el-select v-model="userInfoFormData.role" filterable placeholder="请选择角色">
              <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="介绍">
            <el-input v-model="userInfoFormData.introduction" type="textarea" placeholder="请输入" />
          </el-form-item>
          <!-- <el-form-item label="头像"> -->
          <!--   <el-input v-model="addUserFormData.avatar" placeholder="请输入" /> -->
          <!-- </el-form-item> -->
        </el-form>
        <template #footer>
          <el-button @click="handleCloseUserAddDialog">取消</el-button>
          <el-button type="primary" @click="addUser">添加</el-button>
        </template>
      </el-card>
    </el-dialog>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="editUserDialogVisible" top="5vh" title="用户详情">
      <el-card v-loading="updatingUser" shadow="never">
        <el-form ref="editUserFormRef" :model="userInfoFormData" label-width="auto" :rules="userFormRules">
          <el-form-item prop="userId" label="用户 ID">
            <el-input v-model="userInfoFormData.id" readonly />
          </el-form-item>
          <el-form-item prop="username" label="用户名">
            <el-input v-model="userInfoFormData.username" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="userInfoFormData.password" type="password" />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="userInfoFormData.nickname" />
          </el-form-item>
          <el-form-item prop="role" label="角色">
            <el-select v-model="userInfoFormData.role" filterable placeholder="请选择角色">
              <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="介绍">
            <el-input v-model="userInfoFormData.introduction" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handleCloseUserEditDialog">取消</el-button>
          <el-button type="primary" @click="updateUser">更新</el-button>
        </template>
      </el-card>
    </el-dialog>
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
</style>
