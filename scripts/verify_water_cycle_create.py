import os
import sys

sys.path.insert(0, r"D:\Users\Desktop\cnooc-backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django  # noqa: E402

django.setup()

from django.db import transaction  # noqa: E402
from shared_models.models import WaterCycleOrder, WaterCycleOrderInstrument  # noqa: E402
from test_management_app.serializers import WaterCycleOrderSerializer  # noqa: E402


payload = {
    "table_no": "WC-FORM-CREATE-TEST-001",
    "task_number": "WC-TASK-CREATE-TEST-001",
    "applicant": "创建测试",
    "applicant_phone": "13000000000",
    "test_application_unit": "测试单位",
    "test_application_unit_manager": "负责人",
    "research_number": "KY-CREATE",
    "application_date": "2026-05-26",
    "project_budget_number": "YS-CREATE",
    "project_name": "创建接口验证",
    "quantity": 3,
    "device_name": "仪器A / 仪器B",
    "device_number": "A-001,A-002,B-001",
    "client": "委托人",
    "planned_time": "2026-05-26 15:00:00",
    "test_purpose": "验证创建接口",
    "test_type": "水循环测试",
    "flow_process": "440米",
    "need_command_transfer": "yes",
    "need_pressure_test": "no",
    "project_members": "成员",
    "equipment_list": "设备",
    "instrument_combination": "组合",
    "test_steps": "步骤",
    "safety_risks": "风险",
    "test_platform": "水循环测试台",
    "test_date": "2026-05-26",
    "start_time": "15:00:00",
    "end_time": "16:00:00",
    "remark": "创建验证",
}


WaterCycleOrder.objects.filter(task_number=payload["task_number"]).delete()
serializer = WaterCycleOrderSerializer(data=payload)
print("valid", serializer.is_valid(), serializer.errors)
if serializer.is_valid():
    with transaction.atomic():
        order = serializer.save()
        WaterCycleOrderInstrument.objects.create(order=order, instrument_name="仪器A", sn_numbers="A-001,A-002", quantity=2)
        WaterCycleOrderInstrument.objects.create(order=order, instrument_name="仪器B", sn_numbers="B-001", quantity=1)
        print("created", order.id, WaterCycleOrderSerializer(order).data["task_number"], len(WaterCycleOrderSerializer(order).data["instruments"]))
        order.delete()
        print("deleted test order")
