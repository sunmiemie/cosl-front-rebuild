<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import type { GetRoleData } from "@/api/role/types/role"
import { createRoleDataApi, getRoleDataApi, updateRoleDataApi } from "@/api/role"
import { getPermissionDataApi } from "@/api/permission"
import type { GetPermissionData } from "@/api/permission/types/permission"

type PermissionItem = GetPermissionData
type RoleMode = "create" | "edit"
type PermissionBucket = "available" | "owned"
type DragPermissionPayload = { id: number; source: PermissionBucket }

const CATEGORY_ALL = "__ALL__"

const searchData = reactive({
  roleId: "",
  roleName: ""
})
const clearSearchData = () => {
  searchData.roleId = ""
  searchData.roleName = ""
}

const gettingRoles = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const roleTableData = ref<GetRoleData[]>([])

const permissionList = ref<PermissionItem[]>([])
const availablePermissions = ref<PermissionItem[]>([])
const ownedPermissions = ref<PermissionItem[]>([])
const permissionKeyword = ref("")
const activeCategory = ref(CATEGORY_ALL)
const dragging = ref(false)
const dragOverBucket = ref<PermissionBucket | null>(null)
const dragPayload = ref<DragPermissionPayload | null>(null)
const selectedAvailableIds = ref<number[]>([])
const selectedOwnedIds = ref<number[]>([])

const roleDrawerVisible = ref(false)
const roleMode = ref<RoleMode>("edit")
const savingRole = ref(false)
const roleFormRef = ref<FormInstance | null>(null)
const roleFormData = reactive({
  roleId: "",
  roleName: "",
  permissions: [] as number[]
})

const roleFormRules: FormRules = reactive({
  roleName: [{ required: true, trigger: "blur", message: "请填写角色名称" }]
})

const normalizedCategory = (permission: PermissionItem) => permission.category || "未分组"
const categoryOrder = (permission: PermissionItem) => permission.categoryOrder ?? 999
const sortPermission = (list: PermissionItem[]) =>
  [...list].sort((a, b) => {
    if (categoryOrder(a) !== categoryOrder(b)) return categoryOrder(a) - categoryOrder(b)
    if ((a.sort || 0) !== (b.sort || 0)) return (a.sort || 0) - (b.sort || 0)
    return a.id - b.id
  })

const selectedPermissionIds = computed(() => new Set(ownedPermissions.value.map((item) => item.id)))
const categoryCount = computed(() => Math.max(categoryGroups.value.length - 1, 0))
const currentRolePermissionCount = computed(() => ownedPermissions.value.length)
const categoryGroups = computed(() => {
  const groups = new Map<
    string,
    { key: string; label: string; total: number; owned: number; available: number; order: number }
  >()
  const ensureGroup = (permission: PermissionItem) => {
    const label = normalizedCategory(permission)
    const current = groups.get(label)
    if (current) {
      current.total += 1
      current.order = Math.min(current.order, categoryOrder(permission))
      return current
    }
    const created = {
      key: label,
      label,
      total: 1,
      owned: 0,
      available: 0,
      order: categoryOrder(permission)
    }
    groups.set(label, created)
    return created
  }

  permissionList.value.forEach(ensureGroup)
  ownedPermissions.value.forEach((permission) => {
    const group = groups.get(normalizedCategory(permission))
    if (group) group.owned += 1
  })
  availablePermissions.value.forEach((permission) => {
    const group = groups.get(normalizedCategory(permission))
    if (group) group.available += 1
  })

  return [
    {
      key: CATEGORY_ALL,
      label: "全部权限",
      total: permissionList.value.length,
      owned: ownedPermissions.value.length,
      available: availablePermissions.value.length,
      order: -1
    },
    ...Array.from(groups.values()).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.label.localeCompare(b.label, "zh-Hans-CN")
    })
  ]
})

const drawerTitle = computed(() => (roleMode.value === "create" ? "添加角色" : `角色详情 #${roleFormData.roleId}`))
const activeCategoryName = computed(() => {
  return categoryGroups.value.find((item) => item.key === activeCategory.value)?.label || "全部权限"
})

