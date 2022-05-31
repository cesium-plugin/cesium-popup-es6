import { ScreenSpaceEventHandler, ScreenSpaceEventType } from "cesium";
import { v1 as uuidv1 } from 'uuid';
import { CesiumPopupContextmenuUtil } from "./";
import { CesiumPopupPositionUtil } from "./";
import "./index.css";
/**
 * 气泡弹窗
 * onegiser 2022-01-22
 */
export class CesiumPopup {
    constructor(viewer, options, action) {
        var _a, _b, _c, _d;
        this.moving = false;
        this.moved = false; //鼠标开始移动 
        this.viewer = viewer;
        this.positionUtil = new CesiumPopupPositionUtil(viewer);
        this.options = options;
        this.action = action;
        this.addPopup();
        if (!((_a = this.action) === null || _a === void 0 ? void 0 : _a.noLisener)) {
            this.addMapListener();
            this.eventHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
            if (!((_b = this.action) === null || _b === void 0 ? void 0 : _b.contextDisabled)) {
                this.createMenu();
            }
            let self = this;
            (_c = this.element) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function (e) {
                var _a;
                e.preventDefault();
                if (!self.moved) {
                    if ((_a = self.action) === null || _a === void 0 ? void 0 : _a.onClick) {
                        self.action.onClick(self);
                    }
                }
            }, false);
        }
        this.addCameraLisener();
        if ((_d = this.action) === null || _d === void 0 ? void 0 : _d.pickPosition) {
            this.actionState = "draw";
            this.addMouseLisener();
        }
    }
    addMouseLisener() {
        this.addMouseRightDownLisener();
        this.addMouseMoveLisener();
    }
    addMouseRightDownLisener() {
        var _a;
        (_a = this.eventHandler) === null || _a === void 0 ? void 0 : _a.setInputAction((movement) => {
            var _a, _b, _c, _d;
            if (this.actionState === "edit") {
                if (((_a = this.element) === null || _a === void 0 ? void 0 : _a.id) !== ((_b = this.selectValue) === null || _b === void 0 ? void 0 : _b.id)) {
                    return;
                }
            }
            const { position } = movement;
            if (this.moved) {
                const cartesian3 = this.positionUtil.cartesian2ToCartesian3(position);
                this.positionUtil.changeMouseStyle(true);
                if (cartesian3) {
                    this.setPosition(cartesian3);
                    if ((_c = this.action) === null || _c === void 0 ? void 0 : _c.onChange) {
                        this.action.onChange(this);
                    }
                    (_d = this.tooltip) === null || _d === void 0 ? void 0 : _d.remove();
                    this.tooltip = undefined;
                    this.removeMouseLisener();
                }
                this.moved = false;
                this.moving = false;
                this.actionState = undefined;
            }
        }, ScreenSpaceEventType.RIGHT_DOWN);
    }
    addMouseLeftDownListener() {
        var _a;
        (_a = this.eventHandler) === null || _a === void 0 ? void 0 : _a.setInputAction((movement) => {
            var _a;
            (_a = this.contextmenu) === null || _a === void 0 ? void 0 : _a.remove();
            this.removeMouseLeftDownLisener();
        }, ScreenSpaceEventType.LEFT_DOWN);
    }
    showTooltip(position) {
        if (this.viewer) {
            if (!this.tooltip) {
                const html4 = `<div>按下鼠标右键结束</div>`;
                if (!this.tooltip) {
                    this.tooltip = new CesiumPopup(this.viewer, { position, popPosition: "leftmiddle", html: html4, className: "earth-popup-bubble", }, { noLisener: true, contextDisabled: true }); //一丁不能添加监听
                }
            }
            else {
                this.tooltip.setPosition(position);
            }
        }
    }
    addMouseMoveLisener() {
        var _a;
        (_a = this.eventHandler) === null || _a === void 0 ? void 0 : _a.setInputAction((movement) => {
            var _a, _b, _c;
            const { endPosition } = movement;
            const cartesians3 = this.positionUtil.cartesian2ToCartesian3(endPosition);
            if (this.actionState === "edit") {
                if (((_a = this.element) === null || _a === void 0 ? void 0 : _a.id) === ((_b = this.selectValue) === null || _b === void 0 ? void 0 : _b.id)) {
                    if (this.moved && cartesians3) {
                        this.positionUtil.changeMouseStyle(false);
                        this.showTooltip(cartesians3);
                        this.moving = true;
                        (_c = this.contextmenu) === null || _c === void 0 ? void 0 : _c.remove();
                        if (cartesians3)
                            this.setPosition(cartesians3);
                        if (this.viewer) {
                            this.showTooltip(cartesians3);
                        }
                    }
                }
            }
            else {
                this.moving = true;
                if (cartesians3) {
                    this.setPosition(cartesians3);
                    this.moved = true;
                    this.showTooltip(cartesians3);
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }
    removeMouseLisener() {
        var _a, _b;
        (_a = this.eventHandler) === null || _a === void 0 ? void 0 : _a.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        (_b = this.eventHandler) === null || _b === void 0 ? void 0 : _b.removeInputAction(ScreenSpaceEventType.RIGHT_DOWN);
        this.removeMouseLeftDownLisener();
    }
    removeMouseLeftDownLisener() {
        var _a;
        (_a = this.eventHandler) === null || _a === void 0 ? void 0 : _a.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
    }
    createMenu() {
        if (this.element && !this.moving)
            this.contextmenu = new CesiumPopupContextmenuUtil({
                container: this.element,
                onRClick: (callback) => {
                    this.addMouseLeftDownListener();
                    callback(!this.moving);
                },
                onMove: () => {
                    this.moved = true;
                    this.actionState = "edit";
                    this.selectValue = this.element;
                    this.addMouseLisener();
                },
                onRemove: () => {
                    this.removeCommon("handler");
                },
                onEdit: () => {
                    var _a;
                    if ((_a = this.action) === null || _a === void 0 ? void 0 : _a.editAttr) {
                        this.action.editAttr(this);
                    }
                },
            });
    }
    removeCommon(type) {
        var _a, _b, _c;
        if (this.viewer) {
            const { container } = this.viewer;
            if (this.element) {
                container.removeChild(this.element);
                this.element = undefined;
            }
            if (this.cameraMoveEnd)
                this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
            (_a = this.eventHandler) === null || _a === void 0 ? void 0 : _a.destroy();
        }
        (_b = this.contextmenu) === null || _b === void 0 ? void 0 : _b.remove();
        if ((_c = this.action) === null || _c === void 0 ? void 0 : _c.remove) {
            this.action.remove(this, type);
        }
    }
    /**
     * 移除弹窗
     */
    remove() {
        this.removeCommon("method");
    }
    /**
    * 通过抓手移除弹窗
    */
    removeByHandler() {
        this.removeCommon("handler");
    }
    /**
     * 设置弹窗的内容
     * @param html 内容
     */
    setContent(html, init) {
        var _a;
        const { element } = this;
        if (element) {
            element.innerHTML = html;
        }
        if (this.options) {
            this.options.html = html;
        }
        if (!init && ((_a = this.action) === null || _a === void 0 ? void 0 : _a.onChange)) {
            this.action.onChange(this);
        }
    }
    /**
     * 处理弹窗的屏幕位置
     * @param position
     */
    setPosition(position) {
        var _a, _b, _c;
        if (this.viewer && position) {
            const screenPosition = new CesiumPopupPositionUtil(this.viewer).cartesian3ToCartesian2(position);
            const { element } = this;
            if (element && screenPosition) {
                if (this.lastScreenPostion) {
                    if (this.lastScreenPostion.x === screenPosition.x && this.lastScreenPostion.y === screenPosition.y) {
                        return;
                    }
                }
                let x = screenPosition.x - element.clientWidth / 2;
                let y = screenPosition.y - element.clientHeight - 15;
                if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.popPosition) {
                    if (((_b = this.options) === null || _b === void 0 ? void 0 : _b.popPosition) === "leftbottom") {
                        x = screenPosition.x;
                        y = screenPosition.y - element.clientHeight;
                    }
                    else if (((_c = this.options) === null || _c === void 0 ? void 0 : _c.popPosition) === "leftmiddle") {
                        x = screenPosition.x + 20;
                        y = screenPosition.y - element.clientHeight / 2;
                    }
                }
                element.style.display = "block";
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                this.lastScreenPostion = Object.assign({}, screenPosition);
            }
            if (this.options)
                this.options.position = position;
        }
    }
    /**
     * 添加相机的监听
     */
    addCameraLisener() {
        var _a, _b;
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.visibleMaxCameraHeight) {
            this.cameraMoveEnd = (_b = this.viewer) === null || _b === void 0 ? void 0 : _b.camera.moveEnd.addEventListener(() => {
                var _a, _b;
                const h = (_a = this.viewer) === null || _a === void 0 ? void 0 : _a.camera.getMagnitude();
                const min = 6375000;
                if (h && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.visibleMaxCameraHeight) && this.element) {
                    if (h - min > this.options.visibleMaxCameraHeight) {
                        this.hide();
                    }
                    else {
                        this.show();
                    }
                }
            });
        }
    }
    hide() {
        if (this.element)
            this.element.style.visibility = "hidden";
    }
    show() {
        if (this.element)
            this.element.style.visibility = "visible";
    }
    /**
     * 地图添加监听，用于更新弹窗的位置
     */
    addMapListener() {
        var _a;
        (_a = this.viewer) === null || _a === void 0 ? void 0 : _a.scene.postRender.addEventListener(() => {
            var _a, _b;
            const position = (_a = this.options) === null || _a === void 0 ? void 0 : _a.position;
            if (position) {
                if ((_b = this.options) === null || _b === void 0 ? void 0 : _b.renderInViewBounds) {
                    if (this.positionUtil.isVisibleByBounds(position)) {
                        if (!this.moving) {
                            this.setPosition(position);
                        }
                        this.show();
                    }
                    else {
                        this.hide();
                    }
                }
                else {
                    if (!this.moving) {
                        this.setPosition(position);
                    }
                }
            }
        });
    }
    /**
     * 添加弹窗
     */
    addPopup() {
        var _a;
        if (this.viewer && this.options) {
            const { options } = this;
            const id = uuidv1();
            if (document.getElementById(id)) {
                throw new Error(`id为${id}的div已存在！`);
            }
            else {
                this.element = this.createPopupDom(id);
                if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.position) {
                    this.setPosition(this.options.position);
                }
                if (options.html !== undefined)
                    this.setContent(options.html, true);
            }
        }
    }
    /**
     * 创建弹窗的dom
     * @param id
     * @returns
     */
    createPopupDom(id) {
        const { viewer, options } = this;
        if (viewer) {
            const container = viewer.container;
            const popupContainer = document.createElement("div");
            popupContainer.id = id;
            popupContainer.className = (options === null || options === void 0 ? void 0 : options.className) ? options.className : "earth-popup-common";
            container.appendChild(popupContainer);
            return popupContainer;
        }
    }
}
