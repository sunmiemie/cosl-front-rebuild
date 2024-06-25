<template>
  <div class="app-container">
    <el-card class="test-check">
      <!-- 审核测试工艺 -->
      <h2>审核测试工艺</h2>
      <el-button type="primary" style="margin: 20px 10px">功能性测试1</el-button>
      <div style="display: flex; margin-top: 10px">
            <div v-if="props.type=='eyes'">{{data}}
              <div v-if="currentProcess=='eyes'"
                   style="width: calc(100vw - 40px); height: calc(100vh - 160px); background: rgba(245,246,248,0.5); margin-right: 10px; border-radius: 6px">
                <div style="display: flex; align-items: center; padding: 6px">
                  <div style="display: flex; align-items: center">
                    <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path
                            d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"></path>
                      </svg>
                    </el-icon>
                    <el-text style="font-size: 18px">目检流程预览</el-text>
                  </div>
                </div>
                <el-divider style="margin-top: 0; margin-bottom: 0"/>
                <!--<process-preview v-model:preview-list="processJson.eyes"/>-->
              </div>
              <div v-if="currentProcess=='eyesBak'" style="display: flex; align-items: center">
                <div
                    style="width: calc(50vw - 25px); height: calc(100vh - 160px); background: rgba(245,246,248,0.5); margin-right: 10px; border-radius: 6px">
                  <div style="display: flex; align-items: center; padding: 6px">
                    <div style="display: flex; align-items: center">
                      <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path
                              d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"></path>
                        </svg>
                      </el-icon>
                      <el-text style="font-size: 18px">正面目检流程预览</el-text>
                    </div>
                  </div>
                  <el-divider style="margin-top: 0; margin-bottom: 0"/>
                  <process-preview v-model:preview-list="processJson.eyes" :has-plane="true"/>
                </div>
                <div
                    style="width: calc(50vw - 25px); height: calc(100vh - 160px); background: rgba(245,246,248,0.5); margin-right: 10px; border-radius: 6px">
                  <div style="display: flex; align-items: center; padding: 6px">
                    <div style="display: flex; align-items: center">
                      <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path
                              d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"></path>
                        </svg>
                      </el-icon>
                      <el-text style="font-size: 18px">背面目检流程预览</el-text>
                    </div>
                  </div>
                  <el-divider style="margin-top: 0; margin-bottom: 0"/>
                  <process-preview v-model:preview-list="processJson.eyesBak" :has-plane="false"/>
                </div>
              </div>
            </div>
            <div v-if="props.type=='xray'"
                 style="width: calc(100vw - 40px); height: calc(100vh - 160px); background: rgba(245,246,248,0.5); border-radius: 6px">
              <div style="display: flex; align-items: center; padding: 6px">
                <div style="display: flex; align-items: center">
                  <el-icon style="font-size: 20px; margin-right: 10px; margin-left: 10px">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path
                          d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8H8V10H13V9C13 8.44772 13.4477 8 14 8H20C20.5523 8 21 8.44772 21 9V13C21 13.5523 20.5523 14 20 14H14C13.4477 14 13 13.5523 13 13V12H8V18H13V17C13 16.4477 13.4477 16 14 16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H14C13.4477 22 13 21.5523 13 21V20H7C6.44772 20 6 19.5523 6 19V8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H10ZM19 18H15V20H19V18ZM19 10H15V12H19V10ZM9 4H5V6H9V4Z"></path>
                    </svg>
                  </el-icon>
                  <el-text style="font-size: 18px">X-Ray流程预览</el-text>
                </div>
              </div>
              <el-divider style="margin-top: 0; margin-bottom: 0"/>
              <process-preview v-model:preview-list="processJson.xray" :has-plane="false"/>
            </div>
          </div>
      <!--<process-preview v-model:preview-list=""/>
            <el-row>
                <el-col :span="12">
                    <el-text size="large">1.测试工艺基本信息</el-text>
                    <el-form :model="CheckInfo" label-position="left" style="margin: 20px;">
                        <el-form-item label="工艺名称" style="width: 20vw;">
                            <el-input disabled></el-input>
                        </el-form-item>
                        <el-form-item label="工艺版本" style="width: 20vw;">
                            <el-input disabled></el-input>
                        </el-form-item>
                    </el-form>
                    <el-text size="large">2.所绑定设备</el-text>
                    <el-form :model="CheckEquipment">
                        <el-form-item label="绑定夹具" style="width: 20vw;margin-top: 20px;">
                            <el-input disabled v-model="CheckEquipment.fixture"></el-input>
                        </el-form-item>
                        <el-form-item label="绑定主机" style="width: 20vw;">
                            <el-input disabled v-model="CheckEquipment.host"></el-input>
                        </el-form-item>
                        <el-form-item label="其他设备:" style="width: 20vw;">
                            <el-input disabled v-for="item in CheckEquipment.other" style="margin: 10px 0;">
                                <template #prefix>
                                    {{ item.number }} 型号：{{ item.region }}
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="12">
                    <el-text size="large">3.测试脚本</el-text>
                    <div class="check-file">
                        <el-upload class="upload-demo" action="" :on-success="handleSuccess" :show-file-list="false">
                            <el-button size="small" type="primary">点击下载文件</el-button>
                        </el-upload>
                    </div>
                </el-col>
            </el-row>-->
      <el-button type="success" icon="Check" size="large">审核通过</el-button>
      <el-button type="danger" size="large" icon="Close">审核未通过</el-button>
    </el-card>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue"
import ProcessPreview from "@/components/Check/ProcessPreview.vue"
//import { type } from "os"
const CheckEquipment = reactive({
  fixture: "",
  host: "",
  other: [
    {
      number: 123,
      region: "A型号"
    },
    {
      number: 123,
      region: "A型号"
    }
  ]
})
const props = reactive({
    type: "eyes"
  })
const currentProcess = 'eyes'
const data = reactive()
onMounted(()=>{
  data=route.query.data
})
const handleSuccess = (response, file, fileList) => {
  const url = "https://www.example.com/example.pdf" // 替换为你要下载的文件链接
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "")
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
<style scoped lang="scss">
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.el-link {
  margin-right: 8px;
}

.test-check {
  position: relative;
}

.check-file {
  margin-top: 20px;
  width: 15vw;
  height: 200px;
  border: 1px dashed #ccc;
}
</style>
