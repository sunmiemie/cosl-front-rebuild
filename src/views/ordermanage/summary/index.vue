<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>电路板与委托单关联汇总</span>
        </div>
      </template>

      <div class="stat-row">
        <div class="stat-card">
          <div class="s-label">电路板总数</div>
          <div class="s-val">{{ stats.total }}</div>
        </div>
        <div class="stat-card">
          <div class="s-label">已关联委托单</div>
          <div class="s-val ok">{{ stats.linked }}</div>
        </div>
        <div class="stat-card">
          <div class="s-label">未关联委托单</div>
          <div class="s-val warn">{{ stats.unlinked }}</div>
        </div>
      </div>

      <el-form :inline="true" :model="filters" class="search-form">
        <el-form-item>
          <el-input
            v-model="filters.search"
            placeholder="搜索申请单号、样品名称、SN号、批次号..."
            clearable
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="已关联委托单" value="linked" />
            <el-option label="未关联委托单" value="unlinked" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="applyFilters">查询</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :loading="exportLoading" @click="handleExport">批量导出</el-button>
          <span v-if="selectedRows.length" class="selection-tip">已选择 {{ selectedRows.length }} 条</span>
        </div>
        <el-tooltip content="刷新数据">
          <el-button circle icon="RefreshRight" type="primary" @click="getList" />
        </el-tooltip>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        class="summary-table"
        max-height="600"
        stripe
        border
        :row-key="getRelationRowKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" fixed="left" />
        <el-table-column prop="applicationNo" label="申请单号" min-width="136" show-overflow-tooltip />
        <el-table-column label="SN号" min-width="106">
          <template #default="{ row }">
            <span class="sn-code">{{ row.sn }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="样品名称" min-width="124" show-overflow-tooltip />
        <el-table-column prop="batchNo" label="批次号" min-width="104" show-overflow-tooltip />
        <el-table-column prop="spec" label="规格型号" min-width="138" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" min-width="104" show-overflow-tooltip />
        <el-table-column prop="materialNo" label="物料号" min-width="88" show-overflow-tooltip />
        <el-table-column prop="testContent" label="测试内容" min-width="92" show-overflow-tooltip />
        <el-table-column prop="hours" label="工时(h)" width="86" align="center">
          <template #default="{ row }">{{ formatHours(row.hours) }}</template>
        </el-table-column>
        <el-table-column prop="doneAt" label="检测完成时间" min-width="116" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ row.doneAt || row.done_at || "-" }}</template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" min-width="128" show-overflow-tooltip />
        <el-table-column prop="applicant" label="申请/委托人" width="92" show-overflow-tooltip />
        <el-table-column prop="phone" label="申请人电话" min-width="90" show-overflow-tooltip />
        <el-table-column label="关联联系人" width="84">
          <template #default="{ row }">
            <span :style="{ color: row.client ? 'inherit' : 'var(--el-text-color-secondary)' }">
              {{ row.client || "—" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="委托单编号" min-width="190">
          <template #default="{ row }">
            <template v-if="row.status === 'linked'">
              <el-button class="commission-link" link type="primary" @click="showDetail(row.commNo)">
                <span class="commission-no">{{ row.commNo }}</span>
              </el-button>
              <div v-if="row.commissionSampleName" class="linked-sample">
                {{ row.commissionSampleName }}{{ row.commissionSampleSpec ? ` / ${row.commissionSampleSpec}` : "" }}
              </div>
            </template>
            <span v-else class="badge unlinked">未关联</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="142" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button v-if="row.status === 'unlinked'" link type="primary" @click="openLinkModal($index)">
              关联委托单
            </el-button>
            <el-button v-else link type="primary" @click="openLinkModal($index)">修改</el-button>
            <el-button link type="info" @click="openHoursModal($index)">编辑工时</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 关联委托单弹窗 -->
    <el-dialog v-model="linkModalVisible" :title="linkDialogTitle" width="460px">
      <div class="modal-sub">SN：{{ pendingRow?.sn }} {{ pendingRow?.name }}</div>
      <el-form label-position="top">
        <el-form-item label="选择委托单">
          <el-select
            v-model="linkForm.commNo"
            placeholder="请选择委托单..."
            style="width: 100%"
            filterable
            :loading="orderListLoading"
            @change="handleOrderChange"
          >
            <el-option
              v-for="item in orderList"
              :key="item.commission_no"
              :label="getOrderLabel(item)"
              :value="item.commission_no"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择样品明细">
          <el-tree-select
            v-model="linkForm.sampleId"
            :data="sampleTreeData"
            :props="sampleTreeProps"
            node-key="value"
            check-strictly
            filterable
            :render-after-expand="false"
            placeholder="请选择样品种类/规格型号..."
            style="width: 100%"
            :disabled="!linkForm.commNo || sampleTreeLoading"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="linkModalVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmLink">确认关联</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑工时弹窗 -->
    <el-dialog v-model="hoursModalVisible" title="编辑工时" width="400px">
      <div class="modal-sub">SN：{{ pendingRow?.sn }} {{ pendingRow?.name }}</div>
      <el-form label-position="top">
        <el-form-item label="工时（小时）">
          <el-input-number v-model="hoursForm.val" :min="0" :step="0.5" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="hoursModalVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmHours">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 委托单详情抽屉/弹窗 -->
    <el-drawer v-model="detailVisible" :title="'委托单详情 · ' + detailData?.basic?.['委托单编号']" size="680px">
      <div v-if="detailData" class="detail-content">
        <!-- 基本信息 -->
        <div class="d-section">
          <div class="d-section-title">基本信息</div>
          <el-row :gutter="24" class="d-grid">
            <el-col
              :span="12"
              v-for="key in [
                '委托单编号',
                '委托单位',
                '地址',
                '科研项目预算编号',
                '联系人',
                '电话',
                '邮箱',
                '接收方式',
                '处理方式',
                '输出要求',
                '输出版本',
                '封面标识',
                '印章要求',
                '交付方式',
                '报告用途',
                '备注'
              ]"
              :key="key"
            >
              <div class="d-field">
                <span class="dk">{{ key }}</span>
                <span class="dv" :class="{ empty: !detailData.basic[key] }">{{ detailData.basic[key] || "—" }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 委托信息 -->
        <div class="d-section">
          <div class="d-section-title">委托信息（共 {{ detailData.samples.length }} 项）</div>
          <div v-for="(s, i) in detailData.samples" :key="i" class="sample-card">
            <div class="sample-card-title">样品 {{ i + 1 }}</div>
            <el-row :gutter="24" class="d-grid">
              <el-col :span="12" v-for="key in sampleDetailFields" :key="key">
                <div class="d-field">
                  <span class="dk">{{ key }}</span>
                  <span class="dv" :class="{ empty: !s[key] }">{{ s[key] || "—" }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 服务级别 -->
        <div class="d-section">
          <div class="d-section-title">服务级别</div>
          <div class="d-field">
            <span class="dk">服务级别</span>
            <span class="dv">{{ detailData.service }}</span>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { ElMessage } from "element-plus"
import { request } from "@/utils/service"

const sampleDetailFields = [
  "样品名称",
  "分类",
  "规格型号",
  "数量",
  "生产厂家",
  "项目名称",
  "批次号",
  "SN号",
  "物料号",
  "测试内容"
]

const loading = ref(false)
const exportLoading = ref(false)
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])
const stats = reactive({ total: 0, linked: 0, unlinked: 0 })

const filters = reactive({
  search: "",
  status: ""
})

const normalizeRelationStatus = (row: any): "linked" | "unlinked" => {
  const rawStatus = row?.status
  if (rawStatus === "linked" || rawStatus === 1 || rawStatus === "1" || rawStatus === true || rawStatus === "已关联") {
    return "linked"
  }
  if (
    rawStatus === "unlinked" ||
    rawStatus === 0 ||
    rawStatus === "0" ||
    rawStatus === false ||
    rawStatus === "未关联"
  ) {
    return "unlinked"
  }
  return row?.commNo || row?.commission_no ? "linked" : "unlinked"
}

const filterRowsByStatus = (rows: any[]) => {
  const normalizedRows = (rows || []).map((row) => ({
    ...row,
    status: normalizeRelationStatus(row)
  }))
  if (!filters.status) return normalizedRows
  return normalizedRows.filter((row) => row.status === filters.status)
}

const getRelationRowKey = (row: any) => `${row?.applicationNo || ""}@@${row?.sn || ""}`

const formatHours = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-"
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return Number.isInteger(numeric) ? String(numeric) : String(numeric)
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const selectedKeys = selectedRows.value.map(getRelationRowKey).filter(Boolean).join(",")
    const params = selectedKeys
      ? { keys: selectedKeys }
      : {
          search: filters.search,
          status: filters.status
        }
    const blob = await request<Blob>({
      url: "data/commission-board-relation/export",
      method: "get",
      params,
      responseType: "blob"
    })
    saveBlob(blob, `电路板委托关联汇总_${new Date().toISOString().slice(0, 10)}.pdf`)
  } catch (error) {
    ElMessage.error("导出失败")
  } finally {
    exportLoading.value = false
  }
}

