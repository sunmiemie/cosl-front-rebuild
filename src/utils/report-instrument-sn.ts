export interface ReportInstrumentSnSource {
  instrumentName?: string
  instrument_name?: string
  instrumentSn?: string
  instrument_sn?: string
  snNumbers?: string
  sn_numbers?: string
}

export interface ReportInstrumentSnOption {
  value: string
  label: string
  instrumentName: string
}

/**
 * 工单中的 SN 历史数据可能使用中英文逗号、分号、斜杠、顿号或换行分隔。
 * 报告只能绑定其中一个明确的 SN，因此这里先拆分、去空白并去重。
 */
export const splitReportInstrumentSns = (value?: string) => {
  return Array.from(
    new Set(
      String(value || "")
        .split(/[\s,，/;；、]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

export const buildReportInstrumentSnOptions = (
  instruments: ReportInstrumentSnSource[] = []
): ReportInstrumentSnOption[] => {
  const options = new Map<string, ReportInstrumentSnOption>()

  instruments.forEach((instrument) => {
    const instrumentName = String(instrument.instrumentName || instrument.instrument_name || "").trim()
    const snText = instrument.snNumbers || instrument.sn_numbers || instrument.instrumentSn || instrument.instrument_sn
    splitReportInstrumentSns(snText).forEach((sn) => {
      if (options.has(sn)) return
      options.set(sn, {
        value: sn,
        label: instrumentName ? `${sn}（${instrumentName}）` : sn,
        instrumentName
      })
    })
  })

  return Array.from(options.values())
}
