import { ref } from "vue"
import { defineStore } from "pinia"

export const useUserStore = defineStore("test", () => {
  const board_model_id = ref<string>("")
  const board_model_name = ref<string>("")
  const versionArr = ref<any>([])
  return { board_model_id, versionArr, board_model_name }
})
