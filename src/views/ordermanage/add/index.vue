<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新增委托单</span>
          <span class="badge-req">* 为必填项</span>
        </div>
      </template>
      <el-form :model="form" ref="formRef" label-position="top">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-label">基本信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="委托单编号 *"
                prop="commNo"
                :rules="[{ required: true, message: '委托单编号不能为空', trigger: 'blur' }]"
              >
                <el-input v-model="form.commNo" placeholder="请输入委托单编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="委托单位 *"
                prop="commOrg"
                :rules="[{ required: true, message: '委托单位不能为空', trigger: 'blur' }]"
              >
                <el-input v-model="form.commOrg" placeholder="请输入委托单位名称" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="地址" prop="address">
                <el-input v-model="form.address" placeholder="请输入单位地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="科研项目预算编号" prop="budgetNo">
                <el-input v-model="form.budgetNo" placeholder="请输入预算编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="联系人 *"
                prop="contactName"
                :rules="[{ required: true, message: '请选择联系人', trigger: 'change' }]"
              >
                <el-select
                  v-model="form.contactName"
                  filterable
                  placeholder="输入姓名或部门搜索..."
                  style="width: 100%"
                  @change="handleContactChange"
                >
                  <el-option v-for="item in personnelList" :key="item.name" :label="item.name" :value="item.name">
                    <span style="float: left">{{ item.name }}</span>
                    <span style="float: right; color: var(--el-text-color-secondary); font-size: 12px">{{
                      item.dept
                    }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话">
                <el-input v-model="form.phone" placeholder="选择联系人后自动填入" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱">
                <el-input v-model="form.email" placeholder="选择联系人后自动填入" readonly />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 样品委托信息 -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-label">样品委托信息</span>
            <span style="font-size: 12px; color: #888780">共 {{ form.samples.length }} 项</span>
          </div>

          <div class="sample-list">
            <div v-for="(sample, index) in form.samples" :key="sample.id" class="sample-item">
              <div class="sample-item-header">
                <span class="sample-idx">样品 {{ index + 1 }}</span>
                <el-button v-if="form.samples.length > 1" type="danger" plain size="small" @click="removeSample(index)"
                  >删除</el-button
                >
              </div>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item
                    label="样品名称 *"
                    :prop="'samples.' + index + '.name'"
                    :rules="[{ required: true, message: '请输入样品名称', trigger: 'blur' }]"
                  >
                    <el-input v-model="sample.name" placeholder="请输入样品名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="分类 *"
                    :prop="'samples.' + index + '.category'"
                    :rules="[{ required: true, message: '请选择分类', trigger: 'change' }]"
                  >
                    <el-select v-model="sample.category" placeholder="请选择分类" style="width: 100%">
                      <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item>
                    <template #label>规格型号 <span class="opt-tag">选填</span></template>
                    <el-input v-model="sample.spec" placeholder="如有请填写" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="数量 *"
                    :prop="'samples.' + index + '.qty'"
                    :rules="[{ required: true, message: '请输入数量', trigger: 'blur' }]"
                  >
                    <el-input-number v-model="sample.qty" :min="1" placeholder="请输入数量" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item>
                    <template #label>生产厂家 <span class="opt-tag">可选</span></template>
                    <el-input v-model="sample.manufacturer" placeholder="如有请填写" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item>
                    <template #label>项目名称 <span class="opt-tag">可选</span></template>
                    <el-input v-model="sample.projectName" placeholder="如有请填写" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <el-button class="btn-add" @click="addSample" icon="Plus">添加样品信息</el-button>
        </div>

        <!-- 样品 -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-label">样品</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="接收方式">
                <el-radio-group v-model="form.receiveMethod">
                  <el-radio label="自送">自送</el-radio>
                  <el-radio label="邮寄">邮寄</el-radio>
                  <el-radio label="其他">其他</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理方式">
                <el-radio-group v-model="form.returnMethod">
                  <el-radio label="自取">自取</el-radio>
                  <el-radio label="邮寄退回">邮寄退回</el-radio>
                  <el-radio label="留存">留存</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 报告设置 -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-label">报告设置</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="输出要求">
                <el-select v-model="form.report.outputReq" style="width: 100%">
                  <el-option label="按样品分开出" value="按样品分开出" />
                  <el-option label="合并出具" value="合并出具" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="输出版本">
                <el-select v-model="form.report.version" style="width: 100%">
                  <el-option label="中文" value="中文" />
                  <el-option label="英文" value="英文" />
                  <el-option label="中英双语" value="中英双语" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="封面标识">
                <el-select v-model="form.report.coverMark" style="width: 100%">
                  <el-option label="无" value="无" />
                  <el-option label="加盖标识" value="加盖标识" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="印章要求">
                <el-select v-model="form.report.sealReq" style="width: 100%">
                  <el-option label="油田技术实验中心" value="油田技术实验中心" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="交付方式">
                <el-select v-model="form.report.delivery" style="width: 100%">
                  <el-option label="电子版" value="电子版" />
                  <el-option label="纸质版" value="纸质版" />
                  <el-option label="电子+纸质" value="电子+纸质" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="报告用途">
                <el-select v-model="form.report.usage" style="width: 100%">
                  <el-option label="一般委托" value="一般委托" />
                  <el-option label="科研项目" value="科研项目" />
                  <el-option label="质量仲裁" value="质量仲裁" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 服务要求 -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-label">服务要求</span>
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="服务级别">
                <el-radio-group v-model="form.serviceLevel">
                  <el-radio label="normal">正常</el-radio>
                  <el-radio label="urgent">加急</el-radio>
                  <el-radio label="urgent2">特急</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-actions">
          <el-button @click="resetForm">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">保存委托单</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { ElMessage } from "element-plus"
import type { FormInstance } from "element-plus"
import { request } from "@/utils/service"

const categories = ["连接器及线缆线束组件", "PCBA工艺", "关键电子器件", "关键部件", "研发故障排查"]

const personnelList = [
  { name: "李明", dept: "油田研究院·测控所", phone: "138-0010-0021", email: "liming@oiltech.com" },
  { name: "赵云", dept: "信号处理研究所", phone: "139-5500-5566", email: "zhaoyun@signal.com" },
  { name: "刘刚", dept: "装备研发部·电子组", phone: "136-8800-8801", email: "liugang@equip.com" },
  { name: "孙强", dept: "质检中心", phone: "137-2200-2244", email: "sunqiang@qc.com" },
  { name: "陈丹", dept: "装备部·维保组", phone: "135-9900-9977", email: "chendan@maint.com" },
  { name: "周平", dept: "油田研究院·材料所", phone: "131-3300-3388", email: "zhouping@oiltech.com" },
  { name: "吴霞", dept: "通信技术部", phone: "133-7700-7712", email: "wuxia@comm.com" },
  { name: "郑伟", dept: "信号处理研究所", phone: "188-4400-4410", email: "zhengwei@signal.com" },
  { name: "王芳", dept: "质检中心·工艺组", phone: "132-6600-6688", email: "wangfang@qc.com" },
  { name: "张磊", dept: "电子器件研究室", phone: "139-1100-1123", email: "zhanglei@elab.com" }
]

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const getInitialSample = () => ({
  id: Date.now() + Math.random(),
  name: "",
  category: "",
  spec: "",
  qty: 1,
  manufacturer: "",
  projectName: ""
})

const form = reactive({
  commNo: "",
  commOrg: "",
  address: "",
  budgetNo: "",
  contactName: "",
  phone: "",
  email: "",
  samples: [getInitialSample()],
  receiveMethod: "自送",
  returnMethod: "自取",
  report: {
    outputReq: "按样品分开出",
    version: "中文",
    coverMark: "无",
    sealReq: "油田技术实验中心",
    delivery: "电子版",
    usage: "一般委托"
  },
  serviceLevel: "normal"
})

const handleContactChange = (val: string) => {
  const person = personnelList.find((p) => p.name === val)
  if (person) {
    form.phone = person.phone
    form.email = person.email
  } else {
    form.phone = ""
    form.email = ""
  }
}

const addSample = () => {
  form.samples.push(getInitialSample())
}

const removeSample = (index: number) => {
  form.samples.splice(index, 1)
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.samples = [getInitialSample()]
  form.phone = ""
  form.email = ""
  form.receiveMethod = "自送"
  form.returnMethod = "自取"
  form.serviceLevel = "normal"
  form.report = {
    outputReq: "按样品分开出",
    version: "中文",
    coverMark: "无",
    sealReq: "油田技术实验中心",
    delivery: "电子版",
    usage: "一般委托"
  }
}

const submitForm = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      request({
        url: "data/commission-order/save",
        method: "post",
        data: {
          commission_no: form.commNo,
          commission_org: form.commOrg,
          address: form.address,
          budget_no: form.budgetNo,
          contact_name: form.contactName,
          phone: form.phone,
          email: form.email,
          service_level: form.serviceLevel,
          receive_method: form.receiveMethod,
          process_method: form.returnMethod,
          output_req: form.report.outputReq,
          output_version: form.report.version,
          cover_mark: form.report.coverMark,
          seal_req: form.report.sealReq,
          delivery_method: form.report.delivery,
          report_usage: form.report.usage,
          samples: form.samples.map((s: any) => ({
            sample_name: s.name,
            category: s.category,
            spec_model: s.spec,
            quantity: s.qty,
            manufacturer: s.manufacturer,
            project_name: s.projectName
          }))
        }
      })
        .then(() => {
          ElMessage.success("委托单已保存")
          resetForm()
        })
        .catch(() => {
          ElMessage.error("保存失败")
        })
        .finally(() => {
          submitLoading.value = false
        })
    } else {
      ElMessage.error("请填写所有必填项")
    }
  })
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge-req {
  font-size: 12px;
  background: #fcebeb;
  color: #a32d2d;
  padding: 2px 8px;
  border-radius: 4px;
}

.form-section {
  margin-bottom: 24px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .section-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
}

.opt-tag {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
  font-weight: normal;
}

.sample-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.sample-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-fill-color-light);

  .sample-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .sample-idx {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
}

.btn-add {
  width: 100%;
  border-style: dashed;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
