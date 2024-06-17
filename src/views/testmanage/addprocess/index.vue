<template>
  <div class="app-container">
    <header>
      <el-row class="mb-4">
        <div class="selectTypeBtn">
          <el-button
            v-for="testType in testTypeList"
            :type="activeType(testType.name)"
            :key="testType.number"
            class="selectBtn"
            @click="TestType(testType.name, testType.number)"
            >{{ testType.name }}
          </el-button>
        </div>
      </el-row>
    </header>
    <div class="test-content">
      <el-card class="flex-card" style="margin: 20px" v-if="testTypeShow === ''">
        <el-empty description="请选择测试类型" />
      </el-card>
      <!-- 功能性测试 -->
      <el-card class="flex-card" style="margin: 20px" v-else-if="testTypeShow === '功能性测试'">
        <el-row>
          <el-col :span="7">
            <el-text size="large">1.填写测试工艺信息</el-text>
            <el-form :model="functform" style="margin: 10px 0" :rules="rules">
              <el-form-item label="工艺名称:">
                <el-input type="text" style="margin-right: 80px" v-model="functform.name" placeholder="请填写" />
              </el-form-item>
              <el-form-item label="工艺版本:" prop="version">
                <el-input
                  type="text"
                  @change="handleVision"
                  style="margin-right: 80px"
                  v-model="functform.version"
                  placeholder="请填写"
                >
                  <template #prepend>V</template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="8">
            <el-text size="large">2.选择绑定设备</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="绑定夹具:">
                <el-select
                  filterable
                  v-model="functform.fixtureId"
                  placeholder="请选择(输入可搜索)"
                  style="width: 190px"
                >
                  <el-option v-for="item in fixtureModelList" :label="item.name" :value="item.id" :key="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="绑定主机:">
                <el-select filterable v-model="functform.hostId" placeholder="请选择(输入可搜索)" style="width: 190px">
                  <el-option
                    v-for="item in psiModelList"
                    :label="item.psimodel_name"
                    :value="item.psimodel_id"
                    :key="item.psimodel_id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="其他设备:">
                <el-select
                  filterable
                  v-model="functform.equipmentId"
                  placeholder="请选择(输入可搜索)"
                  multiple
                  style="width: 190px"
                >
                  <el-option v-for="item in equipmentModelList" :label="item.name" :value="item.id" :key="item.id" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="8">
            <el-text class="mx-1" size="large">3.上传测试脚本</el-text>
            <el-upload
              class="upload-demo"
              drag
              :show-file-list="true"
              v-model:file-list="fileList"
              :on-change="handleFileChange"
              multiple
              style="margin: 10px 0"
            >
              <el-icon class="el-icon--upload">
                <upload-filled />
              </el-icon>
              <div class="el-upload__text">上传脚本</div>
            </el-upload>
          </el-col>
        </el-row>
        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <el-button>取消</el-button>
            <el-button type="primary" style="margin-left: 10px" @click="handleconfirmAddProcess(ruleFormRef)"
              >确认新增</el-button
            >
          </div>
        </template>
      </el-card>
      <!--X-Ray测试编辑-->
      <el-card style="margin: 20px" v-else-if="testTypeShow === 'X-Ray测试'">
        <el-row>
          <el-col :span="4">
            <el-text size="large">1.填写测试工艺信息</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="工艺名称:">
                <el-input type="text" v-model="form.name" placeholder="请填写" />
              </el-form-item>
              <el-form-item label="工艺版本:">
                <el-input type="text" v-model="form.version" placeholder="请填写">
                  <template #prepend>V</template>
                </el-input>
              </el-form-item>
              <el-form-item label="绑定夹具:">
                <el-select filterable v-model="form.fixtureId" placeholder="请选择(输入可搜索)">
                  <el-option v-for="item in fixtureModelList" :label="item.name" :value="item.id" :key="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="其他设备:">
                <el-select filterable v-model="form.equipmentId" placeholder="请选择(输入可搜索)">
                  <el-option v-for="item in equipmentModelList" :label="item.name" :value="item.id" :key="item.id" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <!-- 增加测试工艺步骤 -->
          <el-col :span="18" style="margin-left: 20px; height: auto">
            <el-text size="large">2.增加测试工艺</el-text>
            <el-card shadow="never" style="margin-top: 10px; width: 110%">
              <el-tabs model-value="first" class="demo-tabs">
                <el-tab-pane label="人工目检" name="first">
                  <el-steps style="width: 100%" :active="eyesCheck">
                    <el-step title="步骤一" description="上传图片电路板图片并截图分区" />
                    <el-step title="步骤二" description="为整体目检创建流程" />
                    <el-step title="步骤三" description="为每个分区目检创建流程" />
                  </el-steps>
                  <div style="width: 100%; margin-top: 10px" v-if="eyesCheck === 1">
                    <div style="width: 100%; height: 300px">
                      <VueCropper
                        style="width: 100%; height: 100%"
                        ref="cropperRef"
                        :img="option.img"
                        :outputSize="option.outputSize"
                        :outputType="option.outputType"
                        :info="option.info"
                        :canScale="option.canScale"
                        :autoCrop="option.autoCrop"
                        :autoCropWidth="option.autoCropWidth"
                        :autoCropHeight="option.autoCropHeight"
                        :fixedBox="option.fixedBox"
                        :fixed="option.fixed"
                        :fixedNumber="option.fixedNumber"
                        :canMove="option.canMove"
                        :canMoveBox="option.canMoveBox"
                        :original="option.original"
                        :centerBox="option.centerBox"
                        :infoTrue="option.infoTrue"
                        :full="option.full"
                        @real-time="realTime"
                      />
                    </div>
                    <div style="margin-top: 20px">
                      <picture-card
                        :banner-list="eyesImageCutList"
                        :preview="preview.url"
                        @on-update="draggableOnUpdate"
                        @delete-pic="handleDeletePic"
                      />
                    </div>
                    <div style="display: flex; justify-content: space-between">
                      <div>
                        <label class="btn" for="uploads">上传图片</label>
                        <input
                          type="file"
                          id="uploads"
                          style="position: absolute; clip: rect(0 0 0 0)"
                          accept="image/png, image/jpeg, image/gif, image/jpg"
                          @change="uploadImg($event, 1)"
                        />
                        <el-button
                          v-if="option.img !== ''"
                          style="margin-top: 0"
                          icon="scissor"
                          @click="handleEyesCheckCut"
                          >截取
                        </el-button>
                      </div>
                      <div style="margin-top: 35px">
                        <el-button
                          :disabled="eyesImageCutList.length === 0"
                          style="margin-left: 20px"
                          type="primary"
                          @click="nextEyesCheck"
                        >
                          下一步
                          <el-icon class="el-icon--right">
                            <ArrowRight />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div style="width: 100%; margin-top: 10px" v-if="eyesCheck === 2">
                    <div>
                      <el-card
                        shadow="never"
                        style="width: 100%; display: flex; align-items: center; justify-content: center"
                      >
                        <el-image
                          cursor-pointer
                          @click="editEyestotal"
                          draggable="false"
                          :src="eyesTotalImg"
                          fit="contain"
                        />
                        <el-text size="small" style="display: flex; justify-content: center">点击图片进行标注</el-text>
                      </el-card>
                    </div>
                    <div>
                      <el-tabs model-value="first" class="demo-tabs">
                        <el-tab-pane key="eyestotaltab1" name="first" label="检测项设置">
                          <el-card style="margin-top: 20px; height: 500px" shadow="never">
                            <template #header>
                              <el-button type="primary" icon="plus" @click="addEyesTotalStep">新增检测项</el-button>
                            </template>
                            <el-scrollbar ref="eyesTotalScrollbarRef" max-height="400px">
                              <div ref="innerEyesTotalRef">
                                <template v-for="component in eyesTotalStepInfo" :key="component">
                                  <step-component
                                    v-model:name="component.name"
                                    v-model:desc="component.desc"
                                    @remove:step-component="removeEyesTotalCom(component.id)"
                                  />
                                </template>
                              </div>
                            </el-scrollbar>
                          </el-card>
                        </el-tab-pane>
                        <el-tab-pane key="eyestotaltab2" name="second" label="拍照留存设置">
                          <el-card style="margin-top: 20px; height: 500px" shadow="never">
                            <template #header>
                              <div style="display: flex; justify-content: space-between">
                                <el-button type="primary" icon="plus" @click="addEyesTotalPic">新增留存项</el-button>
                                <div>
                                  <el-text style="margin-right: 10px">是否需要整体留存:</el-text>
                                  <el-switch
                                    v-model="eyesTotalShot"
                                    size="large"
                                    inline-prompt
                                    active-icon="check"
                                    inactive-icon="close"
                                  />
                                </div>
                              </div>
                            </template>
                            <el-scrollbar ref="eyesTotalPicScrollbarRef" max-height="400px">
                              <div ref="innerEyesTotalPicRef">
                                <template v-for="component in eyesTotalPicStepInfo" :key="component">
                                  <pic-component
                                    v-model:name="component.name"
                                    v-model:desc="component.desc"
                                    v-model:url="component.url"
                                    @remove:pic-component="removeEyesTotalPicCom(component.id)"
                                    @click:upload="uploadEyesTotalPicCom(component.id)"
                                    @click:edit="editEyesTotalPicCom(component.id)"
                                  />
                                </template>
                              </div>
                            </el-scrollbar>
                          </el-card>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 35px">
                      <el-button type="primary" icon="arrow-left" @click="previousEyesCheck">上一步</el-button>
                      <el-button style="margin-left: 20px" type="primary" @click="nextEyesCheck">
                        下一步
                        <el-icon class="el-icon--right">
                          <ArrowRight />
                        </el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div style="width: 100%; margin-top: 10px" v-if="eyesCheck === 3">
                    <div>
                      <el-tabs type="border-card" v-model="eyesCheckArea" class="demo-tabs" tab-position="left" stretch>
                        <el-tab-pane v-for="img in eyesImageCutList" :key="img.id" :name="img.id">
                          <template #label>
                            <span
                              class="custom-tabs-label"
                              style="width: 80px; display: flex"
                              @mouseenter="handleMouseEnterTab(img.id)"
                              @mouseleave="handleMouseLeaveTab()"
                            >
                              <span style="display: flex">
                                <span style="display: flex; align-items: center">第{{ String(img.id) }}区域</span>
                                <span style="display: flex; flex-direction: column">
                                  <el-button
                                    v-if="img.id === visibleTabButton"
                                    :disabled="img.id === 1"
                                    text
                                    style="width: 10px; height: 15px"
                                    size="small"
                                    icon="arrow-up"
                                    @click="moveTabUp(img.id, 2)"
                                  />
                                  <el-button
                                    v-if="img.id === visibleTabButton"
                                    :disabled="img.id === eyesImageCutList.length"
                                    text
                                    style="width: 10px; height: 15px"
                                    size="small"
                                    icon="arrow-down"
                                    @click="moveTabDown(img.id, 2)"
                                  />
                                </span>
                              </span>
                            </span>
                          </template>
                          <div>
                            <el-tabs>
                              <el-tab-pane>
                                <template #label>
                                  <div>
                                    <el-text style="margin-right: 10px">通用检测:</el-text>
                                    <el-switch
                                      v-model="img.needGeneral"
                                      size="large"
                                      inline-prompt
                                      active-icon="check"
                                      inactive-icon="close"
                                    />
                                  </div>
                                </template>
                                <el-card v-if="!img.needGeneral">
                                  <el-empty description="已关闭通用检测流程">
                                    <template #image>
                                      <el-icon size="120">
                                        <Failed />
                                      </el-icon>
                                    </template>
                                  </el-empty>
                                </el-card>
                                <el-card v-if="img.needGeneral" shadow="never">
                                  <div>
                                    <el-card
                                      shadow="never"
                                      style="width: 100%; display: flex; align-items: center; justify-content: center"
                                    >
                                      <el-image
                                        cursor-pointer
                                        draggable="false"
                                        :src="img.url"
                                        @click="editEyesArea(img)"
                                        fit="contain"
                                      />
                                      <el-text size="small" style="display: flex; justify-content: center"
                                        >点击图片进行标注</el-text
                                      >
                                    </el-card>
                                  </div>
                                  <div>
                                    <el-tabs>
                                      <el-tab-pane label="检测项设置">
                                        <el-card style="margin-top: 20px; height: 500px" shadow="never">
                                          <template #header>
                                            <el-button type="primary" icon="plus" @click="addEyesAreaStep(img.id)"
                                              >新增检测项</el-button
                                            >
                                          </template>
                                          <el-scrollbar ref="eyesAreaScrollbarRef" max-height="400px">
                                            <div ref="innerEyesAreaRef">
                                              <template v-for="component in img.eyesAreaStepInfo" :key="component">
                                                <step-component
                                                  v-model:name="component.name"
                                                  v-model:desc="component.desc"
                                                  @remove:step-component="removeEyesAreaCom(img, component.id)"
                                                />
                                              </template>
                                            </div>
                                          </el-scrollbar>
                                        </el-card>
                                      </el-tab-pane>
                                      <el-tab-pane label="留存项设置">
                                        <el-card style="margin-top: 20px; height: 500px" shadow="never">
                                          <template #header>
                                            <div style="display: flex; justify-content: space-between">
                                              <el-button type="primary" icon="plus" @click="addEyesAreaPic(img.id)"
                                                >新增留存项</el-button
                                              >
                                              <div>
                                                <el-text style="margin-right: 10px">是否需要整体留存:</el-text>
                                                <el-switch
                                                  v-model="img.needGeneralPic"
                                                  size="large"
                                                  inline-prompt
                                                  active-icon="check"
                                                  inactive-icon="close"
                                                />
                                              </div>
                                            </div>
                                          </template>
                                          <el-scrollbar ref="eyesAreaGeneralPicScrollbarRef" max-height="400px">
                                            <div ref="innerEyesAreaGeneralPicRef">
                                              <template v-for="component in img.eyesAreaPicStepInfo" :key="component">
                                                <pic-component
                                                  v-model:name="component.name"
                                                  v-model:desc="component.desc"
                                                  v-model:url="component.url"
                                                  @remove:pic-component="removeEyesAreaPicCom(img.id, component.id)"
                                                  @click:upload="uploadEyesAreaPicCom(img.id, component.id)"
                                                  @click:edit="editEyesAreaPicCom(img.id, component.id)"
                                                />
                                              </template>
                                            </div>
                                          </el-scrollbar>
                                        </el-card>
                                      </el-tab-pane>
                                    </el-tabs>
                                  </div>
                                </el-card>
                              </el-tab-pane>
                              <el-tab-pane label="具体检测设置">
                                <div>
                                  <el-card style="margin-top: 20px; height: 500px" shadow="never">
                                    <template #header>
                                      <el-button type="primary" icon="plus" @click="addEyesDetail(img.id)"
                                        >新增具体检测点位</el-button
                                      >
                                    </template>
                                    <el-scrollbar ref="eyesAreaDetailScrollbarRef" max-height="400px">
                                      <div ref="innerEyesAreaDetailRef">
                                        <template v-for="component in img.eyesAreaDetailInfo" :key="component">
                                          <detail-component
                                            v-model:name="component.name"
                                            v-model:url="component.url"
                                            v-model:step="component.step"
                                            v-model:pic="component.pic"
                                            @remove:detail-component="removeEyesAreaDetail(img.id, component.id)"
                                            @click:add-step="addEyesAreaDetailStep(img.id, component.id)"
                                            @click:add-pic="addEyesAreaDetailPic(img.id, component.id)"
                                            @remove:step-component="
                                              removeEyesAreaDetailStep($event, img.id, component.id)
                                            "
                                            @remove:pic-component="
                                              removeEyesAreaDetailPic($event, img.id, component.id)
                                            "
                                            @click:upload="uploadEyesAreaDetailCom(img.id, component.id)"
                                            @click:edit="editEyesAreaDetailCom(img.id, component.id)"
                                            @click:upload-pic="uploadEyesAreaDetailPic($event, img.id, component.id)"
                                            @click:edit-pic="editEyesAreaDetailPic($event, img.id, component.id)"
                                          />
                                        </template>
                                      </div>
                                    </el-scrollbar>
                                  </el-card>
                                </div>
                              </el-tab-pane>
                            </el-tabs>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 35px">
                      <el-button type="primary" icon="arrow-left" @click="previousEyesCheck">上一步</el-button>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="X-Ray检查" name="second">
                  <el-steps style="width: 100%" :active="xrayCheck">
                    <el-step title="步骤一" description="上传图片电路板图片并截图分区" />
                    <el-step title="步骤二" description="为整体目检创建流程" />
                    <el-step title="步骤三" description="为每个分区目检创建流程" />
                  </el-steps>
                  <div style="width: 100%; margin-top: 10px" v-if="xrayCheck === 1">
                    <div style="width: 100%; height: 300px">
                      <VueCropper
                        style="width: 100%; height: 100%"
                        ref="cropperXRef"
                        :img="optionX.img"
                        :outputSize="optionX.outputSize"
                        :outputType="optionX.outputType"
                        :info="optionX.info"
                        :canScale="optionX.canScale"
                        :autoCrop="optionX.autoCrop"
                        :autoCropWidth="optionX.autoCropWidth"
                        :autoCropHeight="optionX.autoCropHeight"
                        :fixedBox="optionX.fixedBox"
                        :fixed="optionX.fixed"
                        :fixedNumber="optionX.fixedNumber"
                        :canMove="optionX.canMove"
                        :canMoveBox="optionX.canMoveBox"
                        :original="optionX.original"
                        :centerBox="optionX.centerBox"
                        :infoTrue="optionX.infoTrue"
                        :full="optionX.full"
                        @real-time="realTimeX"
                      />
                    </div>
                    <div style="margin-top: 20px">
                      <picture-card
                        :banner-list="XRayImageCutList"
                        :preview="previewX.url"
                        @on-update="draggableXOnUpdate"
                        @delete-pic="handleDeleteXPic"
                      />
                    </div>
                    <div style="display: flex; justify-content: space-between">
                      <div>
                        <label class="btn" for="xrayUploads">上传图片</label>
                        <input
                          type="file"
                          id="xrayUploads"
                          style="position: absolute; clip: rect(0 0 0 0)"
                          accept="image/png, image/jpeg, image/gif, image/jpg"
                          @change="uploadXImg($event, 1)"
                        />
                        <el-button
                          v-if="optionX.img !== ''"
                          style="margin-top: 0"
                          icon="scissor"
                          @click="handleXrayCheckCut"
                          >截取
                        </el-button>
                      </div>
                      <div style="margin-top: 35px">
                        <el-button
                          :disabled="XRayImageCutList.length === 0"
                          style="margin-left: 20px"
                          type="primary"
                          @click="nextXrayCheck"
                        >
                          下一步
                          <el-icon class="el-icon--right">
                            <ArrowRight />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div style="width: 100%; margin-top: 10px" v-if="xrayCheck === 2">
                    <div>
                      <el-card
                        shadow="never"
                        style="width: 100%; display: flex; align-items: center; justify-content: center"
                      >
                        <el-image
                          cursor-pointer
                          @click="editXraytotal"
                          draggable="false"
                          :src="xrayTotalImg"
                          fit="contain"
                        />
                        <el-text size="small" style="display: flex; justify-content: center">点击图片进行标注</el-text>
                      </el-card>
                    </div>
                    <div>
                      <el-tabs model-value="first" class="demo-tabs">
                        <el-tab-pane key="xraytotaltab1" name="first" label="检测项设置">
                          <el-card style="margin-top: 20px; height: 500px" shadow="never">
                            <template #header>
                              <el-button type="primary" icon="plus" @click="addXrayTotalStep">新增检测项</el-button>
                            </template>
                            <el-scrollbar ref="xrayTotalScrollbarRef" max-height="400px">
                              <div ref="innerXrayTotalRef">
                                <template v-for="component in xrayTotalStepInfo" :key="component">
                                  <step-component
                                    v-model:name="component.name"
                                    v-model:desc="component.desc"
                                    @remove:step-component="removeXrayTotalCom(component.id)"
                                  />
                                </template>
                              </div>
                            </el-scrollbar>
                          </el-card>
                        </el-tab-pane>
                        <el-tab-pane key="xraytotaltab2" name="second" label="拍照留存设置">
                          <el-card style="margin-top: 20px; height: 500px" shadow="never">
                            <template #header>
                              <div style="display: flex; justify-content: space-between">
                                <el-button type="primary" icon="plus" @click="addXrayTotalPic">新增留存项</el-button>
                                <div>
                                  <el-text style="margin-right: 10px">是否需要整体留存:</el-text>
                                  <el-switch
                                    v-model="xrayTotalShot"
                                    size="large"
                                    inline-prompt
                                    active-icon="check"
                                    inactive-icon="close"
                                  />
                                </div>
                              </div>
                            </template>
                            <el-scrollbar ref="xrayTotalPicScrollbarRef" max-height="400px">
                              <div ref="innerXrayTotalPicRef">
                                <template v-for="component in xrayTotalPicStepInfo" :key="component">
                                  <pic-component
                                    v-model:name="component.name"
                                    v-model:desc="component.desc"
                                    v-model:url="component.url"
                                    @remove:pic-component="removeXrayTotalPicCom(component.id)"
                                    @click:upload="uploadXrayTotalPicCom(component.id)"
                                    @click:edit="editXrayTotalPicCom(component.id)"
                                  />
                                </template>
                              </div>
                            </el-scrollbar>
                          </el-card>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 35px">
                      <el-button type="primary" icon="arrow-left" @click="previousXrayCheck">上一步</el-button>
                      <el-button style="margin-left: 20px" type="primary" @click="nextXrayCheck">
                        下一步
                        <el-icon class="el-icon--right">
                          <ArrowRight />
                        </el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div style="width: 100%; margin-top: 10px" v-if="xrayCheck === 3">
                    <div>
                      <el-tabs type="border-card" v-model="xrayCheckArea" class="demo-tabs" tab-position="left" stretch>
                        <el-tab-pane
                          v-for="img in XRayImageCutList"
                          :key="img.id"
                          :label="'第' + String(img.id) + '区域'"
                          :name="img.id"
                        >
                          <template #label>
                            <span
                              class="custom-tabs-label"
                              style="width: 80px; display: flex"
                              @mouseenter="handleMouseEnterTab(img.id)"
                              @mouseleave="handleMouseLeaveTab()"
                            >
                              <span style="display: flex">
                                <span style="display: flex; align-items: center">第{{ String(img.id) }}区域</span>
                                <span style="display: flex; flex-direction: column">
                                  <el-button
                                    v-if="img.id === visibleTabButton"
                                    :disabled="img.id === 1"
                                    text
                                    style="width: 10px; height: 15px"
                                    size="small"
                                    icon="arrow-up"
                                    @click="moveTabUp(img.id, 1)"
                                  />
                                  <el-button
                                    v-if="img.id === visibleTabButton"
                                    :disabled="img.id === XRayImageCutList.length"
                                    text
                                    style="width: 10px; height: 15px"
                                    size="small"
                                    icon="arrow-down"
                                    @click="moveTabDown(img.id, 1)"
                                  />
                                </span>
                              </span>
                            </span>
                          </template>
                          <div>
                            <el-card
                              shadow="never"
                              style="width: 100%; display: flex; align-items: center; justify-content: center"
                            >
                              <el-image
                                cursor-pointer
                                draggable="false"
                                :src="img.url"
                                @click="editXrayArea(img)"
                                fit="contain"
                              />
                              <el-text size="small" style="display: flex; justify-content: center"
                                >点击图片进行标注</el-text
                              >
                            </el-card>
                          </div>
                          <div>
                            <el-card style="margin-top: 20px; height: 500px" shadow="never">
                              <template #header>
                                <el-button type="primary" icon="plus" @click="addXrayAreaStep(img.id)"
                                  >新增检测项</el-button
                                >
                              </template>
                              <el-scrollbar ref="xrayAreaScrollbarRef" max-height="400px">
                                <div ref="innerXrayAreaRef">
                                  <template v-for="component in img.xrayAreaStepInfo" :key="component">
                                    <step-component
                                      v-model:name="component.name"
                                      v-model:desc="component.desc"
                                      @remove:step-component="removeXrayAreaCom(img, component.id)"
                                    />
                                  </template>
                                </div>
                              </el-scrollbar>
                            </el-card>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 35px">
                      <el-button type="primary" icon="arrow-left" @click="previousXrayCheck">上一步</el-button>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <el-button>取消</el-button>
            <el-button type="primary" style="margin-left: 10px" @click="handleconfirmAddProcess">确认新增</el-button>
          </div>
        </template>
      </el-card>
      <!-- 可靠性测试 -->
      <el-card style="margin: 20px" v-else-if="testTypeShow === '可靠性测试'">
        <el-row>
          <el-col :span="4">
            <el-text class="mx-1" size="large">1.填写测试工艺信息</el-text>
            <el-form :model="form" style="margin: 10px 0">
              <el-form-item label="工艺名称:">
                <el-input type="text" style="margin-right: 20px" v-model="form.name" placeholder="请填写" />
              </el-form-item>
              <el-form-item label="工艺版本:">
                <el-input type="text" style="margin-right: 20px" v-model="form.version" placeholder="请填写">
                  <template #prepend>V</template>
                </el-input>
              </el-form-item>
              <el-form-item label="其他设备:">
                <el-select filterable v-model="form.equipmentId" placeholder="请选择(输入可搜索)">
                  <el-option v-for="item in equipmentModelList" :label="item.name" :value="item.id" :key="item.id" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <!-- 增加测试工艺步骤 -->
          <el-col :span="18" style="margin-left: 20px; height: auto">
            <el-text size="large">2.增加测试工艺</el-text>
            <el-card shadow="never" style="margin-top: 10px; width: 110%">
              <el-row>
                <el-col :span="4">
                  <div class="process-left">
                    <div class="mb1">
                      <el-scrollbar height="620px" ref="stepScrollbarRef">
                        <div ref="stepInnerRef">
                          <el-button-group style="margin: 5px; width: 95%" v-for="item in stepinfo" :key="item.step">
                            <el-button :type="activeBtn(item.step)" style="width: 75%" @click="currentStep(item.step)">
                              第{{ item.step }}步
                            </el-button>
                            <el-button
                              :disabled="stepinfo.length == 1"
                              style="width: 20%"
                              icon="Delete"
                              type="danger"
                              @click="removeStep(item.step)"
                            />
                          </el-button-group>
                        </div>
                      </el-scrollbar>
                    </div>
                    <div class="mb1">
                      <el-button icon="Plus" type="primary" class="mb-add" @click="addStep">新增步骤</el-button>
                    </div>
                  </div>
                </el-col>
                <el-col :span="20" v-if="showprocessRight">
                  <el-card shadow="never">
                    <el-row>
                      <el-col :span="24">
                        <el-text style="font-size: 20px; font-weight: bold">当前编辑: 第{{ form.curStep }}步</el-text>
                        <el-form-item style="margin-top: 15px" label="步骤名称:">
                          <el-input
                            placeholder="请填写"
                            v-model="
                              stepinfo.find((item) => {
                                return item.step == form.curStep
                              }).info.name
                            "
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="24">
                        <el-form-item label="步骤描述:">
                          <el-input
                            placeholder="请填写"
                            type="textarea"
                            v-model="
                              stepinfo.find((item) => {
                                return item.step == form.curStep
                              }).info.desc
                            "
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="24">
                        <el-row>
                          <el-col :span="3" class="operate">
                            <div>
                              <el-text style="" size="large">增加操作:</el-text>
                            </div>
                            <el-button
                              size="default"
                              type="primary"
                              icon="plus"
                              style="margin-top: 20px; width: 90%"
                              @click="addSteptype('ParaProcess')"
                              >填写参数
                            </el-button>
                            <el-button
                              size="default"
                              type="primary"
                              icon="plus"
                              style="margin-top: 20px; width: 90%"
                              @click="addSteptype('RecordProcess')"
                              >拍照记录
                            </el-button>
                            <el-button
                              size="default"
                              type="primary"
                              icon="plus"
                              style="margin-top: 20px; width: 90%"
                              @click="addSteptype('ScanProcess')"
                              >扫码识别
                            </el-button>
                          </el-col>
                          <el-col :span="21">
                            <el-card shadow="never" style="background: #fafafa">
                              <el-scrollbar always="always" height="500px" ref="scrollbarRef">
                                <div ref="innerRef">
                                  <template
                                    v-for="compontent in stepinfo.find((item) => {
                                      return item.step == form.curStep
                                    }).info.tabList"
                                    :key="compontent.id"
                                  >
                                    <component
                                      :is="compontent.com"
                                      @remove-scan="removeCom(compontent.id)"
                                      @remove-record="removeCom(compontent.id)"
                                      @remove-para="removeCom(compontent.id)"
                                    />
                                  </template>
                                </div>
                              </el-scrollbar>
                            </el-card>
                          </el-col>
                        </el-row>
                      </el-col>
                    </el-row>
                  </el-card>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <el-button>取消</el-button>
            <el-button type="primary" style="margin-left: 10px" @click="handleconfirmAddProcess">确认新增</el-button>
          </div>
        </template>
      </el-card>
      <!--其他通用测试-->
      <el-card v-else><el-empty description="待开发..." /></el-card>
    </div>
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
    <el-dialog width="80%" title="标注图片" v-model="editDialogVisible">
      <div style="margin-top: 30px">
        <img-editor :img-url="editImg" @save="saveEdit" />
      </div>
    </el-dialog>
    <el-dialog
      @close="captcha?.reset()"
      align-center
      width="20%"
      :title="'确认提交:' + form.curType"
      v-model="confirmDialogVisible"
    >
      <div>
        <CaptchaSlider ref="captcha" tip="滑动来进行提交" success-tip="已确认" @success="confirmAddProcess" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, markRaw, watch } from "vue"
