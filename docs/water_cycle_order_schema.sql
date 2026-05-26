-- 水循环工单数据库变更设计
-- 主表：water_cycle_order
-- 子表：water_cycle_order_instrument，一个工单可关联多个待测仪器。

ALTER TABLE water_cycle_order
  ADD COLUMN table_no varchar(64) NOT NULL DEFAULT '' COMMENT '表格编号，系统自动生成',
  ADD COLUMN applicant_phone varchar(32) NOT NULL DEFAULT '' COMMENT '申请人电话',
  ADD COLUMN test_application_unit varchar(255) NOT NULL DEFAULT '' COMMENT '测试申请单位',
  ADD COLUMN test_application_unit_manager varchar(64) NOT NULL DEFAULT '' COMMENT '测试申请单位负责人',
  ADD COLUMN research_number varchar(128) NOT NULL DEFAULT '' COMMENT '科研编号',
  ADD COLUMN application_date date NULL COMMENT '申请日期',
  ADD COLUMN project_budget_number varchar(128) NOT NULL DEFAULT '' COMMENT '项目预算编号',
  ADD COLUMN project_name varchar(255) NOT NULL DEFAULT '' COMMENT '项目名称',
  ADD COLUMN quantity int NOT NULL DEFAULT 1 COMMENT '待测仪器数量合计',
  ADD COLUMN client varchar(64) NOT NULL DEFAULT '' COMMENT '委托人',
  ADD COLUMN planned_time datetime NULL COMMENT '时间',
  ADD COLUMN test_purpose text NULL COMMENT '测试目的',
  ADD COLUMN test_type varchar(64) NOT NULL DEFAULT '' COMMENT '测试类型：水循环测试/螺杆钻具测试/螺杆马达整机测试/水平钻机测试',
  ADD COLUMN project_members text NULL COMMENT '项目成员',
  ADD COLUMN equipment_list text NULL COMMENT '设备清单',
  ADD COLUMN instrument_combination text NULL COMMENT '仪器串组合',
  ADD COLUMN test_steps text NULL COMMENT '测试步骤',
  ADD COLUMN safety_risks text NULL COMMENT '安全风险及预防措施';

CREATE TABLE water_cycle_order_instrument (
  id bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  order_id bigint NOT NULL COMMENT '水循环工单ID',
  instrument_name varchar(255) NOT NULL DEFAULT '' COMMENT '待测仪器',
  sn_numbers text NULL COMMENT '仪器SN号/资产号，多个用逗号或换行分隔',
  quantity int NOT NULL DEFAULT 1 COMMENT '数量',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_water_cycle_order_instrument_order_id (order_id),
  CONSTRAINT fk_water_cycle_order_instrument_order
    FOREIGN KEY (order_id) REFERENCES water_cycle_order (id)
    ON DELETE CASCADE
) COMMENT='水循环工单待测仪器明细';

CREATE UNIQUE INDEX uk_water_cycle_order_table_no ON water_cycle_order (table_no);
CREATE UNIQUE INDEX uk_water_cycle_order_task_number ON water_cycle_order (task_number);