const matchesPermissionFilter = (permission: PermissionItem) => {
  const keyword = permissionKeyword.value.trim().toLowerCase()
  const categoryMatched =
    activeCategory.value === CATEGORY_ALL || normalizedCategory(permission) === activeCategory.value
  if (!categoryMatched) return false
  if (!keyword) return true
  return [permission.name, permission.code, permission.category, permission.scope, permission.action]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword))
}

const visibleAvailablePermissions = computed(() => availablePermissions.value.filter(matchesPermissionFilter))
const visibleOwnedPermissions = computed(() => ownedPermissions.value.filter(matchesPermissionFilter))
const visibleAvailableCount = computed(() => availablePermissions.value.filter(matchesPermissionFilter).length)
const visibleOwnedCount = computed(() => ownedPermissions.value.filter(matchesPermissionFilter).length)
const visibleAvailableIdSet = computed(() => new Set(visibleAvailablePermissions.value.map((item) => item.id)))
const visibleOwnedIdSet = computed(() => new Set(visibleOwnedPermissions.value.map((item) => item.id)))
const selectedVisibleAvailableIds = computed(() =>
  selectedAvailableIds.value.filter((id) => visibleAvailableIdSet.value.has(id))
)
const selectedVisibleOwnedIds = computed(() => selectedOwnedIds.value.filter((id) => visibleOwnedIdSet.value.has(id)))
const hasSelectedAvailable = computed(() => selectedVisibleAvailableIds.value.length > 0)
const hasSelectedOwned = computed(() => selectedVisibleOwnedIds.value.length > 0)

const clearPoolSelections = () => {
  selectedAvailableIds.value = []
  selectedOwnedIds.value = []
}

const normalizePermissionPools = () => {
  const ownedIds = new Set<number>(ownedPermissions.value.map((item) => item.id))
  ownedPermissions.value = sortPermission(permissionList.value.filter((item) => ownedIds.has(item.id)))
  availablePermissions.value = sortPermission(permissionList.value.filter((item) => !ownedIds.has(item.id)))
  roleFormData.permissions = ownedPermissions.value.map((item) => item.id)
}

const resetRoleForm = () => {
  roleFormData.roleId = ""
  roleFormData.roleName = ""
  roleFormData.permissions = []
  ownedPermissions.value = []
  availablePermissions.value = sortPermission(permissionList.value)
  permissionKeyword.value = ""
  activeCategory.value = CATEGORY_ALL
  clearPoolSelections()
  nextTick(() => roleFormRef.value?.clearValidate())
}

const openCreateRole = () => {
  roleMode.value = "create"
  resetRoleForm()
  roleDrawerVisible.value = true
}

const openEditRole = (row: GetRoleData) => {
  roleMode.value = "edit"
  roleFormData.roleId = String(row.id)
  roleFormData.roleName = row.roleName
  roleFormData.permissions = [...(row.permissions || [])]
  const ids = new Set(roleFormData.permissions)
  ownedPermissions.value = sortPermission(permissionList.value.filter((item) => ids.has(item.id)))
  availablePermissions.value = sortPermission(permissionList.value.filter((item) => !ids.has(item.id)))
  permissionKeyword.value = ""
  activeCategory.value = CATEGORY_ALL
  clearPoolSelections()
  roleDrawerVisible.value = true
}

const movePermissions = (ids: number[], target: PermissionBucket) => {
  const idSet = new Set(ids)
  if (target === "owned") {
    const moving = availablePermissions.value.filter((item) => idSet.has(item.id))
    if (moving.length === 0) return
    availablePermissions.value = availablePermissions.value.filter((item) => !idSet.has(item.id))
    ownedPermissions.value = sortPermission([...ownedPermissions.value, ...moving])
  } else {
    const moving = ownedPermissions.value.filter((item) => idSet.has(item.id))
    if (moving.length === 0) return
    ownedPermissions.value = ownedPermissions.value.filter((item) => !idSet.has(item.id))
    availablePermissions.value = sortPermission([...availablePermissions.value, ...moving])
  }
  clearPoolSelections()
  normalizePermissionPools()
}

