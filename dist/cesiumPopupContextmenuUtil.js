import "./menu.css";
export const earthMenuId = "earth-right-menu-id"; //右键dom的id
export var CesiumPopupContextmenuActionNames;
(function (CesiumPopupContextmenuActionNames) {
    CesiumPopupContextmenuActionNames["move"] = "move";
    CesiumPopupContextmenuActionNames["remove"] = "remove";
    CesiumPopupContextmenuActionNames["editAttr"] = "editAttr";
    CesiumPopupContextmenuActionNames["stopMove"] = "stopMove";
    CesiumPopupContextmenuActionNames["height"] = "height";
})(CesiumPopupContextmenuActionNames || (CesiumPopupContextmenuActionNames = {}));
export class CesiumPopupContextmenuUtil {
    constructor(option) {
        this.option = option;
        this.init();
    }
    init() {
        if (!this.option.nolistenerContainer) {
            this.addContentMenuListener();
        }
        if (this.option.x && this.option.y) {
            this.setPosition(this.option.x, this.option.y);
        }
    }
    /**
     * 设置位置
     * @param x
     * @param y
     * @returns
     */
    setPosition(x, y) {
        var _a;
        if ((_a = this.option) === null || _a === void 0 ? void 0 : _a.container) {
            const menu = this.getMenu(this.option.container);
            menu.style.left = x + "px";
            menu.style.top = y + "px";
            menu.style.display = 'block';
            return menu;
        }
    }
    /**
    * 右键菜单监听
    */
    addContentMenuListener() {
        const self = this;
        if (this.option.container) {
            this.option.container.addEventListener('contextmenu', function (e) {
                var _a;
                e.preventDefault();
                const { clientX, clientY } = e;
                const menu = self.setPosition(clientX - self.option.container.getBoundingClientRect().left, clientY - self.option.container.getBoundingClientRect().top);
                if (((_a = self.option) === null || _a === void 0 ? void 0 : _a.onRClick) && menu) {
                    self.option.onRClick((show) => {
                        if (!show) {
                            menu.style.display = 'none';
                        }
                        else {
                            menu.style.display = 'block';
                        }
                    });
                }
            }, false);
        }
    }
    /**
     * 获取菜单
     * @returns
     */
    getMenu(container) {
        //禁用浏览器右键
        document.oncontextmenu = function (e) {
            return false;
        };
        const self = this;
        if (document.getElementById(earthMenuId)) {
            this.remove();
        }
        const el = document.createElement('div');
        el.id = earthMenuId;
        el.className = "earth-right-menu";
        const _window = window;
        _window.earthpopupmove = () => {
            var _a;
            self.remove();
            if ((_a = self.option) === null || _a === void 0 ? void 0 : _a.onMove)
                self.option.onMove();
        };
        _window.earthpopupremove = () => {
            var _a;
            self.remove();
            if ((_a = self.option) === null || _a === void 0 ? void 0 : _a.onRemove)
                self.option.onRemove();
        };
        _window.earthpopupedit = () => {
            var _a;
            self.remove();
            if ((_a = self.option) === null || _a === void 0 ? void 0 : _a.onEdit)
                self.option.onEdit();
        };
        _window.earthpopupstopMove = () => {
            var _a;
            self.remove();
            if ((_a = self.option) === null || _a === void 0 ? void 0 : _a.onStopMove)
                self.option.onStopMove();
        };
        _window.earthpopupChangeHeight = () => {
            var _a;
            self.remove();
            if ((_a = self.option) === null || _a === void 0 ? void 0 : _a.onChangeHeight)
                self.option.onChangeHeight();
        };
        const actionNames = this.option.actionNames ? this.option.actionNames : [CesiumPopupContextmenuActionNames.move, CesiumPopupContextmenuActionNames.editAttr, CesiumPopupContextmenuActionNames.remove,];
        const obj = {};
        obj[CesiumPopupContextmenuActionNames.move] = '<li onclick="earthpopupmove()">编辑位置</li>';
        obj[CesiumPopupContextmenuActionNames.remove] = `<li onclick="earthpopupremove()">删除</li>`;
        obj[CesiumPopupContextmenuActionNames.editAttr] = '<li onclick="earthpopupedit()">编辑样式</li>';
        obj[CesiumPopupContextmenuActionNames.stopMove] = '<li onclick="earthpopupstopMove()">停止编辑位置</li>';
        obj[CesiumPopupContextmenuActionNames.height] = '<li onclick="earthpopupChangeHeight()">修改高度</li>';
        let html = '';
        for (let i in actionNames) {
            if (!isNaN(Number(i))) {
                const name = actionNames[i];
                if (name)
                    html += obj[name];
            }
        }
        el.innerHTML = html;
        if (container) {
            container.appendChild(el);
        }
        return el;
    }
    hide() {
        const menu = document.getElementById(earthMenuId);
        if (menu) {
            menu.style.display = "none";
        }
    }
    show() {
        const menu = document.getElementById(earthMenuId);
        if (menu) {
            menu.style.display = "block";
        }
    }
    /**
     * 移除右键菜单
     */
    remove() {
        var _a;
        if (this.option.container) {
            const _window = window;
            _window.earthpopupmove = () => {
            };
            _window.earthpopupremove = () => {
            };
            _window.earthpopupedit = () => {
            };
            _window.earthpopupstopMove = () => {
            };
            (_a = document.getElementById(earthMenuId)) === null || _a === void 0 ? void 0 : _a.remove();
        }
    }
}
