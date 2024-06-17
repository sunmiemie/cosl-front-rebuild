import { defineComponent, onMounted, onUnmounted, reactive } from "vue"
import Draw from "./draw"
import { getDeviceproportion } from '@/api/screen/index'

export default defineComponent({
  components: {
    Draw
  },
  setup() {
    let intervalInstance = null
    const cdata = reactive({
      xData: ["电路板数量", "夹具数量", "主机数量", "其他设备数量"],
      seriesData: [
        { value: 10, name: "电路板数量" },
        { value: 5, name: "夹具数量" },
        { value: 15, name: "主机数量" },
        { value: 25, name: "其他设备数量" }
      ]
    })
    // intervalInstance = setInterval(() => {
    //   const data = cdata.seriesData
    //   cdata.seriesData = data.map((e) => {
    //     return { value: e.value + 10, name: e.name }
    //   })
    // }, 1000)
    const getData = () => {
      getDeviceproportion().then((res) => {
        cdata.xData = res.data.xData
        cdata.seriesData=res.data.seriesData
        console.log(cdata);

        cdata = { ...cdata }
      })
    }
    onMounted(() => {
      getData()
    })
    onUnmounted(() => {
      // clearInterval(intervalInstance)
    })
    return () => {
      return (
        <div>
          <Draw cdata={cdata} />
        </div>
      )
    }
  }
})
