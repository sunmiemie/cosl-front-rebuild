export const PermissionCode = {
  TestOrderCreateBasic: "TEST_ORDER_CREATE_BASIC",
  TestOrderCreateHaltHass: "TEST_ORDER_CREATE_HALT_HASS",
  TestOrderCreateWaterCycle: "TEST_ORDER_CREATE_WATER_CYCLE",
  TestOrderCreateHighTempBox: "TEST_ORDER_CREATE_HIGH_TEMP_BOX",
  TestOrderCreateVibrationTable: "TEST_ORDER_CREATE_VIBRATION_TABLE",
  TestOrderCreateHighTempPressure: "TEST_ORDER_CREATE_HIGH_TEMP_PRESSURE",
  TestOrderCreateSimulatedWell: "TEST_ORDER_CREATE_SIMULATED_WELL",
  ReportReviewBasic: "REPORT_REVIEW_BASIC",
  ReportReviewHaltHass: "REPORT_REVIEW_HALT_HASS",
  ReportReviewWaterCycle: "REPORT_REVIEW_WATER_CYCLE",
  ReportReviewHighTempBox: "REPORT_REVIEW_HIGH_TEMP_BOX",
  ReportReviewVibrationTable: "REPORT_REVIEW_VIBRATION_TABLE",
  ReportReviewHighTempPressure: "REPORT_REVIEW_HIGH_TEMP_PRESSURE",
  ReportReviewSimulatedWell: "REPORT_REVIEW_SIMULATED_WELL",
  UserManage: "USER_MANAGE",
  RoleManage: "ROLE_MANAGE"
} as const

export const AddOrderPermissionCodes = [
  PermissionCode.TestOrderCreateBasic,
  PermissionCode.TestOrderCreateHaltHass,
  PermissionCode.TestOrderCreateWaterCycle,
  PermissionCode.TestOrderCreateHighTempBox,
  PermissionCode.TestOrderCreateVibrationTable,
  PermissionCode.TestOrderCreateHighTempPressure,
  PermissionCode.TestOrderCreateSimulatedWell
]

export const ReportReviewPermissionCodes = [
  PermissionCode.ReportReviewBasic,
  PermissionCode.ReportReviewHaltHass,
  PermissionCode.ReportReviewWaterCycle,
  PermissionCode.ReportReviewHighTempBox,
  PermissionCode.ReportReviewVibrationTable,
  PermissionCode.ReportReviewHighTempPressure,
  PermissionCode.ReportReviewSimulatedWell
]
