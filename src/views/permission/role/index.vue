<script setup lang="ts">
import TableComponent from "@/components/Table/index.vue"
import { reactive, ref } from "vue"
import { updateUserDataApi } from "@/api/user"
import { usePagination } from "@/hooks/usePagination"
import { GetUserData } from "@/api/user/types/user"
import { ElButton, ElMessage, type FormInstance, type FormRules } from "element-plus"
import { getPermissionDataApi } from "@/api/permission"
import {createRoleDataApi, getRoleDataApi, updateRoleDataApi} from "@/api/role"
import { GetRoleData } from "@/api/role/types/role"

// 权限穿梭框
interface Permission {
  id: number
  name: string
}

const permissionList = ref<Permission[]>([])
const getPermissionList = () => {
  getPermissionDataApi()
    .then((res) => {
      permissionList.value = res.data
    })
    .catch((err) => {
      console.error(err.response.data.message)
    })
}
getPermissionList()

const searchData = reactive({
  roleId: "",
  roleName: ""
})
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}
const resetSearch = () => {
  clearSearchData()
  getRoleTableData()
}

const gettingRoles = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const roleTableData = ref<GetRoleData[]>([])

const getRoleTableData = async () => {
  gettingRoles.value = true

  const params = {
    ...searchData,
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  }
  getRoleDataApi(params)
    .then((res) => {
      paginationData.total = res.data.total
      roleTableData.value = res.data.list
      console.log("roleTableData", roleTableData.value)
    })
    .catch(() => {
      roleTableData.value = []
    })
    .finally(() => {
      gettingRoles.value = false
    })
}
getRoleTableData()

const roleTableHeaders = ref([
  { prop: "id", label: "角色 ID", align: "center" },
  { prop: "roleName", label: "角色名称", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "center" }
])

const addRoleDialogVisible = ref(false)
const roleInfoAddFormData = reactive<any>({
  roleName: "",
  permissions: []
})
const roleInfoFormData = reactive<any>({
  roleId: "",
  roleName: "",
  permissions: []
})
const clearRoleInfoFormData = () => {
  roleInfoAddFormData.roleName = ""
  roleInfoAddFormData.permissions = []
}
const roleFormRules: FormRules = reactive({
  roleName: [{ required: true, trigger: "blur", message: "请填写角色名称" }]
})
const handleCloseAddRoleDialog = () => {
  addRoleDialogVisible.value = false
  clearRoleInfoFormData()
}

