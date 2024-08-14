<template>
  <div class="app-container">
    <el-card style="height: 80vh">
      <el-tabs v-model="activeName" type="card" class="demo-tabs">
        <el-tab-pane label="生产电路板" name="first">
          <Board />
        </el-tab-pane>
        <el-tab-pane label="临时电路板" name="second">
          <TempBoard />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import Board from "./Board.vue"
import TempBoard from "./TempBoard.vue"
import { ref } from "vue"

const activeName = ref<any>("first")
</script>
