import "./index.css"
import { Button } from 'antd';
import { ArcGisMapServerImageryProvider, ArcGISTiledElevationTerrainProvider, Cartesian3, Cartographic, Cesium3DTileset, CesiumTerrainProvider, Matrix4, Viewer } from 'cesium';
import { useEffect } from 'react';
import { CesiumPopupAction, CesiumPopup } from "../source/"
let viewer: Viewer

const PPopup = (props: any) => {
    const action: CesiumPopupAction = {
        remove: (popup) => {
            console.log(popup, "被移除了");

        },
        onClick: (popup) => {
            console.log(popup, "被点击了");
        },
        onChange: (popup) => {
            console.log(popup, "移动完成");
        },
        editAttr: (popup: CesiumPopup) => {
            console.log(popup, "需要编辑属性！");
            popup.setContent("我的内容被改变了！")
        }
    }

    useEffect(() => {
        viewer = new Viewer('map', {
            imageryProvider: new ArcGisMapServerImageryProvider({ url: "https://elevation3d.arcgis.com/arcgis/rest/services/World_Imagery/MapServer" }),
            // terrainProvider: new ArcGISTiledElevationTerrainProvider({
            //     url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
            // }),
            terrainProvider: new CesiumTerrainProvider({
                url: 'https://data.marsgis.cn/terrain',
            }),
            infoBox: false,
            selectionIndicator: false,
            animation: false,
            timeline: false,
            baseLayerPicker: false
        })
        console.log(viewer);

        viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(103.742546, 36.06, 30000),
        })
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.entities.add({
            position: Cartesian3.fromDegrees(103.67149, 36.09057, 1800),
            model: {
                uri: "/datas/model/Cesium_Air.glb",
                scale: 500,
            },
        })


        const _3DTileset = new Cesium3DTileset({
            url: 'https://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json'
        })

        _3DTileset.readyPromise.then(function (argument) {
            viewer.scene.primitives.add(_3DTileset)
            viewer.zoomTo(_3DTileset)
            //大雁塔移到兰州
            const height = 1600;
            const cartographic = Cartographic.fromCartesian(
                _3DTileset.boundingSphere.center
            );
            const surface = Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                cartographic.height
            );
            const offset = Cartesian3.fromDegrees(103.709, 36.1107, height);
            const translation = Cartesian3.subtract(
                offset,
                surface,
                new Cartesian3()
            );
            _3DTileset.modelMatrix = Matrix4.fromTranslation(translation);
        });

        //第一个
        const cartesian3 = Cartesian3.fromDegrees(103.75703775549388, 36.08774979703967, 1509.2181406351685)
        const html = `<div class="title">初始化创建</div>
        <div class="content">我不能被编辑</div>`
        new CesiumPopup(viewer, {
            position: cartesian3, html, className: "earth-popup-imgbg-blue", popPosition: "leftbottom"
        }, { contextDisabled: true })

    //     //第二个
    //     const cartesian33 = Cartesian3.fromDegrees(103.6633339676296, 36.090254266492465, 1522.8186244347767)
    //     const html3 = `<div class="title">飞机模型</div>
    //     <div class="content">我在飞机模型上</div>`
    //     new CesiumPopup(viewer, {
    //         position: cartesian33, html: html3, className: "earth-popup-imgbg-blue", popPosition: "leftbottom"
    //     }, action)

    //     //第三个
    //     const cartesian31 = Cartesian3.fromDegrees(103.8030932443637, 36.03599418009624, 1576.081166069641)
    //     const html2 = `<div><div class="earth-popup-common-title">
    //     我是标题
    //     </div><div class="earth-popup-common-close-button" onclick="remove()">×</div></div>
    //     <div class="earth-popup-common-content">
    //     <div>
    //        <div>地址：甘肃省甘肃中牧山丹马场</div>
    //        <div>电话：0936-4455000</div>
    //     </div>`
    //     const popup = new CesiumPopup(viewer, { position: cartesian31, html: html2, className: "earth-popup-common" }, action)
    //     const _window: any = window
    //     _window.remove = () => {
    //         popup.remove()
    //     }


    //     //第四个
    //     const cartesian34 = Cartesian3.fromDegrees(103.8030932443637, 36.01599418009624, 1576.081166069641)
    //     const html4 = `<div>
    //      我是测试文本
    //      </div>`
    //     new CesiumPopup(viewer, { position: cartesian34, popPosition: "leftmiddle", html: html4, className: "earth-popup-bubble" }, action)

    //     const cartesian35 = Cartesian3.fromDegrees(103.8230932443637, 36.02599418009624, 1576.081166069641)
    //     const html5 = `<div class="title">我是标题</div>
    //     <div class="content">内容</div>`
    //     new CesiumPopup(viewer, { position: cartesian35, popPosition: "leftbottom", html: html5, className: "earth-popup-imgbg-green" }, action)


    //     const cartesian36 = Cartesian3.fromDegrees(103.8230932443637, 36.05599418009624, 1576.081166069641)
    //     const html6 = `<div class="title">我是内容</div>`
    //     new CesiumPopup(viewer, { position: cartesian36, popPosition: "leftbottom", html: html6, className: "earth-popup-imgbg-blue-simple" }, action)

    //     // 第五个
    //     const cartesian5 = Cartesian3.fromDegrees(103.74703775549388, 36.09774979703967, 1509.2181406351685)
    //     const html51 = `<a class="earth-popup-flow"><span></span>
    //     <span></span>
    //     <span></span>
    //     <span></span>我是测试文本
    //     </a>`
    //     new CesiumPopup(viewer, { position: cartesian5, popPosition: "leftbottom", html: html51, className: "earth-popup-light" }, action)

    //     // 第六个
    //     const cartesian6 = Cartesian3.fromDegrees(103.77703775549388, 36.09774979703967, 1509.2181406351685)
    //     const html61 = `<div class="earth-popup-area">
    //     <div class="earth-popup-area-top"></div>
    //     <div class="earth-popup-area-bottom"></div>
    //     <div class="earth-popup-area-right"></div>
    //     <div class="earth-popup-area-left"></div>
    //     <div class="earth-popup-area-top-left"></div>
    //     <div class="earth-popup-area-bottom-right"></div>
    //     <div class="earth-popup-area-text">我是测试文本</div>
    //     </div>
    //     <div class="earth-popup-arrow"></div>`
    //     new CesiumPopup(viewer, { position: cartesian6, popPosition: "leftbottom", html: html61, className: "earth-popup-areas" }, action)

    //     const cartesian7 = Cartesian3.fromDegrees(103.77703775549388, 36.01774979703967, 1509.2181406351685)
    //     const html62 = `<div>
    //     我是自定义的
    //    </div>`
    //     new CesiumPopup(viewer, { visibleMaxCameraHeight: 10000, position: cartesian7, popPosition: "leftbottom", html: html62, className: "self-define" }, action)


        //通过点击鼠标绘制，用于获取测试坐标
        // const mouseClickHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        // mouseClickHandler.setInputAction((e) => {
        //     if (state !== "moving") {
        //         const { position } = e
        //         const ray = viewer.camera.getPickRay(position);
        //         const cartesian3 = viewer.scene.globe.pick(ray, viewer.scene);
        //         const radians = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
        //         const lat = CesiumMath.toDegrees(radians.latitude); //弧度转度
        //         const lng = CesiumMath.toDegrees(radians.longitude);
        //         const alt = radians.height;
        //         console.log(`${lng},${lat},${alt}`);
        //         const html = `<div class="title">获取位置</div>
        //         <div class="content"> <div>x:${position.x}</div>
        //         <div>y:${position.y}</div></div>
        //         </div>`
        //         if (cartesian3) {
        //             new Popup(viewer, { position: cartesian3, html, className: "earth-popup-imgbg-blue", popPosition: "leftbottom", onMove })
        //         }
        //     }
        // }, ScreenSpaceEventType.LEFT_CLICK)
        return componentWillUnmount
    }, [])

    function componentWillUnmount() {

    }

    //点击按钮绘制
    function onAdd() {
        const html = `<div class="title">通过鼠标添加</div>
        <div class="content"> <div>我是内容</div>
        </div>`
        new CesiumPopup(viewer, { html, className: "earth-popup-imgbg-blue", popPosition: "leftbottom" }, { ...action, ...{ pickPosition: true } })
    }


    function onAdd2() {
        // const cartesian31 = Cartesian3.fromDegrees(103.8030932443637, 36.03599418009624, 1576.081166069641)
        const html2 = `<div><div class="earth-popup-common-title">
        通过按钮创建
        </div><div class="earth-popup-common-close-button">×</div></div>
        <div class="earth-popup-common-content">
        <div>
           <div>地址：甘肃省甘肃中牧山丹马场</div>
           <div>电话：0936-4455000</div>
        </div>`
        new CesiumPopup(viewer, { html: html2, className: "earth-popup-common" }, { ...action, ...{ pickPosition: true } })
    }

    return <div style={{ width: "100%", height: "100%", position: "relative" }} >
        <div style={{ width: "100%", height: "100%",overflow:"hidden",position:"relative" }} id="map">

        </div>
        <div style={{ position: "absolute", top: 0, left: 0, zIndex: 5000 }}>
            <Button type="primary" style={{ margin: 10 }} onClick={onAdd}>
                添加广告牌（样式1）
            </Button>
            <Button type="primary" style={{ margin: 10 }} onClick={onAdd2}>
                添加广告牌（样式2）
            </Button>
        </div>
    </div>
}
export default PPopup