const getAssistantSyncPayload = () => {
  const searchText = filters.search.trim()
  return /^CS[\w-]+$/i.test(searchText) ? { applicationNum: searchText } : {}
}

const syncAssistantCommissionBindings = async () => {
  try {
    await request({
      url: "data/commission-board-relation/sync-assistant",
      method: "post",
      data: getAssistantSyncPayload()
    })
  } catch (error) {
    ElMessage.warning("同步小助手关联失败，已显示本地数据")
  }
}

const getList = async () => {
  loading.value = true
  await syncAssistantCommissionBindings()
  try {
    const res: any = await request({
      url: "data/commission-board-relation/list",
      method: "get",
      params: {
        currentPage: 1,
        pageSize: 1000,
        search: filters.search,
        status: filters.status
      }
    })
    tableData.value = filterRowsByStatus(res.data.list || [])
    selectedRows.value = []
    const s = res.data.stats || {}
    stats.total = s.total || 0
    stats.linked = s.linked || 0
    stats.unlinked = s.unlinked || 0
  } catch (error) {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  getList()
}

const resetFilters = () => {
  filters.search = ""
  filters.status = ""
  getList()
}

// 关联委托单逻辑
const linkModalVisible = ref(false)
const pendingRowIdx = ref<number | null>(null)
const pendingRow = computed(() => (pendingRowIdx.value !== null ? tableData.value[pendingRowIdx.value] : null))
const linkDialogTitle = computed(() => (pendingRow.value?.status === "linked" ? "修改关联委托单" : "关联委托单"))
const linkForm = reactive<{ commNo: string; sampleId: number | null }>({ commNo: "", sampleId: null })
const orderListLoading = ref(false)
const orderList = ref<any[]>([])
const sampleTreeLoading = ref(false)
const sampleTreeData = ref<any[]>([])
const sampleTreeProps = {
  label: "label",
  children: "children",
  disabled: "disabled"
}

const getOrderLabel = (item: any) => {
  const no = item?.commission_no || ""
  const contact = item?.contact_name || ""
  const org = item?.commission_org || ""
  const suffix = org ? `（${org}）` : ""
  return contact ? `${no} — ${contact}${suffix}` : `${no}${suffix}`
}

const getOrderList = () => {
  orderListLoading.value = true
  request({
    url: "data/commission-order/list",
    method: "get",
    params: {
      currentPage: 1,
      pageSize: 1000
    }
  })
    .then((res: any) => {
      orderList.value = res.data.list || []
    })
    .catch(() => {
      orderList.value = []
    })
    .finally(() => {
      orderListLoading.value = false
    })
}

const openLinkModal = (idx: number) => {
  pendingRowIdx.value = idx
  const row = tableData.value[idx]
  linkForm.commNo = row?.commNo || ""
  linkForm.sampleId = row?.commissionSampleId || null
  sampleTreeData.value = []
  getOrderList()
  if (linkForm.commNo) {
    handleOrderChange(linkForm.commNo, linkForm.sampleId)
  }
  linkModalVisible.value = true
}

const getSampleName = (sample: any) => sample.sample_name || sample["样品名称"] || ""
const getSampleSpec = (sample: any) => sample.spec_model || sample["规格型号"] || ""
const getSampleQuantity = (sample: any) => Number(sample.quantity ?? sample["数量"] ?? 0)

const buildSampleTree = (commissionNo: string, samples: any[]) => {
  const sampleGroups = new Map<string, any[]>()
  samples.forEach((sample) => {
    const name = getSampleName(sample) || "未命名样品"
    if (!sampleGroups.has(name)) sampleGroups.set(name, [])
    sampleGroups.get(name)?.push(sample)
  })

  return [
    {
      label: commissionNo,
      value: `order-${commissionNo}`,
      disabled: true,
      children: Array.from(sampleGroups.entries()).map(([name, items]) => {
        if (items.length === 1 && !getSampleSpec(items[0])) {
          const sample = items[0]
          return {
            label: `${name}（数量：${getSampleQuantity(sample)}）`,
            value: Number(sample.id)
          }
        }

        return {
          label: name,
          value: `sample-${name}`,
          disabled: true,
          children: items.map((sample) => ({
            label: `${getSampleSpec(sample) || "无规格型号"}（数量：${getSampleQuantity(sample)}）`,
            value: Number(sample.id)
          }))
        }
      })
    }
  ]
}

const handleOrderChange = (commissionNo: string, selectedSampleId: number | null = null) => {
  linkForm.sampleId = selectedSampleId
  sampleTreeData.value = []
  if (!commissionNo) return

  sampleTreeLoading.value = true
  request({
    url: "data/commission-order/detail",
    method: "get",
    params: { commissionNo }
  })
    .then((res: any) => {
      sampleTreeData.value = buildSampleTree(commissionNo, res.data?.samples || [])
      linkForm.sampleId = selectedSampleId
    })
    .catch(() => {
      ElMessage.error("获取委托单样品明细失败")
    })
    .finally(() => {
      sampleTreeLoading.value = false
    })
}

const confirmLink = () => {
  if (!linkForm.commNo) {
    ElMessage.warning("请选择一个委托单")
    return
  }
  if (!linkForm.sampleId) {
    ElMessage.warning("请选择样品明细")
    return
  }
  if (pendingRowIdx.value !== null) {
    const row = tableData.value[pendingRowIdx.value]
    request({
      url: "data/commission-board-relation/link",
      method: "post",
      data: {
        sn: row.sn,
        commissionNo: linkForm.commNo,
        sampleId: linkForm.sampleId
      }
    })
      .then(() => {
        ElMessage.success(row.status === "linked" ? "修改成功" : "关联成功")
        linkModalVisible.value = false
        getList()
      })
      .catch(() => {
        ElMessage.error("关联失败")
      })
    return
  }
  linkModalVisible.value = false
}

// 编辑工时逻辑
const hoursModalVisible = ref(false)
const hoursForm = reactive({ val: 0 })

const openHoursModal = (idx: number) => {
  pendingRowIdx.value = idx
  hoursForm.val = tableData.value[idx].hours
  hoursModalVisible.value = true
}

const confirmHours = () => {
  if (pendingRowIdx.value !== null) {
    const row = tableData.value[pendingRowIdx.value]
    request({
      url: "data/commission-board-relation/hours",
      method: "post",
      data: {
        sn: row.sn,
        hours: hoursForm.val
      }
    })
      .then(() => {
        ElMessage.success("工时已更新")
        hoursModalVisible.value = false
        getList()
      })
      .catch(() => {
        ElMessage.error("工时更新失败")
      })
    return
  }
  hoursModalVisible.value = false
}

// 详情抽屉逻辑
const detailVisible = ref(false)
const detailData = ref<any>(null)

const showDetail = (commNo: string) => {
  if (!commNo) return
  request({
    url: "data/commission-order/detail",
    method: "get",
    params: { commissionNo: commNo }
  })
    .then((res: any) => {
      detailData.value = res.data
      detailVisible.value = true
    })
    .catch(() => {
      ElMessage.error("获取委托单详情失败")
    })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  .stat-card {
    background: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 16px 20px;

    .s-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .s-val {
      font-size: 24px;
      font-weight: 500;
      color: var(--el-text-color-primary);

      &.warn {
        color: var(--el-color-warning);
      }
      &.ok {
        color: var(--el-color-success);
      }
    }
  }
}

.search-form {
  margin-bottom: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selection-tip {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.summary-table {
  width: 100%;

  :deep(.cell) {
    padding: 0 6px;
    line-height: 1.35;
    word-break: break-word;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.sn-code {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  &.unlinked {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }
}

.linked-sample {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.commission-link {
  height: auto;
  padding: 0;
  white-space: nowrap;
}

.commission-no {
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
  line-height: 1.35;
  text-decoration: underline;
  text-underline-offset: 2px;
  white-space: nowrap;
  word-break: keep-all;
}

.modal-sub {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}

/* 详情抽屉样式 */
.d-section {
  margin-bottom: 24px;

  .d-section-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 16px;
  }
}

.d-grid {
  row-gap: 16px;
}

.d-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .dk {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .dv {
    font-size: 14px;
    color: var(--el-text-color-primary);
    word-break: break-all;

    &.empty {
      color: var(--el-text-color-placeholder);
    }
  }
}

.sample-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-fill-color-light);
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .sample-card-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
  }
}
</style>
