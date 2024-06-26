<script setup>
const props = defineProps(["previewList", "hasPlane"])
</script>

<template>
  <el-scrollbar style="height: calc(100vh - 200px)">
    <div>
      <el-collapse>
        <el-collapse-item name="0" v-if="props.hasPlane">
          <template #title>
            <el-text style="margin-left: 10px" size="large">躬曲度检测</el-text>
          </template>
          <div style="border: #cbccd0 1px solid; border-radius: 6px">
            <el-text>{{ props.previewList.plane.size }}mm</el-text>
          </div>
        </el-collapse-item>
        <el-collapse-item name="1">
          <template #title>
            <el-text style="margin-left: 10px" size="large">整体检测</el-text>
          </template>
          <div style="border: #cbccd0 1px solid; border-radius: 6px">
            <el-image
              style="display: flex; justify-content: center; height: 200px; margin-top: 5px"
              :src="props.previewList.total.url"
              fit="contain"
            />
            <el-table :data="props.previewList.total.step" stripe border>
              <el-table-column prop="name" label="检测项名称" width="150" />
              <el-table-column prop="desc" label="检测项描述" />
            </el-table>
            <el-table :data="props.previewList.total.pic" stripe border>
              <el-table-column prop="url" label="留存指导" width="200">
                <template #default="scope">
                  <el-image :src="scope.row.url" />
                </template>
              </el-table-column>
              <el-table-column prop="name" label="留存项名称" width="150" />
              <el-table-column prop="desc" label="留存项描述" />
            </el-table>
          </div>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template #title>
            <el-text style="margin-left: 10px" size="large">分区检测</el-text>
          </template>
          <el-collapse style="margin-bottom: -20px">
            <el-collapse-item v-for="item in props.previewList.area" :key="item.id">
              <template #title>
                <el-text style="margin-left: 20px" size="large">区域{{ item.id }}</el-text>
              </template>
              <el-collapse style="margin-bottom: -30px">
                <el-collapse-item name="1">
                  <template #title>
                    <el-text style="margin-left: 30px" size="large">通用检测</el-text>
                  </template>
                  <div style="border: #cbccd0 1px solid; border-radius: 6px">
                    <el-image
                      style="display: flex; justify-content: center; height: 200px; margin-top: 5px"
                      :src="item.url"
                      fit="contain"
                    />
                    <el-table :data="item.general.step" stripe border>
                      <el-table-column prop="name" label="检测项名称" width="150" />
                      <el-table-column prop="desc" label="检测项描述" />
                    </el-table>
                    <el-table :data="item.general.pic" stripe border>
                      <el-table-column prop="url" label="留存指导" width="200">
                        <template #default="scope">
                          <el-image :src="scope.row.url" />
                        </template>
                      </el-table-column>
                      <el-table-column prop="name" label="留存项名称" width="150" />
                      <el-table-column prop="desc" label="留存项描述" />
                    </el-table>
                  </div>
                </el-collapse-item>
                <el-collapse-item name="2">
                  <template #title>
                    <el-text style="margin-left: 30px" size="large">具体检测</el-text>
                  </template>
                  <el-collapse style="margin-bottom: -30px">
                    <el-collapse-item v-for="item in item.detail" :key="item.id">
                      <template #title>
                        <el-text style="margin-left: 40px" size="large">具体点位:{{ item.name }}</el-text>
                      </template>
                      <div style="border: #cbccd0 1px solid; border-radius: 6px">
                        <el-image
                          style="display: flex; justify-content: center; height: 200px; margin-top: 5px"
                          :src="item.url"
                          fit="contain"
                        />
                        <el-table :data="item.step" stripe border>
                          <el-table-column prop="name" label="检测项名称" width="150" />
                          <el-table-column prop="desc" label="检测项描述" />
                        </el-table>
                        <el-table :data="item.pic" stripe border>
                          <el-table-column prop="url" label="留存指导" width="200">
                            <template #default="scope">
                              <el-image :src="scope.row.url" />
                            </template>
                          </el-table-column>
                          <el-table-column prop="name" label="留存项名称" width="150" />
                          <el-table-column prop="desc" label="留存项描述" />
                        </el-table>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </el-collapse-item>
              </el-collapse>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-scrollbar>
</template>

<style scoped>
.el-collapse {
  --el-collapse-border-color: transparent;
  --el-collapse-border: none;
  --el-collapse-header-bg-color: #f5f6f8;
  --el-collapse-bg-color: transparent;
  --el-collapse-content-bg-color: #fbfbfc;
}
</style>
