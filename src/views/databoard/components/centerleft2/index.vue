<template>
  <div class="centreLeft1">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <span>
          <i class="iconfont icon-layer-group" />
        </span>
        <div class="d-flex">
          <span class="fs-xl text mx-2">设备型号分布</span>
          <dv-decoration-1 class="dv-dec-1" />
        </div>
      </div>
      <div class="d-flex jc-center">
        <MyEcharts :option="this.options" :width="'90%'" :height="'370px'"></MyEcharts>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Chart from "./chart/index"
import MyEcharts from '@/components/Echarts/echarts.vue'
import { getTylemodelNumber } from '@/api/screen/index'
export default defineComponent({
  data() {
    return {
      options: {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center',
          textStyle: {
            color: 'write'
          }
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 484, name: '电路板型号' },
              { value: 1048, name: '夹具型号' },
              { value: 735, name: '主机型号' },
              { value: 580, name: '其他设备型号' },
            ]
          }
        ]

      }
    }
  },
  methods: {
    getData() {
      getTylemodelNumber().then((res) => {
        this.options.series[0].data = res.data
      })
    }
  }
  ,
  components: {
    Chart,
    MyEcharts
  },
  mounted() {
    this.getData()
  },
})
</script>

<style lang="scss" scoped>
.centreLeft1 {
  $box-width: 300px;
  $box-height: 410px;
  padding: 16px;
  height: $box-height;
  min-width: $box-width;
  border-radius: 5px;

  .bg-color-black {
    height: $box-height - 30px;
    border-radius: 10px;
  }

  .text {
    color: #c3cbde;
  }

  .dv-dec-1 {
    position: relative;
    width: 100px;
    height: 20px;
    top: -3px;
  }

  .chart-box {
    margin-top: 16px;
    width: 170px;
    height: 170px;

    .active-ring-name {
      padding-top: 10px;
    }
  }
}
</style>
