import { Cartesian2, Cartesian3, SceneTransforms, Viewer, Math as CesiumMath, defined } from "cesium";
export class CesiumPopupPositionUtil {
    viewer: Viewer

    constructor(viewer: Viewer) {
        this.viewer = viewer
    }


    changeMouseStyle(isDefault: boolean) {
        const v: any = this.viewer
        v._container.style.cursor = isDefault ? "default" : "crosshair"
    }
    
    /**
             * 屏幕坐标转笛卡尔坐标
             * @param position 
             * @returns 
             */
    cartesian2ToCartesian3(position: Cartesian2) {
        const { viewer } = this
        if (viewer) {
            // const cartesianLand = viewer.scene.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid)
            const ray = viewer.camera.getPickRay(position);
            const cartesianLand = viewer.scene.globe.pick(ray, viewer.scene);
            const cartesianModel = viewer.scene.pick(position)
            let cartesian3 = cartesianLand
            if (viewer.scene.pickPositionSupported && defined(cartesianModel)) {
                cartesian3 = viewer.scene.pickPosition(position);
            }
            return cartesian3
        }
    }

    /**
     * 经纬度转笛卡尔坐标
     * @param lng 
     * @param lat 
     * @param alt 
     * @returns 
     */
    lnglatToCartesian3(lng: number, lat: number, alt: number) {
        const cartesian3 = Cartesian3.fromDegrees(lng, lat, alt)
        return cartesian3
    }

    /**
     * 笛卡尔坐标转屏幕坐标
     * @param cartesian3 
     * @returns 
     */
    cartesian3ToCartesian2(cartesian3: Cartesian3) {
        return SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian3);
    }

    /**
     * 笛卡尔坐标转经纬度
     * @param cartesian3 
     * @returns 
     */
    cartesian3ToLngLat(cartesian3: Cartesian3) {
        if (cartesian3) {
            const radians = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
            const latitude = CesiumMath.toDegrees(radians.latitude); //弧度转度
            const longitude = CesiumMath.toDegrees(radians.longitude);
            const height = radians.height;
            return { longitude, latitude, height }
        }
    }



    /**
     * 获取当前的视图范围
     */
    computeViewerBounds() {
        const extend = this.viewer.camera.computeViewRectangle();
        let bounds: number[] = []
        if (typeof extend === "undefined") {
            const coordToLonlat = (viewer: Viewer, x: number, y: number) => {
                const { camera, scene } = viewer
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
                    return { lon, lat }
                }
            }
            const canvas = this.viewer.scene.canvas;
            const upperLeftLonLat = coordToLonlat(this.viewer, 0, 0);
            const lowerRightLonLat = coordToLonlat(this.viewer, canvas.clientWidth, canvas.clientHeight);
            if (upperLeftLonLat?.lon && upperLeftLonLat?.lat && lowerRightLonLat?.lon && lowerRightLonLat?.lat)
                bounds = [upperLeftLonLat.lon, upperLeftLonLat.lat, lowerRightLonLat.lon, lowerRightLonLat.lat]
        } else {
            //三维视图
            bounds = [CesiumMath.toDegrees(extend.west), CesiumMath.toDegrees(extend.south), CesiumMath.toDegrees(extend.east), CesiumMath.toDegrees(extend.north)]
        }
        return bounds
    }

}