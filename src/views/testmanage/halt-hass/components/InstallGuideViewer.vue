<!-- 安装指导只读展示组件 -->

<script lang="ts" setup>
import { ref } from "vue"
import type { InstallGuide } from "@/api/halt-hass/types"

defineProps<{
  installGuide: InstallGuide
}>()

const currentStep = ref(0)
</script>

<template>
  <div class="install-guide-viewer">
    <div class="guide-header">
      <h3>安装指导</h3>
    </div>

    <el-steps :active="currentStep" finish-status="success" align-center class="guide-steps">
      <el-step
        v-for="(step, index) in installGuide.steps"
        :key="step.id || index"
        :title="`步骤 ${index + 1}`"
        :description="step.title"
        @click="currentStep = index"
        style="cursor: pointer"
      />
    </el-steps>

    <div v-if="installGuide.steps && installGuide.steps.length > 0" class="step-content">
      <el-card shadow="hover">
        <template #header>
          <div class="step-header">
            <span class="step-number">步骤 {{ currentStep + 1 }}</span>
            <span class="step-title">{{ installGuide.steps[currentStep]?.title }}</span>
          </div>
        </template>

        <!-- 图片内容 -->
        <div v-if="installGuide.steps[currentStep]?.images?.length > 0" class="media-content">
          <el-image
            v-for="(img, imgIndex) in installGuide.steps[currentStep].images"
            :key="imgIndex"
            :src="img"
            fit="contain"
            :preview-src-list="installGuide.steps[currentStep].images"
            class="step-image"
          />
        </div>

        <!-- 视频内容 -->
        <div v-if="installGuide.steps[currentStep]?.video" class="media-content">
          <video :src="installGuide.steps[currentStep].video" controls class="step-video" />
        </div>

        <!-- 文字描述 -->
        <div class="step-description">
          <p>{{ installGuide.steps[currentStep]?.content || "暂无描述" }}</p>
        </div>

        <!-- 导航按钮 -->
        <div class="step-navigation">
          <el-button :disabled="currentStep === 0" @click="currentStep--">上一步</el-button>
          <span class="step-indicator">{{ currentStep + 1 }} / {{ installGuide.steps.length }}</span>
          <el-button :disabled="currentStep === installGuide.steps.length - 1" type="primary" @click="currentStep++">
            下一步
          </el-button>
        </div>
      </el-card>
    </div>

    <el-empty v-else description="暂无安装步骤" />
  </div>
</template>

<style lang="scss" scoped>
.install-guide-viewer {
  padding: 16px;

  .guide-header {
    margin-bottom: 24px;
    text-align: center;

    h3 {
      font-size: 18px;
      color: #303133;
    }
  }

  .guide-steps {
    margin-bottom: 24px;
  }

  .step-content {
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;

      .step-number {
        padding: 4px 12px;
        background-color: #409eff;
        color: white;
        border-radius: 4px;
        font-size: 14px;
      }

      .step-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .media-content {
      margin-bottom: 16px;
      text-align: center;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;

      .step-image {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
      }

      .step-video {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
      }
    }

    .step-description {
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 16px;

      p {
        margin: 0;
        line-height: 1.8;
        color: #606266;
        white-space: pre-wrap;
      }
    }

    .step-navigation {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;

      .step-indicator {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}
</style>
