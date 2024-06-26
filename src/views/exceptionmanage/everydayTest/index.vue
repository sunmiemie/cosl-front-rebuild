<script setup lang="ts">
import { ref, type Ref } from "vue"
import type { CalendarDateType, CalendarInstance } from "element-plus"
import { getDailyInspection } from "@/api/everytest/Dailyinspections"
import { onMounted } from "vue"
const inspectionData: any = ref({})
const loading: Ref<boolean> = ref(false)
const calendar = ref<CalendarInstance>()

/**
 * @description Format the date to a specific format, e.g. 2024-04
 * @param {Date} date Date object
 * @returns {string} Formatted date, e.g. 2024-04
 */
function ProcessingTime(date: Date): string {
  const time = new Date(date)
  const year = time.getFullYear().toString()
  let month = (time.getMonth() + 1).toString()
  // Add a zero at the beginning if month is less than 10
  if (Number(month) < 10) {
    month = "0" + month
  }
  return `${year}-${month}`
}

const selectDate = (val: CalendarDateType) => {
  if (!calendar.value) return
  calendar.value.selectDate(val)
  const currentMonth = calendar.value.selectedDay.$d
  const currentTime = ProcessingTime(currentMonth)

  const params = {
    currentMonth: currentTime
  }
  getDaily(params)
}

const getDaily = async (currentMonth?: any) => {
  loading.value = true
  getDailyInspection(currentMonth)
    .then((res) => {
      inspectionData.value = res.inspections
      // 判断inspectionData.value对象内部的待巡检是否是当天，如果不是当前全部变为已过期tag 红色
      for (let key in inspectionData.value) {
        if (inspectionData.value[key] == "待巡检" && key != currentTime()) {
          inspectionData.value[key] = "已过期"
        }
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const dropdownSelct = (day: any, type: any) => {
  console.log(day, type)
}

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

onMounted(() => {
  const time = currentTime()
  const params = {
    currentMonth: time
  }
  getDaily(params)
})
</script>

<template>
  <div class="app-container">
    <el-calendar ref="calendar" v-loading="loading">
      <!-- 自定义头部 -->
      <template #header="{ date }">
        <span>{{ date }}</span>
        <el-button-group>
          <el-button size="small" @click="selectDate('prev-month')"> 上个月 </el-button>
          <el-button size="small" @click="selectDate('today')">今天</el-button>
          <el-button size="small" @click="selectDate('next-month')"> 下个月 </el-button>
        </el-button-group>
      </template>
      <template #date-cell="{ data }">
        <div :class="data.isSelected ? 'is-selected' : ''">
          <div style="font-size: 18px">{{ data.day.split("-").slice(2).join("-") }}</div>
          <el-card class="c-padding">
            <div class="c-card">
              <div>
                <el-tag v-if="inspectionData[data.day]" class="c-tag" :type="inspectionData[data.day] === '待巡检' ? 'warning' : inspectionData[data.day] === '异常' || inspectionData[data.day] === '已过期' ? 'danger' : 'success'
                  ">{{ inspectionData[data.day] }}</el-tag>
              </div>
              <div>
                <!-- <el-button class="c-button">...</el-button> -->
                <el-dropdown>
                  <el-button class="c-button"> ...</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="inspectionData[data.day] === '待巡检'"
                        @click="dropdownSelct(data.day, '填写巡检报告')">填写巡检报告</el-dropdown-item>
                      <el-dropdown-item v-if="inspectionData[data.day] === '已巡检' || inspectionData[data.day] === '异常'"
                        @click="dropdownSelct(data.day, '查看报告')">查看报告</el-dropdown-item>
                      <el-dropdown-item v-if="inspectionData[data.day] === '已巡检'"
                        @click="dropdownSelct(data.day, '导出报告')">导出报告</el-dropdown-item>
                      <el-dropdown-item v-if="inspectionData[data.day] === '异常'"
                        @click="dropdownSelct(data.day, '查看故障工单')">查看故障工单</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-card>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<style scoped lang="scss">
.downcrad {
  // position: relative;
  // left: 10px;
  // bottom: 15px;
  width: 7vw;
  height: 3vh;
}

.c-card {
  display: flex;
  justify-content: space-between;
}

.c-padding {
  --el-card-padding: 8px;
}

.c-tag {
  align-items: center;
  height: 100%;
}

.c-button {
  align-items: center;
  border: 0;
}
</style>