import { useRouter } from "vue-router"
import ParaProcess from "@/views/testmanage/addprocess/parametersprocesss/index.vue"
import RecordProcess from "@/views/testmanage/addprocess/recordprocess/index.vue"
import ScanProcess from "@/views/testmanage/addprocess/scanprocess/index.vue"
import pictureCard from "@/views/testmanage/addprocess/pictureCard/index.vue"
import stepComponent from "@/views/testmanage/addprocess/stepComponent/index.vue"
import picComponent from "@/views/testmanage/addprocess/picComponent/index.vue"
import detailComponent from "@/views/testmanage/addprocess/detailComponent/index.vue"
import { CaptchaExposed, CaptchaSlider } from "vexip-ui"
import imgEditor from "@/components/imgEditor/index.vue"
import { VueCropper } from "vue-cropper"
import "vue-cropper/dist/index.css"
import { ElScrollbar, ElMessageBox, ElMessage } from "element-plus"
import type { FormInstance, FormRules, UploadUserFile } from "element-plus"
import { Delete, ArrowRight, UploadFilled, Failed } from "@element-plus/icons-vue"
import { getTestTypeDataApi } from "@/api/testtype"
import { getFixtureModelDataApi } from "@/api/fixturemodel"
import { getEquipmentTypeDataApi } from "@/api/otherModelType"
import { getPsiModelDataApi } from "@/api/psimodel"
import { upoloadfuncttest } from "@/api/addprocess/index"
import { useUserStore } from "@/store/modules/test"
defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const testStore = useUserStore()
const router = useRouter()
const testTypeShow = ref("X-Ray测试")
const innerRef = ref<HTMLDivElement>()
const stepInnerRef = ref<HTMLDivElement>()
const innerEyesTotalRef = ref<HTMLDivElement>()
const innerXrayTotalRef = ref<HTMLDivElement>()
const innerEyesAreaRef = ref<HTMLDivElement>()
const innerXrayAreaRef = ref<HTMLDivElement>()
const innerEyesTotalPicRef = ref<HTMLDivElement>()
const innerXrayTotalPicRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const stepScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const eyesTotalScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const xrayTotalScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const eyesTotalPicScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const xrayTotalPicScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const eyesAreaScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const xrayAreaScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const captcha = ref<CaptchaExposed>()
const testTypeList = ref([])
const eyesCheck = ref(1)
const xrayCheck = ref(1)
const eyesCheckArea = ref(1)
const xrayCheckArea = ref(1)
const dialogImageUrl = ref("")
const dialogVisible = ref(false)
const editDialogVisible = ref(false)
const confirmDialogVisible = ref(false)
const cropperRef: any = ref({})
const cropperXRef: any = ref({})
const preview = ref<any>({})
const previewX = ref<any>({})
const eyesTotalImg = ref("")
const xrayTotalImg = ref("")
const currentEditImg = ref("")
const editImg = ref("")
const eyesTotalShot = ref(true)
const xrayTotalShot = ref(true)
const stoppers = []
const option = reactive({
  img: "", // 裁剪图片的地址 url 地址, base64, blob
  outputSize: 1, // 裁剪生成图片的质量
  outputType: "jpeg", // 裁剪生成图片的格式 jpeg, png, webp
  info: true, // 裁剪框的大小信息
  canScale: false, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 150, // 默认生成截图框宽度
  autoCropHeight: 150, // 默认生成截图框高度
  fixedBox: false, // 固定截图框大小 不允许改变
  fixed: true, // 是否开启截图框宽高固定比例，这个如果设置为true，截图框会是固定比例缩放的，如果设置为false，则截图框的狂宽高比例就不固定了
  fixedNumber: [1, 1], // 截图框的宽高比例 [ 宽度 , 高度 ]
  canMove: true, // 上传图片是否可以移动
  canMoveBox: true, // 截图框能否拖动
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  full: true // 是否输出原图比例的截图
})
const optionX = reactive({
  img: "", // 裁剪图片的地址 url 地址, base64, blob
  outputSize: 1, // 裁剪生成图片的质量
  outputType: "jpeg", // 裁剪生成图片的格式 jpeg, png, webp
  info: true, // 裁剪框的大小信息
  canScale: false, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 150, // 默认生成截图框宽度
  autoCropHeight: 150, // 默认生成截图框高度
  fixedBox: false, // 固定截图框大小 不允许改变
  fixed: true, // 是否开启截图框宽高固定比例，这个如果设置为true，截图框会是固定比例缩放的，如果设置为false，则截图框的狂宽高比例就不固定了
  fixedNumber: [1, 1], // 截图框的宽高比例 [ 宽度 , 高度 ]
  canMove: true, // 上传图片是否可以移动
  canMoveBox: true, // 截图框能否拖动
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  full: true // 是否输出原图比例的截图
})
const eyesImageCutList = ref<any[]>([])
const XRayImageCutList = ref<any>([])
/**
 * fixtureModelList
 * psiModelList
 * equipmentModelList
 */
