import "./menu.css"
export const earthMenuId = "earth-right-menu-id"//右键dom的id
export enum CesiumPopupContextmenuActionNames {
    move = "move",
    remove = "remove",
    editAttr = "editAttr",
    stopMove = "stopMove"
}
export interface CesiumPopupContextmenuOption {
    actionNames?: CesiumPopupContextmenuActionNames[]//要显示的已实现的右键
    nolistenerContainer?: boolean//不监听容器
    container: HTMLElement//右键菜单所在的容器
    x?: number//初始化的坐标位置
    y?: number//初始化的坐标位置
    onRemove?: () => void
    onStopMove?: () => void
    onMove?: () => void
    onEdit?: () => void
    onClick?: (callback: (show: boolean) => void) => void
}
export class CesiumPopupContextmenuUtil {
    private option: CesiumPopupContextmenuOption
    constructor(option: CesiumPopupContextmenuOption) {
        this.option = option
        this.init()
    }

    private init() {
        if (!this.option.nolistenerContainer) {
            this.addContentMenuListener()
        }
        if (this.option.x && this.option.y) {
            this.setPosition(this.option.x, this.option.y)
        }
    }

    /**
     * 设置位置
     * @param x 
     * @param y 
     * @returns 
     */
    setPosition(x: number, y: number) {
        if (this.option?.container) {
            const menu: HTMLDivElement = this.getMenu(this.option.container) as HTMLDivElement
            menu.style.left = x + "px";
            menu.style.top = y + "px";
            menu.style.display = 'block'
            return menu
        }
    }

    /**
    * 右键菜单监听
    */
    private addContentMenuListener() {
        const self = this
        if (this.option.container) {
            this.option.container.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                const { clientX, clientY } = e
                const menu = self.setPosition(clientX - self.option.container.getBoundingClientRect().left, clientY - self.option.container.getBoundingClientRect().top)
                if (self.option?.onClick && menu) {
                    self.option.onClick((show: boolean) => {
                        if (!show) {
                            menu.style.display = 'none'
                        } else {
                            menu.style.display = 'block'
                        }
                    })
                }
            }, false);
        }
    }

    /**
     * 获取菜单
     * @returns 
     */
    private getMenu(container: HTMLElement) {
        //禁用浏览器右键
        document.oncontextmenu = function (e) {
            return false;
        }
        const self = this
        if (document.getElementById(earthMenuId)) {
            this.remove()
        }

        const el = document.createElement('div')
        el.id = earthMenuId
        el.className = "earth-right-menu"
        const _window: any = window
        _window.earthpopupmove = () => {
            self.remove()
            if (self.option?.onMove)
                self.option.onMove()
        }
        _window.earthpopupremove = () => {
            self.remove()
            if (self.option?.onRemove)
                self.option.onRemove()
        }
        _window.earthpopupedit = () => {
            self.remove()
            if (self.option?.onEdit)
                self.option.onEdit()
        }
        _window.earthpopupstopMove = () => {
            self.remove()
            if (self.option?.onStopMove)
                self.option.onStopMove()
        }
        const actionNames = this.option.actionNames ? this.option.actionNames : [CesiumPopupContextmenuActionNames.move, CesiumPopupContextmenuActionNames.editAttr, CesiumPopupContextmenuActionNames.remove,]
        const obj: any = {

        }
        obj[CesiumPopupContextmenuActionNames.move] = '<li onclick="earthpopupmove()">编辑位置</li>'
        obj[CesiumPopupContextmenuActionNames.remove] = `<li onclick="earthpopupremove()">删除</li>`
        obj[CesiumPopupContextmenuActionNames.editAttr] = '<li onclick="earthpopupedit()">编辑属性</li>'
        obj[CesiumPopupContextmenuActionNames.stopMove] = '<li onclick="earthpopupstopMove()">停止编辑位置</li>'
        let html = ''
        for (let i in actionNames) {
            if (!isNaN(Number(i))) {
                const name = actionNames[i]
                if (name)
                    html += obj[name]
            }
        }
        el.innerHTML = html
        if (container) {
            container.appendChild(el)
        }
        return el
    }

    hide() {
        const menu = document.getElementById(earthMenuId)
        if (menu) {
            menu.style.display = "none"
        }
    }

    show() {
        const menu = document.getElementById(earthMenuId)
        if (menu) {
            menu.style.display = "block"
        }
    }

    /**
     * 移除右键菜单
     */
    remove() {
        if (this.option.container) {
            const _window: any = window
            _window.earthpopupmove = () => {

            }
            _window.earthpopupremove = () => {

            }
            _window.earthpopupedit = () => {

            }
            _window.earthpopupstopMove = () => {

            }
            document.getElementById(earthMenuId)?.remove()
        }
    }
}