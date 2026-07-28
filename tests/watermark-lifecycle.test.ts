import { afterEach, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { defineComponent, ref } from "vue"
import { useWatermark } from "@/hooks/useWatermark"
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})
it("引用清空后仍释放观察器，并取消延时重建", async () => {
  vi.useFakeTimers()
  const callbacks: MutationCallback[] = []
  const disconnect = vi.fn()
  vi.stubGlobal(
    "MutationObserver",
    class {
      constructor(cb: MutationCallback) {
        callbacks.push(cb)
      }
      observe() {}
      disconnect = disconnect
    }
  )
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect = disconnect
    }
  )
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,AA==")
  const parent = document.createElement("div")
  parent.style.position = "absolute"
  document.body.appendChild(parent)
  const parentRef = ref<HTMLElement | null>(parent)
  let api!: ReturnType<typeof useWatermark>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useWatermark(parentRef)
        return () => null
      }
    })
  )
  api.setWatermark("用户")
  expect(parent.style.position).toBe("absolute")
  const watermark = parent.firstChild
  callbacks[0]([{ type: "attributes", target: watermark } as unknown as MutationRecord], {} as MutationObserver)
  parentRef.value = null
  wrapper.unmount()
  await vi.runAllTimersAsync()
  expect(parent.childElementCount).toBe(0)
  expect(disconnect).toHaveBeenCalledTimes(3)
})
it("清空文本后移除旧背景，并恢复临时添加的容器定位", () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  )
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,AA==")
  const parent = document.createElement("div")
  document.body.appendChild(parent)
  let api!: ReturnType<typeof useWatermark>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useWatermark(ref(parent))
        return () => null
      }
    })
  )
  api.setWatermark("用户", { defense: false })
  api.setWatermark("", { defense: false })
  expect((parent.firstChild as HTMLElement).style.background).toBe("")
  wrapper.unmount()
  expect(parent.style.position).toBe("")
})
