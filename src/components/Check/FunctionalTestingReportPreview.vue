<!-- 功能性测试报告预览 -->

<script setup>
import CommpontentEcharts from "@/components/Echarts/echarts.vue"

const props = defineProps(["previewList"])

const generateXAxis = (length) => {
  return Array.from({ length }, (_, i) => i + 1) // 生成 1, 2, 3, ..., length 的数组
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
</script>

<template>
  <div style="width: 100%">
    <el-scrollbar style="height: calc(100vh - 295px); margin-top: -1px; padding: 5px">
      <el-collapse v-for="(value, key) in props.previewList.data">
        <el-collapse-item>
          <template #title>
            <el-tag style="margin-left: 10px" :type="computeTag(value.result).type">{{
              computeTag(value.result).text
            }}</el-tag>
            <el-text style="margin-left: 10px; font-size: 20px">{{ key }}</el-text>
          </template>
          <el-descriptions :column="3" border>
            <template v-for="item in value.line">
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
      </el-collapse>
    </el-scrollbar>
  </div>
</template>
