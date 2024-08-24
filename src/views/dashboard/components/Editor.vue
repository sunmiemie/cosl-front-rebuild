<script setup lang="ts">
import TableComponent from '@/components/Table/index.vue';
import { reactive, ref } from 'vue';
import CommpontentEcharts from '@/components/Echarts/echarts.vue'

const headers = ref([
  { prop: "equipment", label: "设备", align: "center" },
  { prop: "testunit_name", label: "测试名称", align: "center" },
  { prop: "user_name", label: "创建人", align: "center" },
  { prop: "progress", label: "测试状态", type: "progress", align: "center" }
])

const tableData = [
  {
    equipment: "2016-05-03",
    info: "Tom",
    display: "No. 189,",
    progress: 70,
    steps: "1/20"
  },
  {
    date: "2016-05-02",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    progress: 20
  }
]
let option = reactive({
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: "line"
    }
  ]
})
let option1 = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Direct',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      data: [320, 332, 301, 334, 390, 330, 320]
    },
    {
      name: 'Email',
      type: 'bar',
      stack: 'Ad',
      emphasis: {
        focus: 'series'
      },
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'Union Ads',
      type: 'bar',
      stack: 'Ad',
      emphasis: {
        focus: 'series'
      },
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: 'Video Ads',
      type: 'bar',
      stack: 'Ad',
      emphasis: {
        focus: 'series'
      },
      data: [150, 232, 201, 154, 190, 330, 410]
    }
  ]
})
</script>

<template>
  <div class="app-container">
    <el-row :gutter="15" class="box4" >
      <el-col :span="6">
        <div class="top-box">
          <el-text type="info" size="default" class="top-text">今日新增设备</el-text>
          <div class="text-info">
            <i class="devce-icon"> <img src="@/assets/iconimg/shebei.svg">
              <span class="device-num">546,2</span>
            </i>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="top-box">
          <el-text type="info" size="default" class="top-text">故障设备</el-text>
          <div class="text-info">
            <i class="devce-icon"> <img src="@/assets/iconimg/zhidongxiguzhang.svg">
              <span class="device-num">546,2</span>
            </i>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="top-box">
          <el-text type="info" size="default" class="top-text">测试工单数量</el-text>
          <div class="text-info">
            <i class="devce-icon"> <img src="@/assets/iconimg/liuchengceshigongdan.svg">
              <span class="device-num">546,2</span>
            </i>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="top-box">
          <el-text type="info" size="default" class="top-text">审核数量</el-text>
          <div class="text-info">
            <i class="devce-icon"> <img src="@/assets/iconimg/jihuashenheshuliang.svg">
              <span class="device-num">546,2</span>
            </i>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter=15>
      <el-col :span="9">
        <el-card class="echarts-box " shadow="never">
          <CommpontentEcharts :width="'100%'" :height="'300px'" :option="option as any"></CommpontentEcharts>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card class="echarts-box " shadow="never" style="overflow: visible">
          <CommpontentEcharts :width="'90%'" :height="'250px'" :option="option1 as any"></CommpontentEcharts>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="echarts-box " shadow="never">
          <el-text size="default">每日巡检</el-text>
          <el-scrollbar height="250px">
            <el-card v-for="item in 6" shadow="never" class="everydaytest-card" style="margin-top: 10px">
              <el-tag type="success" class="everydaytest-tag">正常</el-tag>
              <el-text size="small" style="margin-left: 5px;">2024-01-04</el-text>
              <el-icon style="margin-left: 6vw;">
                <ArrowRight />
              </el-icon>

            </el-card>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="15">
      <el-col :span="14">
        <el-card class="Footer-box" shadow="never">
          <el-text type="info" size="large">测试进度监控</el-text>

          <table-component :tableData="tableData" :columnData="headers" style="margin-top: 20px" border>
            <template #progress="{ row }">
              <el-progress :text-inside="true" :stroke-width="26" :percentage="row.progress" />
            </template>
          </table-component>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="Footer-box" shadow="never" />
      </el-col>
    </el-row>
  </div>
</template>
<style lang="scss" scoped>
.everydaytest {
  margin-top: 10px;

  .everydaytest-card {
    z-index: 2;
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 55px;
    margin: 10px 0;
    background-color: #fff;
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
}

.box4 {
  height: 100px;
  margin: 10px 0;

  .top-box {
    border-radius: 5px;
    height: 100px;
    background-color: #E9ECF1;
    width: 99%;
    position: relative;

    .top-text {
      position: absolute;
      left: 10%;
      top: 20%;
    }

    .text-info {
      .device-num {
        display: block;
        position: absolute;
        left: 100%;
        top: 22%;
      }

      .devce-icon {
        display: block;
        width: 50px;
        height: 35px;
        position: absolute;
        left: 7%;
        top: 47%;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}

.el-col {
  border-radius: 4px;
  height: 300px;

  .echarts-box {
    width: 100%;
    height: 100%;
  }
}

.Footer-box2 {
  height: 280px;
}

.Footer-box {
  margin-top: 20px;
  width: 100%;
  height: 360px;
}

.rigth-content {
  width: 60vw;
  margin-top: 20px;

  .div-heder {
    width: 100%;
    height: 100px;
  }

  .Footer-box1 {
    width: 80%;
    height: 250px;
  }
}
</style>
