import { Cartesian2, Cartesian3, SceneTransforms, Math as CesiumMath } from "cesium";
export class CesiumPopupPositionUtil {
    constructor(viewer) {
        this.viewer = viewer;
    }
    /**
         * 屏幕坐标转笛卡尔坐标
         * @param position
         * @returns
         */
    cartesian2ToCartesian3(position) {
        const { viewer } = this;
        if (viewer) {
            const ray = viewer.camera.getPickRay(position);
            const cartesian3 = viewer.scene.globe.pick(ray, viewer.scene);
            return cartesian3;
        }
    }
    /**
     * 经纬度转笛卡尔坐标
     * @param lng
     * @param lat
     * @param alt
     * @returns
     */
    lnglatToCartesian3(lng, lat, alt) {
        const cartesian3 = Cartesian3.fromDegrees(lng, lat, alt);
        return cartesian3;
    }
    /**
     * 笛卡尔坐标转屏幕坐标
     * @param cartesian3
     * @returns
     */
    cartesian3ToCartesian2(cartesian3) {
        return SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian3);
    }
    /**
     * 笛卡尔坐标转经纬度
     * @param cartesian3
     * @returns
     */
    cartesian3ToLngLat(cartesian3) {
        if (cartesian3) {
            const radians = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
            const latitude = CesiumMath.toDegrees(radians.latitude); //弧度转度
            const longitude = CesiumMath.toDegrees(radians.longitude);
            const height = radians.height;
            return { longitude, latitude, height };
        }
    }
    /**
     * 获取当前的视图范围
     */
    computeViewerBounds() {
        const extend = this.viewer.camera.computeViewRectangle();
        let bounds = [];
        if (typeof extend === "undefined") {
            const coordToLonlat = (viewer, x, y) => {
                const { camera, scene } = viewer;
                const d2 = new Cartesian2(x, y);
                const ellipsoid = scene.globe.ellipsoid;
                //2D转3D世界坐标
                const d3 = camera.pickEllipsoid(d2, ellipsoid);
                if (d3) {
                    //3D世界坐标转弧度
                    const upperLeftCartographic = scene.globe.ellipsoid.cartesianToCartographic(d3);
                    //弧度转经纬度
                    const lon = CesiumMath.toDegrees(upperLeftCartographic.longitude);
                    const lat = CesiumMath.toDegrees(upperLeftCartographic.latitude);
                    return { lon, lat };
                }
            };
            const canvas = this.viewer.scene.canvas;
            const upperLeftLonLat = coordToLonlat(this.viewer, 0, 0);
            const lowerRightLonLat = coordToLonlat(this.viewer, canvas.clientWidth, canvas.clientHeight);
            if ((upperLeftLonLat === null || upperLeftLonLat === void 0 ? void 0 : upperLeftLonLat.lon) && (upperLeftLonLat === null || upperLeftLonLat === void 0 ? void 0 : upperLeftLonLat.lat) && (lowerRightLonLat === null || lowerRightLonLat === void 0 ? void 0 : lowerRightLonLat.lon) && (lowerRightLonLat === null || lowerRightLonLat === void 0 ? void 0 : lowerRightLonLat.lat))
                bounds = [upperLeftLonLat.lon, upperLeftLonLat.lat, lowerRightLonLat.lon, lowerRightLonLat.lat];
        }
        else {
            //三维视图
            bounds = [CesiumMath.toDegrees(extend.west), CesiumMath.toDegrees(extend.south), CesiumMath.toDegrees(extend.east), CesiumMath.toDegrees(extend.north)];
        }
        return bounds;
    }
}
