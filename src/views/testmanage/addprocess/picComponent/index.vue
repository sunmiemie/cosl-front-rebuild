<script setup lang="ts">
import { computed } from "vue"
const props = defineProps(["name", "desc", "url"])
const emit = defineEmits([
  "update:name",
  "update:desc",
  "update:url",
  "remove:picComponent",
  "click:upload",
  "click:edit"
])
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
const localUrl = computed({
  get() {
    return props.url
  },
  set(value) {
    emit("update:url", value)
  }
})
</script>

<template>
  <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 5px">
    <el-card style="width: 100%">
      <div style="display: flex; justify-content: space-between; width: 100%">
        <el-text size="large" style="font-weight: bold"> 留存项 {{ localName }} </el-text>
        <el-button type="danger" icon="delete" @click="emit('remove:picComponent')" />
      </div>
      <div class="demo-image__error" style="display: flex; justify-content: start">
        <div class="block">
          <div>
            <div>
              <el-image fit="contain" :src="localUrl">
                <template #error>
                  <div class="image-slot">
                    <el-text size="large">请上传图片</el-text>
                  </div>
                </template>
              </el-image>
            </div>
            <div style="margin-top: 5px">
              <el-button-group>
                <el-button @click="emit('click:upload')" type="primary">上传图片</el-button>
                <el-button @click="emit('click:edit')" type="primary">原图编辑</el-button>
              </el-button-group>
            </div>
          </div>
        </div>
        <div style="width: 80%">
          <el-form label-width="100px" :inline="true" style="margin-top: 10px">
            <el-form-item label="留存项名称:" style="width: 100%">
              <el-input v-model="localName" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="留存操作描述:" style="width: 100%">
              <el-input type="textarea" v-model="localDesc" placeholder="请输入描述" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>
<style>
.demo-image__error .block {
  padding: 30px 0;
  text-align: center;
  width: 20%;
}
.demo-image__error .el-image {
  padding: 0 5px;
  max-width: 200px;
  max-height: 200px;
  width: 100%;
  height: 200px;
}

.demo-image__error .image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}
</style>