const moveToOwned = (permission: PermissionItem) => {
  if (selectedPermissionIds.value.has(permission.id)) return
  movePermissions([permission.id], "owned")
}

const moveToAvailable = (permission: PermissionItem) => {
  movePermissions([permission.id], "available")
}

const moveSelectedToOwned = () => {
  movePermissions(selectedVisibleAvailableIds.value, "owned")
}

const moveSelectedToAvailable = () => {
  movePermissions(selectedVisibleOwnedIds.value, "available")
}

const moveVisibleToOwned = () => {
  movePermissions(
    visibleAvailablePermissions.value.map((item) => item.id),
    "owned"
  )
}

const moveVisibleToAvailable = () => {
  movePermissions(
    visibleOwnedPermissions.value.map((item) => item.id),
    "available"
  )
}

const getPermissionList = async () => {
  const res = await getPermissionDataApi()
  permissionList.value = sortPermission(res.data)
  normalizePermissionPools()
  clearPoolSelections()
}

const getRoleTableData = async () => {
  gettingRoles.value = true
  try {
    const res = await getRoleDataApi({
      ...searchData,
      currentPage: paginationData.currentPage,
      pageSize: paginationData.pageSize
    })
    paginationData.total = res.data.total
    roleTableData.value = res.data.list
  } catch {
    roleTableData.value = []
  } finally {
    gettingRoles.value = false
  }
}

const resetSearch = () => {
  clearSearchData()
  paginationData.currentPage = 1
  getRoleTableData()
}

const saveRole = () => {
  roleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    savingRole.value = true
    normalizePermissionPools()
    try {
      if (roleMode.value === "create") {
        await createRoleDataApi({
          roleName: roleFormData.roleName,
          permissions: roleFormData.permissions
        })
        ElMessage.success("角色添加成功")
      } else {
        await updateRoleDataApi({
          roleId: roleFormData.roleId,
          roleName: roleFormData.roleName,
          permissions: roleFormData.permissions
        })
        ElMessage.success("角色更新成功")
      }
      roleDrawerVisible.value = false
      getRoleTableData()
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || err.response?.data?.msg || "保存失败")
    } finally {
      savingRole.value = false
    }
  })
}

const permissionsForRole = (row: GetRoleData) => {
  const ids = new Set(row.permissions || [])
  return permissionList.value.filter((item) => ids.has(item.id))
}

const rolePermissionCount = (row: GetRoleData) => permissionsForRole(row).length

const rolePermissionGroups = (row: GetRoleData) => {
  const groups = new Map<string, { name: string; count: number; order: number }>()
  permissionsForRole(row).forEach((permission) => {
    const name = normalizedCategory(permission)
    const current = groups.get(name)
    if (current) {
      current.count += 1
      current.order = Math.min(current.order, categoryOrder(permission))
    } else {
      groups.set(name, { name, count: 1, order: categoryOrder(permission) })
    }
  })
  return Array.from(groups.values())
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.name.localeCompare(b.name, "zh-Hans-CN")
    })
    .slice(0, 4)
}

const permissionMeta = (permission: PermissionItem) => {
  return [permission.action, permission.scope].filter(Boolean).join(" · ") || permission.description || "权限项"
}

const startPermissionDrag = (permission: PermissionItem, source: PermissionBucket, event: DragEvent) => {
  dragPayload.value = { id: permission.id, source }
  dragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", `${source}:${permission.id}`)
  }
}

const parseDragPayload = (event: DragEvent): DragPermissionPayload | null => {
  if (dragPayload.value) return dragPayload.value
  const raw = event.dataTransfer?.getData("text/plain")
  if (!raw) return null
  const [source, id] = raw.split(":")
  if ((source !== "available" && source !== "owned") || Number.isNaN(Number(id))) return null
  return { source, id: Number(id) }
}

const onBucketDragOver = (bucket: PermissionBucket, event: DragEvent) => {
  const payload = parseDragPayload(event)
  if (!payload || payload.source === bucket) return
  dragOverBucket.value = bucket
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move"
}

