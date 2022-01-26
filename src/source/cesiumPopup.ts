import { Viewer, Cartesian3, Event } from "cesium"
import { v1 as uuidv1 } from 'uuid';
import { CesiumPopupActionMessageArgs, CesiumPopupMouseActions, CesiumPopupMouseActionUtil } from "./cesiumPopupMouseActionUtil";
import { CesiumPopupContextmenuUtil } from "./";
import { Message } from "./message";
import { CesiumPopupPositionUtil } from "./";
import "./index.css"

export interface CesiumPopupOptions {
    /**
     * 显示弹窗相对于地面相机的最大高度
     */
    visibleMaxCameraHeight?: number
    position?: Cartesian3//位置
    html?: string//内容
    className?: "earth-popup-imgbg-green" | "earth-popup-imgbg-blue" | "earth-popup-imgbg-blue-simple" | "earth-popup-common" | "earth-popup-bubble" | string//默认的样式，支持自定义的样式
    popPosition?: "leftbottom" | "bottom" | "leftmiddle"//弹出的位置
}
export interface CesiumPopupAction {
    pickPosition?: boolean//初次添加,获取位置
    contextDisabled?: boolean//右键不可用
    noLisener?: boolean//不需要添加监听
    editAttr?: (value?: CesiumPopup) => void//编辑属性
    remove?: (value?: CesiumPopup) => void//移除
    onChange?: (value?: CesiumPopup) => void//改变时
}

/**
 * 气泡弹窗
 * onegiser 2022-01-22
 */
export class CesiumPopup {
    private viewer?: Viewer
    private element?: HTMLDivElement
    options?: CesiumPopupOptions
    private contextmenu?: CesiumPopupContextmenuUtil
    private action?: CesiumPopupAction
    private setMoved?: (moved: boolean) => void
    private setValue?: (entity: Element) => void
    private moving = false
    private tooltip?: CesiumPopup
    private cameraMoveEnd?: Event.RemoveCallback
    constructor(viewer: Viewer, options: CesiumPopupOptions, action?: CesiumPopupAction) {
        this.viewer = viewer
        this.options = options
        this.action = action
        this.init()
    }

    private init() {
        this.addPopup()
        if (!this.action?.noLisener) {
            this.addMapListener()
            if (this.viewer)
                CesiumPopupMouseActionUtil.register(this.viewer)
            this.registerMouseAction()
            if (!this.action?.contextDisabled) {
                this.createMenu()
            }
        }
        this.addCameraLisener()
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

    private registerMouseAction() {
        Message.default.register(CesiumPopupActionMessageArgs.Message, (message: string, args?: CesiumPopupActionMessageArgs) => {
            if (args) {
                const { action, value, position, setMoved, setValue, setTooltip } = args
                this.setMoved = setMoved
                this.setValue = setValue
                if (this.element?.id === value?.id) {
                    if (action === CesiumPopupMouseActions.moveEnd) {
                        if (position) {
                            this.setPosition(position)
                            if (this.action?.onChange) {
                                this.action.onChange(this)
                            }
                            this.tooltip = undefined
                        }
                        this.moving = false
                    } else if (action === CesiumPopupMouseActions.selectmoving) {
                        this.moving = true
                        this.contextmenu?.remove()
                        if (position)
                            this.setPosition(position)
                        if (setTooltip && this.viewer) {
                            //解决组件 Cannot access 'CesiumPopupMouseActions' before initialization的问题
                            const html4 = `<div>
                            按下鼠标右键结束
                            </div>`
                            if (!this.tooltip) {
                                this.tooltip = new CesiumPopup(this.viewer, { position, popPosition: "leftmiddle", html: html4, className: "earth-popup-bubble", }, { noLisener: true, contextDisabled: true })//一丁不能添加监听
                                setTooltip(this.tooltip)
                            }
                        }
                    }
                } else {
                    if (action === CesiumPopupMouseActions.leftClick) {
                        this.contextmenu?.remove();
                    } else if (action === CesiumPopupMouseActions.moving) {
                        if (this.action?.pickPosition && !this.options?.position) {
                            this.moving = true
                            if (position) {
                                this.setPosition(position)
                                if (this.element)
                                    if (setValue)
                                        setValue(this.element as Element)
                                if (setMoved)
                                    setMoved(true)
                            }
                        }
                    }
                }
            }
        })
    }

    private createMenu() {
        if (this.element && !this.moving)
            this.contextmenu = new CesiumPopupContextmenuUtil({
                container: this.element as HTMLElement,
                onClick: (callback) => {
                    callback(!this.moving)
                },
                onMove: () => {
                    if (this.setMoved)
                        this.setMoved(true)
                    if (this.setValue) {
                        this.setValue(this.element as Element)
                    }
                },
                onRemove: () => {
                    if (this.action?.remove) {
                        this.action.remove(this)
                        this.remove()
                    }
                },
                onEdit: () => {
                    if (this.action?.editAttr) {
                        this.action.editAttr(this)
                    }
                },
            });
    }

    /**
     * 移除弹窗
     */
    remove() {
        if (this.viewer) {
            const { container } = this.viewer
            if (this.element) {
                container.removeChild(this.element)
                this.element = undefined
            }
            if (this.cameraMoveEnd)
                this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd)
        }
        this.contextmenu?.remove()
    }

