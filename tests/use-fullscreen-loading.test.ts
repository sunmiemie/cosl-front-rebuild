import { describe, expect, it, vi } from "vitest"
import { ElLoading } from "element-plus"
import { useFullscreenLoading } from "@/hooks/useFullscreenLoading"

vi.mock("element-plus", () => ({ ElLoading: { service: vi.fn() } }))

describe("并发全屏加载", () => {
  it("最后一个任务完成后才关闭遮罩", async () => {
    const close = vi.fn()
    vi.mocked(ElLoading.service, { partial: true }).mockReturnValue({ close })
    let finishFirst!: () => void
    let finishSecond!: () => void
    const first = new Promise<void>((resolve) => {
      finishFirst = resolve
    })
    const second = new Promise<void>((resolve) => {
      finishSecond = resolve
    })
    const runFirst = useFullscreenLoading((task: Promise<void>) => task)
    const runSecond = useFullscreenLoading((task: Promise<void>) => task)
    const runningFirst = runFirst(first)
    const runningSecond = runSecond(second)
    finishFirst()
    await runningFirst
    expect(close).not.toHaveBeenCalled()
    finishSecond()
    await runningSecond
    expect(close).toHaveBeenCalledOnce()
  })

  it("失败任务仍清理遮罩并保留错误供调用方处理", async () => {
    const close = vi.fn()
    vi.mocked(ElLoading.service, { partial: true }).mockReturnValue({ close })
    const failure = new Error("读取失败")
    const run = useFullscreenLoading(() => {
      throw failure
    })
    await expect(run()).rejects.toBe(failure)
    expect(close).toHaveBeenCalledOnce()
  })
})
