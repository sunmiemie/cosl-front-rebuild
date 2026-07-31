<script setup lang="ts">
import { computed } from "vue"
import type { WellCommConfig } from "../types"
import { createUsbCommConfig, isPowerConfig } from "../types"
import { Connection, Cpu, Delete, Lightning, Link, Plus } from "@element-plus/icons-vue"

const configs = defineModel<WellCommConfig[]>("configs", { required: true })

const props = defineProps<{
  dualSensor: boolean
}>()

const ROLE_META: Record<
  string,
  { label: string; icon: typeof Link; hint?: string }
> = {
  instrument: { label: "仪器 TBUS", icon: Link, hint: "主传感器串口（VID / PID / 适配器 SN）" },
  instrument_b: { label: "传感器 B", icon: Connection, hint: "双传感器第二路 TBUS 配置" },
  data_stick: { label: "程控电源", icon: Cpu, hint: "可选，程控电源 USB 串口配置" },
  power_supply: { label: "直流电源 IT-M3100", icon: Lightning, hint: "LAN 或 RS232 连接电源" }
}

const addUsbConfig = () => {
  if (configs.value.some((c) => c.deviceRole === "data_stick")) return
  const powerIdx = configs.value.findIndex((c) => c.deviceRole === "power_supply")
  const insertAt = powerIdx >= 0 ? powerIdx : configs.value.length
  configs.value.splice(insertAt, 0, createUsbCommConfig("data_stick"))
}

const removeConfig = (index: number) => {
  const item = configs.value[index]
  if (!item || item.deviceRole !== "data_stick") return
  configs.value.splice(index, 1)
}

const canRemove = (item: WellCommConfig) => item.deviceRole === "data_stick"

const roleMeta = (role: string) =>
  ROLE_META[role] ?? { label: role, icon: Link }

const usbConfigs = () => configs.value.filter((c) => !isPowerConfig(c))
const powerIndex = computed(() =>
  configs.value.findIndex((c) => c.deviceRole === "power_supply")
)
const powerItem = computed(() =>
  powerIndex.value >= 0 ? configs.value[powerIndex.value] : null
)
</script>

