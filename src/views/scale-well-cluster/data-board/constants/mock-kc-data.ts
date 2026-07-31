import type { InstrumentKcConfig } from "../types"

/** 各型号仪器近 10 次 Kc 值（演示数据，待仪器数据接入后替换） */
export const INSTRUMENT_KC_CONFIGS: InstrumentKcConfig[] = [
  {
    model: "475",
    title: "475仪器近10次Kc值",
    kcMin: 3.5,
    kcMax: 5.5,
    values: [4.12, 4.28, 4.35, 4.21, 4.44, 4.38, 4.31, 4.26, 4.42, 4.38]
  },
  {
    model: "675",
    title: "675仪器近10次Kc值",
    kcMin: 5.5,
    kcMax: 7.5,
    values: [6.42, 6.58, 6.71, 6.52, 6.65, 6.48, 6.73, 6.61, 6.55, 6.52]
  },
  {
    model: "800",
    title: "800仪器近10次Kc值",
    kcMin: 5.5,
    kcMax: 7.5,
    values: [6.88, 7.02, 6.95, 7.11, 6.84, 7.05, 6.92, 7.08, 6.97, 7.01]
  }
]
