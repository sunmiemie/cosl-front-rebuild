<template>
  <div class="centerRight1">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <span>
          <i class="iconfont icon-align-left" />
        </span>
        <span class="fs-xl text mx-2">测试进度监控</span>
      </div>
      <div class="d-flex ai-center flex-column body-box">
        <dv-capsule-chart class="dv-cap-chart" :config="config" />
        <!-- <chart /> -->
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive } from "vue"
import Chart from "./chart/index.tsx"
import { testprogress } from '@/api/screen/index'
export default defineComponent({
  components: {
    Chart
  },
  setup() {
    const config = reactive({
      data: [
        {
          name: "HSVP",
          value: 67
        },
        {
          name: "A型号电路板",
          value: 12
        },
        {
          name: "B型号电路板",
          value: 100
        },
        {
          name: "C型号电路板",
          value: 100
        }
      ],
      colors: ['#e062ae', '#fb7293', '#e690d1', '#32c5e9', '#96bfff'],

    })
    const getData = () => {
      testprogress().then((res) => {
        config.data = res.data
      })
    }
    getData()
    return { config }
  }
})
</script>

<style lang="scss" scoped>
$box-height: 400px;
$box-width: 340px;

.centerRight1 {
  padding: 9px;
  height: $box-height;
  width: $box-width;
  border-radius: 5px;

  .bg-color-black {
    padding: 5px;
    height: $box-height;
    width: $box-width;
    border-radius: 10px;
  }

  .text {
    color: #c3cbde;
  }

  .body-box {
    border-radius: 10px;
    overflow: hidden;

    .dv-cap-chart {
      width: 100%;
      height: auto;
    }
  }
}
</style>
