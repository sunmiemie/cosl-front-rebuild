<template>
  <div class="boardBox">
    <div id="tui-image-editor" />
    <div style="display: flex; justify-content: end; margin-top: 10px">
      <el-button type="primary" @click="$emit('save', this.instance.toDataURL())">保存</el-button>
    </div>
  </div>
</template>
<script lang="js">
import "tui-image-editor/dist/tui-image-editor.css"
import "tui-color-picker/dist/tui-color-picker.css"
import ImageEditor from "tui-image-editor"

const localeCN = {
  ZoomIn: "放大",
  ZoomOut: "缩小",
  Hand: "手掌",
  History: "历史",
  Resize: "调整宽高",
  Crop: "裁剪",
  DeleteAll: "全部删除",
  Delete: "删除",
  Undo: "撤销",
  Redo: "反撤销",
  Reset: "重置",
  Flip: "镜像",
  Rotate: "旋转",
  Draw: "画",
  Shape: "形状标注",
  Icon: "图标标注",
  Text: "文字标注",
  Mask: "遮罩",
  Filter: "滤镜",
  Bold: "加粗",
  Italic: "斜体",
  Underline: "下划线",
  Left: "左对齐",
  Center: "居中",
  Right: "右对齐",
  Color: "颜色",
  "Text size": "字体大小",
  Custom: "自定义",
  Square: "正方形",
  Apply: "应用",
  Cancel: "取消",
  "Flip X": "X 轴",
  "Flip Y": "Y 轴",
  Range: "区间",
  Stroke: "描边",
  Fill: "填充",
  Circle: "圆",
  Triangle: "三角",
  Rectangle: "矩形",
  Free: "曲线",
  Straight: "直线",
  Arrow: "箭头",
  "Arrow-2": "箭头2",
  "Arrow-3": "箭头3",
  "Star-1": "星星1",
  "Star-2": "星星2",
  Polygon: "多边形",
  Location: "定位",
  Heart: "心形",
  Bubble: "气泡",
  "Custom icon": "自定义图标",
  "Load Mask Image": "加载蒙层图片",
  Grayscale: "灰度",
  Blur: "模糊",
  Sharpen: "锐化",
  Emboss: "浮雕",
  "Remove White": "除去白色",
  Distance: "距离",
  Brightness: "亮度",
  Noise: "噪音",
  "Color Filter": "彩色滤镜",
  Sepia: "棕色",
  Sepia2: "棕色2",
  Invert: "负片",
  Pixelate: "像素化",
  Threshold: "阈值",
  Tint: "色调",
  Multiply: "正片叠底",
  Blend: "混合色",
  Width: "宽度",
  Height: "高度"
}
// 画布组件自定义样式
const customTheme = {
  // image 坐上角度图片
  "common.bi.image": "https://uploadbeta.com/api/pictures/random/", // 在这里换上你喜欢的logo图片
  "common.bisize.width": "0px",
  "common.bisize.height": "0px",
  "common.backgroundImage": "none",
  "common.backgroundColor": "#f3f4f6",

  // header
  "header.backgroundImage": "none",
  "header.backgroundColor": "#f3f4f6",
  "header.border": "0px",
  "header.display": "none",

  // load button
  "loadButton.backgroundColor": "#fff",
  "loadButton.border": "1px solid #ddd",
  "loadButton.color": "#222",
  "loadButton.fontFamily": "NotoSans, sans-serif",
  "loadButton.fontSize": "12px",
  "loadButton.display": "none", // 可以直接隐藏掉

  // download button
  "downloadButton.backgroundColor": "#fdba3b",
  "downloadButton.border": "1px solid #fdba3b",
  "downloadButton.color": "#fff",
  "downloadButton.fontFamily": "NotoSans, sans-serif",
  "downloadButton.fontSize": "12px",
  "downloadButton.display": "none", // 可以直接隐藏掉

  // icons default
  "menu.normalIcon.color": "#8a8a8a",
  "menu.activeIcon.color": "#555555",
  "menu.disabledIcon.color": "#434343",
  "menu.hoverIcon.color": "#e9e9e9",
  "submenu.normalIcon.color": "#8a8a8a",
  "submenu.activeIcon.color": "#e9e9e9",

  "menu.iconSize.width": "24px",
  "menu.iconSize.height": "24px",
  "submenu.iconSize.width": "32px",
  "submenu.iconSize.height": "32px",

  // submenu primary color
  "submenu.backgroundColor": "#1e1e1e",
  "submenu.partition.color": "#858585",

  // submenu labels
  "submenu.normalLabel.color": "#858585",
  "submenu.normalLabel.fontWeight": "lighter",
  "submenu.activeLabel.color": "#fff",
  "submenu.activeLabel.fontWeight": "lighter",

  // checkbox style
  "checkbox.border": "1px solid #ccc",
  "checkbox.backgroundColor": "#fff",

  // rango style
  "range.pointer.color": "#fff",
  "range.bar.color": "#666",
  "range.subbar.color": "#d1d1d1",

  "range.disabledPointer.color": "#414141",
  "range.disabledBar.color": "#282828",
  "range.disabledSubbar.color": "#414141",

  "range.value.color": "#fff",
  "range.value.fontWeight": "lighter",
  "range.value.fontSize": "11px",
  "range.value.border": "1px solid #353535",
  "range.value.backgroundColor": "#151515",
  "range.title.color": "#fff",
  "range.title.fontWeight": "lighter",

  // colorpicker style
  "colorpicker.button.border": "1px solid #1e1e1e",
  "colorpicker.title.color": "#fff"
}
export default {
  name: "SignImage",
  props: ["imgUrl"],
  data() {
    return {
      // 创建的画布对象
      instance: null
    }
  },
  watch: {
    imgUrl() {
      this.instance.destroy()
      this.init()
    }
  },
  // 页面创建完成后调用
  mounted() {
    if (document.documentElement.clientWidth <= 500) {
      this.initMini()
    } else {
      this.init()
    }
  },
  methods: {
    // 创建图片编辑器 ==>大屏幕
    init() {
      // 创建tui-image-editor组件实例，后续操作需要用到this.instance这个对象
      this.instance = new ImageEditor(document.querySelector("#tui-image-editor"), {
        includeUI: {
          loadImage: {
            path: this.imgUrl, //sessionStorage.getItem("base64Url"),
            name: this.imgUrl
          },
          // 默认开启绘图的功能,小屏幕情况下，直接打开菜单，会占用较大屏幕空间，不美观
          initMenu: "shape",
          // 支持的菜单
          menu: [
            "crop", // 裁切
            "draw", // 添加绘画
            "text", // 添加文本
            "shape", // 添加形状
            "icon" // 添加图标
          ],
          // 菜单位置在下面
          menuBarPosition: "bottom",
          // 汉化
          locale: localeCN,
          // 自定义样式（隐藏默认顶部栏目、按钮颜色。。。）
          theme: customTheme
        }
      })
      // 清除自定义样式造成的一条边框线
      document.getElementsByClassName("tui-image-editor-main")[0].style.top = 0
      // 设置图片编辑其余距离底部90px（就不会被底部展开的工具栏遮挡住了）===>无效
      // document.getElementsByClassName('tui-image-editor-wrap')[0].style.bottom = 90

      //! 修改图片编辑器的顶部导航栏
      // 这个获取到的是tui-image-editor组件默认自带的顶部菜单栏目
      // console.log('顶部工具栏dom')
      // console.log(document.querySelector('.tui-image-editor-help-menu'))
      // 将顶部菜单栏整个隐藏掉
      // document.querySelector('.tui-image-editor-help-menu').style.display = 'none'

      // 你也可以指定那个菜单隐藏，留几个有用的菜单
      // document.querySelector('[tooltip-content="Undo"]').style.display = 'none'// 上一步
      // document.querySelector('[tooltip-content="Redo"]').style.display = 'none' // 下一步
      // document.querySelector('[tooltip-content="Reset"]').style.display = 'none' // 完全重新编辑
      // 调整图片显示位置
      document.getElementsByClassName("tui-image-editor-main")[0].style.top = "0px"
      //隐藏重置按钮
      document.getElementsByClassName("tie-btn-reset tui-image-editor-item help")[0].style.display = "none"
      //隐藏移动按钮
      document.getElementsByClassName("tie-btn-hand tui-image-editor-item help")[0].style.display = "none"
      //隐藏历史记录按钮
      document.getElementsByClassName("tie-btn-history tui-image-editor-item help")[0].style.display = "none"
      //隐藏单个删除按钮
      document.getElementsByClassName("tie-btn-delete tui-image-editor-item")[0].style.display = "none"

      // 隐藏分割线
      document.querySelectorAll(".tui-image-editor-icpartition").forEach((item) => {
        item.style.display = "none"
      })
    },
    // 创建图片编辑器 ==>小屏幕
    initMini() {
      // 创建tui-image-editor组件实例，后续操作需要用到this.instance这个对象
      this.instance = new ImageEditor(document.querySelector("#tui-image-editor"), {
        includeUI: {
          // 默认加载的图片
          loadImage: {
            // 图片路径
            path: this.imgUrl, //sessionStorage.getItem("base64Url"),
            // 图片的名字，可以省略
            name: "image"
          },
          // 默认开启绘图的功能,小屏幕情况下，直接打开菜单，会占用较大屏幕空间，不美观
          initMenu: "draw",
          // 支持的菜单
          menu: [
            //"crop", // 裁切
            "draw", // 添加绘画
            "text", // 添加文本
            // 'rotate', // 旋转
            // 'flip', // 翻转
            "shape" // 添加形状
            // 'icon', // 添加图标
            // 'mask', // 添加覆盖
            // 'filter' // 添加滤镜
          ],
          // 菜单位置在下面
          menuBarPosition: "bottom",
          // 汉化
          locale: localeCN,
          // 自定义样式（隐藏默认顶部栏目、按钮颜色。。。）
          theme: customTheme
        },
        // 设置画布的最大宽高，能自动等比例缩放大图片到指定的宽高内
        // !设置小图宽高，自动压缩图片，防止过大出现滚动，导致无法操作
        cssMaxWidth: 350,
        cssMaxHeight: 500
      })
      // 清除自定义样式造成的一条边框线
      document.getElementsByClassName("tui-image-editor-main")[0].style.top = 0
      // 设置图片编辑其余距离底部90px（就不会被底部展开的工具栏遮挡住了）===>无效
      // document.getElementsByClassName('tui-image-editor-wrap')[0].style.bottom = 90

      //! 修改图片编辑器的顶部导航栏
      document.querySelector('[tooltip-content="History"]').style.display = "none"
      // document.querySelector('[tooltip-content="Undo"]').style.display = 'none'// 上一步
      document.querySelector('[tooltip-content="Redo"]').style.display = "none" // 下一步
      document.querySelector('[tooltip-content="Reset"]').style.display = "none" // 完全重新编辑
      document.querySelector('[tooltip-content="Delete"]').style.display = "none"
      document.querySelector('[tooltip-content="DeleteAll"]').style.display = "none"
      // 隐藏分割线
      document.querySelectorAll(".tui-image-editor-icpartition").forEach((item) => {
        item.style.display = "none"
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.boardBox {
  width: 100%;
  height: 500px;
  margin-bottom: 20px;
  background: #f9f9f9;
}
</style>

<style>
/* 强制压缩菜单的高度 ，减少占用屏幕的空间*/
.tui-image-editor-container .tui-image-editor-submenu {
  height: auto !important;
}
.tui-image-editor-container.bottom .tui-image-editor-submenu > div {
  padding: 0 !important;
}
.tui-image-editor-container .tui-image-editor-help-menu.top {
  background-color: white;
}
/* 顶部工具栏定位 */
.tui-image-editor-container .tui-image-editor-header {
  top: -55px;
}
.tui-image-editor-container .tui-image-editor-help-menu.top {
  top: -50px;
}
.tui-image-editor-container {
  overflow: visible;
}
</style>
