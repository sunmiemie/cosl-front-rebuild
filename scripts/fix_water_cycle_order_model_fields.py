from pathlib import Path


MODELS = Path(r"D:\Users\Desktop\cnooc-backend\shared_models\models.py")


FIELDS = '''    table_no = models.CharField("表格编号", max_length=100, unique=True, null=True, blank=True)
    applicant_phone = models.CharField("申请人电话", max_length=50, blank=True, default="")
    test_application_unit = models.CharField("测试申请单位", max_length=255, blank=True, default="")
    test_application_unit_manager = models.CharField("测试申请单位负责人", max_length=100, blank=True, default="")
    research_number = models.CharField("科研编号", max_length=100, blank=True, default="")
    application_date = models.DateField("申请日期", null=True, blank=True)
    project_budget_number = models.CharField("项目预算编号", max_length=100, blank=True, default="")
    project_name = models.CharField("项目名称", max_length=255, blank=True, default="")
    quantity = models.IntegerField("数量", default=1)
    client = models.CharField("委托人", max_length=100, blank=True, default="")
    planned_time = models.DateTimeField("时间", null=True, blank=True)
    test_purpose = models.TextField("测试目的", blank=True, default="")
    test_type = models.CharField("测试类型", max_length=100, blank=True, default="")
    project_members = models.TextField("项目成员", blank=True, default="")
    equipment_list = models.TextField("设备清单", blank=True, default="")
    instrument_combination = models.TextField("仪器串组合", blank=True, default="")
    test_steps = models.TextField("测试步骤", blank=True, default="")
    safety_risks = models.TextField("安全风险及预防措施", blank=True, default="")
'''


def main():
    text = MODELS.read_text(encoding="utf-8")
    start = text.index("class WaterCycleOrder(models.Model):")
    end = text.index("class WaterCycleOrderInstrument(models.Model):", start)
    block = text[start:end]
    if "applicant_phone = models.CharField(\"申请人电话\"" in block:
        print("WaterCycleOrder fields already present")
        return

    lines = block.splitlines(keepends=True)
    output = []
    inserted = False
    for line in lines:
        output.append(line)
        if not inserted and "task_number = models.CharField" in line:
            output.append(FIELDS)
            inserted = True
    if not inserted:
        raise RuntimeError("task_number field not found in WaterCycleOrder")

    text = text[:start] + "".join(output) + text[end:]
    MODELS.write_text(text, encoding="utf-8")
    print("WaterCycleOrder fields patched")


if __name__ == "__main__":
    main()
