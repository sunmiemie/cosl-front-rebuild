import { computed, ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { getPendingTaskCenterApi, type TaskCenterItem } from "@/api/task-center"

const POLL_INTERVAL_MS = 30_000

let pollingTimer: ReturnType<typeof setInterval> | null = null
let pollingConsumers = 0
let refreshPromise: Promise<void> | null = null
let refreshQueued = false
let queuedRefreshSilent = true

export const useTaskCenterStore = defineStore("task-center", () => {
  const tasks = ref<TaskCenterItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const loaded = ref(false)
  const errorMessage = ref("")
  const lastUpdatedAt = ref("")

  const groupedTasks = computed(() => {
    const groupMap = new Map<string, TaskCenterItem[]>()
    for (const task of tasks.value) {
      const list = groupMap.get(task.group) || []
      list.push(task)
      groupMap.set(task.group, list)
    }

    return [
      { key: "all", label: "全部", tasks: tasks.value },
      ...Array.from(groupMap.entries()).map(([label, groupTasks]) => ({
        key: label,
        label,
        tasks: groupTasks
      }))
    ]
  })

  const refresh = (silent = false) => {
    // 刷新请求执行期间收到的新刷新不能被吞掉；当前请求结束后至少再补跑一次。
    refreshQueued = true
    queuedRefreshSilent = queuedRefreshSilent && silent
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      while (refreshQueued) {
        const currentSilent = queuedRefreshSilent
        refreshQueued = false
        queuedRefreshSilent = true

        const shouldShowLoading = !currentSilent || !loaded.value
        if (shouldShowLoading) {
          loading.value = true
        }

        try {
          const res = await getPendingTaskCenterApi({ limit: 100 })
          if (res.code === 0) {
            tasks.value = res.data.list || []
            total.value = res.data.total || 0
            errorMessage.value = ""
            lastUpdatedAt.value = new Date().toISOString()
          } else {
            tasks.value = []
            total.value = 0
            errorMessage.value = res.msg || "加载任务中心失败"
          }
          loaded.value = true
        } catch (error: any) {
          errorMessage.value = error?.message || "加载任务中心失败"
        } finally {
          loading.value = false
        }
      }
    })().finally(() => {
      loading.value = false
      refreshPromise = null
    })

    return refreshPromise
  }

  const startPolling = () => {
    pollingConsumers += 1
    // 新的任务中心消费者出现时立即取最新数据，即使全局轮询已经启动。
    void refresh(true)
    if (pollingTimer) return

    pollingTimer = setInterval(() => {
      void refresh(true)
    }, POLL_INTERVAL_MS)
  }

  const stopPolling = () => {
    pollingConsumers = Math.max(0, pollingConsumers - 1)
    if (pollingConsumers > 0 || !pollingTimer) return

    clearInterval(pollingTimer)
    pollingTimer = null
  }

  const reset = () => {
    refreshQueued = false
    queuedRefreshSilent = true
    tasks.value = []
    total.value = 0
    loading.value = false
    loaded.value = false
    errorMessage.value = ""
    lastUpdatedAt.value = ""
  }

  return {
    tasks,
    loading,
    loaded,
    errorMessage,
    lastUpdatedAt,
    total,
    groupedTasks,
    refresh,
    startPolling,
    stopPolling,
    reset
  }
})

/** 在 setup 外使用 */
export function useTaskCenterStoreHook() {
  return useTaskCenterStore(store)
}