const onBucketDragLeave = (bucket: PermissionBucket, event: DragEvent) => {
  const current = event.currentTarget as HTMLElement | null
  const nextTarget = event.relatedTarget as Node | null
  if (dragOverBucket.value === bucket && current && (!nextTarget || !current.contains(nextTarget))) {
    dragOverBucket.value = null
  }
}

const finishPermissionDrag = () => {
  dragPayload.value = null
  dragOverBucket.value = null
  clearPoolSelections()
  nextTick(() => {
    dragging.value = false
  })
}

const dropPermission = (bucket: PermissionBucket, event: DragEvent) => {
  const payload = parseDragPayload(event)
  if (payload && payload.source !== bucket) {
    movePermissions([payload.id], bucket)
  }
  finishPermissionDrag()
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], getRoleTableData)

getPermissionList().then(getRoleTableData)
</script>

<template>
  <div class="app-container permission-workbench">
    <section class="permission-hero">
      <div>
        <p class="eyebrow">RBAC Control Desk</p>
        <h2>权限管理</h2>
        <p class="hero-copy">按资源域组织权限，所有权限都由代码显式定义并由后端真实鉴权控制。</p>
      </div>
      <div class="hero-metrics">
        <div>
          <strong>{{ permissionList.length }}</strong>
          <span>权限项</span>
        </div>
        <div>
          <strong>{{ categoryCount }}</strong>
          <span>分类数</span>
        </div>
        <div>
          <strong>{{ currentRolePermissionCount }}</strong>
          <span>当前角色</span>
        </div>
      </div>
    </section>

    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchData" label-width="76px">
        <el-form-item label="角色 ID">
          <el-input v-model="searchData.roleId" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="searchData.roleName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="getRoleTableData">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="gettingRoles" shadow="never">
      <div class="toolbar-wrapper">
        <el-button icon="CirclePlus" type="primary" @click="openCreateRole">添加角色</el-button>
        <el-button type="primary" icon="RefreshRight" circle @click="getRoleTableData" />
      </div>
      <el-table class="role-table" :data="roleTableData" stripe border>
        <el-table-column prop="id" label="角色 ID" align="center" width="120" />
        <el-table-column prop="roleName" label="角色名称" min-width="180" />
        <el-table-column label="已配置权限" min-width="360">
          <template #default="{ row }">
            <div v-if="rolePermissionCount(row) > 0" class="role-permission-summary">
              <el-tag v-for="item in rolePermissionGroups(row)" :key="item.name" size="small" effect="plain">
                {{ item.name }} {{ item.count }}
              </el-tag>
              <span>共 {{ rolePermissionCount(row) }} 项</span>
            </div>
            <span v-else class="muted-text">未配置</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditRole(row)">编辑权限</el-button>
          </template>
        </el-table-column>
      </el-table>
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

    <el-drawer v-model="roleDrawerVisible" :title="drawerTitle" size="86%" destroy-on-close>
      <div class="role-editor" v-loading="savingRole">
        <div class="role-editor-head">
          <el-form ref="roleFormRef" :model="roleFormData" :rules="roleFormRules" label-width="112px" class="role-form">
            <el-form-item v-if="roleMode === 'edit'" label="角色 ID" class="readonly-form-item">
              <el-tooltip content="角色 ID 由系统生成，不支持修改" placement="top">
                <span class="readonly-field">
                  <el-input v-model="roleFormData.roleId" disabled placeholder="系统生成，不可修改" />
                </span>
              </el-tooltip>
              <span class="readonly-tip">系统生成，不可修改</span>
            </el-form-item>
            <el-form-item prop="roleName" label="角色名称">
              <el-input v-model="roleFormData.roleName" placeholder="请输入角色名称" />
            </el-form-item>
          </el-form>
          <div class="editor-stats">
            <div>
              <span>当前分类</span>
              <strong>{{ activeCategoryName }}</strong>
            </div>
            <div>
              <span>已拥有</span>
              <strong>{{ ownedPermissions.length }}</strong>
            </div>
            <div>
              <span>可选</span>
              <strong>{{ availablePermissions.length }}</strong>
            </div>
          </div>
        </div>

        <div class="permission-board">
          <aside class="category-rail">
            <div class="rail-title">权限分类</div>
            <button
              v-for="item in categoryGroups"
              :key="item.key"
              type="button"
              class="category-item"
              :class="{ active: activeCategory === item.key }"
              @click="activeCategory = item.key"
            >
              <span>{{ item.label }}</span>
              <small>{{ item.owned }}/{{ item.total }}</small>
            </button>
          </aside>

          <section class="permission-stage">
            <div class="board-toolbar">
              <el-input v-model="permissionKeyword" placeholder="搜索权限名称、编码、分类、对象" clearable />
              <span class="assignment-hint">拖拽、双击或使用批量按钮调整角色权限</span>
            </div>

            <div class="permission-columns">
              <section
                class="permission-panel available"
                @dragover.prevent="onBucketDragOver('available', $event)"
                @dragleave="onBucketDragLeave('available', $event)"
                @drop.prevent="dropPermission('available', $event)"
              >
                <header>
                  <div>
                    <span>可选权限</span>
                    <small
                      >{{ activeCategoryName }} · 当前 {{ visibleAvailableCount }} / 全部
                      {{ availablePermissions.length }}</small
                    >
                  </div>
                  <div class="panel-actions">
                    <el-button size="small" :disabled="!hasSelectedAvailable" @click="moveSelectedToOwned"
                      >加入选中</el-button
                    >
                    <el-button size="small" :disabled="visibleAvailableCount === 0" @click="moveVisibleToOwned"
                      >加入当前筛选</el-button
                    >
                  </div>
                </header>
                <el-scrollbar class="permission-scroll">
                  <TransitionGroup
                    tag="div"
                    class="permission-list"
                    :class="{
                      'is-drop-empty': visibleAvailableCount === 0,
                      'is-drag-over': dragOverBucket === 'available'
                    }"
                    :name="dragging ? undefined : 'permission-move'"
                  >
                    <article
                      v-for="item in availablePermissions"
                      v-show="matchesPermissionFilter(item)"
                      :key="item.id"
                      class="permission-row"
                      :class="{ checked: selectedAvailableIds.includes(item.id) }"
                      draggable="true"
                      @dragstart="startPermissionDrag(item, 'available', $event)"
                      @dragend="finishPermissionDrag"
                      @dblclick="moveToOwned(item)"
                    >
                      <span class="row-check" @click.stop>
                        <el-checkbox v-model="selectedAvailableIds" :value="item.id" />
                      </span>
                      <div class="row-main">
                        <div class="row-title">
                          <strong>{{ item.name }}</strong>
                        </div>
                        <p>{{ item.code || "NO_CODE" }}</p>
                      </div>
                      <div class="row-meta">
                        <span>{{ permissionMeta(item) }}</span>
                        <small>{{ normalizedCategory(item) }}</small>
                      </div>
                      <div class="row-actions">
                        <el-button link type="primary" @click.stop="moveToOwned(item)">加入</el-button>
                      </div>
                    </article>
                  </TransitionGroup>
                  <div v-if="visibleAvailableCount === 0" class="permission-empty-state">
                    <el-empty :image-size="64" description="当前筛选下没有可选权限" />
                  </div>
                </el-scrollbar>
              </section>

              <section
                class="permission-panel owned"
                @dragover.prevent="onBucketDragOver('owned', $event)"
                @dragleave="onBucketDragLeave('owned', $event)"
                @drop.prevent="dropPermission('owned', $event)"
              >
                <header>
                  <div>
                    <span>具有权限</span>
                    <small
                      >{{ activeCategoryName }} · 当前 {{ visibleOwnedCount }} / 全部
                      {{ ownedPermissions.length }}</small
                    >
                  </div>
                  <div class="panel-actions">
                    <el-button size="small" :disabled="!hasSelectedOwned" @click="moveSelectedToAvailable"
                      >移出选中</el-button
                    >
                    <el-button size="small" :disabled="visibleOwnedCount === 0" @click="moveVisibleToAvailable"
                      >移出当前筛选</el-button
                    >
                  </div>
                </header>
                <el-scrollbar class="permission-scroll">
                  <TransitionGroup
                    tag="div"
                    class="permission-list"
                    :class="{
                      'is-drop-empty': visibleOwnedCount === 0,
                      'is-drag-over': dragOverBucket === 'owned'
                    }"
                    :name="dragging ? undefined : 'permission-move'"
                  >
                    <article
                      v-for="item in ownedPermissions"
                      v-show="matchesPermissionFilter(item)"
                      :key="item.id"
                      class="permission-row selected"
                      :class="{ checked: selectedOwnedIds.includes(item.id) }"
                      draggable="true"
                      @dragstart="startPermissionDrag(item, 'owned', $event)"
                      @dragend="finishPermissionDrag"
                      @dblclick="moveToAvailable(item)"
                    >
                      <span class="row-check" @click.stop>
                        <el-checkbox v-model="selectedOwnedIds" :value="item.id" />
                      </span>
                      <div class="row-main">
                        <div class="row-title">
                          <strong>{{ item.name }}</strong>
                        </div>
                        <p>{{ item.code || "NO_CODE" }}</p>
                      </div>
                      <div class="row-meta">
                        <span>{{ permissionMeta(item) }}</span>
                        <small>{{ normalizedCategory(item) }}</small>
                      </div>
                      <div class="row-actions">
                        <el-button link type="warning" @click.stop="moveToAvailable(item)">移出</el-button>
                      </div>
                    </article>
                  </TransitionGroup>
                  <div v-if="visibleOwnedCount === 0" class="permission-empty-state">
                    <el-empty :image-size="64" description="当前筛选下没有已拥有权限" />
                  </div>
                </el-scrollbar>
              </section>
            </div>
          </section>
        </div>
      </div>

      <template #footer>
        <el-button @click="roleDrawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingRole" @click="saveRole">
          {{ roleMode === "create" ? "添加角色" : "更新角色" }}
        </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.permission-workbench {
  --rbac-ink: #1e2b32;
  --rbac-muted: #6d7a82;
  --rbac-line: #d9e1e6;
  --rbac-blue: #1f6feb;
  --rbac-steel: #eef4f7;
  --rbac-gold: #c38b30;
}

