import { Viewer, Cartesian3, Event, ScreenSpaceEventHandler, ScreenSpaceEventType } from "cesium"
import { v1 as uuidv1 } from 'uuid';
import { CesiumPopupContextmenuUtil } from "./";
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
    /**移除抓手的样式类名 */
    // removeHandlerClassName?: string
}

export type CesiumPopupRemoveType = "handler" | "method"
export interface CesiumPopupAction {
    pickPosition?: boolean//初次添加,获取位置
    contextDisabled?: boolean//右键不可用
    noLisener?: boolean//不需要添加监听
    editAttr?: (value?: CesiumPopup) => void//编辑属性
    remove?: (value?: CesiumPopup, type?: CesiumPopupRemoveType /**移除的类型 */) => void//移除
    onChange?: (value?: CesiumPopup) => void//改变时
    onClick?: (value?: CesiumPopup) => void//改变时
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
    private moving = false
    private tooltip?: CesiumPopup
    private cameraMoveEnd?: Event.RemoveCallback
    private eventHandler?: ScreenSpaceEventHandler
    private moved: boolean = false; //鼠标开始移动 
    private positionUtil: CesiumPopupPositionUtil
    private selectValue?: Element
    private actionState?: "draw" | "edit"
    private lastScreenPostion?: any

    constructor(viewer: Viewer, options: CesiumPopupOptions, action?: CesiumPopupAction) {
        this.viewer = viewer
        this.positionUtil = new CesiumPopupPositionUtil(viewer)
        this.options = options
        this.action = action
        this.addPopup()
        if (!this.action?.noLisener) {
            this.addMapListener()
            this.eventHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
            if (!this.action?.contextDisabled) {
                this.createMenu()
            }
            let self = this
            this.element?.addEventListener('click', function (e) {
                e.preventDefault();
                if (!self.moved) {
                    if (self.action?.onClick) {
                        self.action.onClick(self)
                    }
                }
            }, false);
        }
        this.addCameraLisener()
        if (this.action?.pickPosition) {
            this.actionState = "draw"
            this.addMouseLisener()
        }
    }

    private addMouseLisener() {
        this.addMouseRightDownLisener()
        this.addMouseMoveLisener()
    }

    private addMouseRightDownLisener() {
        this.eventHandler?.setInputAction((movement) => {
            if (this.actionState === "edit") {
                if (this.element?.id !== this.selectValue?.id) {
                    return
                }
            }
            const { position } = movement;
            if (this.moved) {
                const cartesian3 = this.positionUtil.cartesian2ToCartesian3(position);
                this.positionUtil.changeMouseStyle(true)
                if (cartesian3) {
                    this.setPosition(cartesian3)
                    if (this.action?.onChange) {
                        this.action.onChange(this)
                    }
                    this.tooltip?.remove()
                    this.tooltip = undefined
                    this.removeMouseLisener()
                }
                this.moved = false;
                this.moving = false
                this.actionState = undefined
            }
        }, ScreenSpaceEventType.RIGHT_DOWN);
    }

    private addMouseLeftDownListener() {
        this.eventHandler?.setInputAction((movement) => {
            this.contextmenu?.remove();
            this.removeMouseLeftDownLisener()
        }, ScreenSpaceEventType.LEFT_DOWN);
    }

    private showTooltip(position: Cartesian3) {
        if (this.viewer) {
            if (!this.tooltip) {
                const html4 = `<div>按下鼠标右键结束</div>`
                if (!this.tooltip) {
                    this.tooltip = new CesiumPopup(this.viewer, { position, popPosition: "leftmiddle", html: html4, className: "earth-popup-bubble", }, { noLisener: true, contextDisabled: true })//一丁不能添加监听
                }
            } else {
                this.tooltip.setPosition(position)
            }
        }
    }


    private addMouseMoveLisener() {
        this.eventHandler?.setInputAction((movement) => {
            const { endPosition } = movement
            const cartesians3 = this.positionUtil.cartesian2ToCartesian3(endPosition);
            if (this.actionState === "edit") {
                if (this.element?.id === this.selectValue?.id) {
                    if (this.moved && cartesians3) {
                        this.positionUtil.changeMouseStyle(false)
                        this.showTooltip(cartesians3)
                        this.moving = true
                        this.contextmenu?.remove()
                        if (cartesians3)
                            this.setPosition(cartesians3)
                        if (this.viewer) {
                            this.showTooltip(cartesians3)
                        }
                    }
                }
            } else {
                this.moving = true
                if (cartesians3) {
                    this.setPosition(cartesians3)
                    this.moved = true
                    this.showTooltip(cartesians3)
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    private removeMouseLisener() {
        this.eventHandler?.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
        this.eventHandler?.removeInputAction(ScreenSpaceEventType.RIGHT_DOWN)
        this.removeMouseLeftDownLisener()
    }

    private removeMouseLeftDownLisener() {
        this.eventHandler?.removeInputAction(ScreenSpaceEventType.LEFT_DOWN)
    }

    private createMenu() {
        if (this.element && !this.moving)
            this.contextmenu = new CesiumPopupContextmenuUtil({
                container: this.element as HTMLElement,
                onRClick: (callback) => {
                    this.addMouseLeftDownListener()
                    callback(!this.moving)
                },
                onMove: () => {
                    this.moved = true
                    this.actionState = "edit"
                    this.selectValue = this.element as Element
                    this.addMouseLisener()
                },
                onRemove: () => {
                    this.removeCommon("handler")
                },
                onEdit: () => {
                    if (this.action?.editAttr) {
                        this.action.editAttr(this)
                    }
                },
            });
    }


    private removeCommon(type?: CesiumPopupRemoveType) {
        if (this.viewer) {
            const { container } = this.viewer
            if (this.element) {
                container.removeChild(this.element)
                this.element = undefined
            }
            if (this.cameraMoveEnd)
                this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd)
            this.eventHandler?.destroy()
        }
        this.contextmenu?.remove()
        if (this.action?.remove) {
            this.action.remove(this, type)
        }
    }

    /**
     * 移除弹窗
     */
    remove() {
        this.removeCommon("method")
    }

    /**
    * 通过抓手移除弹窗
    */
    removeByHandler() {
        this.removeCommon("handler")
    }

    /**
     * 设置弹窗的内容
     * @param html 内容
     */
    setContent(html: string, init?: boolean) {
        const { element } = this
        if (element) {
            element.innerHTML = html
        }
        if (this.options) {
            this.options.html = html
        }
        if (!init && this.action?.onChange) {
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
                if (this.lastScreenPostion) {
                    if (this.lastScreenPostion.x === screenPosition.x && this.lastScreenPostion.y === screenPosition.y) {
                        return
                    }
                }


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

                element.style.display = "block"
                element.style.left = `${x}px`
                element.style.top = `${y}px`

                this.lastScreenPostion = { ...screenPosition }
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
                        this.hide()
                    } else {
                        this.show()
                    }
                }
            })
        }
    }

    hide() {
        if (this.element)
            this.element.style.visibility = "hidden"
    }


    show() {
        if (this.element)
            this.element.style.visibility = "visible"
    }

    /**
     * 地图添加监听，用于更新弹窗的位置
     */
    private addMapListener() {
        this.viewer?.scene.postRender.addEventListener(() => {
            const position = this.options?.position
            if (position) {
                if (this.positionUtil.isVisibleByBounds(position)) {
                    if (!this.moving) {
                        this.setPosition(position)
                    }
                    this.show()
                } else {
                    this.hide()
                }
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
                    this.setContent(options.html, true)
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