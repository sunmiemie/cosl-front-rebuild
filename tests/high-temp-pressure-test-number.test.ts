import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it, vi } from "vitest"
import ts from "typescript"

const page = readFileSync(resolve(__dirname, "../src/views/testmanage/testorder/components/HighTemperaturePressureOrder.vue"), "utf8")
const ast = ts.createSourceFile("page.ts", page.split('<script setup lang="ts">')[1].split("</script>")[0], ts.ScriptTarget.Latest, true)
const names = ["validatePublishTestNumber", "nextPublishStep", "handleConfirmPublish", "resetPublishDialog"]
const code = ts.transpileModule(ast.statements.filter(n => ts.isVariableStatement(n) && n.declarationList.declarations.some(d => names.includes(d.name.getText(ast)))).map(n => n.getText(ast)).join("\n"), {}).outputText
function harness(success = true) {
  const ref = (value: unknown) => ({ value })
  const context: Record<string, any> = {
    publishStep: ref("number"), publishTestNumber: ref(""), publishOrder: ref({ id: 1 }),
    publishLoading: ref(false), publishDialogVisible: ref(true), sanxinDoneCount: ref(2),
    publishSignatureRawFile: ref(new Blob(["signature"], { type: "image/png" })),
    publishSignatureFileList: ref([]), publishSignatureSource: ref("local"),
    publishSignatureObjectUrl: ref(""), publishSignaturePreviewDataUrl: ref(""), signaturePreviewVisible: ref(false),
    publishConfirmDate: ref("2026-09-09"), sanxinTesterAnswers: ["no", "no"], sanxinHasRisk: ref(false),
    ElMessage: { warning: vi.fn(), success: vi.fn(), error: vi.fn() },
    publishHighTempPressureOrderApi: vi.fn(async () => success ? { code: 0 } : { code: -1, msg: "测试单号已存在" }),
    taskCenterStore: { refresh: vi.fn() }, getList: vi.fn(),
  }
  return { ...context, ...new Function(...Object.keys(context), code + "\nreturn {" + names.join(",") + "}")(...Object.values(context)) }
}

describe("发布时维护测试单号", () => {
  it("单号必填，下一步不保存，返回及取消可丢弃本次输入", () => {
    const h = harness()
    h.nextPublishStep()
    expect(h.publishStep.value).toBe("number")
    h.publishTestNumber.value = " TEST-1 "
    h.nextPublishStep()
    expect(h.publishStep.value).toBe("confirmation")
    expect(h.publishTestNumber.value).toBe("TEST-1")
    expect(h.publishHighTempPressureOrderApi).not.toHaveBeenCalled()
    h.publishStep.value = "number"
    expect(h.publishTestNumber.value).toBe("TEST-1")
    h.resetPublishDialog()
    expect(h.publishTestNumber.value).toBe("")
    expect(h.publishOrder.value).toBeNull()
  })

  it("最终提交同时携带编号、确认项和签名，成功刷新", async () => {
    const h = harness()
    h.publishTestNumber.value = " TEST-1 "
    await h.handleConfirmPublish()
    const form = h.publishHighTempPressureOrderApi.mock.calls[0][1] as FormData
    expect(form.get("test_number")).toBe("TEST-1")
    expect(form.get("tester_item_1")).toBe("no")
    expect(form.get("admin_signature")).toBeTruthy()
    expect(h.publishDialogVisible.value).toBe(false)
    expect(h.getList).toHaveBeenCalledOnce()
  })

  it("重复失败保留编号和签名，禁止空白或超长提交", async () => {
    const h = harness(false)
    for (const value of [" ", "X".repeat(101)]) {
      h.publishTestNumber.value = value
      await h.handleConfirmPublish()
    }
    expect(h.publishHighTempPressureOrderApi).not.toHaveBeenCalled()
    h.publishTestNumber.value = "TEST-1"
    await h.handleConfirmPublish()
    expect(h.publishDialogVisible.value).toBe(true)
    expect(h.publishTestNumber.value).toBe("TEST-1")
    expect(h.publishSignatureRawFile.value).toBeTruthy()
    expect(h.ElMessage.error).toHaveBeenCalledWith("测试单号已存在")
    expect(h.publishLoading.value).toBe(false)
  })
})
