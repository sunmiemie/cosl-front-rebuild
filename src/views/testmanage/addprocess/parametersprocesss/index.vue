<template>
  <el-form :inline="true" :model="formInline" class="demo-form-inline" label-position="top">
    <div style="display: flex; justify-content: space-between; width: 100%">
      <div style="display: flex; align-items: center; width: 90%">
        <span style="margin: 15px; width: 10%; font-size: 15px; font-weight: bold">填写参数</span>
        <el-form-item style="width: 17%" label="参数名称">
          <el-input v-model="formInline.user" />
        </el-form-item>
        <el-form-item style="width: 17%" label="是否必填">
          <el-select v-model="formInline.region">
            <el-option label="是" value="shanghai" />
          </el-select>
        </el-form-item>
        <el-form-item style="width: 17%" label="数据类型">
          <el-select v-model="formInline.region">
            <el-option label="Zone one" value="shanghai" />
          </el-select>
        </el-form-item>
        <el-form-item style="width: 17%" label="单位">
          <el-input v-model="formInline.user" />
        </el-form-item>
        <el-form-item style="width: 17%" label="需要记录">
          <el-input v-model="formInline.user" />
        </el-form-item>
      </div>
      <div style="display: flex; align-items: center; justify-content: flex-end">
        <el-form-item>
          <el-button icon="delete" circle type="danger" @click="$emit('removePara')" />
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

.tableParams {
  width: 90%;
  margin-left: 20px;
}

.single-row {
  height: 100%;
  vertical-align: middle;
}

.double-row {
  height: 50%;
}

.double-row:nth-child(even) {
  border-top: 0;
}

.info {
  font-size: 8px;
  margin-right: 10px;
  line-height: 10vh;
  text-align: center;
}

.backinfo {
  width: 2vw;
  height: 5vh;
  line-height: 5vh;
  margin-left: 1vw;
}

:deep .el-form--inline .el-form-item {
  margin-right: 0.6vw;
}

.demo-form-inline {
  padding: 10px;
  border: 1.5px solid #ccc;
  border-radius: 10px;
  display: flex;
  font-size: 10px;
  margin: 5px;
}

.info {
  width: 5vw;
  height: 8vh;
  line-height: 8vh;
  text-align: center;
}

.allSelectInputSize {
  width: 4.9vw;
}

:deep .el-form--inline .el-form-item {
  margin-right: 1vw;
}
</style>
