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
let resizeObserver: ResizeObserver | null = null

const initChart = () => {
  if (myChart) {
    myChart.dispose()
  }
  if (RefEchart.value) {
    myChart = echarts.init(RefEchart.value)
    myChart.on("datazoom", (params) => emit("datazoom", params))
    myChart.setOption(prop.option, true)
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resizeChart)
      resizeObserver.observe(RefEchart.value)
    }
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

// 监听整个 option 的替换和内部修改，复用实例以保留图表交互状态。
watch(
  () => prop.option,
  (option) => myChart?.setOption(option, true),
  { deep: true }
)

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (myChart) {
    myChart.dispose() // 组件卸载时清理图表
    window.removeEventListener("resize", resizeChart) // 移除窗口大小变化监听
  }
})

defineExpose({ dispatchAction })
</script>

<template>
  <div
    ref="RefEchart"
    :style="{
      width: typeof prop.width === 'number' ? `${prop.width}px` : prop.width,
      height: typeof prop.height === 'number' ? `${prop.height}px` : prop.height
    }"
  />
</template>
