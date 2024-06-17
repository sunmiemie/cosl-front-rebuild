<template>
  <div class="centerRight2">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <span>
          <i class="iconfont icon-vector" />
        </span>
        <div class="d-flex">
          <span class="fs-xl text mx-2">每日巡检</span>
        </div>
      </div>
      <div class="d-flex mt-1 jc-center body-box">
        <dv-scroll-board class="dv-scr-board" :config="config" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from "vue"
import { getDailyInspection } from "@/api/everytest/DailyInspections/index";
export default defineComponent({
  setup() {
    let config = ref({
      header: ["时间", "状态"],
      data: [],
      rowNum: 7, //表格行数
      headerHeight: 35,
      headerBGC: "#0f1325", //表头
      oddRowBGC: "#0f1325", //奇数行
      evenRowBGC: "#171c33", //偶数行
      index: true,
      columnWidth: [50],
      align: ["center"]
    })
    function currentTime() {
      const time = new Date()
      const year = time.getFullYear().toString()
      let month = (time.getMonth() + 1).toString()
      // Add a zero at the beginning if month is less than 10
      if (Number(month) < 10) {
        month = "0" + month
      }
      return `${year}-${month}`
    }

    const getData = () => {
      let params = {
        currentMonth: currentTime()
      }
      getDailyInspection(params).then((res) => {
        // config.data = res.inspections
        let list = res.inspections
        config.value.data = Object.entries(list).map(([key, value]) => [key, value])
        //针对待巡检进行处理，如果日期不是今天所有带巡检的都变为已过期
        config.value.data.forEach((item) => {
          if (item[1] == '待巡检' && item[0] != currentTime()) {
            item[1] = "已过期"
          }
        })

        config.value = { ...config.value }
      })




    }

    getData()
    return { config }
  }
})
</script>

<style lang="scss" scoped>
$box-height: 410px;
$box-width: 300px;

.centerRight2 {
  padding: 16px;
  padding-top: 20px;
  height: $box-height;
  width: $box-width;
  border-radius: 5px;

  .bg-color-black {
    height: $box-height - 30px;
    border-radius: 10px;
  }

  .text {
    color: #c3cbde;
  }

  .body-box {
    border-radius: 10px;
    overflow: hidden;

    .dv-scr-board {
      width: 270px;
      height: 340px;
    }
  }
}
</style>