    /**
     * 设置弹窗的内容
     * @param html 内容
     */
    setContent(html: string) {
        const { element } = this
        if (element) {
            element.innerHTML = html
        }
        if (this.options) {
            this.options.html = html
        }
        if (this.action?.onChange) {
            this.action.onChange(this)
        }
    }

    /**
     * 处理弹窗的屏幕位置
     * @param position 
     */
    setPosition(position: Cartesian3) {
        if (this.viewer && position) {
            const screenPosition = new CesiumPopupPositionUtil(this.viewer).cartesian3ToCartesian2(position)
            const { element } = this
            if (element && screenPosition) {
                element.style.display = "block"
                let x = screenPosition.x - element.clientWidth / 2
                let y = screenPosition.y - element.clientHeight - 15
                if (this.options?.popPosition) {
                    if (this.options?.popPosition === "leftbottom") {
                        x = screenPosition.x
                        y = screenPosition.y - element.clientHeight
                    } else if (this.options?.popPosition === "leftmiddle") {
                        x = screenPosition.x + 20
                        y = screenPosition.y - element.clientHeight / 2
                    }
                }

                element.style.left = `${x}px`
                element.style.top = `${y}px`
            }

            if (this.options)
                this.options.position = position
        }
    }

    /**
     * 添加相机的监听
     */
    private addCameraLisener() {
        if (this.options?.visibleMaxCameraHeight) {
            this.cameraMoveEnd = this.viewer?.camera.moveEnd.addEventListener(() => {
                const h = this.viewer?.camera.getMagnitude()
                const min = 6375000
                if (h && this.options?.visibleMaxCameraHeight && this.element) {
                    if (h - min > this.options.visibleMaxCameraHeight) {
                        this.element.style.visibility = "hidden"
                    } else {
                        this.element.style.visibility = "visible"
                    }
                }
            })
        }
    }

    /**
     * 地图添加监听，用于更新弹窗的位置
     */
    private addMapListener() {
        this.viewer?.scene.postRender.addEventListener(() => {
            if (!this.moving && this.options?.position) {
                this.setPosition(this.options.position)
            }
        })
    }

    /**
     * 添加弹窗
     */
    private addPopup() {
        if (this.viewer && this.options) {
            const { options } = this
            const id = uuidv1()
            if (document.getElementById(id)) {
                throw new Error(`id为${id}的div已存在！`)
            } else {
                this.element = this.createPopupDom(id)
                if (this.options?.position) {
                    this.setPosition(this.options.position)
                }
                if (options.html !== undefined)
                    this.setContent(options.html)
            }
        }
    }


    /**
     * 创建弹窗的dom
     * @param id 
     * @returns 
     */
    private createPopupDom(id: string) {
        const { viewer, options } = this
        if (viewer) {
            const container = viewer.container
            const popupContainer = document.createElement("div")
            popupContainer.id = id
            popupContainer.className = (options?.className) ? options.className : "earth-popup-common"
            container.appendChild(popupContainer)
            return popupContainer
        }
    }
}