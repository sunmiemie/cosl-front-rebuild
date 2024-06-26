<script setup lang="ts">
import { nextTick, ref } from "vue"
import { vDraggable } from "vue-draggable-plus"
defineProps({
  bannerList: {
    type: Array,
    required: true
  },
  preview: {
    type: String
  }
})
const emit = defineEmits(["onUpdate", "deletePic"])
const dialogVisible = ref<any>(false)
const dialogImageUrl = ref<any>("")
const drag = ref<any>(false)
// 预览
const handlePictureCardPreviewFileDetail = (file: any) => {
  dialogImageUrl.value = file
  dialogVisible.value = true
}
function onStart() {
  drag.value = true
}
function onEnd() {
  emit("onUpdate")
  nextTick(() => {
    drag.value = false
  })
}
</script>
<template>
  <div class="upload">
    <div class="el-upload-list el-upload-list&#45;&#45;picture-card">
      <TransitionGroup
        :name="!drag ? 'fade' : null"
        tag="ul"
        type="transition"
        v-draggable="[bannerList, { animation: 150, onStart, onEnd }]"
        class="el-upload-list el-upload-list--picture-card"
      >
        <li v-for="item in bannerList" :key="item" class="el-upload-list__item is-success animated">
          <img :src="item.url" alt="" class="el-upload-list__item-thumbnail" />
          <label class="el-upload-list__item-status-label">
            <i class="el-icon el-icon--upload-success el-icon--check">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path
                  fill="currentColor"
                  d="M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z"
                /></svg></i
          ></label>
          <i class="el-icon-close" />
          <span class="el-upload-list__item-actions">
            <!-- 预览 -->
            <span class="el-upload-list__item-preview" @click="handlePictureCardPreviewFileDetail(item.url)">
              <i class="el-icon el-icon--zoom-in">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704zm-32-384v-96a32 32 0 0 1 64 0v96h96a32 32 0 0 1 0 64h-96v96a32 32 0 0 1-64 0v-96h-96a32 32 0 0 1 0-64h96z"
                  />
                </svg>
              </i>
            </span>
            <!-- 删除 -->
            <span class="el-upload-list__item-delete" @click="$emit('deletePic', item)">
              <i class="el-icon el-icon--zoom-in">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                  />
                </svg>
              </i>
            </span>
          </span>
        </li>
        <el-upload key="upload" :show-file-list="false" list-type="picture-card" :auto-upload="false" disabled>
          <template #trigger>
            <el-button style="width: 100%; height: 100%; padding: 0; border: 2.5px solid #df5000">
              <el-image draggable="false" :src="preview" style="width: 100%; height: 100%">
                <template #error>
                  <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%">
                    <el-text>等待中···</el-text>
                  </div>
                </template>
              </el-image>
            </el-button>
          </template>
        </el-upload>
      </TransitionGroup>
    </div>
  </div>
  <!-- 预览图 -->
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<style lang="scss" scoped>
.unDrag {
  display: flex;
  justify-content: end;
}
.upload {
  display: flex;
  justify-content: flex-start;
}
</style>
