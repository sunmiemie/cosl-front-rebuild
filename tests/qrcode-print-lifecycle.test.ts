import { afterEach, expect, it, vi } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { printBoardQrcodes } from "@/utils/printQrcode"
const { load, error } = vi.hoisted(() => ({ load: vi.fn(), error: vi.fn() }))
vi.mock("@/api/qrcode", () => ({ getQRcodeImgApi: load }))
vi.mock("element-plus", () => ({ ElMessage: { warning: vi.fn(), error } }))
afterEach(() => {
  vi.restoreAllMocks()
})
it("同步打开窗口，等待全部图片后打印并关闭", async () => {
  let resolve!: (value: any) => void
  load.mockImplementationOnce(
    () =>
      new Promise((finish) => {
        resolve = finish
      })
  )
  const images: any[] = []
  const popup = {
    closed: false,
    close: vi.fn(),
    print: vi.fn(),
    document: {
      write: vi.fn(),
      close: vi.fn(),
      body: { appendChild: vi.fn() },
      createElement(tag: string) {
        const element = {}
        if (tag === "img") images.push(element)
        return element
      }
    }
  }
  const open = vi.spyOn(window, "open").mockReturnValue(popup as any)
  const pending = printBoardQrcodes([{ sn: "ABC" }])
  expect(open).toHaveBeenCalledOnce()
  resolve({ code: 0, data: { one: "data:a", two: "data:b" } })
  await flushPromises()
  images[0].onload()
  await flushPromises()
  expect(popup.print).not.toHaveBeenCalled()
  images[1].onload()
  expect(await pending).toBe(true)
  expect(popup.print).toHaveBeenCalledOnce()
  expect(popup.close).toHaveBeenCalledOnce()
})
it("请求失败后关闭占位窗口，不触发打印", async () => {
  const popup = { close: vi.fn(), print: vi.fn() }
  vi.spyOn(window, "open").mockReturnValue(popup as any)
  load.mockRejectedValueOnce(new Error("请求失败"))
  expect(await printBoardQrcodes([{ sn: "ABC" }])).toBe(false)
  expect(popup.print).not.toHaveBeenCalled()
  expect(popup.close).toHaveBeenCalledOnce()
})
