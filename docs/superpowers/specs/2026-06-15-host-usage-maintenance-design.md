# 主机管理使用与维保设计

## 背景

主机管理当前位于设备管理的主机管理页面，数据来自后端 `Psi` 模型和数据库表 `psi`。页面目前提供主机列表、新增、编辑、删除和基础详情查看。

模拟井的使用与维保已经整合在仪器详情中，通过详情抽屉展示使用记录、维保记录、维保周期配置和维保提醒记录。主机管理的使用与维保也采用同样的交互位置和视觉风格；参考 HTML 仅用于确认字段口径，不直接复用其独立页面样式。

## 目标

在主机管理中补齐“使用与维保”能力：

- 主机列表保持现有入口。
- 点击“查看”进入主机详情抽屉。
- 详情中展示主机基础信息，并增加“使用记录”“维保记录”“维保周期配置”“维保提醒”四个 Tab。
- 使用记录先支持管理端手动维护，后续可以接入工单测试过程自动累计。
- 主机使用与维保数据独立建表，不复用模拟井 `sim_instrument_*` 表，避免不同设备域数据混淆。

## 前端设计

页面位置保持在 `src/views/devicemanage/device/psi/index.vue`。

现有“查看”弹窗改为详情抽屉，布局参考模拟井仪器详情：

- 顶部摘要：主机名称、SN号、型号、所属测试台、设备状态、在线状态。
- 基础信息区：SN号、设备名称、所属测试台、型号、设备状态、在线状态。
- Tab 区：
  - 使用记录
  - 维保记录
  - 维保周期配置
  - 维保提醒

使用记录字段：

- 记录ID
- 主机SN
- 主机名称
- 所属测试台
- 关联工单
- 使用日期
- 运转时长(h)
- 使用状态
- 备注

使用记录支持新增、编辑、删除。第一版为手动维护，保存后更新该主机累计运转时长和提醒状态。

维保记录字段：

- 记录ID
- 主机SN
- 维保日期
- 维保类型
- 维保人员
- 维保内容
- 维保结果
- 备注

维保记录支持新增、编辑、删除。新增维保记录时，如果结果为“合格”，默认可作为一次有效维保，刷新上次维保日期并重算提醒状态。

维保周期配置字段：

- 主机SN
- 维保周期(h)
- 上次维保日期
- 下次维保日期

周期配置支持单台主机独立编辑。下次维保日期按上次维保日期展示，小时阈值主要用于运转时长提醒。

维保提醒字段：

- 主机SN
- 累计运转(h)
- 维保周期(h)
- 剩余时长(h)
- 提醒状态

提醒状态为：

- 正常：剩余时长大于提醒阈值。
- 即将维保：剩余时长大于等于 0 且小于等于提醒阈值。
- 已过期：剩余时长小于 0。

默认提醒阈值为 50h。

## 后端设计

保留现有主机表 `psi` 和主机型号表 `psimodel`。

新增三类主机维保相关模型和表：

- `HostUsageRecord`，表名 `host_usage_record`
- `HostMaintenanceRecord`，表名 `host_maintenance_record`
- `HostMaintenanceConfig`，表名 `host_maintenance_config`

`HostUsageRecord` 主要字段：

- `host`：关联 `Psi`
- `host_sn`
- `host_name`
- `test_bench`
- `work_order_no`
- `usage_date`
- `duration_hours`
- `status`
- `remark`
- `created_at`
- `updated_at`

`HostMaintenanceRecord` 主要字段：

- `host`：关联 `Psi`
- `host_sn`
- `host_name`
- `maintenance_date`
- `maintenance_type`
- `maintainer`
- `content`
- `result`
- `remark`
- `created_at`
- `updated_at`

`HostMaintenanceConfig` 主要字段：

- `host`：一对一关联 `Psi`
- `cycle_hours`
- `last_maintenance_date`
- `next_maintenance_date`
- `warning_threshold_hours`
- `created_at`
- `updated_at`

累计运转时长不冗余写入主机表，接口按使用记录汇总。下次维保日期作为配置字段保存，用于页面展示；小时提醒仍以累计运转时长、维保周期和提醒阈值实时计算返回，减少状态不一致。

## API 设计

接口放在设备管理应用下，前缀使用 `equipment/host-maintenance/`：

- `GET usage-records/list`：按主机、SN、工单号、日期、状态分页查询使用记录。
- `POST usage-records/create`：新增使用记录。
- `POST usage-records/update/<record_id>/`：编辑使用记录。
- `DELETE usage-records/delete/<record_id>/`：删除使用记录。
- `GET maintenance-records/list`：按主机、SN、维保类型、日期分页查询维保记录。
- `POST maintenance-records/create`：新增维保记录。
- `POST maintenance-records/update/<record_id>/`：编辑维保记录。
- `DELETE maintenance-records/delete/<record_id>/`：删除维保记录。
- `GET config/detail`：读取主机维保周期配置和提醒摘要。
- `POST config/update`：更新单台主机维保周期、上次维保日期、下次维保日期和提醒阈值。
- `GET reminders/list`：返回按当前使用记录和配置计算出的提醒列表。

## 数据流

1. 主机列表沿用 `equipment/device-instance/list`。
2. 用户点击“查看”后，前端打开详情抽屉。
3. 抽屉加载主机详情、使用记录、维保记录、周期配置和提醒信息。
4. 新增或编辑使用记录后，前端刷新使用记录、周期配置摘要和提醒信息。
5. 新增有效维保记录后，前端刷新维保记录、周期配置摘要和提醒信息。

## 错误处理

- 主机不存在时返回 404，前端提示“主机不存在”。
- 使用日期、维保日期、运转时长、维保周期等关键字段缺失时返回 400，前端显示后端错误信息。
- 删除记录前使用二次确认。
- 接口失败时保留抽屉，不清空已有可见数据。

## 测试

前端测试：

- 主机详情打开后能加载四个 Tab。
- 使用记录新增、编辑、删除会调用正确接口。
- 维保记录新增、编辑、删除会调用正确接口。
- 周期配置保存后刷新提醒信息。

后端测试：

- 使用记录 CRUD。
- 维保记录 CRUD。
- 周期配置创建和更新。
- 提醒状态按累计运转时长、维保周期和提醒阈值正确计算。
- 主机不存在、非法运转时长、非法日期返回明确错误。

## 不在本次范围

- 不接入工单测试过程自动生成使用记录。
- 不改造主机型号管理。
- 不复用或迁移模拟井使用与维保数据。
- 不新增独立“主机使用与维保”菜单。
