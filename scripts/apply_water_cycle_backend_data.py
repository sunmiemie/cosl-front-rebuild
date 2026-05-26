from pathlib import Path


BACKEND = Path(r"D:\Users\Desktop\cnooc-backend")
MODELS = BACKEND / "shared_models" / "models.py"
SERIALIZERS = BACKEND / "test_management_app" / "serializers.py"


def patch_models():
    text = MODELS.read_text(encoding="utf-8")
    if "applicant_phone = models.CharField(\"申请人电话\"" not in text:
        marker = '    task_number = models.CharField("任务单号", max_length=100, unique=True)\n'
        insert = (
            '    table_no = models.CharField("表格编号", max_length=100, unique=True, null=True, blank=True)\n'
            '    applicant_phone = models.CharField("申请人电话", max_length=50, blank=True, default="")\n'
            '    test_application_unit = models.CharField("测试申请单位", max_length=255, blank=True, default="")\n'
            '    test_application_unit_manager = models.CharField("测试申请单位负责人", max_length=100, blank=True, default="")\n'
            '    research_number = models.CharField("科研编号", max_length=100, blank=True, default="")\n'
            '    application_date = models.DateField("申请日期", null=True, blank=True)\n'
            '    project_budget_number = models.CharField("项目预算编号", max_length=100, blank=True, default="")\n'
            '    project_name = models.CharField("项目名称", max_length=255, blank=True, default="")\n'
            '    quantity = models.IntegerField("数量", default=1)\n'
            '    client = models.CharField("委托人", max_length=100, blank=True, default="")\n'
            '    planned_time = models.DateTimeField("时间", null=True, blank=True)\n'
            '    test_purpose = models.TextField("测试目的", blank=True, default="")\n'
            '    test_type = models.CharField("测试类型", max_length=100, blank=True, default="")\n'
            '    project_members = models.TextField("项目成员", blank=True, default="")\n'
            '    equipment_list = models.TextField("设备清单", blank=True, default="")\n'
            '    instrument_combination = models.TextField("仪器串组合", blank=True, default="")\n'
            '    test_steps = models.TextField("测试步骤", blank=True, default="")\n'
            '    safety_risks = models.TextField("安全风险及预防措施", blank=True, default="")\n'
        )
        text = text.replace(marker, marker + insert)

    if "class WaterCycleOrderInstrument(models.Model):" not in text:
        marker = "\n\nclass WaterCycleReport(models.Model):"
        insert = '''

class WaterCycleOrderInstrument(models.Model):
    """水循环工单待测仪器明细"""

    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(
        WaterCycleOrder,
        on_delete=models.CASCADE,
        related_name="instruments",
        db_column="order_id",
    )
    instrument_name = models.CharField("待测仪器", max_length=255)
    sn_numbers = models.TextField("仪器SN号（资产号，多个）", blank=True, default="")
    quantity = models.IntegerField("数量", default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "water_cycle_order_instrument"
        ordering = ["id"]
'''
        text = text.replace(marker, insert + marker)

    MODELS.write_text(text, encoding="utf-8")


def patch_serializers():
    text = SERIALIZERS.read_text(encoding="utf-8")
    if "WaterCycleOrderInstrument" not in text.split("from shared_models.models import", 1)[-1].split(")", 1)[0]:
        text = text.replace("WaterCycleOrder,", "WaterCycleOrder,\n    WaterCycleOrderInstrument,")

    if "class WaterCycleOrderInstrumentSerializer" not in text:
        text = text.replace(
            "class WaterCycleOrderSerializer(serializers.ModelSerializer):\n",
            "class WaterCycleOrderInstrumentSerializer(serializers.ModelSerializer):\n"
            "    class Meta:\n"
            "        model = WaterCycleOrderInstrument\n"
            "        fields = [\"id\", \"instrument_name\", \"sn_numbers\", \"quantity\"]\n\n\n"
            "class WaterCycleOrderSerializer(serializers.ModelSerializer):\n"
            "    instruments = WaterCycleOrderInstrumentSerializer(many=True, read_only=True)\n",
        )
    elif "instruments = WaterCycleOrderInstrumentSerializer" not in text:
        text = text.replace(
            "class WaterCycleOrderSerializer(serializers.ModelSerializer):\n",
            "class WaterCycleOrderSerializer(serializers.ModelSerializer):\n"
            "    instruments = WaterCycleOrderInstrumentSerializer(many=True, read_only=True)\n",
        )

    SERIALIZERS.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    patch_models()
    patch_serializers()
    print("patched backend model and serializer")
