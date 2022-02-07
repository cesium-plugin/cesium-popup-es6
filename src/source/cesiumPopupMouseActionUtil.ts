import {
  Viewer,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian3,
  Cartesian2,
} from "cesium";
import { Message, MessageArgs } from "./message";
import { CesiumPopupPositionUtil } from "./cesiumPopupPositionUtil";
import { CesiumPopup } from "./cesiumPopup";
//鼠标动作
export enum CesiumPopupMouseActions {
  moving = "moving",
  selectmoving = "selectmoving",
  moveEnd = "moveEnd",
  leftClick = "leftClick",//点击左键
  rightClick = "rightClick"//点击右键
}

export class CesiumPopupActionMessageArgs extends MessageArgs {
  static Message = "09d1309f-a78d-4598-9cd8-f6961cffd69b"
  action?: CesiumPopupMouseActions
  value?: Element
  position?: Cartesian3
  screenPosition?: Cartesian2
  getIsCurrent?: (current: boolean) => void
  setValue?: (entity: Element) => void//获取外接的Entity
  setMoved?: (moved: boolean) => void
  setTooltip?: (tooltip: CesiumPopup) => void
}

//调用方法，需要使用的地方进行注册
// registerEntitySelect() {
//   Messenger.default.register(SelectEntityMessageArgs.Message, (message: string, args?: SelectEntityMessageArgs) => {
//     if (args) {

//     }
//   })
// }

export class CesiumPopupMouseActionUtil {
  private static viewer?: Viewer
  private static eventHandler?: ScreenSpaceEventHandler
  private static moved: boolean = false; //鼠标开始移动 
  private static positionUtil: CesiumPopupPositionUtil
  private static selectValue?: Element
  private static args = new CesiumPopupActionMessageArgs()
  private static tooltip?: CesiumPopup
  static register(viewer: Viewer) {
    this.clear()//清除
    if (!this.viewer) {
      this.viewer = viewer;
      this.positionUtil = new CesiumPopupPositionUtil(viewer)
      this.addViewerMouseListener();
    }
  }


  private static send(args: CesiumPopupActionMessageArgs) {
    this.args.setValue = (entity: Element) => {
      this.selectValue = entity
    }

    this.args.setMoved = (moved?: boolean) => {
      this.moved = !!moved
      if (this.args?.position)
        this.showTooltip(this.args.position)
    }
    this.args.setTooltip = (tooltip: CesiumPopup) => {
      this.tooltip = tooltip
    }

    Message.default.sendMessage(CesiumPopupActionMessageArgs.Message, args)
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
    this.removeEventHandler()
    this.viewer = undefined
    this.moved = false
    this.clear()
  }

  private static clear() {
    this.selectValue = undefined
    this.args.value = undefined
  }


  static showTooltip(position: Cartesian3) {
    if (!this.tooltip) {

    } else {
      this.tooltip.setPosition(position)
    }
  }

  static addViewerMouseListener() {
    const { viewer } = this;
    if (viewer) {
      const eventHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      this.eventHandler = eventHandler;
      eventHandler.setInputAction((movement) => {
        const { position } = movement;
        if (this.moved) {
          //移动时
          this.moved = false;
          const cartesian3 = this.positionUtil.cartesian2ToCartesian3(position);
          if (cartesian3) {
            this.args.action = CesiumPopupMouseActions.moveEnd
            this.args.position = cartesian3
            this.args.value = this.selectValue
            this.send(this.args)

            this.clear()
            this.positionUtil.changeMouseStyle(true)
            this.tooltip?.remove()
            this.tooltip = undefined
          }
        }
      }, ScreenSpaceEventType.RIGHT_DOWN);
      eventHandler.setInputAction((movement) => {
        const { position } = movement
        this.args.action = CesiumPopupMouseActions.leftClick
        const cartesian3 = this.positionUtil.cartesian2ToCartesian3(position);
        this.args.position = cartesian3
        this.send(this.args)
      }, ScreenSpaceEventType.LEFT_DOWN);
      eventHandler.setInputAction((movement) => {
        const { endPosition } = movement
        const cartesian3 = this.positionUtil.cartesian2ToCartesian3(endPosition);
        if (this.moved && cartesian3) {
          this.positionUtil.changeMouseStyle(false)
          this.showTooltip(cartesian3)
          this.args.action = CesiumPopupMouseActions.selectmoving
          this.args.position = cartesian3
          this.args.screenPosition = endPosition
          this.args.value = this.selectValue
          this.send(this.args)
        } else {
          //没有popup
          this.args.action = CesiumPopupMouseActions.moving
          this.args.position = cartesian3
          this.clear()
          this.send(this.args)
        }
      }, ScreenSpaceEventType.MOUSE_MOVE);
    }
  }
}
