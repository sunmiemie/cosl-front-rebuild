<script>
import { defineComponent } from "vue"

export default defineComponent({
  name: "TableComponent",
  props: {
    columnData: {
      type: Array,
      required: true
    },
    tableData: {
      type: Array,
      required: true
    },
    refValue: String,
    selection: Boolean,
    border: Boolean,
    stripe: Boolean,
    rowKey: {
      type: [String, Function],
      default: () => (row) => row.id ?? row.date ?? row.index
    }
  },
  emits: ["selection-change", "current-change"],
  data() {
    return {
      multipleSelection: [],
      checkNumber: 0
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.checkNumber = val.length
      this.$emit("selection-change", val)
    },
    handleCurrentChange(val) {
      this.$emit("current-change", val)
    },
    toggleSelection() {
      if (this.$refs.table) {
        this.$refs.table.clearSelection()
      }
    },
    clearSelection() {
      if (this.$refs.table) {
        this.$refs.table.clearSelection()
      }
    },
    getColumnMinWidth(item, fallback) {
      if (item.minWidth) return item.minWidth
      if (item.width) return undefined
      return fallback
    }
  }
})
</script>

<template>
  <el-table
    ref="table"
    :data="tableData"
    :border="border"
    :stripe="stripe"
    :row-key="rowKey"
    v-bind="$attrs"
    @selection-change="handleSelectionChange"
    @current-change="handleCurrentChange"
  >
    <!-- columnData属性列 -->
    <el-table-column v-if="selection" type="selection" width="30" align="center" :fixed="'left'" />
    <template v-for="item in columnData" :key="item.prop || item.label">
      <el-table-column
        v-if="item.type === 'link'"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :min-width="getColumnMinWidth(item, 220)"
        :align="item.align"
        :fixed="item.fixed === false ? false : 'right'"
        class-name="table-operation-column"
        label-class-name="table-operation-column"
        :sortable="item.sort"
        :formatter="item.formatter"
        :show-overflow-tooltip="item.showOverflowTooltip !== false"
      >
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column
        v-else-if="item.type === 'tag'"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :min-width="getColumnMinWidth(item, 110)"
        :align="item.align"
        :fixed="item.fixed"
        :sortable="item.sort"
        :filters="item.filters"
        :formatter="item.formatter"
        :show-overflow-tooltip="item.showOverflowTooltip !== false"
      >
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column
        v-else-if="item.type === 'btn'"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :min-width="getColumnMinWidth(item, 160)"
        :align="item.align"
        :fixed="item.fixed"
        :sortable="item.sort"
        :filters="item.filters"
        :formatter="item.formatter"
        :show-overflow-tooltip="item.showOverflowTooltip !== false"
      >
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column
        v-else-if="item.type === 'progress'"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :min-width="getColumnMinWidth(item, 140)"
        :align="item.align"
        :fixed="item.fixed"
        :sortable="item.sort"
        :filters="item.filters"
        :formatter="item.formatter"
        :show-overflow-tooltip="item.showOverflowTooltip !== false"
      >
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column
        v-else-if="item.type === 'select'"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :min-width="getColumnMinWidth(item, 140)"
        :align="item.align"
        :fixed="item.fixed"
        :sortable="item.sort"
        :filters="item.filters"
        :formatter="item.formatter"
        :show-overflow-tooltip="item.showOverflowTooltip !== false"
      >
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column
        v-else
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :min-width="getColumnMinWidth(item, 140)"
        :align="item.align"
        :fixed="item.fixed"
        :sortable="item.sort"
        :formatter="item.formatter"
        :show-overflow-tooltip="item.showOverflowTooltip !== false"
      />
    </template>
  </el-table>
</template>

<style scoped>
:deep(.el-table .cell) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

:deep(.table-operation-column .cell),
:deep(.table-operation-column .operation-links) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap !important;
  gap: 8px;
  white-space: nowrap;
}
</style>
