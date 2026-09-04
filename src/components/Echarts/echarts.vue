<script setup lang="ts">
import * as echarts from "echarts"
import { onMounted, onUnmounted, ref, watch, withDefaults } from "vue"

type EChartsOption = echarts.EChartsOption
type EChartsActionPayload = Parameters<echarts.ECharts["dispatchAction"]>[0]

interface Prop {
  width?: number | string
  height?: number | string
  option: EChartsOption
}

const prop = withDefaults(defineProps<Prop>(), {
  width: "100%",
  height: "100%",
  option: () => ({})
})
const emit = defineEmits<{
  datazoom: [params: unknown]
}>()

const RefEchart = ref<HTMLDivElement | null>(null)
let myChart: echarts.ECharts | null = null

const initChart = () => {
  if (myChart) {
    myChart.dispose()
  }
  if (RefEchart.value) {
    myChart = echarts.init(RefEchart.value)
    myChart.on("datazoom", (params) => emit("datazoom", params))
    myChart.setOption(prop.option, true)
    window.addEventListener("resize", resizeChart) // 添加窗口大小变化监听
  }
}

const dispatchAction = (payload: EChartsActionPayload) => {
  myChart?.dispatchAction(payload)
}

const resizeChart = () => {
  if (myChart) {
    myChart.resize() // 更新图表大小
  }
}

onMounted(initChart)

watch(prop.option, initChart, {
  deep: true
})

onUnmounted(() => {
  if (myChart) {
    myChart.dispose() // 组件卸载时清理图表
    window.removeEventListener("resize", resizeChart) // 移除窗口大小变化监听
  }
})

defineExpose({ dispatchAction })
</script>

<template>
  <div ref="RefEchart" :style="{ width: `${prop.width}`, height: `${prop.height}` }" />
</template>