<template>
  <div class="well-comm-config-list">
    <p v-if="props.dualSensor" class="well-comm-config-list__hint">
      双传感器模式：请分别为仪器 TBUS 与传感器 B 填写独立的 USB 适配器信息。
    </p>

    <section class="well-comm-config-list__group">
      <header class="well-comm-config-list__group-head">
        <span class="well-comm-config-list__group-title">USB 串口设备</span>
        <span class="well-comm-config-list__group-desc">{{ usbConfigs().length }} 项</span>
      </header>

      <template v-for="(item, index) in configs" :key="`${item.deviceRole}-${index}`">
        <article
          v-if="!isPowerConfig(item)"
          class="well-comm-config-list__card"
        >
          <header class="well-comm-config-list__card-head">
            <div class="well-comm-config-list__card-title">
              <el-icon><component :is="roleMeta(item.deviceRole).icon" /></el-icon>
              <div>
                <strong>{{ roleMeta(item.deviceRole).label }}</strong>
                <span v-if="roleMeta(item.deviceRole).hint" class="well-comm-config-list__card-sub">
                  {{ roleMeta(item.deviceRole).hint }}
                </span>
              </div>
            </div>
            <el-button
              v-if="canRemove(item)"
              link
              type="danger"
              :icon="Delete"
              @click="removeConfig(index)"
            >
              删除
            </el-button>
          </header>

          <div class="well-comm-config-list__usb-grid">
            <el-form-item
              label="VID"
              :prop="`commConfigs.${index}.vid`"
              :rules="[{ required: true, message: '必填', trigger: 'blur' }]"
              label-position="top"
            >
              <el-input v-model="item.vid" placeholder="0403" />
            </el-form-item>
            <el-form-item
              label="PID"
              :prop="`commConfigs.${index}.pid`"
              :rules="[{ required: true, message: '必填', trigger: 'blur' }]"
              label-position="top"
            >
              <el-input v-model="item.pid" placeholder="6001" />
            </el-form-item>
            <el-form-item
              label="波特率"
              label-position="top"
            >
              <el-input-number
                v-model="item.baudRate"
                :min="1200"
                :step="9600"
                controls-position="right"
                class="well-comm-config-list__number"
              />
            </el-form-item>
            <el-form-item
              class="well-comm-config-list__span-full"
              label="适配器 SN"
              :prop="`commConfigs.${index}.adapterSerial`"
              :rules="[{ required: true, message: '必填', trigger: 'blur' }]"
              label-position="top"
            >
              <el-input v-model="item.adapterSerial" placeholder="USB 适配器序列号，如 CTRL001" />
            </el-form-item>
          </div>
        </article>
      </template>

      <el-button
        v-if="!configs.some((c) => c.deviceRole === 'data_stick')"
        class="well-comm-config-list__add"
        :icon="Plus"
        @click="addUsbConfig"
      >
        添加程控电源
      </el-button>
    </section>

    <section v-if="powerItem" class="well-comm-config-list__group">
      <header class="well-comm-config-list__group-head">
        <span class="well-comm-config-list__group-title">电源</span>
      </header>

      <article class="well-comm-config-list__card">
        <header class="well-comm-config-list__card-head">
          <div class="well-comm-config-list__card-title">
            <el-icon><Lightning /></el-icon>
            <div>
              <strong>{{ roleMeta('power_supply').label }}</strong>
              <span class="well-comm-config-list__card-sub">{{ roleMeta('power_supply').hint }}</span>
            </div>
          </div>
        </header>

        <div class="well-comm-config-list__power-grid">
          <el-form-item label="连接方式" label-position="top">
            <el-select v-model="powerItem.transport" style="width: 100%">
              <el-option label="LAN（网口）" value="lan" />
              <el-option label="RS232（串口）" value="serial" />
            </el-select>
          </el-form-item>
          <el-form-item
            label="地址"
            :prop="`commConfigs.${powerIndex}.host`"
            :rules="[{ required: true, message: '请输入 IP 或 COM', trigger: 'blur' }]"
            label-position="top"
          >
            <el-input v-model="powerItem.host" placeholder="192.168.0.201" />
          </el-form-item>
          <el-form-item label="端口" label-position="top">
            <el-input-number
              v-model="powerItem.port"
              :min="1"
              :max="65535"
              controls-position="right"
              class="well-comm-config-list__number"
            />
          </el-form-item>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
.well-comm-config-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.well-comm-config-list__hint {
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 6px;
}

.well-comm-config-list__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.well-comm-config-list__group-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.well-comm-config-list__group-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
}

.well-comm-config-list__group-desc {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.well-comm-config-list__card {
  padding: 14px 14px 4px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-fill-color-blank);
}

.well-comm-config-list__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.well-comm-config-list__card-title {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  min-width: 0;

  .el-icon {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 18px;
    color: var(--el-color-primary);
  }

  strong {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.well-comm-config-list__card-sub {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

.well-comm-config-list__usb-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 12px;
}

.well-comm-config-list__power-grid {
  display: grid;
  grid-template-columns: 140px 1fr 120px;
  gap: 0 12px;
}

.well-comm-config-list__span-full {
  grid-column: 1 / -1;
}

.well-comm-config-list__number {
  width: 100%;
}

.well-comm-config-list__add {
  align-self: flex-start;
}

:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px !important;
  font-size: 12px;
  line-height: 1.2 !important;
  color: var(--el-text-color-secondary);
}

@media (max-width: 720px) {
  .well-comm-config-list__usb-grid,
  .well-comm-config-list__power-grid {
    grid-template-columns: 1fr;
  }
}
</style>
