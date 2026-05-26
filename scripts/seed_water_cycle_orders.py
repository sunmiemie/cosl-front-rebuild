import os
import sys
from pathlib import Path


BACKEND = Path(r"D:\Users\Desktop\cnooc-backend")
sys.path.insert(0, str(BACKEND))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django  # noqa: E402

django.setup()

from django.core.cache import cache  # noqa: E402
from django.db import connection  # noqa: E402


ORDER_TABLE = "water_cycle_order"
INSTRUMENT_TABLE = "water_cycle_order_instrument"


def table_names():
    return set(connection.introspection.table_names())


def column_names(table_name):
    with connection.cursor() as cursor:
        return {column.name for column in connection.introspection.get_table_description(cursor, table_name)}


def add_column_if_missing(cursor, existing, name, ddl):
    if name not in existing:
        cursor.execute(f"ALTER TABLE {ORDER_TABLE} ADD COLUMN {name} {ddl}")
        existing.add(name)


def ensure_schema():
    tables = table_names()
    if ORDER_TABLE not in tables:
        raise RuntimeError(f"Missing table: {ORDER_TABLE}")

    existing = column_names(ORDER_TABLE)
    with connection.cursor() as cursor:
        add_column_if_missing(cursor, existing, "table_no", "varchar(100) NULL UNIQUE")
        add_column_if_missing(cursor, existing, "applicant_phone", "varchar(50) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "test_application_unit", "varchar(255) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "test_application_unit_manager", "varchar(100) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "research_number", "varchar(100) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "application_date", "date NULL")
        add_column_if_missing(cursor, existing, "project_budget_number", "varchar(100) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "project_name", "varchar(255) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "quantity", "int NOT NULL DEFAULT 1")
        add_column_if_missing(cursor, existing, "client", "varchar(100) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "planned_time", "datetime(6) NULL")
        add_column_if_missing(cursor, existing, "test_purpose", "longtext NULL")
        add_column_if_missing(cursor, existing, "test_type", "varchar(100) NOT NULL DEFAULT ''")
        add_column_if_missing(cursor, existing, "project_members", "longtext NULL")
        add_column_if_missing(cursor, existing, "equipment_list", "longtext NULL")
        add_column_if_missing(cursor, existing, "instrument_combination", "longtext NULL")
        add_column_if_missing(cursor, existing, "test_steps", "longtext NULL")
        add_column_if_missing(cursor, existing, "safety_risks", "longtext NULL")

        if INSTRUMENT_TABLE not in tables:
            cursor.execute(
                f"""
                CREATE TABLE {INSTRUMENT_TABLE} (
                  id int NOT NULL AUTO_INCREMENT,
                  order_id int NOT NULL,
                  instrument_name varchar(255) NOT NULL,
                  sn_numbers longtext NULL,
                  quantity int NOT NULL DEFAULT 1,
                  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                  updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                  PRIMARY KEY (id),
                  KEY idx_water_cycle_order_instrument_order_id (order_id),
                  CONSTRAINT fk_water_cycle_order_instrument_order
                    FOREIGN KEY (order_id) REFERENCES water_cycle_order (id)
                    ON DELETE CASCADE
                )
                """
            )


ORDERS = [
    {
        "table_no": "WC-FORM-20260526-001",
        "task_number": "WC-TASK-20260526-001",
        "applicant": "张明",
        "applicant_phone": "13800010001",
        "test_application_unit": "中海油服实验中心",
        "test_application_unit_manager": "李强",
        "research_number": "KY-2026-WC-001",
        "application_date": "2026-05-26",
        "project_budget_number": "YS-2026-041",
        "project_name": "螺杆钻具水循环验证项目",
        "device_name": "导向控制器 / 压力短节",
        "device_number": "NAV-202, NAV-203, PS-877-01",
        "quantity": 3,
        "client": "王工",
        "planned_time": "2026-05-28 09:00:00",
        "test_purpose": "验证螺杆钻具在不同管线长度下的循环稳定性和通讯可靠性。",
        "test_type": "螺杆钻具测试",
        "flow_process": "877米",
        "need_command_transfer": "yes",
        "need_pressure_test": "yes",
        "project_members": "张明、王工、刘工",
        "equipment_list": "水循环测试台、压力传感器、采集工控机",
        "instrument_combination": "导向控制器 + 压力短节 + 通讯短节",
        "test_steps": "1. 设备连接检查；2. 空循环；3. 加压循环；4. 数据回收。",
        "safety_risks": "高压管线连接需复核，测试前完成泄压确认和人员隔离。",
        "test_platform": "水循环测试台",
        "test_date": "2026-05-28",
        "start_time": "09:00:00",
        "end_time": "12:00:00",
        "status": 0,
        "instruments": [
            ("导向控制器", "NAV-202, NAV-203", 2),
            ("压力短节", "PS-877-01", 1),
        ],
    },
    {
        "table_no": "WC-FORM-20260526-002",
        "task_number": "WC-TASK-20260526-002",
        "applicant": "赵磊",
        "applicant_phone": "13900020002",
        "test_application_unit": "钻井工具事业部",
        "test_application_unit_manager": "陈晨",
        "research_number": "KY-2026-WC-002",
        "application_date": "2026-05-26",
        "project_budget_number": "YS-2026-052",
        "project_name": "水平钻机长距离循环测试",
        "device_name": "水平钻机通讯模块 / 控制短节",
        "device_number": "HD-1500-01, HD-1500-02, HD-CTRL-01",
        "quantity": 3,
        "client": "赵工",
        "planned_time": "2026-06-01 14:00:00",
        "test_purpose": "评估水平钻机在长距离管线下的指令下发能力。",
        "test_type": "水平钻机测试",
        "flow_process": "1500米",
        "need_command_transfer": "yes",
        "need_pressure_test": "no",
        "project_members": "赵磊、陈晨、孙工",
        "equipment_list": "水平钻机、通讯模块、上位机",
        "instrument_combination": "通讯模块 + 控制短节 + 采集模块",
        "test_steps": "1. 通讯检查；2. 1500米循环；3. 指令下发；4. 异常记录。",
        "safety_risks": "注意电气连接防水，管线移动时设置警戒线。",
        "test_platform": "水循环测试台",
        "test_date": "2026-06-01",
        "start_time": "14:00:00",
        "end_time": "17:00:00",
        "status": 1,
        "instruments": [
            ("水平钻机通讯模块", "HD-1500-01, HD-1500-02", 2),
            ("水平钻机控制短节", "HD-CTRL-01", 1),
        ],
    },
    {
        "table_no": "WC-FORM-20260526-003",
        "task_number": "WC-TASK-20260526-003",
        "applicant": "李娜",
        "applicant_phone": "13700030003",
        "test_application_unit": "井下仪器研发部",
        "test_application_unit_manager": "周航",
        "research_number": "KY-2026-WC-003",
        "application_date": "2026-05-27",
        "project_budget_number": "YS-2026-063",
        "project_name": "螺杆马达整机小循环测试",
        "device_name": "螺杆马达整机 / 马达控制短节 / 流量计",
        "device_number": "MD-440-01, MD-CTRL-02, FLOW-440-01",
        "quantity": 3,
        "client": "李工",
        "planned_time": "2026-06-03 10:00:00",
        "test_purpose": "验证螺杆马达整机在小循环工况下的流量响应和控制稳定性。",
        "test_type": "螺杆马达整机测试",
        "flow_process": "小循环",
        "need_command_transfer": "no",
        "need_pressure_test": "yes",
        "project_members": "李娜、周航、何工",
        "equipment_list": "小循环管线、流量计、扭矩采集模块",
        "instrument_combination": "马达整机 + 控制短节 + 流量计",
        "test_steps": "1. 小循环管线检查；2. 低压启动；3. 分段调压；4. 记录流量曲线。",
        "safety_risks": "调压阶段需双人复核阀门状态，避免瞬时压力冲击。",
        "test_platform": "水循环测试台",
        "test_date": "2026-06-03",
        "start_time": "10:00:00",
        "end_time": "13:00:00",
        "status": 2,
        "instruments": [
            ("螺杆马达整机", "MD-440-01", 1),
            ("马达控制短节", "MD-CTRL-02", 1),
            ("流量计", "FLOW-440-01", 1),
        ],
    },
    {
        "table_no": "WC-FORM-20260526-004",
        "task_number": "WC-TASK-20260526-004",
        "applicant": "王海",
        "applicant_phone": "13600040004",
        "test_application_unit": "海洋工程测试中心",
        "test_application_unit_manager": "郭敏",
        "research_number": "KY-2026-WC-004",
        "application_date": "2026-05-27",
        "project_budget_number": "YS-2026-074",
        "project_name": "水循环测试长管线综合验证",
        "device_name": "随钻测量短节 / 电池短节 / 通讯短节和传感短节",
        "device_number": "MWD-3122-01, BAT-3122-02, COM-3122-03, SEN-3122-04",
        "quantity": 4,
        "client": "郭工",
        "planned_time": "2026-06-05 08:30:00",
        "test_purpose": "验证随钻测量仪器串在 3122 米管线长度下的数据采集、供电和通讯能力。",
        "test_type": "水循环测试",
        "flow_process": "3122米",
        "need_command_transfer": "yes",
        "need_pressure_test": "yes",
        "project_members": "王海、郭敏、杨工",
        "equipment_list": "3122米管线、供电模块、通讯采集箱、压力表",
        "instrument_combination": "测量短节 + 电池短节 + 通讯短节 + 传感短节",
        "test_steps": "1. 绝缘检查；2. 上电自检；3. 3122米循环；4. 指令下发；5. 数据导出。",
        "safety_risks": "长管线测试需确认固定点，通电前完成绝缘检查。",
        "test_platform": "水循环测试台",
        "test_date": "2026-06-05",
        "start_time": "08:30:00",
        "end_time": "12:30:00",
        "status": 3,
        "instruments": [
            ("随钻测量短节", "MWD-3122-01", 1),
            ("电池短节", "BAT-3122-02", 1),
            ("通讯短节和传感短节", "COM-3122-03, SEN-3122-04", 2),
        ],
    },
]


def seed_data():
    task_numbers = [order["task_number"] for order in ORDERS]
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT id FROM {ORDER_TABLE} WHERE task_number IN ({','.join(['%s'] * len(task_numbers))})",
            task_numbers,
        )
        old_ids = [row[0] for row in cursor.fetchall()]
        if old_ids:
            cursor.execute(
                f"DELETE FROM {INSTRUMENT_TABLE} WHERE order_id IN ({','.join(['%s'] * len(old_ids))})",
                old_ids,
            )
            cursor.execute(
                f"DELETE FROM {ORDER_TABLE} WHERE id IN ({','.join(['%s'] * len(old_ids))})",
                old_ids,
            )

        order_columns = [
            "table_no",
            "task_number",
            "applicant",
            "applicant_phone",
            "test_application_unit",
            "test_application_unit_manager",
            "research_number",
            "application_date",
            "project_budget_number",
            "project_name",
            "device_name",
            "device_number",
            "quantity",
            "client",
            "planned_time",
            "test_purpose",
            "test_type",
            "flow_process",
            "need_command_transfer",
            "need_pressure_test",
            "project_members",
            "equipment_list",
            "instrument_combination",
            "test_steps",
            "safety_risks",
            "test_platform",
            "test_date",
            "start_time",
            "end_time",
            "status",
            "remark",
            "created_at",
            "updated_at",
        ]
        placeholders = ", ".join(["%s"] * len(order_columns))
        column_sql = ", ".join(order_columns)
        for order in ORDERS:
            values = [order.get(column, "") for column in order_columns]
            values[order_columns.index("remark")] = "模拟数据"
            values[order_columns.index("created_at")] = "2026-05-26 12:00:00"
            values[order_columns.index("updated_at")] = "2026-05-26 12:00:00"
            cursor.execute(f"INSERT INTO {ORDER_TABLE} ({column_sql}) VALUES ({placeholders})", values)
            order_id = cursor.lastrowid
            for instrument_name, sn_numbers, quantity in order["instruments"]:
                cursor.execute(
                    f"""
                    INSERT INTO {INSTRUMENT_TABLE}
                      (order_id, instrument_name, sn_numbers, quantity, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, NOW(6), NOW(6))
                    """,
                    [order_id, instrument_name, sn_numbers, quantity],
                )

    cache.clear()


if __name__ == "__main__":
    ensure_schema()
    seed_data()
    print(f"seeded {len(ORDERS)} water-cycle orders")