const fixtureModelList = ref([])
const psiModelList = ref([])
const equipmentModelList = ref([])

const fileList = ref<UploadUserFile[]>([])

const showprocessRight = ref(true)
// X-Ray测试
const form = reactive({
  name: "",
  version: "",
  fixtureId: "",
  hostId: "",
  equipmentId: [],
  radio1: "1",
  processName: "",
  processDesc: "",
  curStep: "1",
  curType: "",
  curTypeId: -1
})
// 功能性测试form
const functform = reactive({
  name: "",
  version: "",
  fixtureId: "",
  hostId: "",
  equipmentId: [],
  File: null
})

const validatePass = (rule: any, value: any, callback: any) => {
  console.log(value)

  if (value.toString() === testStore.versionArr.includes(functform.version)) {
    console.log("该版本已存在")

    callback(new Error("该版本已存在"))
  } else {
    callback()
  }
}
interface ruleForm {
  version: string
}
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<ruleForm>>({
  version: [{ validator: validatePass, trigger: "blur" }]
})

//工艺版本处理
const handleVision = () => {
  //
  // testStore.versionArr.find(item=>{
  //   if(item==functform.version){
  //     ElMessage.error('该版本已存在')
  //   }else{
  //     ElMessage.success('该版本可以使用')
  //   }
  // })
  if (testStore.versionArr.includes(functform.version)) {
    ElMessage.error("该版本已存在")
  } else if (functform.version == "") {
    return
  } else {
    ElMessage.success("该版本可以使用")
  }
  console.log(functform.version)
  console.log(testStore.versionArr)
}