.permission-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 14px;
  padding: 18px 22px;
  color: var(--rbac-ink);
  border: 1px solid #d6e0e6;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(235, 244, 248, 0.95)),
    radial-gradient(circle at 8% 20%, rgba(195, 139, 48, 0.2), transparent 28%),
    radial-gradient(circle at 92% 8%, rgba(31, 111, 235, 0.16), transparent 30%);
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--rbac-gold);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.permission-hero h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.hero-copy {
  max-width: 620px;
  margin: 8px 0 0;
  color: var(--rbac-muted);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, 92px);
  gap: 8px;
}

.hero-metrics div {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid rgba(31, 111, 235, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
}

.hero-metrics strong {
  color: var(--rbac-blue);
  font-size: 22px;
  line-height: 1;
}

.hero-metrics span {
  color: var(--rbac-muted);
  font-size: 12px;
}

.search-wrapper {
  margin-bottom: 18px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }

  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.role-table {
  margin-bottom: 18px;
}

.role-permission-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--rbac-muted);
  font-size: 12px;
}

.muted-text {
  color: var(--rbac-muted);
  font-size: 12px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.role-editor {
  display: grid;
  gap: 12px;
}

.role-editor-head {
  display: grid;
  grid-template-columns: minmax(320px, 560px) minmax(320px, 1fr);
  gap: 14px;
  align-items: stretch;
}

.role-form {
  padding: 12px 14px 0;
  border: 1px solid var(--rbac-line);
  border-radius: 14px;
  background: #fff;
}

.role-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.readonly-form-item :deep(.el-form-item__content) {
  align-items: center;
  gap: 10px;
}

.readonly-field {
  display: inline-flex;
  width: min(280px, 100%);
  cursor: not-allowed;
}

.role-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background: #f2f4f7;
  box-shadow: inset 0 0 0 1px #d7dde5;
}

