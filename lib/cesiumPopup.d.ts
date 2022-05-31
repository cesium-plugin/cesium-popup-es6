import { Viewer, Cartesian3 } from "cesium";
import "./index.css";
export interface CesiumPopupOptions {
    /**
     * 显示弹窗相对于地面相机的最大高度
     */
    visibleMaxCameraHeight?: number;
    position?: Cartesian3;
    html?: string;
    className?: "earth-popup-imgbg-green" | "earth-popup-imgbg-blue" | "earth-popup-imgbg-blue-simple" | "earth-popup-common" | "earth-popup-bubble" | string;
    popPosition?: "leftbottom" | "bottom" | "leftmiddle";
    /**移除抓手的样式类名 */
    /**仅在视图范围渲染 */
    renderInViewBounds?: boolean;
}
export declare type CesiumPopupRemoveType = "handler" | "method";
export interface CesiumPopupAction {
    pickPosition?: boolean;
    contextDisabled?: boolean;
    noLisener?: boolean;
    editAttr?: (value?: CesiumPopup) => void;
    remove?: (value?: CesiumPopup, type?: CesiumPopupRemoveType /**移除的类型 */) => void;
    onChange?: (value?: CesiumPopup) => void;
    onClick?: (value?: CesiumPopup) => void;
}
/**
 * 气泡弹窗
 * onegiser 2022-01-22
 */
export declare class CesiumPopup {
    private viewer?;
    private element?;
    options?: CesiumPopupOptions;
    private contextmenu?;
    private action?;
    private moving;
    private tooltip?;
    private cameraMoveEnd?;
    private eventHandler?;
    private moved;
    private positionUtil;
    private selectValue?;
    private actionState?;
    private lastScreenPostion?;
    constructor(viewer: Viewer, options: CesiumPopupOptions, action?: CesiumPopupAction);
    private addMouseLisener;
    private addMouseRightDownLisener;
    private addMouseLeftDownListener;
    private showTooltip;
    private addMouseMoveLisener;
    private removeMouseLisener;
    private removeMouseLeftDownLisener;
    private createMenu;
    private removeCommon;
    /**
     * 移除弹窗
     */
    remove(): void;
    /**
    * 通过抓手移除弹窗
    */
    removeByHandler(): void;
    /**
     * 设置弹窗的内容
     * @param html 内容
     */
    setContent(html: string, init?: boolean): void;
    /**
     * 处理弹窗的屏幕位置
     * @param position
     */
    setPosition(position: Cartesian3): void;
    /**
     * 添加相机的监听
     */
    private addCameraLisener;
    hide(): void;
    show(): void;
    /**
     * 地图添加监听，用于更新弹窗的位置
     */
    private addMapListener;
    /**
     * 添加弹窗
     */
    private addPopup;
    /**
     * 创建弹窗的dom
     * @param id
     * @returns
     */
    private createPopupDom;
}
