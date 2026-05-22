-- 振动台工单数据库变更设计
-- 主表：vibration_table_order
-- 子表：vibration_table_order_instrument，一个工单可关联多种待测仪器。

ALTER TABLE vibration_table_order
  ADD COLUMN table_no varchar(64) NOT NULL DEFAULT '' COMMENT '表格编号，系统自动生成',
  ADD COLUMN task_number varchar(64) NOT NULL DEFAULT '' COMMENT '任务单编号，系统自动生成',
  ADD COLUMN applicant_phone varchar(32) NOT NULL DEFAULT '' COMMENT '申请人电话',
  ADD COLUMN test_application_unit varchar(255) NOT NULL DEFAULT '' COMMENT '测试申请单位',
  ADD COLUMN test_application_unit_manager varchar(64) NOT NULL DEFAULT '' COMMENT '测试申请单位负责人',
  ADD COLUMN application_date date NULL COMMENT '申请日期',
  ADD COLUMN research_number varchar(128) NOT NULL DEFAULT '' COMMENT '科研编号',
  ADD COLUMN project_budget_number varchar(128) NOT NULL DEFAULT '' COMMENT '项目预算编号',
  ADD COLUMN project_name varchar(255) NOT NULL DEFAULT '' COMMENT '项目名称',
  ADD COLUMN client varchar(64) NOT NULL DEFAULT '' COMMENT '委托人',
  ADD COLUMN planned_time datetime NULL COMMENT '时间',
  ADD COLUMN test_purpose text NULL COMMENT '测试目的',
  ADD COLUMN test_type varchar(64) NOT NULL DEFAULT '' COMMENT '测试类型：40T振动台测试/5T振动台测试/1.5T冲击台测试',
  ADD COLUMN vibration_direction varchar(64) NOT NULL DEFAULT '' COMMENT '振动方向',
  ADD COLUMN acceleration varchar(64) NOT NULL DEFAULT '' COMMENT '加速度',
  ADD COLUMN slope varchar(64) NOT NULL DEFAULT '' COMMENT '斜率',
  ADD COLUMN frequency varchar(64) NOT NULL DEFAULT '' COMMENT '频率',
  ADD COLUMN vibration_times int NOT NULL DEFAULT 1 COMMENT '振动次数',
  ADD COLUMN project_members text NULL COMMENT '项目成员',
  ADD COLUMN equipment_list text NULL COMMENT '设备清单',
  ADD COLUMN instrument_combination text NULL COMMENT '仪器串组合',
  ADD COLUMN test_steps text NULL COMMENT '测试步骤',
  ADD COLUMN safety_risks text NULL COMMENT '安全风险及预防措施';

CREATE TABLE vibration_table_order_instrument (
  id bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  order_id bigint NOT NULL COMMENT '振动台工单ID',
  instrument_name varchar(255) NOT NULL DEFAULT '' COMMENT '待测仪器',
  sn_numbers text NULL COMMENT '仪器SN号/资产号，多个用逗号或换行分隔',
  quantity int NOT NULL DEFAULT 1 COMMENT '数量',
  weight varchar(64) NOT NULL DEFAULT '' COMMENT '仪器重量',
  length varchar(64) NOT NULL DEFAULT '' COMMENT '仪器长度',
  max_diameter varchar(64) NOT NULL DEFAULT '' COMMENT '仪器最大直径',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_vibration_table_order_instrument_order_id (order_id),
  CONSTRAINT fk_vibration_table_order_instrument_order
    FOREIGN KEY (order_id) REFERENCES vibration_table_order (id)
    ON DELETE CASCADE
) COMMENT='振动台工单待测仪器明细';

CREATE UNIQUE INDEX uk_vibration_table_order_table_no ON vibration_table_order (table_no);
CREATE UNIQUE INDEX uk_vibration_table_order_task_number ON vibration_table_order (task_number);