-- 模拟数据：4 条工单，且每条工单都有多个待测仪器明细。
INSERT INTO water_cycle_order (
  table_no,
  task_number,
  applicant,
  applicant_phone,
  test_application_unit,
  test_application_unit_manager,
  research_number,
  application_date,
  project_budget_number,
  project_name,
  device_name,
  device_number,
  quantity,
  client,
  planned_time,
  test_purpose,
  test_type,
  flow_process,
  need_command_transfer,
  need_pressure_test,
  project_members,
  equipment_list,
  instrument_combination,
  test_steps,
  safety_risks,
  test_platform,
  test_date,
  start_time,
  end_time,
  status,
  created_at,
  updated_at
) VALUES
(
  'WC-FORM-20260526-001',
  'WC-TASK-20260526-001',
  '张明',
  '13800010001',
  '中海油服实验中心',
  '李强',
  'KY-2026-WC-001',
  '2026-05-26',
  'YS-2026-041',
  '螺杆钻具水循环验证项目',
  '导向控制器',
  'NAV-202, NAV-203, PS-877-01',
  3,
  '王工',
  '2026-05-28 09:00:00',
  '验证螺杆钻具在不同管线长度下的循环稳定性和通讯可靠性。',
  '螺杆钻具测试',
  '877米',
  'yes',
  'yes',
  '张明、王工、刘工',
  '水循环测试台、压力传感器、采集工控机',
  '导向控制器 + 压力短节 + 通讯短节',
  '1. 设备连接检查；2. 空循环；3. 加压循环；4. 数据回收。',
  '高压管线连接需复核，测试前完成泄压确认和人员隔离。',
  '水循环测试台',
  '2026-05-28',
  '09:00:00',
  '12:00:00',
  0,
  NOW(),
  NOW()
),
(
  'WC-FORM-20260526-002',
  'WC-TASK-20260526-002',
  '赵磊',
  '13900020002',
  '钻井工具事业部',
  '陈晨',
  'KY-2026-WC-002',
  '2026-05-26',
  'YS-2026-052',
  '水平钻机长距离循环测试',
  '水平钻机通讯模块',
  'HD-1500-01, HD-1500-02, HD-CTRL-01',
  3,
  '赵工',
  '2026-06-01 14:00:00',
  '评估水平钻机在长距离管线下的指令下发能力。',
  '水平钻机测试',
  '1500米',
  'yes',
  'no',
  '赵磊、陈晨、孙工',
  '水平钻机、通讯模块、上位机',
  '通讯模块 + 控制短节 + 采集模块',
  '1. 通讯检查；2. 1500米循环；3. 指令下发；4. 异常记录。',
  '注意电气连接防水，管线移动时设置警戒线。',
  '水循环测试台',
  '2026-06-01',
  '14:00:00',
  '17:00:00',
  1,
  NOW(),
  NOW()
),
(
  'WC-FORM-20260526-003',
  'WC-TASK-20260526-003',
  '李娜',
  '13700030003',
  '井下仪器研发部',
  '周航',
  'KY-2026-WC-003',
  '2026-05-27',
  'YS-2026-063',
  '螺杆马达整机小循环测试',
  '螺杆马达整机',
  'MD-440-01, MD-CTRL-02, FLOW-440-01',
  3,
  '李工',
  '2026-06-03 10:00:00',
  '验证螺杆马达整机在小循环工况下的流量响应和控制稳定性。',
  '螺杆马达整机测试',
  '小循环',
  'no',
  'yes',
  '李娜、周航、何工',
  '小循环管线、流量计、扭矩采集模块',
  '马达整机 + 控制短节 + 流量计',
  '1. 小循环管线检查；2. 低压启动；3. 分段调压；4. 记录流量曲线。',
  '调压阶段需双人复核阀门状态，避免瞬时压力冲击。',
  '水循环测试台',
  '2026-06-03',
  '10:00:00',
  '13:00:00',
  2,
  NOW(),
  NOW()
),
(
  'WC-FORM-20260526-004',
  'WC-TASK-20260526-004',
  '王海',
  '13600040004',
  '海洋工程测试中心',
  '郭敏',
  'KY-2026-WC-004',
  '2026-05-27',
  'YS-2026-074',
  '水循环测试长管线综合验证',
  '随钻测量仪器串',
  'MWD-3122-01, BAT-3122-02, COM-3122-03, SEN-3122-04',
  4,
  '郭工',
  '2026-06-05 08:30:00',
  '验证随钻测量仪器串在 3122 米管线长度下的数据采集、供电和通讯能力。',
  '水循环测试',
  '3122米',
  'yes',
  'yes',
  '王海、郭敏、杨工',
  '3122米管线、供电模块、通讯采集箱、压力表',
  '测量短节 + 电池短节 + 通讯短节 + 传感短节',
  '1. 绝缘检查；2. 上电自检；3. 3122米循环；4. 指令下发；5. 数据导出。',
  '长管线测试需确认固定点，通电前完成绝缘检查。',
  '水循环测试台',
  '2026-06-05',
  '08:30:00',
  '12:30:00',
  3,
  NOW(),
  NOW()
);

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '导向控制器', 'NAV-202, NAV-203', 2
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-001';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '压力短节', 'PS-877-01', 1
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-001';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '水平钻机通讯模块', 'HD-1500-01, HD-1500-02', 2
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-002';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '水平钻机控制短节', 'HD-CTRL-01', 1
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-002';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '螺杆马达整机', 'MD-440-01', 1
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-003';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '马达控制短节', 'MD-CTRL-02', 1
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-003';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '流量计', 'FLOW-440-01', 1
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-003';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '随钻测量短节', 'MWD-3122-01', 1
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-004';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '电池短节', 'BAT-3122-02', 1
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-004';

INSERT INTO water_cycle_order_instrument (order_id, instrument_name, sn_numbers, quantity)
SELECT id, '通讯短节和传感短节', 'COM-3122-03, SEN-3122-04', 2
FROM water_cycle_order
WHERE task_number = 'WC-TASK-20260526-004';
