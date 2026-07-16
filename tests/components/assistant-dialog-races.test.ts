import { expect, it, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import Dialog from "@/components/EngineerAssistantPushDialog/index.vue"
const { load } = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock("@/api/engineer-assistant", () => ({ getEngineerAssistantTestTypesApi: load }))
vi.mock("element-plus", () => ({ ElMessage: { warning: vi.fn() } }))
it("初始打开即加载，重开后忽略旧请求", async () => {
  let oldResolve!: (value: any) => void
  load.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        oldResolve = resolve
      })
  )
  load.mockResolvedValueOnce({ data: { list: [{ typeId: 2, typeName: "新类型" }] } })
  const wrapper = mount(Dialog, { props: { modelValue: true, title: "推送", itemCount: 1, itemName: "报告" } })
  expect(load).toHaveBeenCalledOnce()
  await wrapper.setProps({ modelValue: false })
  await wrapper.setProps({ modelValue: true })
  await flushPromises()
  oldResolve({ data: { list: [{ typeId: 1, typeName: "旧类型" }] } })
  await flushPromises()
  const vm = wrapper.vm as any
  expect(vm.testTypes[0].typeId).toBe(2)
  await wrapper.setProps({ itemCount: 0 })
  vm.confirmPush()
  expect(wrapper.emitted("confirm")).toBeUndefined()
  wrapper.unmount()
})
