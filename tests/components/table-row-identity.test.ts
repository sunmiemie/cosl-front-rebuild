import { expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import Table from "@/components/Table/index.vue"
it("表格保留有效的零行主键", () => {
  const wrapper = mount(Table, { props: { columnData: [], tableData: [] } })
  expect((wrapper.vm as any).rowKey({ id: 0, date: "fallback" })).toBe(0)
  expect((wrapper.vm as any).rowKey({ id: null, index: 0 })).toBe(0)
  wrapper.unmount()
})