const getTestTypeData = () => {
  getTestTypeDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    testTypeList.value = res.data.list
  })
}
const getFixtureModelData = () => {
  getFixtureModelDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    fixtureModelList.value = res.data.list
  })
}
const getPsiModelModelData = () => {
  getPsiModelDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    psiModelList.value = res.data.list
  })
}
const getEquipmentModelData = () => {
  getEquipmentTypeDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    equipmentModelList.value = res.data.list
  })
}
const testid = ref<number>()
const TestType = (type: string, id: number): void => {
  testid.value = id
  testTypeShow.value = type
  form.curType = type
  form.curTypeId = id
}
const uploadImg = (e, num) => {
  const file = e.target.files[0]
  if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
    alert("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种")
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    let data
    if (typeof e.target.result === "object") {
      data = window["URL"].createObjectURL(new Blob([e.target.result]))
    } else {
      data = e.target.result
    }
    if (num === 1) {
      option.img = data
    }
  }
  reader.readAsArrayBuffer(file)
}
const uploadXImg = (e, num) => {
  const file = e.target.files[0]
  if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
    alert("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种")
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    let data
    if (typeof e.target.result === "object") {
      data = window["URL"].createObjectURL(new Blob([e.target.result]))
    } else {
      data = e.target.result
    }
    if (num === 1) {
      optionX.img = data
    }
  }
  reader.readAsArrayBuffer(file)
}
const stepinfo = reactive([
  {
    step: "1",
    info: {
      name: "",
      desc: "",
      tabList: [],
      operate: []
    }
  }
])
const eyesTotalStepInfo = reactive([
  {
    id: 1,
    name: "",
    desc: ""
  }
])
const eyesTotalPicStepInfo = reactive([])
const xrayTotalStepInfo = reactive([
  {
    id: 1,
    name: "",
    desc: ""
  }
])
const xrayTotalPicStepInfo = reactive([])
const addEyesTotalStep = async () => {
  eyesTotalStepInfo.push({
    id: eyesTotalStepInfo.length + 1,
    name: "",
    desc: ""
  })
  await nextTick()
  eyesTotalScrollbarRef.value!.scrollTo(0, innerEyesTotalRef.value!.scrollHeight)
}
const addEyesTotalPic = async () => {
  eyesTotalPicStepInfo.push({
    id: eyesTotalPicStepInfo.length + 1,
    name: "",
    desc: "",
    url: ""
  })
  await nextTick()
  eyesTotalPicScrollbarRef.value!.scrollTo(0, innerEyesTotalPicRef.value!.scrollHeight)
}
const addXrayTotalStep = async () => {
  xrayTotalStepInfo.push({
    id: xrayTotalStepInfo.length + 1,
    name: "",
    desc: ""
  })
  await nextTick()
  xrayTotalScrollbarRef.value!.scrollTo(0, innerXrayTotalRef.value!.scrollHeight)
}
const addXrayTotalPic = async () => {
  xrayTotalPicStepInfo.push({
    id: xrayTotalPicStepInfo.length + 1,
    name: "",
    desc: "",
    url: ""
  })
  await nextTick()
  xrayTotalPicScrollbarRef.value!.scrollTo(0, innerXrayTotalPicRef.value!.scrollHeight)
}
const addEyesAreaStep = async (data) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == data
    })
    .eyesAreaStepInfo.push({
      id: eyesImageCutList.value.find((item) => item.id == data).eyesAreaStepInfo.length + 1,
      name: "",
      desc: ""
    })
}
const addEyesAreaPic = (val) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == val
    })
    .eyesAreaPicStepInfo.push({
      id:
        eyesImageCutList.value.find((item) => {
          return item.id == val
        }).eyesAreaPicStepInfo.length + 1,
      name: "",
      desc: "",
      url: ""
    })
}
const addEyesDetail = async (data) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == data
    })
    .eyesAreaDetailInfo.push({
      id: eyesImageCutList.value.find((item) => item.id == data).eyesAreaDetailInfo.length + 1,
      name: "",
      url: "",
      step: [{ id: 1, name: "", desc: "" }],
      pic: []
    })
}
const addEyesAreaDetailStep = (imgData, comData) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaDetailInfo.find((item) => item.id == comData)
    .step.push({
      id:
        eyesImageCutList.value
          .find((item) => {
            return item.id == imgData
          })
          .eyesAreaDetailInfo.find((item) => item.id == comData).step.length + 1,
      name: "",
      desc: ""
    })
  console.log(eyesImageCutList)
}
const addEyesAreaDetailPic = (imgData, comData) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaDetailInfo.find((item) => item.id == comData)
    .pic.push({
      id:
        eyesImageCutList.value
          .find((item) => {
            return item.id == imgData
          })
          .eyesAreaDetailInfo.find((item) => item.id == comData).pic.length + 1,
      name: "",
      desc: "",
      url: ""
    })
}
const removeEyesAreaDetail = (imgData, comData) => {
  if (
    eyesImageCutList.value.find((item) => {
      return item.id == imgData
    }).eyesAreaDetailInfo.length === 1
  ) {
    ElMessage({
      type: "error",
      message: "至少应包含一个点位"
    })
    return
  }
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = comData - 1
    if (index !== -1) {
      eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaDetailInfo.splice(index, 1)
    }
    eyesImageCutList.value
      .find((item) => {
        return item.id == imgData
      })
      .eyesAreaDetailInfo.forEach((item, index) => {
        item.id = index + 1
      })
  })
}
const removeEyesAreaDetailStep = (val, imgData, comData) => {
  if (
    eyesImageCutList.value
      .find((item) => {
        return item.id == imgData
      })
      .eyesAreaDetailInfo.find((item) => item.id == comData).step.length === 1
  ) {
    ElMessage({
      type: "error",
      message: "至少应包含一个点位"
    })
    return
  }
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = val - 1
    if (index !== -1) {
      eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaDetailInfo.find((item) => {
          return item.id == comData
        })
        .step.splice(index, 1)
    }
    eyesImageCutList.value
      .find((item) => {
        return item.id == imgData
      })
      .eyesAreaDetailInfo.find((item) => {
        return item.id == comData
      })
      .step.forEach((item, index) => {
        item.id = index + 1
      })
  })
}
const removeEyesAreaDetailPic = (val, imgData, comData) => {
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = val - 1
    if (index !== -1) {
      eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaDetailInfo.find((item) => {
          return item.id == comData
        })
        .pic.splice(index, 1)
    }
    eyesImageCutList.value
      .find((item) => {
        return item.id == imgData
      })
      .eyesAreaDetailInfo.find((item) => {
        return item.id == comData
      })
      .pic.forEach((item, index) => {
        item.id = index + 1
      })
  })
}
const addXrayAreaStep = async (data) => {
  XRayImageCutList.value
    .find((item) => {
      return item.id == data
    })
    .xrayAreaStepInfo.push({
      id: XRayImageCutList.value.find((item) => item.id == data).xrayAreaStepInfo.length + 1,
      name: "",
      desc: ""
    })
}
const uploadFunc = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/png, image/jpeg, image/gif, image/jpg" // 限制选择的文件类型为 .pdf, .png, .zip, .jpg
    input.style.display = "none"
    document.body.appendChild(input)
    input.click()
    input.onchange = (e) => {
      const file = e.target["files"][0]
      const reader = new FileReader()
      reader.onload = (e) => {
        let data
        if (typeof e.target.result === "object") {
          data = window["URL"].createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        resolve(data)
      }
      reader.onerror = (e) => {
        reject(e)
      }
      reader.readAsDataURL(file)
    }
  })
}
const uploadEyesTotalPicCom = (val) => {
  uploadFunc().then(
    (data) =>
      (eyesTotalPicStepInfo.find((item) => {
        return item.id == val
      }).url = data)
  )
}
const uploadEyesAreaPicCom = (imgData, comData) => {
  uploadFunc().then(
    (data) =>
      (eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaPicStepInfo.find((item) => {
          return item.id == comData
        }).url = data)
  )
}
const uploadXrayTotalPicCom = (val) => {
  uploadFunc().then(
    (data) =>
      (xrayTotalPicStepInfo.find((item) => {
        return item.id == val
      }).url = data)
  )
}
const uploadXrayAreaPicCom = (imgData, comData) => {
  uploadFunc().then(
    (data) =>
      (XRayImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .xrayAreaPicStepInfo.find((item) => {
          return item.id == comData
        }).url = data)
  )
}
const uploadEyesAreaDetailCom = (imgData, comData) => {
  uploadFunc().then(
    (data) =>
      (eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaDetailInfo.find((item) => {
          return item.id == comData
        }).url = data)
  )
}
const uploadEyesAreaDetailPic = (picData, imgData, comData) => {
  uploadFunc().then(
    (data) =>
      (eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaDetailInfo.find((item) => {
          return item.id == comData
        })
        .pic.find((item) => {
          return item.id == picData
        }).url = data)
  )
}
const editEyesTotalPicCom = (data) => {
  eyesTotalPicStepInfo.find((item) => {
    return item.id == data
  }).url = option.img
  editImg.value = eyesTotalPicStepInfo.find((item) => {
    return item.id == data
  }).url
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      eyesTotalPicStepInfo.find((item) => {
        return item.id == data
      }).url = val
    })
  )
  editDialogVisible.value = true
}
const editXrayTotalPicCom = (data) => {
  xrayTotalPicStepInfo.find((item) => {
    return item.id == data
  }).url = optionX.img
  editImg.value = xrayTotalPicStepInfo.find((item) => {
    return item.id == data
  }).url
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      xrayTotalPicStepInfo.find((item) => {
        return item.id == data
      }).url = val
    })
  )
  editDialogVisible.value = true
}
const editEyesAreaPicCom = (imgData, comData) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaPicStepInfo.find((item) => {
      return item.id == comData
    }).url = eyesImageCutList.value.find((item) => {
    return item.id == imgData
  }).url
  editImg.value = eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaPicStepInfo.find((item) => {
      return item.id == comData
    }).url
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaPicStepInfo.find((item) => {
          return item.id == comData
        }).url = val
    })
  )
  editDialogVisible.value = true
}
const editEyesAreaDetailCom = (imgData, comData) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaDetailInfo.find((item) => {
      return item.id == comData
    }).url = eyesImageCutList.value.find((item) => {
    return item.id == imgData
  }).url
  editImg.value = eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaDetailInfo.find((item) => {
      return item.id == comData
    }).url
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaDetailInfo.find((item) => {
          return item.id == comData
        }).url = val
    })
  )
  editDialogVisible.value = true
}
const editEyesAreaDetailPic = (picData, imgData, comData) => {
  eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaDetailInfo.find((item) => {
      return item.id == comData
    })
    .pic.find((item) => {
      return item.id == picData
    }).url = eyesImageCutList.value.find((item) => {
    return item.id == imgData
  }).url
  editImg.value = eyesImageCutList.value
    .find((item) => {
      return item.id == imgData
    })
    .eyesAreaDetailInfo.find((item) => {
      return item.id == comData
    })
    .pic.find((item) => {
      return item.id == picData
    }).url
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      eyesImageCutList.value
        .find((item) => {
          return item.id == imgData
        })
        .eyesAreaDetailInfo.find((item) => {
          return item.id == comData
        })
        .pic.find((item) => {
          return item.id == picData
        }).url = val
    })
  )
  editDialogVisible.value = true
}
let stepNumber = 1
const addStep = async () => {
  stepNumber++
  stepinfo.push({
    step: String(stepNumber),
    info: {
      name: "",
      desc: "",
      tabList: [],
      operate: []
    }
  })
  // 重置表单
  form.processName = ""
  form.processDesc = ""
  form.curStep = String(stepNumber)
  await nextTick()
  stepScrollbarRef.value!.scrollTo(0, stepInnerRef.value!.scrollHeight)
}

