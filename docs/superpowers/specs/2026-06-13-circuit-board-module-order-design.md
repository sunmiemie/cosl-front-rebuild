# 电路板模块独立表设计

## 目标

电路板模块不能再复用 `commission_board_relation`。本次调整要新建独立的数据表保存电路板模块工单数据，并恢复 `commission_board_relation` 原本的电路板管理关系表职责。

最终新表名称：

```text
circuit_board_module_order
```

## 当前问题

前端电路板模块页面已经有独立 API 模块，但后端仍复用 `CommissionBoardRelation` 和物理表 `commission_board_relation`。

这会导致两个问题：

1. 电路板模块工单数据和原有电路板管理关系数据混在同一张表里。
2. 排程字段被加到了 `commission_board_relation`，旧表职责被污染。

## 推荐方案

采用单表方案，新建 `CircuitBoardModuleOrder` 模型，对应物理表 `circuit_board_module_order`。

不采用主表加子表方案，原因是当前页面和排程逻辑只需要按申请单/工单整体展示、排程和打印二维码。模块下电路板列表可以先存为 JSON，后续如果需要单板级生命周期再拆子表。

## 数据模型

新增模型 `CircuitBoardModuleOrder`，字段如下：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | AutoField | 主键 |
| `order_no` | CharField unique | 申请单/工单号 |
| `module_name` | CharField | 电路板模块名称 |
| `spec_model` | CharField nullable | 型号/规格 |
| `quantity` | IntegerField | 数量 |
| `device` | CharField nullable | 检验设备 |
| `hours` | DecimalField nullable | 工时 |
| `inspector` | CharField nullable | 检验人 |
| `done_at` | CharField nullable | 完成时间文本，兼容现有页面字段 |
| `applicant` | CharField nullable | 申请人 |
| `applicant_phone` | CharField nullable | 申请人电话 |
| `client` | CharField nullable | 委托单位 |
| `boards` | JSONField | 模块下电路板列表，用于批量打印二维码 |
| `status` | IntegerField | 工单状态，对齐高温箱 |
| `scheduled_start_at` | DateTimeField nullable | 排程开始时间 |
| `scheduled_end_at` | DateTimeField nullable | 排程结束时间 |
| `schedule_segments` | JSONField | 跨天或多段排程区段 |
| `created_at` | DateTimeField | 创建时间 |
| `updated_at` | DateTimeField | 更新时间 |

## 状态设计

`status` 必须和高温箱工单一致，使用整数状态：

```text
0 已创建
1 待领取
2 测试中
3 待审核
4 待重做
5 正常
6 异常
7 暂存
8 疑问
```

`已排程` 不保存为 `status`。排程状态通过 `scheduled_start_at`、`scheduled_end_at` 或 `schedule_segments` 判断：

- `status = 1` 且没有排程时间：待排程/待领取
- `status = 1` 且有排程时间：已排程
- `status = 2`：测试中
- 其他状态按高温箱状态展示

## 旧表恢复

`commission_board_relation` 继续保留给原来的电路板管理/关系功能使用。

恢复动作：

1. `CommissionBoardRelation` 模型移除本次误加的排程字段：
   - `scheduled_start_at`
   - `scheduled_end_at`
   - `schedule_segments`
2. 数据库迁移中如果旧表已经存在这些字段，要删除这些字段。
3. 清理旧表中属于电路板模块工单的演示或同步数据。

为了兼容当前本地数据库已经应用过未提交的 `0028_halt_hass_circuit_schedule.py`，实现时需要：

1. 调整未提交的 `0028`，让它不再把排程字段加到 `commission_board_relation`。
2. 新增后续迁移，创建 `circuit_board_module_order`，并用守卫 SQL 删除旧表上可能已经存在的误加字段。

## 模拟数据

迁移中写入几条电路板模块模拟数据到新表，供管理端页面和工单排程验证：

1. `CBM-DEMO-20260613001`，状态 `1`，未排程。
2. `CBM-DEMO-20260613002`，状态 `1`，未排程。
3. `CBM-DEMO-20260613003`，状态 `2`，测试中。

每条数据的 `boards` 中至少包含 2 个电路板条目，包含序列号、型号和二维码打印所需文本。

## 接口调整

前端可以继续使用现有电路板模块 API 封装，但后端实现必须改读新表。

需要调整的后端接口：

- `GET data/assistant/commission-board-relation/list`
- `POST data/assistant/commission-board-relation/sync`

实现时可以保留原 URL 以减少前端改动，但函数内部改为访问 `CircuitBoardModuleOrder`。如果新增更语义化的 URL，也要同步前端 API。

工单排程里的电路板模块也必须改为读取 `circuit_board_module_order`，保存和删除排程也写入该表。

## 打印二维码

打印二维码功能保留。

电路板模块列表中的打印二维码要打印当前模块下所有电路板的二维码，不弹出二维码预览弹窗，行为继续复用系统已有打印能力。

## 测试与验证

后端验证：

1. `python manage.py check`
2. 执行迁移后确认新表存在：
   - `circuit_board_module_order`
3. 确认旧表不再包含：
   - `scheduled_start_at`
   - `scheduled_end_at`
   - `schedule_segments`
4. 确认新表有模拟数据。

前端验证：

1. `pnpm vitest run tests/circuit-board-module-admin.test.ts tests/work-order-schedule-page.test.ts tests/work-order-schedule-api.test.ts tests/work-order-schedule-status.test.ts`
2. `pnpm exec vue-tsc --noEmit`
3. 管理端电路模块检验中的电路板模块只显示新表数据。
4. 工单排程中的电路板模块显示已发布的待领取数据。
5. 排程后管理端日历能显示方块，测试端读取同一后端排程数据。
