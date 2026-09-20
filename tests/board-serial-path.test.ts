import { expect, it, vi } from "vitest"
import { getBoardDataBySn, getProdBoardDataBySn } from "@/api/board"
const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock("@/utils/service", () => ({ request }))
it("电路板序列号中的保留字符作为完整路径段传递", () => {
  const serial = "SN/01 #2?修订=甲"
  getBoardDataBySn(serial)
  expect(request).toHaveBeenLastCalledWith({ url: `equipment/board/${encodeURIComponent(serial)}`, method: "get" })
  getProdBoardDataBySn(serial, { silentError: true })
  expect(request).toHaveBeenLastCalledWith({
    url: `equipment/prod-board/${encodeURIComponent(serial)}`,
    method: "get",
    silentError: true
  })
})
