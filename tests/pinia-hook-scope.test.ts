import { expect, it } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useDevice } from "@/hooks/useDevice"
import { useLayoutMode } from "@/hooks/useLayoutMode"
import { useAppStore } from "@/store/modules/app"
import { DeviceEnum, LayoutModeEnum } from "@/constants/app-key"
it("布局和设备 hook 从当前 Pinia 读取，不共享首个导入时的 store", () => {
  setActivePinia(createPinia())
  const first = useLayoutMode()
  first.setLayoutMode(LayoutModeEnum.Left)
  const firstDevice = useDevice()
  useAppStore().device = DeviceEnum.Mobile
  setActivePinia(createPinia())
  const second = useLayoutMode()
  second.setLayoutMode(LayoutModeEnum.Top)
  const secondDevice = useDevice()
  useAppStore().device = DeviceEnum.Desktop
  expect(first.isLeft.value).toBe(true)
  expect(second.isTop.value).toBe(true)
  expect(firstDevice.isMobile.value).toBe(true)
  expect(secondDevice.isDesktop.value).toBe(true)
})
