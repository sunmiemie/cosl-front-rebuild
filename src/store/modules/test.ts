import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

export const useUserStore = defineStore("test", () => {
  const board_model_id = ref<string>("")
  const versionArr = ref([])
  return { board_model_id, versionArr }
})
