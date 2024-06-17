<script setup lang="ts">
import { computed, ref } from "vue"
import stepComponent from "../stepComponent/index.vue"
import picComponent from "../picComponent/index.vue"
import { ElScrollbar } from "element-plus"

const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const innerPicRef = ref<HTMLDivElement>()
const picScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const stepDialogVisible = ref(false)
const picDialogVisible = ref(false)
const props = defineProps(["name", "url", "step", "pic"])
const emit = defineEmits([
  "update:name",
  "update:url",
  "update:step",
  "update:pic",
  "remove:detailComponent",
  "remove:stepComponent",
  "remove:picComponent",
  "click:addStep",
  "click:addPic",
  "click:uploadPic",
  "click:editPic",
  "click:upload",
  "click:edit"
])
const localName = computed({
  get: () => props.name,
  set: (value) => {
    emit("update:name", value)
  }
})
const localStep = computed({
  get() {
    return props.step
  },
  set(value) {
    emit("update:step", value)
  }
})
const localPic = computed({
  get() {
    return props.pic
  },
  set(value) {
    emit("update:pic", value)
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
        <el-text size="large" style="font-weight: bold"> 具体点位 {{ localName }} </el-text>
        <el-button type="danger" icon="delete" @click="emit('remove:detailComponent')" />
      </div>
      <div class="demo-image__error" style="display: flex; justify-content: start">
        <div class="block">
          <div>
            <div style="margin-top: 5px">
              <el-image fit="contain" :src="localUrl">
                <template #error>
                  <div class="image-slot">
                    <el-text size="large">点击编辑图片</el-text>
                  </div>
                </template>
              </el-image>
              <el-button-group style="margin-top: 10px">
                <el-button @click="emit('click:upload')" type="primary">上传图片</el-button>
                <el-button @click="emit('click:edit')" type="primary">原图编辑</el-button>
              </el-button-group>
            </div>
          </div>
        </div>
        <div style="width: 80%">
          <el-form label-width="100" :inline="true" style="margin-top: 10px">
            <el-form-item label="点位名称:" style="width: 100%">
              <el-input v-model="localName" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="检测项设置:" style="width: 100%">
              <el-button @click="stepDialogVisible = true" type="primary" icon="edit">编辑</el-button>
            </el-form-item>
            <el-form-item label="拍照留存设置:" style="width: 100%">
              <el-button @click="picDialogVisible = true" type="primary" icon="edit">编辑</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
    <el-dialog :title="'编辑检测项: 点位' + localName" v-model="stepDialogVisible">
      <div>
        <el-button type="primary" icon="plus" @click="emit('click:addStep')">新增检测项</el-button>
      </div>
      <div style="margin-top: 20px; height: 400px">
        <el-scrollbar ref="scrollbarRef" max-height="400px">
          <div ref="innerRef">
            <template v-for="component in localStep" :key="component">
              <step-component
                max-height="300px"
                v-model:name="component.name"
                v-model:desc="component.desc"
                @remove:step-component="emit('remove:stepComponent', component.id)"
              />
            </template>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>
    <el-dialog width="60%" :title="'编辑留存项: 点位' + localName" v-model="picDialogVisible">
      <div>
        <el-button type="primary" icon="plus" @click="emit('click:addPic')">新增检测项</el-button>
      </div>
      <div style="margin-top: 20px; height: 400px">
        <el-scrollbar ref="picScrollbarRef" max-height="400px">
          <div ref="innerPicRef">
            <template v-for="component in localPic" :key="component">
              <pic-component
                v-model:name="component.name"
                v-model:desc="component.desc"
                v-model:url="component.url"
                @remove:pic-component="emit('remove:picComponent', component.id)"
                @click:upload="emit('click:uploadPic', component.id)"
                @click:edit="emit('click:editPic', component.id)"
              />
            </template>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>
  </div>
</template>
<style>
.demo-image__error .block {
  padding: 10px 0;
  text-align: center;
  width: 20%;
}
.demo-image__error .el-image {
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
