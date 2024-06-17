import { defineComponent, reactive, onMounted } from "vue"
import Draw from "./draw"
import { everydayTestList } from '@/api/screen/index'
export default defineComponent({
  components: {
    Draw
  },
  setup() {
    let cdata = reactive({
      category: [
      ],
      // 异常
      lineData: [
       
      ],
      // 正常
      barData: [
      ],
      // 已创建
      rateData: []
    })

    // methods
    const setData = () => {
      for (let i = 0; i < cdata.barData.length - 1; i++) {
        const rate = cdata.barData[i] / cdata.lineData[i]
        cdata.rateData.push(rate.toFixed(2))
      }
    }
    function currentTime() {
      const time = new Date()
      const year = time.getFullYear().toString()
      let month = (time.getMonth() + 1).toString()
      let day = time.getDate().toString()
      // Add a zero at the beginning if month is less than 10
      if (Number(month) < 10) {
        month = "0" + month
      }
      // Add a zero at the beginning if day is less than 10
      if (Number(day) < 10) {
        day = "0" + day
      }
      return `${year}-${month}-${day}`
    }
    const getData = () => {
      everydayTestList().then((res) => {
        // cdata = res.data
        cdata.category = res.data.category
        cdata.barData = res.data.bar_data
        cdata.lineData = res.data.line_data
        cdata.rateData = res.data.rate_data
        cdata = { ...cdata }
      })
    }
    // 生命周期
    onMounted(() => {
      getData()
      setData()
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
