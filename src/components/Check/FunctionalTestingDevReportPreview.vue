<!-- 功能性测试临时报告预览 -->

<template>
  <div style="width: 100%">
    <el-scrollbar style="height: calc(100vh - 295px); margin-top: -1px; padding: 5px">
      <el-collapse v-for="(value, key) in props.previewList">
        <el-collapse-item>
          <template #title>
            <el-text style="margin-left: 10px">工艺版本</el-text>
            <el-tag style="margin-left: 5px">{{ key }}</el-tag>
          </template>
          <el-collapse-item v-for="(value2, key2) in value">
            <template #title>
              <el-text style="margin-left: 20px">测试</el-text>
              <el-tag style="margin-left: 5px">{{ key2 }}</el-tag>
            </template>
            <el-descriptions style="margin-left: 20px" :column="3" border>
              <el-descriptions-item :span="3" label="用时" width="120">
                {{ msToMinutesSeconds(value2.time) }}
              </el-descriptions-item>
            </el-descriptions>
            <el-collapse-item style="margin-left: 10px" v-for="(value3, key3) in value2.data">
              <template #title>
                <el-tag style="margin-left: 10px" :type="computeTag(value3.result).type">{{
                  computeTag(value3.result).text
                }}</el-tag>
                <el-text style="margin-left: 10px; font-size: 20px">{{ key3 }}</el-text>
              </template>
              <el-descriptions :column="3" border>
                <template v-for="item in value3.line">
                  <template v-if="item.type === 'table'">
                    <el-descriptions-item v-for="(name, index) in item.name" :span="3" :label="name" width="120">
                      {{ item.value[index] }}
                    </el-descriptions-item>
                  </template>
                  <template v-else>
                    <el-descriptions-item :span="3">
                      {{ item.name }}
                    </el-descriptions-item>
                    <el-descriptions-item :span="3">
                      <CommpontentEcharts
                        :width="'80vw'"
                        :height="'500px'"
                        :option="{
                          tooltip: { trigger: 'axis' },
                          xAxis: {
                            type: 'category',
                            data: generateXAxis(item.value.length) // X轴数据
                          },
                          yAxis: { type: 'value' },
                          series: [
                            {
                              data: item.value, // Y轴数据
                              type: item.model,
                              smooth: true,
                              lineStyle: {
                                color: '#5470C6',
                                width: 2
                              },
                              areaStyle: {
                                color: 'rgba(84, 112, 198, 0.2)'
                              }
                            }
                          ]
                        }"
                      />
                    </el-descriptions-item>
                  </template>
                </template>
              </el-descriptions>
            </el-collapse-item>
          </el-collapse-item>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>

<script setup>
import CommpontentEcharts from "@/components/Echarts/echarts.vue"

const props = defineProps(["previewList"])

const msToMinutesSeconds = (ms) => {
  const minutes = Math.floor(ms / 1000 / 60)
  const seconds = (ms % (60 * 1000)) / 1000
  return `${minutes} 分钟 ${seconds} 秒`
}

const computeTag = (status) => {
  if (status === "PASS") {
    return {
      type: "success",
      text: "通过"
    }
  }
  return {
    type: "danger",
    text: "不通过"
  }
}

const generateXAxis = (length) => {
  return Array.from({ length }, (_, i) => i + 1) // 生成 1, 2, 3, ..., length 的数组
}
</script>
