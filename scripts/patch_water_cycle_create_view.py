from pathlib import Path


VIEWS = Path(r"D:\Users\Desktop\cnooc-backend\test_management_app\views.py")


OLD = '''def water_cycle_order_create(request):
    """
    创建水循环工单
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"code": -1, "msg": "请求参数错误"}, status=400)

    serializer = WaterCycleOrderSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        _invalidate_water_cycle_order_list_cache()
        return JsonResponse({"code": 0, "msg": "创建成功", "data": serializer.data})

    return JsonResponse(
        {"code": -1, "msg": "创建失败", "errors": serializer.errors}, status=400
    )
'''


NEW = '''def water_cycle_order_create(request):
    """
    创建水循环工单
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"code": -1, "msg": "请求参数错误"}, status=400)

    instruments = data.pop("instruments", []) or []
    serializer = WaterCycleOrderSerializer(data=data)
    if serializer.is_valid():
        with transaction.atomic():
            order = serializer.save()
            for item in instruments:
                instrument_name = (item.get("instrument_name") or "").strip()
                sn_numbers = (item.get("sn_numbers") or "").strip()
                quantity = item.get("quantity") or 1
                if not instrument_name and not sn_numbers:
                    continue
                WaterCycleOrderInstrument.objects.create(
                    order=order,
                    instrument_name=instrument_name,
                    sn_numbers=sn_numbers,
                    quantity=quantity,
                )
        _invalidate_water_cycle_order_list_cache()
        return JsonResponse({"code": 0, "msg": "创建成功", "data": WaterCycleOrderSerializer(order).data})

    return JsonResponse(
        {"code": -1, "msg": "创建失败", "errors": serializer.errors}, status=400
    )
'''


def main():
    text = VIEWS.read_text(encoding="utf-8")
    if "WaterCycleOrderInstrument.objects.create(" in text:
        print("water_cycle_order_create already patched")
        return
    if OLD not in text:
        raise RuntimeError("Target water_cycle_order_create block not found")
    VIEWS.write_text(text.replace(OLD, NEW), encoding="utf-8")
    print("patched water_cycle_order_create")


if __name__ == "__main__":
    main()
