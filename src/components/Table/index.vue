<script>
import { getCurrentInstance, ref, toRefs } from "vue"
//checkbox点击事件
const instance = getCurrentInstance()
const multipleSelection = ref([])
const checkNumber = ref(null)
//取消勾选事件
const toggleSelection = () => {
  const ultipleTabInstance = toRefs(instance.refs.table)
  ultipleTabInstance.clearSelection.value()
}
//勾选checkbox事件
const handleSelectionChange = (val) => {
  console.log("val", val)
  multipleSelection.value = val
  checkNumber.value = multipleSelection.value.length
}

export default {
  name: "TableComponent",
  methods: { handleSelectionChange, toggleSelection },
  props: {
    columnData: {
      type: Array,
      required: true
    },
    tableData: {
      type: Array,
      required: true
    },
    selection: Boolean,
    border: Boolean,
    stripe: Boolean
  }
}
</script>

<template>
  <el-table ref="table" :data="tableData" :border="border" :stripe="stripe" :row-key="(row) => {
    return row.id
  }
    " @selection-change="handleSelectionChange">
    <!-- columnData属性列 -->
    <el-table-column v-if="selection" type="selection" width="30" align="center" :fixed="'left'" />
    <template v-for="item in columnData" :key="item.id">
      <el-table-column v-if="item.type === 'link'" :label="item.label" :prop="item.prop" :width="item.width"
        :align="item.align" :fixed="'right'" :sortable="item.sort" :formatter="item.formatter">
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column v-else-if="item.type === 'tag'" :label="item.label" :prop="item.prop" :width="item.width"
        :align="item.align" :fixed="item.fixed" :sortable="item.sort" :filters="item.filters"
        :formatter="item.formatter">

        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column v-else-if="item.type === 'btn'" :label="item.label" :prop="item.prop" :width="item.width"
        :align="item.align" :fixed="item.fixed" :sortable="item.sort" :filters="item.filters"
        :formatter="item.formatter">

        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column v-else-if="item.type === 'progress'" :label="item.label" :prop="item.prop" :width="item.width"
        :align="item.align" :fixed="item.fixed" :sortable="item.sort" :filters="item.filters"
        :formatter="item.formatter">
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column v-else-if="item.type === 'select'" :label="item.label" :prop="item.prop" :width="item.width"
        :align="item.align" :fixed="item.fixed" :sortable="item.sort" :filters="item.filters"
        :formatter="item.formatter">
        <template #default="scope">
          <slot :name="item.prop" v-bind="scope" />
        </template>
      </el-table-column>
      <el-table-column v-else :label="item.label" :prop="item.prop" :width="item.width" :align="item.align"
        :fixed="item.fixed" :sortable="item.sort" :formatter="item.formatter" />
    </template>
  </el-table>
</template>

<style scoped></style>
