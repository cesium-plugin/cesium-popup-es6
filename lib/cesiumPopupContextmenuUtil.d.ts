import "./menu.css";
export declare const earthMenuId = "earth-right-menu-id";
export declare enum CesiumPopupContextmenuActionNames {
    move = "move",
    remove = "remove",
    editAttr = "editAttr",
    stopMove = "stopMove",
    height = "height"
}
export interface CesiumPopupContextmenuOption {
    actionNames?: CesiumPopupContextmenuActionNames[];
    nolistenerContainer?: boolean;
    container: HTMLElement;
    x?: number;
    y?: number;
    onRemove?: () => void;
    onStopMove?: () => void;
    onChangeHeight?: () => void;
    onMove?: () => void;
    onEdit?: () => void;
    onRClick?: (callback: (show: boolean) => void) => void;
    menuObj?: {
        [key: string]: string;
    };
}
export declare class CesiumPopupContextmenuUtil {
    private option;
    constructor(option: CesiumPopupContextmenuOption);
    private init;
    /**
     * 设置位置
     * @param x
     * @param y
     * @returns
     */
    setPosition(x: number, y: number): HTMLDivElement | undefined;
    /**
    * 右键菜单监听
    */
    private addContentMenuListener;
    /**
     * 获取菜单
     * @returns
     */
    private getMenu;
    hide(): void;
    show(): void;
    /**
     * 移除右键菜单
     */
    remove(): void;
}