.readonly-tip {
  color: var(--rbac-muted);
  font-size: 12px;
  line-height: 1;
}

.editor-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.editor-stats div {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid var(--rbac-line);
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff, #f6fafc);
}

.editor-stats span {
  color: var(--rbac-muted);
  font-size: 12px;
}

.editor-stats strong {
  color: var(--rbac-ink);
  font-size: 18px;
}

.permission-board {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--rbac-line);
  border-radius: 16px;
  background: #f8fbfc;
}

.category-rail {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--rbac-line);
  border-radius: 14px;
  background: #fff;
}

.rail-title {
  margin: 2px 4px 10px;
  color: var(--rbac-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.category-item {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding: 9px 10px;
  color: var(--rbac-ink);
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.category-item small {
  color: var(--rbac-muted);
  font-size: 11px;
}

.category-item:hover,
.category-item.active {
  border-color: rgba(31, 111, 235, 0.22);
  background: #eef5ff;
}

.permission-stage {
  min-width: 0;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.assignment-hint {
  flex: 0 0 auto;
  color: var(--rbac-muted);
  font-size: 12px;
  white-space: nowrap;
}

.permission-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.permission-panel {
  min-width: 0;
  min-height: 620px;
  border: 1px solid var(--rbac-line);
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}

.permission-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--rbac-line);
  background: var(--rbac-steel);
}

.permission-panel header span {
  color: var(--rbac-ink);
  font-size: 14px;
  font-weight: 800;
}

.permission-panel header small {
  color: var(--rbac-muted);
  display: block;
  margin-top: 2px;
  font-size: 12px;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.permission-scroll {
  height: 560px;

  :deep(.el-scrollbar__view) {
    position: relative;
    min-height: 100%;
  }
}

.permission-list {
  display: grid;
  align-content: start;
  gap: 6px;
  min-height: 540px;
  padding: 10px;
}

.permission-list.is-drop-empty {
  border: 1px dashed rgba(31, 111, 235, 0.24);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(238, 245, 255, 0.72), rgba(255, 255, 255, 0.2));
}

.permission-list.is-drag-over {
  border: 1px solid rgba(31, 111, 235, 0.58);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(220, 235, 255, 0.9), rgba(255, 255, 255, 0.72));
  box-shadow: inset 0 0 0 2px rgba(31, 111, 235, 0.12);
}

.permission-empty-state {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  min-height: 0;
  place-items: center;
  pointer-events: none;
}

.permission-row {
  display: grid;
  grid-template-columns: 26px minmax(132px, 1.3fr) minmax(112px, 0.8fr) auto;
  gap: 8px;
  align-items: center;
  min-height: 42px;
  padding: 6px 9px;
  border: 1px solid #dde6eb;
  border-radius: 10px;
  background: #fff;
  cursor: grab;
}

.permission-row:active {
  cursor: grabbing;
}

.permission-row:hover {
  border-color: rgba(31, 111, 235, 0.28);
  box-shadow: 0 6px 16px rgba(30, 43, 50, 0.06);
}

.permission-row.selected {
  border-color: rgba(31, 111, 235, 0.3);
  background: linear-gradient(180deg, #ffffff, #f4f8ff);
}

.permission-row.checked {
  outline: 2px solid rgba(31, 111, 235, 0.14);
}

.row-check {
  display: flex;
  justify-content: center;
}

.row-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.row-title strong {
  overflow: hidden;
  color: var(--rbac-ink);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-main p {
  margin: 3px 0 0;
  overflow: hidden;
  color: var(--rbac-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
  color: var(--rbac-muted);
  font-size: 12px;
}

.row-meta span,
.row-meta small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  gap: 2px;
}

.permission-move-enter-active,
.permission-move-leave-active {
  transition: all 0.18s ease;
}

.permission-move-enter-from,
.permission-move-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 960px) {
  .permission-hero,
  .role-editor-head,
  .board-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-metrics,
  .role-editor-head,
  .editor-stats,
  .permission-board,
  .permission-columns,
  .permission-row {
    grid-template-columns: 1fr;
  }

  .permission-scroll {
    height: auto;
    max-height: 560px;
  }
}
</style>
