<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"
import Admin from "./components/Admin.vue"
import Editor from "./components/Editor.vue"

const userStore = useUserStore()
// 管理员拥有全部的权限
const permissionsOfAdmin = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19"
]

const isAdmin = permissionsOfAdmin.every((permission) => userStore.roles.includes(permission))
</script>

<template>
  <component :is="isAdmin ? Admin : Editor" />
</template>
