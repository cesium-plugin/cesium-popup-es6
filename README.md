# 插件使用方法

## 安装
`npm install cesium-popup-es6`


## 文档

自行打开docs文件夹
## umd模式

```javascript
<script type="text/javascript" src="./CesiumPopup/dist/cesium-popup-es6.umd.js"></script>
 const cartesian3 = Cesium.Cartesian3.fromDegrees(103.75703775549388, 36.08774979703967, 1509.2181406351685)
 const html = `<div class="title">初始化创建</div>
 <div class="content">初始化创建内容</div>`
 new CesiumPopup(viewer, {
    position: cartesian3, html, className: "earth-popup-imgbg-blue", popPosition: "leftbottom", onMove
 })
```

## es6模式
```javascript

import { CesiumPopupAction, CesiumPopup } from "cesium-popup-es6"
const action: CesiumPopupAction = {
    remove: (popup) => {
        console.log(popup, "被移除了");

    },
    onChange: (popup) => {
        console.log(popup, "移动完成");
    },
    editAttr: (popup: CesiumPopup) => {
        console.log(popup, "需要编辑属性！");
        popup.setContent("我的内容被改变了！")
    }
}
const cartesian33 = Cartesian3.fromDegrees(103.6633339676296, 36.090254266492465, 1522.8186244347767)
const html3 = `<div class="title">飞机模型</div>
 <div class="content">我在飞机模型上</div>`
 new CesiumPopup(viewer, {
     position: cartesian33, html: html3, className: "earth-popup-imgbg-blue", popPosition: "leftbottom"
 }, action)
```

# 源码使用方法
## 依赖安装
`npm run a`

## 项目运行
`npm start`

## 项目打包
`npm run build`

## 发布
`npm run release`