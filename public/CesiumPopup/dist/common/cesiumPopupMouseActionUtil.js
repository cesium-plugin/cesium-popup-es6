import { ScreenSpaceEventHandler, ScreenSpaceEventType, } from "cesium";
import { Message, MessageArgs } from "./message";
import { CesiumPopupPositionUtil } from "./cesiumPopupPositionUtil";
//鼠标动作
export var CesiumPopupMouseActions;
(function (CesiumPopupMouseActions) {
    CesiumPopupMouseActions["moving"] = "moving";
    CesiumPopupMouseActions["selectmoving"] = "selectmoving";
    CesiumPopupMouseActions["moveEnd"] = "moveEnd";
    CesiumPopupMouseActions["leftClick"] = "leftClick";
    CesiumPopupMouseActions["rightClick"] = "rightClick"; //点击右键
})(CesiumPopupMouseActions || (CesiumPopupMouseActions = {}));
export class CesiumPopupActionMessageArgs extends MessageArgs {
}
CesiumPopupActionMessageArgs.Message = "09d1309f-a78d-4598-9cd8-f6961cffd69b";
//调用方法，需要使用的地方进行注册
// registerEntitySelect() {
//   Messenger.default.register(SelectEntityMessageArgs.Message, (message: string, args?: SelectEntityMessageArgs) => {
//     if (args) {
//     }
//   })
// }
export class CesiumPopupMouseActionUtil {
    static register(viewer) {
        this.clear(); //清除
        if (!this.viewer) {
            this.viewer = viewer;
            this.positionUtil = new CesiumPopupPositionUtil(viewer);
            this.addViewerMouseListener();
        }
    }
    static send(args) {
        this.args.setValue = (entity) => {
            this.selectValue = entity;
        };
        this.args.setMoved = (moved) => {
            var _a;
            this.moved = !!moved;
            if ((_a = this.args) === null || _a === void 0 ? void 0 : _a.position)
                this.showTooltip(this.args.position);
        };
        this.args.setTooltip = (tooltip) => {
            this.tooltip = tooltip;
        };
        Message.default.sendMessage(CesiumPopupActionMessageArgs.Message, args);
    }
    /**
     * 移除地图鼠标事件
     */
    static removeEventHandler() {
        if (this.eventHandler) {
            this.eventHandler.removeInputAction(ScreenSpaceEventType.RIGHT_DOWN);
            this.eventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
            this.eventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        }
    }
    static destory() {
        this.removeEventHandler();
        this.viewer = undefined;
        this.moved = false;
        this.clear();
    }
    static clear() {
        this.selectValue = undefined;
        this.args.value = undefined;
    }
    static changeMouseStyle(isDefault) {
        const v = this.viewer;
        v._container.style.cursor = isDefault ? "default" : "crosshair";
    }
    static showTooltip(position) {
        if (!this.tooltip) {
        }
        else {
            this.tooltip.setPosition(position);
        }
    }
    static addViewerMouseListener() {
        const { viewer } = this;
        if (viewer) {
            const eventHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
            this.eventHandler = eventHandler;
            eventHandler.setInputAction((movement) => {
                var _a;
                const { position } = movement;
                if (this.moved) {
                    //移动时
                    this.moved = false;
                    const cartesian3 = this.positionUtil.cartesian2ToCartesian3(position);
                    if (cartesian3) {
                        this.args.action = CesiumPopupMouseActions.moveEnd;
                        this.args.position = cartesian3;
                        this.args.value = this.selectValue;
                        this.send(this.args);
                        this.clear();
                        this.changeMouseStyle(true);
                        (_a = this.tooltip) === null || _a === void 0 ? void 0 : _a.remove();
                        this.tooltip = undefined;
                    }
                }
            }, ScreenSpaceEventType.RIGHT_DOWN);
            eventHandler.setInputAction((movement) => {
                const { position } = movement;
                this.args.action = CesiumPopupMouseActions.leftClick;
                const cartesian3 = this.positionUtil.cartesian2ToCartesian3(position);
                this.args.position = cartesian3;
                this.send(this.args);
            }, ScreenSpaceEventType.LEFT_DOWN);
            eventHandler.setInputAction((movement) => {
                const { endPosition } = movement;
                const cartesian3 = this.positionUtil.cartesian2ToCartesian3(endPosition);
                if (this.moved && cartesian3) {
                    this.changeMouseStyle(false);
                    this.showTooltip(cartesian3);
                    this.args.action = CesiumPopupMouseActions.selectmoving;
                    this.args.position = cartesian3;
                    this.args.screenPosition = endPosition;
                    this.args.value = this.selectValue;
                    this.send(this.args);
                }
                else {
                    //没有popup
                    this.args.action = CesiumPopupMouseActions.moving;
                    this.args.position = cartesian3;
                    this.clear();
                    this.send(this.args);
                }
            }, ScreenSpaceEventType.MOUSE_MOVE);
        }
    }
}
CesiumPopupMouseActionUtil.moved = false; //鼠标开始移动 
CesiumPopupMouseActionUtil.args = new CesiumPopupActionMessageArgs();
