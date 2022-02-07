import { Viewer, Cartesian3, Cartesian2 } from "cesium";
import { MessageArgs } from "./message";
import { CesiumPopup } from "./cesiumPopup";
export declare enum CesiumPopupMouseActions {
    moving = "moving",
    selectmoving = "selectmoving",
    moveEnd = "moveEnd",
    leftClick = "leftClick",
    rightClick = "rightClick"
}
export declare class CesiumPopupActionMessageArgs extends MessageArgs {
    static Message: string;
    action?: CesiumPopupMouseActions;
    value?: Element;
    position?: Cartesian3;
    screenPosition?: Cartesian2;
    getIsCurrent?: (current: boolean) => void;
    setValue?: (entity: Element) => void;
    setMoved?: (moved: boolean) => void;
    setTooltip?: (tooltip: CesiumPopup) => void;
}
export declare class CesiumPopupMouseActionUtil {
    private static viewer?;
    private static eventHandler?;
    private static moved;
    private static positionUtil;
    private static selectValue?;
    private static args;
    private static tooltip?;
    static register(viewer: Viewer): void;
    private static send;
    /**
     * 移除地图鼠标事件
     */
    static removeEventHandler(): void;
    static destory(): void;
    private static clear;
    static showTooltip(position: Cartesian3): void;
    static addViewerMouseListener(): void;
}
