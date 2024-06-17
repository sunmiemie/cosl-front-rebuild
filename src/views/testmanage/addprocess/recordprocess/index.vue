<template>
  <el-form :inline="true" :model="formInline" class="demo-form-inline" label-position="top">
    <div style="display: flex; justify-content: space-between; width: 100%">
      <div style="display: flex; align-items: center; width: 80%">
        <span style="margin: 15px; width: 15%; font-size: 15px; font-weight: bold">拍照记录</span>
        <el-form-item label="拍照描述" style="width: 85%">
          <el-input v-model="formInline.user" />
        </el-form-item>
      </div>
      <div style="display: flex; align-items: center; justify-content: flex-end">
        <el-form-item>
          <el-button icon="Delete" circle type="danger" @click="$emit('removeRecord')" />
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>
<script setup lang="ts">
import { reactive } from "vue"

const formInline = reactive({
  user: "",
  region: "",
  date: ""
})
</script>
<style scoped lang="scss">
* {
  padding: 0;
  margin: 0;
}

.demo-form-inline {
  padding: 10px;
  border: 1.5px solid #ccc;
  border-radius: 10px;
  display: flex;
  font-size: 10px;
  margin: 5px;
}
</style>
