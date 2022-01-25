import { Cartesian2, Cartesian3, Viewer } from "cesium";
export interface EarthPoint {
    longitude: number;
    latitude: number;
    height?: number;
}
export declare class CesiumPopupPositionUtil {
    viewer: Viewer;
    constructor(viewer: Viewer);
    /**
         * 屏幕坐标转笛卡尔坐标
         * @param position
         * @returns
         */
    cartesian2ToCartesian3(position: Cartesian2): Cartesian3 | undefined;
    /**
     * 经纬度转笛卡尔坐标
     * @param lng
     * @param lat
     * @param alt
     * @returns
     */
    lnglatToCartesian3(lng: number, lat: number, alt: number): Cartesian3;
    /**
     * 笛卡尔坐标转屏幕坐标
     * @param cartesian3
     * @returns
     */
    cartesian3ToCartesian2(cartesian3: Cartesian3): Cartesian2;
    /**
     * 笛卡尔坐标转经纬度
     * @param cartesian3
     * @returns
     */
    cartesian3ToLngLat(cartesian3: Cartesian3): {
        longitude: number;
        latitude: number;
        height: number;
    } | undefined;
    /**
     * 获取当前的视图范围
     */
    computeViewerBounds(): number[];
}
