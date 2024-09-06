<script setup>
import { ref } from "vue"
import { Viewer } from "vexip-ui"

const props = defineProps(["previewList"])
const picViewer = ref(false)
const viewerUrl = ref("")
const openViewer = (img) => {
  picViewer.value = true
  viewerUrl.value = img
}
</script>

<template>
  <div>
    <el-scrollbar style="height: calc(100vh - 290px); margin-top: -1px">
      <el-collapse v-if="props.previewList.json.xray == undefined">
        <el-collapse-item v-if="props.previewList.json.twoD !== ''">
          <template #title>
            <el-text style="margin-left: 10px; font-size: 20px">2D留存图</el-text>
          </template>
          <el-text>正面留存</el-text>
          <el-image
            :src="props.previewList.json.twoD"
            fit="contain"
            style="width: 100%; cursor: pointer"
            @click="openViewer(props.previewList.json.twoD)"
          />
          <el-text>背面留存</el-text>
          <el-image
            :src="props.previewList.json.twoDBak"
            fit="contain"
            style="width: 100%; cursor: pointer"
            @click="openViewer(props.previewList.json.twoDBak)"
          />
        </el-collapse-item>
        <el-collapse-item v-if="props.previewList.json.plane['leftPass'] != undefined">
          <template #title>
            <el-text size="large" style="margin-left: 10px; font-size: 20px">弓曲度检测</el-text>
          </template>
          <el-text>检测项</el-text>
          <el-table
            :data="[
              { title: '正面弓曲度', pass: props.previewList.json.plane['leftPass'] },
              { title: '对面弓曲度', pass: props.previewList.json.plane['rightPass'] }
            ]"
          >
            <el-table-column label="检测项" prop="title" />
            <el-table-column align="right" label="结果" prop="pass">
              <template #default="scope">
                <el-text
                  v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                  :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                  >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                </el-text>
                <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
              </template>
            </el-table-column>
          </el-table>
          <el-table
            v-if="props.previewList.json.plane.noteList != undefined"
            :data="props.previewList.json.plane.noteList"
            border
            stripe
          >
            <el-table-column label="备注">
              <template #default="scope">
                {{ scope.row }}
              </template>
            </el-table-column>
          </el-table>
          <el-text>留存项</el-text>
          <div style="display: flex; justify-content: center; align-items: center">
            <el-image
              :src="props.previewList.json.plane.leftUrl"
              fit="contain"
              style="width: 40%; margin-right: 10px; cursor: pointer"
              @click="openViewer(props.previewList.json.plane.leftUrl)"
            />
            <el-image
              :src="props.previewList.json.plane.rightUrl"
              fit="contain"
              style="width: 40%; cursor: pointer"
              @click="openViewer(props.previewList.json.plane.rightUrl)"
            />
          </div>
          <el-text v-if="props.previewList.json.plane.errorList != undefined">缺陷项</el-text>
          <el-table
            v-if="props.previewList.json.plane.errorList != undefined"
            :data="props.previewList.json.plane.errorList"
            border
            stripe
          >
            <el-table-column label="检测项名称" prop="name" width="300" />
            <el-table-column label="缺陷描述">
              <template #default="scope">
                <el-text>{{ scope.row.error.desc }}</el-text>
              </template>
            </el-table-column>
            <el-table-column align="right" label="留存">
              <template #default="scope">
                <el-image
                  :src="scope.row.error.url"
                  fit="contain"
                  style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                  @click="openViewer(scope.row.error.url)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item v-if="props.previewList.json.threeD.eyes != undefined" title="3D检测">
          <template #title>
            <el-text size="large" style="margin-left: 10px; font-size: 20px">3D检测</el-text>
          </template>
          <el-collapse>
            <el-collapse-item>
              <template #title>
                <el-text size="large" style="margin-left: 15px">正面目检</el-text>
              </template>
              <el-collapse>
                <el-collapse-item v-if="props.previewList.json.threeD.eyes.total.stepList.length != 0">
                  <template #title>
                    <el-text style="margin-left: 20px">整体检测</el-text>
                  </template>
                  <el-text>检测项</el-text>
                  <el-table :data="props.previewList.json.threeD.eyes.total.stepList" border stripe>
                    <el-table-column label="检测项" prop="name" />
                    <el-table-column align="right" label="结果" prop="pass">
                      <template #default="scope">
                        <el-text
                          v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                          :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                          >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                        </el-text>
                        <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                        <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                        <el-text
                          v-if="
                            props.previewList.json.threeD.eyes.total.warnList != undefined &&
                            props.previewList.json.threeD.eyes.total.warnList.find(
                              (item) => item.id === scope.row.id
                            ) !== undefined
                          "
                          type="warning"
                        >
                          制程警示
                        </el-text>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-table
                    v-if="props.previewList.json.threeD.eyes.total.stepNote.length != 0"
                    :data="props.previewList.json.threeD.eyes.total.stepNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyes.total.picList.length != 0">留存项</el-text>
                  <el-table
                    v-if="props.previewList.json.threeD.eyes.total.picList.length != 0"
                    :data="props.previewList.json.threeD.eyes.total.picList"
                    border
                    stripe
                  >
                    <el-table-column label="留存项" prop="name" width="300" />
                    <el-table-column align="right" label="结果" prop="save">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.save"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="留存项" prop="name" width="300" />
                    <el-table-column align="right" label="结果" prop="save">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.save"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.json.threeD.eyes.total.picNote.length != 0"
                    :data="props.previewList.json.threeD.eyes.total.picNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyes.total.errorList != undefined">缺陷项</el-text>
                  <el-table
                    v-if="props.previewList.json.threeD.eyes.total.errorList != undefined"
                    :data="props.previewList.json.threeD.eyes.total.errorList"
                    border
                    stripe
                  >
                    <el-table-column label="检测项名称" prop="name" width="300" />
                    <el-table-column label="检测项名称" prop="name" width="300" />
                    <el-table-column label="缺陷描述">
                      <template #default="scope">
                        <el-text>{{ scope.row.error.desc }}</el-text>
                      </template>
                    </el-table-column>
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.error.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyes.total.questionList != undefined">疑问项</el-text>
                  <el-table
                    v-if="props.previewList.json.threeD.eyes.total.questionList != undefined"
                    :data="props.previewList.json.threeD.eyes.total.questionList"
                    border
                    stripe
                  >
                    <el-table-column label="检测项名称" prop="name" width="300" />
                    <el-table-column label="疑问描述">
                      <template #default="scope">
                        <el-text>{{ scope.row.question.desc }}</el-text>
                      </template>
                    </el-table-column>
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.question.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyes.total.warnList != undefined">制程警示</el-text>
                  <el-table
                    v-if="props.previewList.json.threeD.eyes.total.warnList != undefined"
                    :data="props.previewList.json.threeD.eyes.total.warnList"
                    border
                    stripe
                  >
                    <el-table-column label="检测项名称" prop="name" width="300" />
                    <el-table-column label="制程警示描述">
                      <template #default="scope">
                        <el-text>{{ scope.row.warn.desc }}</el-text>
                      </template>
                    </el-table-column>
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.warn.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
                <el-collapse-item v-for="item in props.previewList.json.threeD.eyes.area" :key="item.id">
                  <template #title>
                    <el-text style="margin-left: 20px">区域{{ item.id }}检测</el-text>
                  </template>
                  <el-collapse>
                    <el-collapse-item>
                      <template #title>
                        <el-text style="margin-left: 25px">通用检测</el-text>
                      </template>
                      <el-text>检测项</el-text>
                      <el-table :data="item.general.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                              :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                              >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                            </el-text>
                            <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                            <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                            <el-text
                              v-if="
                                item.general.warnList != undefined &&
                                item.general.warnList.find((item) => item.id === scope.row.id) !== undefined
                              "
                              type="warning"
                            >
                              制程警示
                            </el-text>
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="item.general.stepNote.length != 0" :data="item.general.stepNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.picList != 0">留存项</el-text>
                      <el-table v-if="item.general.picList != 0" :data="item.general.picList" border stripe>
                        <el-table-column label="留存项" prop="name" width="300" />
                        <el-table-column align="right" label="结果" prop="save">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.save"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="item.general.picNote.length != 0" :data="item.general.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.errorList != undefined">缺陷项</el-text>

                      <el-table v-if="item.general.errorList != undefined" :data="item.general.errorList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="缺陷描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.error.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.error.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.questionList != undefined">疑问项</el-text>
                      <el-table
                        v-if="item.general.questionList != undefined"
                        :data="item.general.questionList"
                        border
                        stripe
                      >
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="疑问描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.question.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.question.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.warnList != undefined">制程警示</el-text>
                      <el-table v-if="item.general.warnList != undefined" :data="item.general.warnList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="制程警示描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.warn.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.warn.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item v-for="point in item.detail" :key="point.id">
                      <template #title>
                        <el-text style="margin-left: 25px">点位 {{ point.name }} 检测</el-text>
                      </template>
                      <el-text>检测项</el-text>
                      <el-table :data="point.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                              :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                              >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                            </el-text>
                            <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                            <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                            <el-text
                              v-if="
                                point.warnList != undefined &&
                                point.warnList.find((item) => item.id === scope.row.id) !== undefined
                              "
                              type="warning"
                            >
                              制程警示
                            </el-text>
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.stepNote.length != 0" :data="point.stepNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.picList.length != 0">留存项</el-text>
                      <el-table v-if="point.picList.length != 0" :data="point.picList" border stripe>
                        <el-table-column label="留存项" prop="name" width="300" />
                        <el-table-column align="right" label="结果" prop="save">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.save"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.picNote.length != 0" :data="point.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.errorList != undefined">缺陷项</el-text>

                      <el-table v-if="point.errorList != undefined" :data="point.errorList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="缺陷描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.error.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.error.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.questionList != undefined">疑问项</el-text>

                      <el-table v-if="point.questionList != undefined" :data="point.questionList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="疑问描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.question.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.question.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.warnList != undefined">制程警示</el-text>

                      <el-table v-if="point.warnList != undefined" :data="point.warnList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="制程警示描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.warn.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.warn.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                  </el-collapse>
                </el-collapse-item>
              </el-collapse>
            </el-collapse-item>
            <el-collapse-item v-if="props.previewList.json.threeD.eyesBak !== undefined">
              <template #title>
                <el-text size="large" style="margin-left: 15px">背面目检</el-text>
              </template>
              <el-collapse>
                <el-collapse-item v-if="props.previewList.json.threeD.eyesBak.total.stepList.length != 0">
                  <template #title>
                    <el-text style="margin-left: 20px">整体检测</el-text>
                  </template>
                  <el-text>检测项</el-text>
                  <el-table :data="props.previewList.json.threeD.eyesBak.total.stepList" border stripe>
                    <el-table-column label="检测项" prop="name" />
                    <el-table-column align="right" label="结果" prop="pass">
                      <template #default="scope">
                        <el-text
                          v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                          :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                          >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                        </el-text>
                        <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                        <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                        <el-text
                          v-if="
                            props.previewList.json.threeD.eyesBak.total.warnList != undefined &&
                            props.previewList.json.threeD.eyesBak.total.warnList.find(
                              (item) => item.id === scope.row.id
                            ) !== undefined
                          "
                          type="warning"
                        >
                          制程警示
                        </el-text>
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.json.threeD.eyesBak.total.stepNote.length !== 0"
                    :data="props.previewList.json.threeD.eyesBak.total.stepNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyesBak.total.picList.length != 0">留存项</el-text>
                  <el-table
                    v-if="props.previewList.json.threeD.eyesBak.total.picList.length != 0"
                    :data="props.previewList.json.threeD.eyesBak.total.picList"
                    border
                    stripe
                  >
                    <el-table-column label="留存项" prop="name" width="300" />
                    <el-table-column align="right" label="结果" prop="save">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.save"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.json.threeD.eyesBak.total.picNote.length !== 0"
                    :data="props.previewList.json.threeD.eyesBak.total.picNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyesBak.total.errorList !== undefined">缺陷项</el-text>

                  <el-table
                    v-if="props.previewList.json.threeD.eyesBak.total.errorList !== undefined"
                    :data="props.previewList.json.threeD.eyesBak.total.errorList"
                    border
                    stripe
                  >
                    <el-table-column label="检测项名称" prop="name" width="300" />
                    <el-table-column label="缺陷描述">
                      <template #default="scope">
                        <el-text>{{ scope.row.error.desc }}</el-text>
                      </template>
                    </el-table-column>
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.error.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyesBak.total.questionList !== undefined"
                    >疑问项
                  </el-text>

                  <el-table
                    v-if="props.previewList.json.threeD.eyesBak.total.questionList !== undefined"
                    :data="props.previewList.json.threeD.eyesBak.total.questionList"
                    border
                    stripe
                  >
                    <el-table-column label="检测项名称" prop="name" width="300" />
                    <el-table-column label="疑问描述">
                      <template #default="scope">
                        <el-text>{{ scope.row.question.desc }}</el-text>
                      </template>
                    </el-table-column>
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.question.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-text v-if="props.previewList.json.threeD.eyesBak.total.warnList !== undefined">制程警示 </el-text>

                  <el-table
                    v-if="props.previewList.json.threeD.eyesBak.total.warnList !== undefined"
                    :data="props.previewList.json.threeD.eyesBak.total.warnList"
                    border
                    stripe
                  >
                    <el-table-column label="检测项名称" prop="name" width="300" />
                    <el-table-column label="制程警示描述">
                      <template #default="scope">
                        <el-text>{{ scope.row.warn.desc }}</el-text>
                      </template>
                    </el-table-column>
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.warn.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                          @click="openViewer(img)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
                <el-collapse-item v-for="item in props.previewList.json.threeD.eyesBak.area" :key="item.id">
                  <template #title>
                    <el-text style="margin-left: 20px">区域{{ item.id }}检测</el-text>
                  </template>
                  <el-collapse>
                    <el-collapse-item>
                      <template #title>
                        <el-text style="margin-left: 25px">通用检测</el-text>
                      </template>
                      <el-text>检测项</el-text>
                      <el-table :data="item.general.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                              :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                              >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                            </el-text>
                            <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                            <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                            <el-text
                              v-if="
                                item.general.warnList != undefined &&
                                item.general.warnList.find((item) => item.id === scope.row.id) !== undefined
                              "
                              type="warning"
                            >
                              制程警示
                            </el-text>
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="item.general.stepNote.length != 0" :data="item.general.stepNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.picList.length != 0">留存项</el-text>

                      <el-table v-if="item.general.picList.length != 0" :data="item.general.picList" border stripe>
                        <el-table-column label="留存项" prop="name" width="300" />
                        <el-table-column align="right" label="结果" prop="save">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.save"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="item.general.picNote.length != 0" :data="item.general.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.errorList != undefined">缺陷项</el-text>

                      <el-table v-if="item.general.errorList != undefined" :data="item.general.errorList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="缺陷描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.error.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.error.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.questionList != undefined">疑问项</el-text>

                      <el-table
                        v-if="item.general.questionList != undefined"
                        :data="item.general.questionList"
                        border
                        stripe
                      >
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="疑问描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.question.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.question.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="item.general.warnList != undefined">制程警示</el-text>

                      <el-table v-if="item.general.warnList != undefined" :data="item.general.warnList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="制程警示描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.warn.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.warn.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item v-for="point in item.detail" :key="point.id">
                      <template #title>
                        <el-text style="margin-left: 25px">点位 {{ point.name }} 检测</el-text>
                      </template>
                      <el-text>检测项</el-text>
                      <el-table :data="point.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                              :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                              >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                            </el-text>
                            <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                            <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                            <el-text
                              v-if="
                                point.warnList != undefined &&
                                point.warnList.find((item) => item.id === scope.row.id) !== undefined
                              "
                              type="warning"
                            >
                              制程警示
                            </el-text>
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.stepNote.length != 0" :data="point.stepNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.picList.length != 0">留存项</el-text>

                      <el-table v-if="point.picList.length != 0" :data="point.picList" border stripe>
                        <el-table-column label="留存项" prop="name" width="300" />
                        <el-table-column align="right" label="结果" prop="save">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.save"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.picNote.length != 0" :data="point.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.errorList != undefined">缺陷项</el-text>

                      <el-table v-if="point.errorList != undefined" :data="point.errorList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="缺陷描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.error.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.error.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.questionList != undefined">疑问项</el-text>

                      <el-table v-if="point.questionList != undefined" :data="point.questionList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="疑问描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.question.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.question.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-text v-if="point.warnList != undefined">制程警示</el-text>

                      <el-table v-if="point.warnList != undefined" :data="point.warnList" border stripe>
                        <el-table-column label="检测项名称" prop="name" width="300" />
                        <el-table-column label="制程警示描述">
                          <template #default="scope">
                            <el-text>{{ scope.row.warn.desc }}</el-text>
                          </template>
                        </el-table-column>
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.warn.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                              @click="openViewer(img)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                  </el-collapse>
                </el-collapse-item>
              </el-collapse>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
      <el-collapse v-if="props.previewList.json.xray != undefined">
        <el-collapse-item v-if="props.previewList.json.xray.total.stepList.length != 0">
          <template #title>
            <el-text style="margin-left: 20px">整体检测</el-text>
          </template>
          <el-text>检测项</el-text>
          <el-table :data="props.previewList.json.xray.total.stepList" border stripe>
            <el-table-column label="检测项" prop="name" />
            <el-table-column align="right" label="结果" prop="pass">
              <template #default="scope">
                <el-text :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'"
                  >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                </el-text>
                <el-text
                  v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                  :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                  >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                </el-text>
                <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                <el-text
                  v-if="
                    props.previewList.json.xray.total.warnList != undefined &&
                    props.previewList.json.xray.total.warnList.find((item) => item.id === scope.row.id) !== undefined
                  "
                  type="warning"
                >
                  制程警示
                </el-text>
              </template>
            </el-table-column>
          </el-table>

          <el-table
            v-if="props.previewList.json.xray.total.stepNote.length != 0"
            :data="props.previewList.json.xray.total.stepNote"
            border
            stripe
          >
            <el-table-column label="备注">
              <template #default="scope">
                {{ scope.row }}
              </template>
            </el-table-column>
          </el-table>
          <el-text v-if="props.previewList.json.xray.total.picList.length != 0">留存项</el-text>

          <el-table
            v-if="props.previewList.json.xray.total.picList.length != 0"
            :data="props.previewList.json.xray.total.picList"
            border
            stripe
          >
            <el-table-column label="留存项" prop="name" width="300" />
            <el-table-column align="right" label="结果" prop="save">
              <template #default="scope">
                <el-image
                  v-for="img in scope.row.save"
                  :src="img"
                  fit="contain"
                  style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                  @click="openViewer(img)"
                />
              </template>
            </el-table-column>
          </el-table>

          <el-table
            v-if="props.previewList.json.xray.total.picNote.length != 0"
            :data="props.previewList.json.xray.total.picNote"
            border
            stripe
          >
            <el-table-column label="备注">
              <template #default="scope">
                {{ scope.row }}
              </template>
            </el-table-column>
          </el-table>
          <el-text v-if="props.previewList.json.xray.total.errorList != undefined">缺陷项</el-text>

          <el-table
            v-if="props.previewList.json.xray.total.errorList != undefined"
            :data="props.previewList.json.xray.total.errorList"
            border
            stripe
          >
            <el-table-column label="检测项名称" prop="name" width="300" />
            <el-table-column label="缺陷描述">
              <template #default="scope">
                <el-text>{{ scope.row.error.desc }}</el-text>
              </template>
            </el-table-column>
            <el-table-column align="right" label="留存">
              <template #default="scope">
                <el-image
                  v-for="img in scope.row.error.url"
                  :src="img"
                  fit="contain"
                  style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                  @click="openViewer(img)"
                />
              </template>
            </el-table-column>
          </el-table>
          <el-text v-if="props.previewList.json.xray.total.questionList != undefined">疑问项</el-text>

          <el-table
            v-if="props.previewList.json.xray.total.questionList != undefined"
            :data="props.previewList.json.xray.total.questionList"
            border
            stripe
          >
            <el-table-column label="检测项名称" prop="name" width="300" />
            <el-table-column label="疑问描述">
              <template #default="scope">
                <el-text>{{ scope.row.question.desc }}</el-text>
              </template>
            </el-table-column>
            <el-table-column align="right" label="留存">
              <template #default="scope">
                <el-image
                  v-for="img in scope.row.question.url"
                  :src="img"
                  fit="contain"
                  style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                  @click="openViewer(img)"
                />
              </template>
            </el-table-column>
          </el-table>
          <el-text v-if="props.previewList.json.xray.total.warnList != undefined">制程警示</el-text>

          <el-table
            v-if="props.previewList.json.xray.total.warnList != undefined"
            :data="props.previewList.json.xray.total.warnList"
            border
            stripe
          >
            <el-table-column label="检测项名称" prop="name" width="300" />
            <el-table-column label="制程警示描述">
              <template #default="scope">
                <el-text>{{ scope.row.warn.desc }}</el-text>
              </template>
            </el-table-column>
            <el-table-column align="right" label="留存">
              <template #default="scope">
                <el-image
                  v-for="img in scope.row.warn.url"
                  :src="img"
                  fit="contain"
                  style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                  @click="openViewer(img)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item v-for="item in props.previewList.json.xray.area" :key="item.id">
          <template #title>
            <el-text style="margin-left: 20px">区域{{ item.id }}检测</el-text>
          </template>
          <el-collapse>
            <el-collapse-item>
              <template #title>
                <el-text style="margin-left: 25px">通用检测</el-text>
              </template>
              <el-text>检测项</el-text>
              <el-table :data="item.general.stepList" border stripe>
                <el-table-column label="检测项" prop="name" />
                <el-table-column align="right" label="结果" prop="pass">
                  <template #default="scope">
                    <el-text
                      v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                      :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                      >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                    </el-text>
                    <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                    <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                    <el-text
                      v-if="
                        item.general.warnList != undefined &&
                        item.general.warnList.find((item) => item.id === scope.row.id) !== undefined
                      "
                      type="warning"
                    >
                      制程警示
                    </el-text>
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="item.general.stepNote.length != 0" :data="item.general.stepNote" border stripe>
                <el-table-column label="备注">
                  <template #default="scope">
                    {{ scope.row }}
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="item.general.picList != 0">留存项</el-text>
              <el-table v-if="item.general.picList != 0" :data="item.general.picList" border stripe>
                <el-table-column label="留存项" prop="name" width="300" />
                <el-table-column align="right" label="结果" prop="save">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.save"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="item.general.picNote.length != 0" :data="item.general.picNote" border stripe>
                <el-table-column label="备注">
                  <template #default="scope">
                    {{ scope.row }}
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="item.general.errorList != undefined">缺陷项</el-text>

              <el-table v-if="item.general.errorList != undefined" :data="item.general.errorList" border stripe>
                <el-table-column label="检测项名称" prop="name" width="300" />
                <el-table-column label="缺陷描述">
                  <template #default="scope">
                    <el-text>{{ scope.row.error.desc }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.error.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="item.general.questionList != undefined">疑问项</el-text>

              <el-table v-if="item.general.questionList != undefined" :data="item.general.questionList" border stripe>
                <el-table-column label="检测项名称" prop="name" width="300" />
                <el-table-column label="疑问描述">
                  <template #default="scope">
                    <el-text>{{ scope.row.question.desc }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.question.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="item.general.warnList != undefined">制程警示</el-text>

              <el-table v-if="item.general.warnList != undefined" :data="item.general.warnList" border stripe>
                <el-table-column label="检测项名称" prop="name" width="300" />
                <el-table-column label="制程警示描述">
                  <template #default="scope">
                    <el-text>{{ scope.row.warn.desc }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.warn.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
            <el-collapse-item v-for="point in item.detail" :key="point.id">
              <template #title>
                <el-text style="margin-left: 25px">点位 {{ point.name }} 检测</el-text>
              </template>
              <el-text>检测项</el-text>
              <el-table :data="point.stepList" border stripe>
                <el-table-column label="检测项" prop="name" />
                <el-table-column align="right" label="结果" prop="pass">
                  <template #default="scope">
                    <el-text
                      v-if="scope.row.pass == 3 || scope.row.pass == 2 || scope.row.pass == 1"
                      :type="scope.row.pass == 3 ? 'info' : scope.row.pass == 1 ? 'success' : 'danger'"
                      >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                    </el-text>
                    <el-text v-if="scope.row.pass == 4" type="danger"> 不通过 </el-text>
                    <el-text v-if="scope.row.pass == 4" type="info"> 疑问 </el-text>
                    <el-text
                      v-if="
                        point.warnList != undefined &&
                        point.warnList.find((item) => item.id === scope.row.id) !== undefined
                      "
                      type="warning"
                    >
                      制程警示
                    </el-text>
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="point.stepNote.length != 0" :data="point.stepNote" border stripe>
                <el-table-column label="备注">
                  <template #default="scope">
                    {{ scope.row }}
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="point.picList.length != 0">留存项</el-text>

              <el-table v-if="point.picList.length != 0" :data="point.picList" border stripe>
                <el-table-column label="留存项" prop="name" width="300" />
                <el-table-column align="right" label="结果" prop="save">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.save"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="point.picNote.length != 0" :data="point.picNote" border stripe>
                <el-table-column label="备注">
                  <template #default="scope">
                    {{ scope.row }}
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="point.errorList != undefined">缺陷项</el-text>

              <el-table v-if="point.errorList != undefined" :data="point.errorList" border stripe>
                <el-table-column label="检测项名称" prop="name" width="300" />
                <el-table-column label="缺陷描述">
                  <template #default="scope">
                    <el-text>{{ scope.row.error.desc }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.error.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="point.questionList != undefined">疑问项</el-text>
              <el-table v-if="point.questionList != undefined" :data="point.questionList" border stripe>
                <el-table-column label="检测项名称" prop="name" width="300" />
                <el-table-column label="疑问描述">
                  <template #default="scope">
                    <el-text>{{ scope.row.question.desc }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.question.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>
              <el-text v-if="point.warnList != undefined">制程警示</el-text>
              <el-table v-if="point.warnList != undefined" :data="point.warnList" border stripe>
                <el-table-column label="检测项名称" prop="name" width="300" />
                <el-table-column label="制程警示描述">
                  <template #default="scope">
                    <el-text>{{ scope.row.warn.desc }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.warn.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px; cursor: pointer"
                      @click="openViewer(img)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
    <el-dialog v-model="picViewer" align-center center width="70%">
      <Viewer height="600">
        <img :src="viewerUrl" alt="" />
      </Viewer>
    </el-dialog>
  </div>
</template>

<style scoped>
.el-collapse {
  --el-collapse-border-color: #d5d4d4;
  --el-collapse-border: 1px solid;
  --el-collapse-header-bg-color: #f3f3f3;
  --el-collapse-bg-color: transparent;
  --el-collapse-content-bg-color: #f5f5ff;
}
</style>
