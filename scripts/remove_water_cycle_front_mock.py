from pathlib import Path


FILE = Path("src/views/testmanage/testorder/components/WaterCycleOrder.vue")


def remove_block(text: str, start_marker: str, end_marker: str) -> str:
    start = text.index(start_marker)
    end = text.index(end_marker, start)
    return text[:start] + text[end:]


def main():
    text = FILE.read_text(encoding="utf-8")
    if "const mockWaterCycleOrders" in text:
        text = remove_block(text, "const mockWaterCycleOrders: WaterCycleOrderDetail[] = [", "const canCreate = computed")
        text = text.replace("const canCreate = computed", "const canCreate = computed")

    if "const getMockOrders = () =>" in text:
        text = remove_block(text, "const getMockOrders = () =>", "const getList = async () =>")
        text = text.replace("const getList = async () =>", "const getList = async () =>")

    text = text.replace(
        '''    if (res.code === 0) {
      const list = res.data?.list || []
      if (list.length > 0) {
        tableData.value = list
        pagination.total = res.data.total
      } else {
        useMockOrders()
      }
    }
  } catch (e) {
    console.error(e)
    useMockOrders()
  } finally {''',
        '''    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {''',
    )

    text = text.replace(
        '''const handleDetail = async (row: WaterCycleOrderListItem) => {
  try {
    const res = await getWaterCycleOrderDetailApi(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
      return
    }
  } catch (e) {
    console.error(e)
  }
  const mockOrder = mockWaterCycleOrders.find((item) => item.id === row.id)
  if (mockOrder) {
    currentOrder.value = mockOrder
    detailDialogVisible.value = true
    return
  }
  ElMessage.error("获取详情失败")
}
''',
        '''const handleDetail = async (row: WaterCycleOrderListItem) => {
  try {
    const res = await getWaterCycleOrderDetailApi(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}
''',
    )

    FILE.write_text(text, encoding="utf-8")
    print("removed frontend mock fallback")


if __name__ == "__main__":
    main()
