<script setup>
const props = defineProps(["previewList"])
</script>

<template>
  <div>
    <el-scrollbar style="height: calc(100vh - 430px); margin-top: -1px">
      <el-collapse v-if="props.previewList.detail.xray === undefined">
        <el-collapse-item v-if="props.previewList.detail.twoD !== ''" name="1">
          <template #title>
            <el-text style="margin-left: 10px; font-size: 20px">2D留存图</el-text>
          </template>
          <el-image :src="props.previewList.detail.twoD" fit="contain" style="width: 100%" />
        </el-collapse-item>
        <el-collapse-item v-if="props.previewList.detail.plane['leftPass'] != undefined" name="2">
          <template #title>
            <el-text size="large" style="margin-left: 10px; font-size: 20px">弓曲度检测</el-text>
          </template>
          <el-table
            :data="[
              { title: '左弓曲度', pass: props.previewList.detail.plane['leftPass'] },
              { title: '右弓曲度', pass: props.previewList.detail.plane['rightPass'] }
            ]"
          >
            <el-table-column label="检测项" prop="title" />
            <el-table-column align="right" label="结果" prop="pass">
              <template #default="scope">
                <el-text :type="scope.row.pass === 3 ? 'warning' : scope.row.pass === 1 ? 'success' : 'danger'"
                  >{{ scope.row.pass === 3 ? "疑问" : scope.row.pass === 1 ? "通过" : "不通过" }}
                </el-text>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: center; align-items: center">
            <el-image
              :src="props.previewList.detail.plane['leftUrl']"
              fit="contain"
              style="width: 40%; margin-right: 10px"
            />
            <el-image :src="props.previewList.detail.plane['rightUrl']" fit="contain" style="width: 40%" />
          </div>
        </el-collapse-item>
        <el-collapse-item v-if="props.previewList.detail.threeD.eyes != undefined" name="3" title="3D检测">
          <template #title>
            <el-text size="large" style="margin-left: 10px; font-size: 20px">3D检测</el-text>
          </template>
          <el-collapse>
            <el-collapse-item>
              <template #title>
                <el-text size="large" style="margin-left: 15px">正面目检</el-text>
              </template>
              <el-collapse>
                <el-collapse-item v-if="props.previewList.detail.threeD.eyes.total.stepList.length != 0">
                  <template #title>
                    <el-text style="margin-left: 20px">整体检测</el-text>
                  </template>

                  <el-table :data="props.previewList.detail.threeD.eyes.total.stepList" border stripe>
                    <el-table-column label="检测项" prop="name" />
                    <el-table-column align="right" label="结果" prop="pass">
                      <template #default="scope">
                        <el-text :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'"
                          >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                        </el-text>
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyes.total.stepNote.length != 0"
                    :data="props.previewList.detail.threeD.eyes.total.stepNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyes.total.picList.length != 0"
                    :data="props.previewList.detail.threeD.eyes.total.picList"
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
                          style="height: 150px; width: 150px; margin-right: 5px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyes.total.picNote.length != 0"
                    :data="props.previewList.detail.threeD.eyes.total.picNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyes.total.errorList != undefined"
                    :data="props.previewList.detail.threeD.eyes.total.errorList"
                    border
                    stripe
                  >
                    <el-table-column label="缺陷描述" prop="desc" width="300" />
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyes.total.questionList != undefined"
                    :data="props.previewList.detail.threeD.eyes.total.questionList"
                    border
                    stripe
                  >
                    <el-table-column label="疑问描述" prop="desc" width="300" />
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
                <el-collapse-item v-for="item in props.previewList.detail.threeD.eyes.area" :key="item.id">
                  <template #title>
                    <el-text style="margin-left: 20px">区域{{ item.id }}检测</el-text>
                  </template>
                  <el-collapse>
                    <el-collapse-item>
                      <template #title>
                        <el-text style="margin-left: 25px">通用检测</el-text>
                      </template>

                      <el-table :data="item.general.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'"
                            >
                              {{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
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

                      <el-table v-if="item.general.picList != 0" :data="item.general.picList" border stripe>
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

                      <el-table v-if="item.general.picNote.length != 0" :data="item.general.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="item.general.errorList != undefined" :data="item.general.errorList" border stripe>
                        <el-table-column label="缺陷描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table
                        v-if="item.general.questionList != undefined"
                        :data="item.general.questionList"
                        border
                        stripe
                      >
                        <el-table-column label="疑问描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item v-for="point in item.detail" :key="point.id">
                      <template #title>
                        <el-text style="margin-left: 25px">点位 {{ point.name }} 检测</el-text>
                      </template>

                      <el-table :data="point.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'"
                            >
                              {{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
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

                      <el-table v-if="point.picList.length != 0" :data="point.picList" border stripe>
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

                      <el-table v-if="point.picNote.length != 0" :data="point.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.errorList != undefined" :data="point.errorList" border stripe>
                        <el-table-column label="缺陷描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.questionList != undefined" :data="point.questionList" border stripe>
                        <el-table-column label="疑问描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                  </el-collapse>
                </el-collapse-item>
              </el-collapse>
            </el-collapse-item>
            <el-collapse-item v-if="props.previewList.detail.threeD.eyesBak !== undefined">
              <template #title>
                <el-text size="large" style="margin-left: 15px">背面目检</el-text>
              </template>
              <el-collapse>
                <el-collapse-item v-if="props.previewList.detail.threeD.eyesBak.total.stepList.length != 0">
                  <template #title>
                    <el-text style="margin-left: 20px">整体检测</el-text>
                  </template>

                  <el-table :data="props.previewList.detail.threeD.eyesBak.total.stepList" border stripe>
                    <el-table-column label="检测项" prop="name" />
                    <el-table-column align="right" label="结果" prop="pass">
                      <template #default="scope">
                        <el-text :type="scope.row.pass === 3 ? 'warning' : scope.row.pass === 1 ? 'success' : 'danger'"
                          >{{ scope.row.pass === 3 ? "疑问" : scope.row.pass === 1 ? "通过" : "不通过" }}
                        </el-text>
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyesBak.total.stepNote.length !== 0"
                    :data="props.previewList.detail.threeD.eyesBak.total.stepNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyesBak.total.picList.length != 0"
                    :data="props.previewList.detail.threeD.eyesBak.total.picList"
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
                          style="height: 150px; width: 150px; margin-right: 5px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyesBak.total.picNote.length !== 0"
                    :data="props.previewList.detail.threeD.eyesBak.total.picNote"
                    border
                    stripe
                  >
                    <el-table-column label="备注">
                      <template #default="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyesBak.total.errorList !== undefined"
                    :data="props.previewList.detail.threeD.eyesBak.total.errorList"
                    border
                    stripe
                  >
                    <el-table-column label="缺陷描述" prop="desc" width="300" />
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-table
                    v-if="props.previewList.detail.threeD.eyesBak.total.questionList !== undefined"
                    :data="props.previewList.detail.threeD.eyesBak.total.questionList"
                    border
                    stripe
                  >
                    <el-table-column label="疑问描述" prop="desc" width="300" />
                    <el-table-column align="right" label="留存">
                      <template #default="scope">
                        <el-image
                          v-for="img in scope.row.url"
                          :src="img"
                          fit="contain"
                          style="height: 150px; width: 150px; margin-right: 5px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
                <el-collapse-item v-for="item in props.previewList.detail.threeD.eyesBak.area" :key="item.id">
                  <template #title>
                    <el-text style="margin-left: 20px">区域{{ item.id }}检测</el-text>
                  </template>
                  <el-collapse>
                    <el-collapse-item>
                      <template #title>
                        <el-text style="margin-left: 25px">通用检测</el-text>
                      </template>

                      <el-table :data="item.general.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'"
                            >
                              {{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
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

                      <el-table v-if="item.general.picList.length != 0" :data="item.general.picList" border stripe>
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

                      <el-table v-if="item.general.picNote.length != 0" :data="item.general.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="item.general.errorList != undefined" :data="item.general.errorList" border stripe>
                        <el-table-column label="缺陷描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table
                        v-if="item.general.questionList != undefined"
                        :data="item.general.questionList"
                        border
                        stripe
                      >
                        <el-table-column label="疑问描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item v-for="point in item.detail" :key="point.id">
                      <template #title>
                        <el-text style="margin-left: 25px">点位 {{ point.name }} 检测</el-text>
                      </template>

                      <el-table :data="point.stepList" border stripe>
                        <el-table-column label="检测项" prop="name" />
                        <el-table-column align="right" label="结果" prop="pass">
                          <template #default="scope">
                            <el-text
                              :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'"
                            >
                              {{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
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

                      <el-table v-if="point.picList.length != 0" :data="point.picList" border stripe>
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

                      <el-table v-if="point.picNote.length != 0" :data="point.picNote" border stripe>
                        <el-table-column label="备注">
                          <template #default="scope">
                            {{ scope.row }}
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.errorList != undefined" :data="point.errorList" border stripe>
                        <el-table-column label="缺陷描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>

                      <el-table v-if="point.questionList != undefined" :data="point.questionList" border stripe>
                        <el-table-column label="疑问描述" prop="desc" width="300" />
                        <el-table-column align="right" label="留存">
                          <template #default="scope">
                            <el-image
                              v-for="img in scope.row.url"
                              :src="img"
                              fit="contain"
                              style="height: 150px; width: 150px; margin-right: 5px"
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
      <el-collapse v-if="props.previewList.detail.xray != undefined">
        <el-collapse-item v-if="props.previewList.detail.xray.total.stepList.length != 0">
          <template #title>
            <el-text style="margin-left: 20px">整体检测</el-text>
          </template>

          <el-table :data="props.previewList.detail.xray.total.stepList" border stripe>
            <el-table-column label="检测项" prop="name" />
            <el-table-column align="right" label="结果" prop="pass">
              <template #default="scope">
                <el-text :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'"
                  >{{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
                </el-text>
              </template>
            </el-table-column>
          </el-table>

          <el-table
            v-if="props.previewList.detail.xray.total.stepNote.length != 0"
            :data="props.previewList.detail.xray.total.stepNote"
            border
            stripe
          >
            <el-table-column label="备注">
              <template #default="scope">
                {{ scope.row }}
              </template>
            </el-table-column>
          </el-table>

          <el-table
            v-if="props.previewList.detail.xray.total.picList.length != 0"
            :data="props.previewList.detail.xray.total.picList"
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
                  style="height: 150px; width: 150px; margin-right: 5px"
                />
              </template>
            </el-table-column>
          </el-table>

          <el-table
            v-if="props.previewList.detail.xray.total.picNote.length != 0"
            :data="props.previewList.detail.xray.total.picNote"
            border
            stripe
          >
            <el-table-column label="备注">
              <template #default="scope">
                {{ scope.row }}
              </template>
            </el-table-column>
          </el-table>

          <el-table
            v-if="props.previewList.detail.xray.total.errorList != undefined"
            :data="props.previewList.detail.xray.total.errorList"
            border
            stripe
          >
            <el-table-column label="缺陷描述" prop="desc" width="300" />
            <el-table-column align="right" label="留存">
              <template #default="scope">
                <el-image
                  v-for="img in scope.row.url"
                  :src="img"
                  fit="contain"
                  style="height: 150px; width: 150px; margin-right: 5px"
                />
              </template>
            </el-table-column>
          </el-table>

          <el-table
            v-if="props.previewList.detail.xray.total.questionList != undefined"
            :data="props.previewList.detail.xray.total.questionList"
            border
            stripe
          >
            <el-table-column label="疑问描述" prop="desc" width="300" />
            <el-table-column align="right" label="留存">
              <template #default="scope">
                <el-image
                  v-for="img in scope.row.url"
                  :src="img"
                  fit="contain"
                  style="height: 150px; width: 150px; margin-right: 5px"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item v-for="item in props.previewList.detail.xray.area" :key="item.id">
          <template #title>
            <el-text style="margin-left: 20px">区域{{ item.id }}检测</el-text>
          </template>
          <el-collapse>
            <el-collapse-item>
              <template #title>
                <el-text style="margin-left: 25px">通用检测</el-text>
              </template>

              <el-table :data="item.general.stepList" border stripe>
                <el-table-column label="检测项" prop="name" />
                <el-table-column align="right" label="结果" prop="pass">
                  <template #default="scope">
                    <el-text :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'">
                      {{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
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

              <el-table v-if="item.general.picList != 0" :data="item.general.picList" border stripe>
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

              <el-table v-if="item.general.picNote.length != 0" :data="item.general.picNote" border stripe>
                <el-table-column label="备注">
                  <template #default="scope">
                    {{ scope.row }}
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="item.general.errorList != undefined" :data="item.general.errorList" border stripe>
                <el-table-column label="缺陷描述" prop="desc" width="300" />
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="item.general.questionList != undefined" :data="item.general.questionList" border stripe>
                <el-table-column label="疑问描述" prop="desc" width="300" />
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
            <el-collapse-item v-for="point in item.detail" :key="point.id">
              <template #title>
                <el-text style="margin-left: 25px">点位 {{ point.name }} 检测</el-text>
              </template>

              <el-table :data="point.stepList" border stripe>
                <el-table-column label="检测项" prop="name" />
                <el-table-column align="right" label="结果" prop="pass">
                  <template #default="scope">
                    <el-text :type="scope.row.pass == 3 ? 'warning' : scope.row.pass == 1 ? 'success' : 'danger'">
                      {{ scope.row.pass == 3 ? "疑问" : scope.row.pass == 1 ? "通过" : "不通过" }}
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

              <el-table v-if="point.picList.length != 0" :data="point.picList" border stripe>
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

              <el-table v-if="point.picNote.length != 0" :data="point.picNote" border stripe>
                <el-table-column label="备注">
                  <template #default="scope">
                    {{ scope.row }}
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="point.errorList != undefined" :data="point.errorList" border stripe>
                <el-table-column label="缺陷描述" prop="desc" width="300" />
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <el-table v-if="point.questionList != undefined" :data="point.questionList" border stripe>
                <el-table-column label="疑问描述" prop="desc" width="300" />
                <el-table-column align="right" label="留存">
                  <template #default="scope">
                    <el-image
                      v-for="img in scope.row.url"
                      :src="img"
                      fit="contain"
                      style="height: 150px; width: 150px; margin-right: 5px"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
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
