<script setup lang="ts">
import { ref } from "vue"
import GenericEquipmentReportReview from "./GenericEquipmentReportReview.vue"

const innerRef = ref<InstanceType<typeof GenericEquipmentReportReview> | null>(null)

defineExpose({
  resetSearch: () => innerRef.value?.resetSearch()
})
</script>

<template>
  <GenericEquipmentReportReview ref="innerRef" report-type="high-temp-high-pressure" />
</template>
