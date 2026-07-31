import { ref } from "vue"
import { ElMessage } from "element-plus"
import orderIcon from "@/assets/iconimg/liuchengceshigongdan.svg"
import auditIcon from "@/assets/iconimg/jihuashenheshuliang.svg"
import deviceIcon from "@/assets/iconimg/shebei.svg"
import pendingIcon from "@/assets/iconimg/zhidongxiguzhang.svg"
import { getCalibrationDashboardApi } from "@/api/calibration-well/dashboard"
import type { ApiDashboardStatSummary } from "@/api/calibration-well/types"
import { INSTRUMENT_KC_CONFIGS } from "../constants/mock-kc-data"
import type { DashboardRecentOrder, StatSummaryItem } from "../types"

const ICON_MAP: Record<string, string> = {
  "monthly-count": orderIcon,
  "pass-rate": auditIcon,
  "active-instruments": deviceIcon,
  "pending-orders": pendingIcon
}

function mapStatItem(item: ApiDashboardStatSummary): StatSummaryItem {
  return {
    key: item.key,
    label: item.label,
    value: item.value,
    unit: item.unit,
    icon: ICON_MAP[item.icon_key] || orderIcon,
    trendText: item.trend_text,
    trendType: item.trend_type
  }
}

export function useDataBoard() {
  const loading = ref(false)
  const statSummary = ref<StatSummaryItem[]>([])
  const dailyCalibrationCounts = ref<number[]>([])
  const recentOrders = ref<DashboardRecentOrder[]>([])
  const instrumentKcConfigs = INSTRUMENT_KC_CONFIGS

  const fetchDashboard = async () => {
    loading.value = true
    try {
      const res = await getCalibrationDashboardApi()
      if (res.code !== 0 || !res.data) {
        ElMessage.error(res.msg || "加载看板数据失败")
        statSummary.value = []
        dailyCalibrationCounts.value = []
        recentOrders.value = []
        return
      }
      statSummary.value = res.data.stat_summary.map(mapStatItem)
      dailyCalibrationCounts.value = res.data.daily_calibration_counts
      recentOrders.value = res.data.recent_orders.map((order) => ({
        taskNumber: order.task_number,
        modelName: order.instrument_model_name,
        engineer: order.tester_name,
        status: order.status,
        statusText: order.status_text,
        kc: order.kc,
        planDate: order.plan_date || ""
      }))
    } catch {
      ElMessage.error("加载看板数据失败")
      statSummary.value = []
      dailyCalibrationCounts.value = []
      recentOrders.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    statSummary,
    dailyCalibrationCounts,
    recentOrders,
    instrumentKcConfigs,
    fetchDashboard
  }
}
