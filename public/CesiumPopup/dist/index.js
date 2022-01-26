import { v1 as uuidv1 } from 'uuid';
import { CesiumPopupActionMessageArgs, CesiumPopupMouseActions, CesiumPopupMouseActionUtil } from "./common/cesiumPopupMouseActionUtil";
import { CesiumPopupContextmenuUtil } from "./common/cesiumPopupContextmenuUtil";
import { Message } from "./common/message";
import { CesiumPopupPositionUtil } from "./common";
import "./index.css";
/**
 * 气泡弹窗
 * onegiser 2022-01-22
 */
export class CesiumPopup {
    constructor(viewer, options, action) {
        this.moving = false;
        this.viewer = viewer;
        this.options = options;
        this.action = action;
        this.init();
    }
    init() {
        var _a, _b;
        this.addPopup();
        if (!((_a = this.action) === null || _a === void 0 ? void 0 : _a.noLisener)) {
            this.addMapListener();
            if (this.viewer)
                CesiumPopupMouseActionUtil.register(this.viewer);
            this.registerMouseAction();
            if (!((_b = this.action) === null || _b === void 0 ? void 0 : _b.contextDisabled)) {
                this.createMenu();
            }
        }
    }
    // /**
    //  * 添加提示的实体
    //  * @param position 
    //  */
    // private addEntity(position: Cartesian3) {
    //     const { viewer } = this
    //     if (viewer && position) {
    //         this.entity = viewer.entities.add({
    //             position: position,
    //             label: {
    //                 style: LabelStyle.FILL,
    //                 text: "移动鼠标开始\n按下右键结束",//\n按住左键拖动地图\n滚动中键缩放地图
    //                 fillColor: Color.YELLOW,
    //                 font: "10px",
    //                 pixelOffset: new Cartesian2(80, 20),
    //                 eyeOffset: new Cartesian3(0, 0, 10)
    //             }
    //         })
    //     }
    // }
    registerMouseAction() {
        Message.default.register(CesiumPopupActionMessageArgs.Message, (message, args) => {
            var _a, _b, _c, _d, _e, _f;
            if (args) {
                const { action, value, position, setMoved, setValue, setTooltip } = args;
                this.setMoved = setMoved;
                this.setValue = setValue;
                if (((_a = this.element) === null || _a === void 0 ? void 0 : _a.id) === (value === null || value === void 0 ? void 0 : value.id)) {
                    if (action === CesiumPopupMouseActions.moveEnd) {
                        if (position) {
                            this.setPosition(position);
                            if ((_b = this.action) === null || _b === void 0 ? void 0 : _b.onChange) {
                                this.action.onChange(this);
                            }
                            this.tooltip = undefined;
                        }
                        this.moving = false;
                    }
                    else if (action === CesiumPopupMouseActions.selectmoving) {
                        this.moving = true;
                        (_c = this.contextmenu) === null || _c === void 0 ? void 0 : _c.remove();
                        if (position)
                            this.setPosition(position);
                        if (setTooltip && this.viewer) {
                            //解决组件 Cannot access 'CesiumPopupMouseActions' before initialization的问题
                            const html4 = `<div>
                            按下鼠标右键结束
                            </div>`;
                            if (!this.tooltip) {
                                this.tooltip = new CesiumPopup(this.viewer, { position, popPosition: "leftmiddle", html: html4, className: "earth-popup-bubble", }, { noLisener: true, contextDisabled: true }); //一丁不能添加监听
                                setTooltip(this.tooltip);
                            }
                        }
                    }
                }
                else {
                    if (action === CesiumPopupMouseActions.leftClick) {
                        (_d = this.contextmenu) === null || _d === void 0 ? void 0 : _d.remove();
                    }
                    else if (action === CesiumPopupMouseActions.moving) {
                        if (((_e = this.action) === null || _e === void 0 ? void 0 : _e.pickPosition) && !((_f = this.options) === null || _f === void 0 ? void 0 : _f.position)) {
                            //新增 
                            console.log("add");
                            this.moving = true;
                            if (position) {
                                this.setPosition(position);
                                if (this.element)
                                    if (setValue)
                                        setValue(this.element);
                                if (setMoved)
                                    setMoved(true);
                            }
                        }
                    }
                }
            }
        });
    }
    createMenu() {
        if (this.element && !this.moving)
            this.contextmenu = new CesiumPopupContextmenuUtil({
                container: this.element,
                onClick: (callback) => {
                    callback(!this.moving);
                },
                onMove: () => {
                    if (this.setMoved)
                        this.setMoved(true);
                    if (this.setValue) {
                        this.setValue(this.element);
                    }
                },
                onRemove: () => {
                    var _a;
                    if ((_a = this.action) === null || _a === void 0 ? void 0 : _a.remove) {
                        this.action.remove(this);
                        this.remove();
                    }
                },
                onEdit: () => {
                    var _a;
                    if ((_a = this.action) === null || _a === void 0 ? void 0 : _a.editAttr) {
                        this.action.editAttr(this);
                    }
                },
            });
    }
    /**
     * 移除弹窗
     */
    remove() {
        var _a;
        if (this.viewer) {
            const { container } = this.viewer;
            if (this.element) {
                container.removeChild(this.element);
                this.element = undefined;
            }
        }
        (_a = this.contextmenu) === null || _a === void 0 ? void 0 : _a.remove();
    }
    /**
     * 设置弹窗的内容
     * @param html 内容
     */
    setContent(html) {
        var _a;
        const { element } = this;
        if (element) {
            element.innerHTML = html;
        }
        if (this.options) {
            this.options.html = html;
        }
        if ((_a = this.action) === null || _a === void 0 ? void 0 : _a.onChange) {
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
                element.style.display = "block";
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
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
            }
            if (this.options)
                this.options.position = position;
        }
    }
    /**
     * 地图添加监听，用于更新弹窗的位置
     */
    addMapListener() {
        var _a;
        (_a = this.viewer) === null || _a === void 0 ? void 0 : _a.scene.postRender.addEventListener(() => {
            var _a;
            if (!this.moving && ((_a = this.options) === null || _a === void 0 ? void 0 : _a.position)) {
                this.setPosition(this.options.position);
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
                    this.setContent(options.html);
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