const addingRole = ref(false)
const updatingRole = ref(false)
const addRoleFormRef = ref<FormInstance | null>(null)
const editRoleFormRef = ref<FormInstance | null>(null)
const addRole = () => {
  addRoleFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      addingRole.value = true

      createRoleDataApi(roleInfoAddFormData)
        .then(() => {
          ElMessage.success("新增成功")
          clearRoleInfoFormData()
          addRoleDialogVisible.value = false
          getRoleTableData()
        })
        .catch((err) => {
          ElMessage.error(err.response.data.message)
        })
        .finally(() => {
          addingRole.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}
const updateRole = () => {
  editRoleFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      updatingRole.value = true

      updateRoleDataApi(roleInfoFormData)
        .then(() => {
          ElMessage.success("更新成功")
          roleInfoDialogVisible.value = false
          getRoleTableData()
        })
        .catch((err) => {
          ElMessage.error(err.response.data.message)
        })
        .finally(() => {
          updatingRole.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

const roleInfoDialogVisible = ref<boolean>(false)
const editUserDialogVisible = ref<boolean>(false)

const changePassword = ref(false)
const toggleCheck = () => {
  changePassword.value = !changePassword.value
}

const handleCloseEditUserDialog = () => {
  editUserDialogVisible.value = false
  clearRoleInfoFormData()
}

const editUserFormRef = ref<FormInstance | null>(null)
const updatingUser = ref<boolean>(false)
const updateUser = () => {
  editUserFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      updatingUser.value = true
      if (!changePassword.value) {
        delete roleInfoAddFormData.password
      }
      updateUserDataApi(roleInfoAddFormData)
        .then(() => {
          ElMessage.success("更新成功")
          clearRoleInfoFormData()
          editUserDialogVisible.value = false
          getRoleTableData()
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
const handleLink = (data) => {
  roleInfoFormData.roleId = data.id
  roleInfoFormData.roleName = data.roleName
  roleInfoFormData.permissions = data.permissions
  roleInfoDialogVisible.value = true
}
</script>

<template>
  <div class="app-container">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="角色 ID">
          <el-input v-model="searchData.roleId" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="searchData.roleName" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="getRoleTableData">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="gettingRoles" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button icon="CirclePlus" type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getRoleTableData" />
          </el-tooltip>
        </div>
      </div>
      <TableComponent
        class="table-wrapper"
        :column-data="roleTableHeaders"
        :tableData="roleTableData"
        stripe
      >
        <template #link="{ row }">
          <el-link type="primary" @click="handleLink(row)">角色详情</el-link>
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

    <!-- 添加角色弹窗 -->
    <el-dialog v-model="addRoleDialogVisible" title="添加角色">
      <el-card v-loading="addingRole" shadow="never">
        <el-form ref="addRoleFormRef" :model="roleInfoAddFormData" label-width="auto" :rules="roleFormRules">
          <el-form-item prop="roleName" label="角色名称">
            <el-input v-model="roleInfoAddFormData.roleName" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="permission" label="权限">
            <el-transfer
              :props="{
                key: 'id',
                label: 'name'
              }"
              filterable
              v-model="roleInfoAddFormData.permissions"
              :titles="['可选的权限', '具有的权限']"
              filter-placeholder="搜索"
              :data="permissionList"
            >
              <template #default="{ option }">
                <!-- 鼠标悬浮在文字上时，显示提示 -->
                <span :title="option.name">{{ option.id }} - {{ option.name }}</span>
              </template>
            </el-transfer>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handleCloseAddRoleDialog">取消</el-button>
          <el-button type="primary" @click="addRole">确认</el-button>
        </template>
      </el-card>
    </el-dialog>

    <!-- 角色详情弹窗 -->
    <el-dialog v-model="roleInfoDialogVisible" title="角色详情">
      <el-card v-loading="updatingRole" shadow="never">
        <el-form ref="editRoleFormRef" :model="roleInfoFormData" label-width="auto" :rules="roleFormRules">
          <el-form-item prop="roleId" label="角色 ID">
            <el-input v-model="roleInfoFormData.roleId" readonly />
          </el-form-item>
          <el-form-item prop="roleName" label="角色名称">
            <el-input v-model="roleInfoFormData.roleName" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="permission" label="权限">
            <el-transfer
              :props="{
                key: 'id',
                label: 'name'
              }"
              filterable
              v-model="roleInfoFormData.permissions"
              :titles="['可选的权限', '具有的权限']"
              filter-placeholder="搜索"
              :data="permissionList"
            >
              <template #default="{ option }">
                <!-- 鼠标悬浮在文字上时，显示提示 -->
                <span :title="option.name">{{ option.id }} - {{ option.name }}</span>
              </template>
            </el-transfer>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="roleInfoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateRole">更新</el-button>
        </template>
      </el-card>
    </el-dialog>

    <!-- 编辑用户信息 -->
    <el-dialog v-model="editUserDialogVisible" width="30%" title="编辑用户信息">
      <el-card v-loading="updatingUser" shadow="never">
        <el-form ref="editUserFormRef" :model="roleInfoAddFormData" label-width="auto" :rules="roleFormRules">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="roleInfoAddFormData.username" />
          </el-form-item>
          <el-form-item prop="role" label="角色">
            <el-input v-model="roleInfoAddFormData.role" />
          </el-form-item>
          <el-form-item label="介绍">
            <el-input v-model="roleInfoAddFormData.introduction" type="textarea" />
          </el-form-item>

          <el-button :type="changePassword ? 'primary' : 'default'" @click.prevent="toggleCheck" style="opacity: 0.8">
            修改密码
          </el-button>
          <el-form-item v-show="changePassword" class="mt-2" label="密码">
            <el-input v-model="roleInfoAddFormData.password" type="password" />
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
</style>