const currentStep = (stepCur: any) => {
  form.curStep = stepCur
  const result = stepinfo.find((item) => {
    return item.step == stepCur
  })
  // 填充表单
  form.processName = result.info.name
  form.processDesc = result.info.desc
}
let idCounter = 0
const addSteptype = async (type) => {
  const comId = idCounter++
  if (type === "ParaProcess") {
    stepinfo
      .find((item) => {
        return item.step == form.curStep
      })
      .info.tabList.push({ com: ParaProcess, id: comId })
  } else if (type === "RecordProcess") {
    stepinfo
      .find((item) => {
        return item.step == form.curStep
      })
      .info.tabList.push({ com: RecordProcess, id: comId })
  } else {
    stepinfo
      .find((item) => {
        return item.step == form.curStep
      })
      .info.tabList.push({ com: ScanProcess, id: comId })
  }
  await nextTick()
  scrollbarRef.value!.scrollTo(0, innerRef.value!.scrollHeight)
}
const removeCom = (val: any) => {
  ElMessageBox.confirm("是否删除该操作", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    stepinfo.find((item) => {
      return item.step == form.curStep
    }).info.tabList = stepinfo
      .find((item) => {
        return item.step == form.curStep
      })
      .info.tabList.filter((component) => component.id !== val)
  })
}
const removeEyesTotalCom = (val) => {
  if (eyesTotalStepInfo.length === 1) {
    ElMessage({
      type: "error",
      message: "至少应包含一个检测项"
    })
    return
  }
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = eyesTotalStepInfo.findIndex((item) => item.id == val)
    if (index !== -1) {
      eyesTotalStepInfo.splice(index, 1)
    }
    for (let i = 0; i < eyesTotalStepInfo.length; i++) {
      eyesTotalStepInfo[i].id = i + 1
    }
  })
}
const removeEyesTotalPicCom = (val) => {
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = eyesTotalPicStepInfo.findIndex((item) => item.id == val)
    if (index !== -1) {
      eyesTotalPicStepInfo.splice(index, 1)
    }
    for (let i = 0; i < eyesTotalPicStepInfo.length; i++) {
      eyesTotalPicStepInfo[i].id = i + 1
    }
  })
}
const removeXrayTotalCom = (val) => {
  if (xrayTotalStepInfo.length === 1) {
    ElMessage({
      type: "error",
      message: "至少应包含一个检测项"
    })
    return
  }
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = xrayTotalStepInfo.findIndex((item) => item.id == val)
    if (index !== -1) {
      xrayTotalStepInfo.splice(index, 1)
    }
    for (let i = 0; i < xrayTotalStepInfo.length; i++) {
      xrayTotalStepInfo[i].id = i + 1
    }
  })
}
const removeXrayTotalPicCom = (val) => {
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = xrayTotalPicStepInfo.findIndex((item) => item.id == val)
    if (index !== -1) {
      xrayTotalPicStepInfo.splice(index, 1)
    }
    for (let i = 0; i < xrayTotalPicStepInfo.length; i++) {
      xrayTotalPicStepInfo[i].id = i + 1
    }
  })
}
const removeEyesAreaCom = (data, val) => {
  if (
    eyesImageCutList.value.find((item) => {
      return item.id == data.id
    }).eyesAreaStepInfo.length === 1
  ) {
    ElMessage({
      type: "error",
      message: "至少应包含一个检测项"
    })
    return
  }
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const _index = eyesImageCutList.value.findIndex((item) => item.id == data.id)
    const index = val - 1
    if (index !== -1) {
      eyesImageCutList.value
        .find((item) => {
          return item.id == _index + 1
        })
        .eyesAreaStepInfo.splice(index, 1)
    }
    eyesImageCutList.value
      .find((item) => {
        return item.id == _index + 1
      })
      .eyesAreaStepInfo.forEach((item, index) => {
        item.id = index + 1
      })
  })
}
const removeEyesAreaPicCom = (data, val) => {
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = val - 1
    if (index !== -1) {
      eyesImageCutList.value
        .find((item) => {
          return item.id == data
        })
        .eyesAreaPicStepInfo.splice(index, 1)
    }
    eyesImageCutList.value
      .find((item) => {
        return item.id == data
      })
      .eyesAreaPicStepInfo.forEach((item, index = 0) => {
        item.id = index + 1
      })
  })
}
const removeXrayAreaCom = (data, val) => {
  if (
    XRayImageCutList.value.find((item) => {
      return item.id == data.id
    }).xrayAreaStepInfo.length === 1
  ) {
    ElMessage({
      type: "error",
      message: "至少应包含一个检测项"
    })
    return
  }
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const _index = XRayImageCutList.value.findIndex((item) => item.id == data.id)
    const index = val - 1
    if (index !== -1) {
      XRayImageCutList.value
        .find((item) => {
          return item.id == _index + 1
        })
        .xrayAreaStepInfo.splice(index, 1)
    }
    XRayImageCutList.value
      .find((item) => {
        return item.id == _index + 1
      })
      .xrayAreaStepInfo.forEach((item, index) => {
        item.id = index + 1
      })
  })
}
const removeXrayAreaPicCom = (data, val) => {
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = val - 1
    if (index !== -1) {
      XRayImageCutList.value
        .find((item) => {
          return item.id == data
        })
        .xrayAreaPicStepInfo.splice(index, 1)
    }
    XRayImageCutList.value
      .find((item) => {
        return item.id == data
      })
      .xrayAreaPicStepInfo.forEach((item, index = 0) => {
        item.id = index + 1
      })
  })
}
const removeStep = (val: any) => {
  form.curStep = val
  ElMessageBox.confirm("该操作将导致该步骤所有已编辑的数据被永久性移除", "删除确认:第" + val + "步", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error",
    icon: markRaw(Delete)
  }).then(() => {
    const index = stepinfo.findIndex((item) => item.step == val)
    console.log(index)
    if (index !== -1) {
      stepinfo.splice(index, 1)
    }
    for (let i = 0; i < stepinfo.length; i++) {
      stepinfo[i].step = `${i + 1}`
    }
    form.curStep = String(val - 1)
    stepNumber = stepinfo.length
  })
}
const activeBtn = (val) => {
  if (val == form.curStep) {
    return "success"
  } else {
    return null
  }
}
const activeType = (val): "info" | "default" | "text" | "success" | "warning" | "primary" | "danger" => {
  if (val == form.curType) {
    return "success"
  } else {
    return null
  }
}
const nextEyesCheck = () => {
  if (eyesCheck.value !== 3) {
    if (eyesCheck.value === 1) {
      eyesTotalImg.value = option.img
    }
    eyesCheck.value += 1
  }
}
const previousEyesCheck = () => {
  if (eyesCheck.value !== 1) {
    eyesCheck.value -= 1
  }
}
const nextXrayCheck = () => {
  if (xrayCheck.value !== 3) {
    if (xrayCheck.value === 1) {
      xrayTotalImg.value = optionX.img
    }
    xrayCheck.value += 1
  }
}
const previousXrayCheck = () => {
  if (xrayCheck.value !== 1) {
    xrayCheck.value -= 1
  }
}
let eyesCheckAreaId = 1
const handleEyesCheckCut = () => {
  cropperRef.value.getCropData((data) => {
    eyesImageCutList.value.push({
      id: eyesCheckAreaId,
      url: data,
      needGeneral: true,
      needGeneralPic: true,
      eyesAreaStepInfo: [
        {
          id: 1,
          name: "",
          desc: ""
        }
      ],
      eyesAreaPicStepInfo: [],
      eyesAreaDetailInfo: [
        {
          id: 1,
          name: "",
          url: "",
          step: [{ id: 1, name: "", desc: "" }],
          pic: []
        }
      ]
    })
    eyesCheckAreaId += 1
  })
}
let xrayCheckAreaId = 1
const handleXrayCheckCut = () => {
  cropperXRef.value.getCropData((data) => {
    XRayImageCutList.value.push({
      id: xrayCheckAreaId,
      url: data,
      xrayAreaStepInfo: [
        {
          id: 1,
          name: "",
          desc: ""
        }
      ],
      xrayAreaPicStepInfo: [
        {
          id: 1,
          name: "",
          desc: "",
          url: ""
        }
      ],
      xrayAreaDetailInfo: [
        {
          id: 1,
          name: "",
          url: "",
          step: [{ id: 1, name: "", desc: "" }],
          pic: []
        }
      ]
    })
    xrayCheckAreaId += 1
  })
}
const realTime = () => {
  cropperRef.value.getCropData((res) => {
    preview.value.url = res
  })
}
const realTimeX = () => {
  cropperXRef.value.getCropData((res) => {
    previewX.value.url = res
  })
}
const visibleTabButton = ref<any>()
const handleMouseEnterTab = (data: any) => {
  visibleTabButton.value = data
}
const handleMouseLeaveTab = () => {
  visibleTabButton.value = undefined
}
const moveTabUp = (data, mode) => {
  if (mode === 1) {
    const index = XRayImageCutList.value.findIndex((item) => {
      return item.id === data
    })
    if (index > 0) {
      const item = XRayImageCutList.value[index]
      XRayImageCutList.value.splice(index, 1)
      XRayImageCutList.value.splice(index - 1, 0, item)
    }
    // 重新排序
    XRayImageCutList.value.forEach((item, index) => {
      item.id = index + 1
    })
  } else {
    const index = eyesImageCutList.value.findIndex((item) => {
      return item.id === data
    })
    if (index > 0) {
      const item = eyesImageCutList.value[index]
      eyesImageCutList.value.splice(index, 1)
      eyesImageCutList.value.splice(index - 1, 0, item)
    }
    // 重新排序
    eyesImageCutList.value.forEach((item, index) => {
      item.id = index + 1
    })
  }
}
const moveTabDown = (data, mode) => {
  if (mode === 1) {
    const index = XRayImageCutList.value.findIndex((item) => {
      return item.id === data
    })
    if (index < XRayImageCutList.value.length - 1) {
      const item = XRayImageCutList.value[index]
      XRayImageCutList.value.splice(index, 1)
      XRayImageCutList.value.splice(index + 1, 0, item)
    }
    // 重新排序
    XRayImageCutList.value.forEach((item, index) => {
      item.id = index + 1
    })
  } else {
    const index = eyesImageCutList.value.findIndex((item) => {
      return item.id === data
    })
    if (index < eyesImageCutList.value.length - 1) {
      const item = eyesImageCutList.value[index]
      eyesImageCutList.value.splice(index, 1)
      eyesImageCutList.value.splice(index + 1, 0, item)
    }
    // 重新排序
    eyesImageCutList.value.forEach((item, index) => {
      item.id = index + 1
    })
  }
}
const handleDeletePic = (data) => {
  const index = eyesImageCutList.value.findIndex((item) => {
    return item.id === data.id
  })
  eyesImageCutList.value.splice(index, 1)
  eyesImageCutList.value.forEach((item, index) => {
    item.id = index + 1
  })
}
const handleDeleteXPic = (data) => {
  const index = XRayImageCutList.value.findIndex((item) => {
    return item.id === data.id
  })
  XRayImageCutList.value.splice(index, 1)
  XRayImageCutList.value.forEach((item, index) => {
    item.id = index + 1
  })
}
const draggableOnUpdate = () => {
  console.log(eyesImageCutList)
  eyesImageCutList.value.forEach((item, index) => {
    item.id = index + 1
  })
}
const draggableXOnUpdate = () => {
  XRayImageCutList.value.forEach((item, index) => {
    item.id = index + 1
  })
}
const saveEdit = async (data) => {
  currentEditImg.value = data
  editDialogVisible.value = false
  await nextTick()
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
}
const editEyestotal = () => {
  editImg.value = eyesTotalImg.value
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      eyesTotalImg.value = val
    })
  )
  editDialogVisible.value = true
}
const editXraytotal = () => {
  editImg.value = xrayTotalImg.value
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      xrayTotalImg.value = val
    })
  )
  editDialogVisible.value = true
}
const editEyesArea = (data) => {
  editImg.value = data.url
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      eyesImageCutList.value[data.id - 1].url = val
    })
  )
  editDialogVisible.value = true
}
const editXrayArea = (data) => {
  editImg.value = data.url
  stoppers.forEach((stop) => stop())
  stoppers.splice(0, stoppers.length)
  stoppers.push(
    watch(currentEditImg, (val) => {
      XRayImageCutList.value[data.id - 1].url = val
    })
  )
  editDialogVisible.value = true
}
const handleconfirmAddProcess = (formEl: FormInstance | undefined) => {
  confirmDialogVisible.value = true
  // console.log(functform)
}

