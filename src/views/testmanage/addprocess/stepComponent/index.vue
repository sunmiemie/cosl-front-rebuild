<script setup lang="ts">
import { computed } from "vue"
const props = defineProps(["name", "desc"])
const emit = defineEmits(["update:name", "update:desc", "remove:stepComponent"])
const localName = computed({
  get: () => props.name,
  set: (value) => {
    emit("update:name", value)
  }
})
const localDesc = computed({
  get() {
    return props.desc
  },
  set(value) {
    emit("update:desc", value)
  }
})
</script>

<template>
  <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 5px">
    <el-card style="width: 100%">
      <div style="display: flex; justify-content: space-between; width: 100%">
        <el-text size="large" style="font-weight: bold"> 检测项 {{ localName }} </el-text>
        <el-button type="danger" icon="delete" @click="emit('remove:stepComponent')" />
      </div>
      <el-form label-width="100px" :inline="true" style="margin-top: 10px">
        <el-form-item label="检测项名称:" style="width: 100%">
          <el-input v-model="localName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="检测操作描述:" style="width: 100%">
          <el-input type="textarea" v-model="localDesc" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
