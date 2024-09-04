<script setup lang="ts">
import TableComponent from "@/components/Table/index.vue"
import { reactive, ref } from "vue"
import { createUserDataApi, getUserDataApi, updateUserDataApi } from "@/api/user"
import { usePagination } from "@/hooks/usePagination"
import { GetUserData } from "@/api/user/types/user"
import { ElButton, ElMessage, type FormInstance, type FormRules } from "element-plus"

const searchData = reactive({
  userId: "",
  username: ""
})
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}
const resetSearch = () => {
  clearSearchData()
  getUserTableData()
}

const gettingUsers = ref<boolean>(false)

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
      userTableData.value.forEach((u) => (u.link = { 1: "详情", 2: "编辑" }))
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
  { prop: "link", label: "操作 ", type: "link", align: "center" }
])

const addUserDialogVisible = ref<boolean>(false)
const userInfoFormData = reactive<any>({
  id: "",
  username: "",
  password: "",
  role: "",
  introduction: ""
})
const userFormRules: FormRules = reactive({
  username: [{ required: true, trigger: "blur", message: "请填写用户名" }]
})
const handleCloseAddUserDialog = () => {
  addUserDialogVisible.value = false
  clearUserInfoFormData()
}
const clearUserInfoFormData = () => {
  Object.keys(userInfoFormData).forEach((key) => (userInfoFormData[key] = ""))
}

const addingUser = ref<boolean>(false)
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

const userInfoDialogVisible = ref<boolean>(false)
const editUserDialogVisible = ref<boolean>(false)
const handleRowClick = (row: GetUserData, text: string) => {
  if (text === "详情") {
    userInfoDialogVisible.value = true
  } else {
    changePassword.value = false
    editUserDialogVisible.value = true
    userInfoFormData.id = row.id
  }
  userInfoFormData.username = row.username
  userInfoFormData.role = row.role
  userInfoFormData.introduction = row.introduction
}

const changePassword = ref(false)
const toggleCheck = () => {
  changePassword.value = !changePassword.value
}

const handleCloseEditUserDialog = () => {
  editUserDialogVisible.value = false
  clearUserInfoFormData()
}

const editUserFormRef = ref<FormInstance | null>(null)
const updatingUser = ref<boolean>(false)
const updateUser = () => {
  editUserFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      updatingUser.value = true
      if (!changePassword.value) {
        delete userInfoFormData.password
      }
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
          <el-link
            v-for="text in row['link']"
            :key="text"
            class="el-link"
            type="primary"
            @click="handleRowClick(row, text)"
          >
            {{ text }}
          </el-link>
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

    <!-- 添加用户对话框 -->
    <el-dialog v-model="addUserDialogVisible" width="30%" title="添加用户">
      <el-card v-loading="addingUser" shadow="never">
        <el-form ref="addUserFormRef" :model="userInfoFormData" label-width="auto" :rules="userFormRules">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="userInfoFormData.username" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input v-model="userInfoFormData.password" type="password" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="role" label="角色">
            <el-input v-model="userInfoFormData.role" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="介绍">
            <el-input v-model="userInfoFormData.introduction" type="textarea" placeholder="请输入" />
          </el-form-item>
          <!-- <el-form-item label="头像"> -->
          <!--   <el-input v-model="addUserFormData.avatar" placeholder="请输入" /> -->
          <!-- </el-form-item> -->
        </el-form>
        <template #footer>
          <el-button @click="handleCloseAddUserDialog">取消</el-button>
          <el-button type="primary" @click="addUser">确认</el-button>
        </template>
      </el-card>
    </el-dialog>

    <!-- 用户详情 -->
    <el-dialog v-model="userInfoDialogVisible" width="30%" title="用户详情">
      <el-form :model="userInfoFormData" label-width="auto">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="userInfoFormData.username" readonly />
        </el-form-item>
        <el-form-item prop="role" label="角色">
          <el-input v-model="userInfoFormData.role" readonly />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="userInfoFormData.introduction" readonly type="textarea" />
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑用户信息 -->
    <el-dialog v-model="editUserDialogVisible" width="30%" title="编辑用户信息">
      <el-card v-loading="updatingUser" shadow="never">
        <el-form ref="editUserFormRef" :model="userInfoFormData" label-width="auto" :rules="userFormRules">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="userInfoFormData.username" />
          </el-form-item>
          <el-form-item prop="role" label="角色">
            <el-input v-model="userInfoFormData.role" />
          </el-form-item>
          <el-form-item label="介绍">
            <el-input v-model="userInfoFormData.introduction" type="textarea" />
          </el-form-item>

          <el-button :type="changePassword ? 'primary' : 'default'" @click.prevent="toggleCheck" style="opacity: 0.8">
            修改密码
          </el-button>
          <el-form-item v-show="changePassword" class="mt-2" label="密码">
            <el-input v-model="userInfoFormData.password" type="password" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handleCloseEditUserDialog">取消</el-button>
          <el-button type="primary" @click="updateUser">确认</el-button>
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

.el-link {
  margin-right: 8px;
}
</style>