//选择文件
const handleFileChange = (file: any) => {
  // console.log(file.raw)
  // from.append("file", file.raw)
  functform.File = file.raw
  fileList.value.push({ name: file.name, url: URL.createObjectURL(file.raw) })
}

const confirmAddProcess = () => {
  interface FormDataFields {
    name: string
    version: string
    fixtureId: string
    hostId: string
    equipmentId: string // 假设 equipmentId 已经被转化为字符串
    File: File | Blob | null // 假设 File 是 File 或 Blob 类型，或者可能是 null
    board_model_id: string
    testtype: string | number // 根据你的实际情况，testtype 可能是字符串或数字
  }
  const data: FormDataFields = {
    name: functform.name,
    version: functform.version,
    fixtureId: functform.fixtureId,
    hostId: functform.hostId,
    equipmentId: JSON.stringify(functform.equipmentId),
    File: functform.File,
    board_model_id: testStore.board_model_id,
    testtype: form.curTypeId
  }

  const fromData = new FormData()

  for (const key in data) {
    fromData.append(key, data[key])
  }

  // fromData.append('name', functform.name)
  // fromData.append('version', functform.version)
  // fromData.append('fixtureId', functform.fixtureId)
  // fromData.append('hostId', functform.hostId)
  // fromData.append('equipmentId', JSON.stringify(functform.equipmentId))
  // fromData.append('file', functform.File)
  // fromData.append('board_model_id', testStore.board_model_id)
  // fromData.append('testtype', form.curTypeId)
  upoloadfuncttest(fromData).then((res) => {
    // console.log(res)
    if (res.code == 0) {
      ElMessage.success("新增成功")
    }
  })
  confirmDialogVisible.value = false
  router.push("/testmanage/testprocess")
}
getTestTypeData()
getPsiModelModelData()
getFixtureModelData()
getEquipmentModelData()
</script>

<style scoped lang="scss">
.el-button + .el-button {
  margin: 0;
}

.process-left {
  .mb1 {
    display: flex;
    flex-direction: column;
  }

  .mb-add {
    width: 90%;
    margin: 20px 5px 5px;
  }
}

.operate {
  display: flex;
  flex-direction: column;
}

.selectTypeBtn {
  display: flex;
  justify-content: space-between;
  margin: 15px auto auto auto;
}

.selectBtn + .selectBtn {
  margin-left: 10px;
}

.btn {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 20px 10px 0 0;
  padding: 9px 15px;
  font-size: 14px;
  border-radius: 4px;
  color: #fff;
  background: #63a3f5;
  border: 1px solid #63a3f5;
  transition: all 0.2s ease;
  text-decoration: none;
  user-select: none;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.demo-tabs .custom-tabs-label div {
  margin-left: 4px;
}

.demo-tabs .custom-tabs-label span {
  margin-left: 4px;
}
</style>
