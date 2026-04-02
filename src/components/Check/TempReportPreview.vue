<script setup>
import { Viewer } from "vexip-ui"
import { ref } from "vue"

const props = defineProps(["previewList"])
const picViewer = ref(false)
const viewerUrl = ref("")

const openViewer = (img) => {
  picViewer.value = true
  viewerUrl.value = img
}
const changeLabelType = (item) => {
  if (item.pass === 1 && !("warn" in item)) {
    return "label-success"
  } else if (item.pass === 1 && "warn" in item) {
    return "label-warn"
  } else if (item.pass === 2) {
    return "label-danger"
  } else if (item.pass === 3) {
    return "label-question"
  } else if (item.pass === 4) {
    return "label-danger"
  }
}
</script>

<template>
  <div style="width: 100%">
    <el-scrollbar style="height: calc(100vh - 295px); margin-top: -1px; padding: 5px">
      <div v-if="props.previewList.json.tempTest.length != 0">
        <template v-for="item in props.previewList.json.tempTest">
          <el-descriptions :column="3" :title="'名称:' + item.name" border>
            <el-descriptions-item :class-name="changeLabelType(item)" :span="3" align="left" label="状态" width="120">
              <el-space>
                <el-text v-if="item.pass == 1" type="success">通过</el-text>
                <el-text v-if="item.pass == 2 || item.pass == 4" type="danger">缺陷</el-text>
                <el-text v-if="item.pass == 3 || item.pass == 4" type="info">疑问</el-text>
                <el-text v-if="'warn' in item" type="warning">制程警示</el-text>
              </el-space>
            </el-descriptions-item>
            <el-descriptions-item :span="3" label="描述">
              {{ item.desc == "" ? "无描述" : item.desc }}
            </el-descriptions-item>
            <el-descriptions-item :span="3" label="留存图片">
              <span v-if="item.save.length == 0">无图片</span>
              <div style="display: flex; flex-wrap: wrap">
                <template v-for="(img, index) in item.save">
                  <div style="display: flex; flex-direction: column">
                    <el-image
                      :src="img"
                      fit="contain"
                      style="width: 10vw; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                    <el-text>图片{{ index + 1 }}</el-text>
                  </div>
                </template>
              </div>
            </el-descriptions-item>
            <div v-if="item.error != undefined">
              <el-descriptions-item :span="3" label="缺陷描述">
                {{ item.error.desc }}
              </el-descriptions-item>
              <el-descriptions-item :span="3" label="缺陷图片">
                <div style="display: flex; flex-wrap: wrap">
                  <template v-for="(img, index) in item.error.url">
                    <div style="display: flex; flex-direction: column">
                      <el-image
                        :src="img"
                        fit="contain"
                        style="width: 10vw; margin-right: 5px; cursor: pointer"
                        @click="openViewer(img)"
                      />
                      <el-text>图片{{ index + 1 }}</el-text>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>
            </div>
            <div v-if="item.question != undefined">
              <el-descriptions-item :span="3" label="问题描述">
                {{ item.question.desc }}
              </el-descriptions-item>
              <el-descriptions-item :span="3" label="问题图片">
                <div style="display: flex; flex-wrap: wrap">
                  <template v-for="(img, index) in item.question.url">
                    <div style="display: flex; flex-direction: column">
                      <el-image
                        :src="img"
                        fit="contain"
                        style="width: 10vw; margin-right: 5px; cursor: pointer"
                        @click="openViewer(img)"
                      />
                      <el-text>图片{{ index + 1 }}</el-text>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>
            </div>
            <div v-if="item.warn != undefined">
              <el-descriptions-item :span="3" label="制程警示描述">
                {{ item.warn.desc }}
              </el-descriptions-item>
              <el-descriptions-item :span="3" label="制程警示图片">
                <div style="display: flex; flex-wrap: wrap">
                  <template v-for="(img, index) in item.warn.url">
                    <div style="display: flex; flex-direction: column">
                      <el-image
                        :src="img"
                        fit="contain"
                        style="width: 10vw; margin-right: 5px; cursor: pointer"
                        @click="openViewer(img)"
                      />
                      <el-text>图片{{ index + 1 }}</el-text>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>
            </div>
          </el-descriptions>
          <el-divider />
        </template>
      </div>
      <div v-if="props.previewList.json.plane.leftUrl != ''">
        <el-text>检测项</el-text>
        <el-table
          :data="[
            { title: '正面弓曲度', pass: props.previewList.json.plane['leftPass'] },
            { title: '对面弓曲度', pass: props.previewList.json.plane['rightPass'] }
          ]"
          style="margin-top: 5px"
        >
          <el-table-column label="检测项" prop="title" />
          <el-table-column align="right" label="结果" prop="pass">
            <template #default="scope">
              <el-text :type="scope.row.pass === 3 ? 'warning' : scope.row.pass === 1 ? 'success' : 'danger'"
                >{{ scope.row.pass === 3 ? "疑问" : scope.row.pass === 1 ? "通过" : "不通过" }}
              </el-text>
            </template>
          </el-table-column>
        </el-table>
        <el-table
          v-if="props.previewList.json.plane.noteList != undefined"
          :data="props.previewList.json.plane.noteList"
          border
          stripe
        >
          <el-table-column label="备注">
            <template #default="scope">
              {{ scope.row }}
            </template>
          </el-table-column>
        </el-table>
        <el-text>留存项</el-text>
        <div style="display: flex; justify-content: center; align-items: center">
          <el-image :src="props.previewList.json.plane.leftUrl" fit="contain" style="width: 40%; margin-right: 10px" />
          <el-image :src="props.previewList.json.plane.rightUrl" fit="contain" style="width: 40%" />
        </div>

        <el-text v-if="props.previewList.json.plane.errorList != undefined">缺陷项</el-text>
        <el-table
          v-if="props.previewList.json.plane.errorList != undefined"
          :data="props.previewList.json.plane.errorList"
          border
          stripe
        >
          <el-table-column label="检测项名称" prop="name" width="300" />
          <el-table-column label="缺陷描述">
            <template #default="scope">
              <el-text>{{ scope.row.error.desc }}</el-text>
            </template>
          </el-table-column>
          <el-table-column align="right" label="留存">
            <template #default="scope">
              <el-image
                :src="scope.row.error.url"
                fit="contain"
                style="height: 150px; width: 150px; margin-right: 5px"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="props.previewList.json.twoD != ''">
        <el-text>正面留存</el-text>
        <el-image :src="props.previewList.json.twoD" fit="contain" style="width: 100%" />
        <el-text>背面留存</el-text>
        <el-image :src="props.previewList.json.twoDBak" fit="contain" style="width: 100%" />
      </div>
    </el-scrollbar>
  </div>
  <el-dialog v-model="picViewer" align-center center width="70%">
    <Viewer height="600">
      <img :src="viewerUrl" alt="" />
    </Viewer>
  </el-dialog>
</template>

<style scoped>
.el-collapse {
  --el-collapse-border-color: #d5d4d4;
  --el-collapse-border: 1px solid;
  --el-collapse-header-bg-color: #f3f3f3;
  --el-collapse-bg-color: transparent;
  --el-collapse-content-bg-color: #f5f5ff;
}

:deep(.label-success) {
  background: var(--el-color-success-light-7) !important;
}

:deep(.label-danger) {
  background: var(--el-color-danger-light-7) !important;
}

:deep(.label-warn) {
  background: var(--el-color-warning-light-7) !important;
}

:deep(.label-question) {
  background: var(--el-color-primary-light-7) !important;
}
</style>
