import {Three} from ".";
import gsap from "gsap";

class LngLatCameraControl {
    constructor(public camera: Three.Camera, public radius: number) {}

    setLngLat(lng: number, lat: number) {
        const y = Math.sin(lat) * this.radius,  // 根据纬度求出y
            r = this.radius * Math.cos(lat),  // d*cos(y)是纬线半径
            x = Math.sin(lng) * r,  // 根据经度在纬线上偏移得到x
            z = Math.cos(lng) * r  // 得到z
        this.camera.position.set(x, y, z)
        this.camera.lookAt(0, 0, 0)
    }
}

/**
 * 相机位于以原点为中心的球面上，始终看向原点。
 * 由于屏幕是有界的，所以需要在球面上找一部分，然后将屏幕投影到该球面部分上，具体思路为：
 * 1. 使用经纬度坐标系，以z-y平面作为0经度面，z-x屏幕作为0纬度面；
 * 2. {lngRange}和{latRange}分别为所选择球面部分的经度和纬度范围大小，这两个值决定了可以相机运动的平面大小；
 * 3. 在计算投影时，根据鼠标坐标相对于{domElement}的比例，等比例计算经纬度，然后将经纬度转为直角坐标；
 * 4. 当无法确定比例时，比如鼠标尚未进入{domElement}元素，使用{defaultXRate}和{defaultYRate}作为默认比例。
 */
export class RateCameraControl extends LngLatCameraControl {
    constructor(public camera: Three.Camera, public domElement: HTMLElement,
                public radius: number, public lngRange: number, public latRange: number,
                public defaultXRate: number, public defaultYRate: number) {
        super(camera, radius)
        this.enabled = true
        this.setRate(defaultXRate, defaultYRate)
    }

    private _enabled = false
    get enabled() { return this._enabled }

    set enabled(b) {
        if (b) {
            this.domElement.addEventListener('mousemove', this.onMouseMove)
            this.domElement.addEventListener('mouseenter', this.onMouseEnter)
            this.domElement.addEventListener('mouseleave', this.onMouseLeave)
        } else {
            this.domElement.removeEventListener('mousemove', this.onMouseMove)
            this.domElement.removeEventListener('mouseenter', this.onMouseEnter)
            this.domElement.removeEventListener('mouseleave', this.onMouseLeave)
        }
        this._enabled = b
        this.setRate(this.xRate, this.yRate)
    }

    xRate: number = 0
    yRate: number = 0

    onMouseMove = ev => this.setRate(
        ev.clientX / this.domElement.clientWidth, ev.clientY / this.domElement.clientHeight)
    onMouseEnter = this.onMouseMove
    onMouseLeave = () => this.setRate(this.defaultXRate, this.defaultYRate)

    /**
     * @param xRate [0-1]
     * @param yRate [0-1]
     */
    setRate(xRate: number, yRate: number) {
        gsap.to(this, {
            xRate, yRate,
            duration: .3,
            ease: 'easeOut',
            onUpdate: () => this.updateCamera()
        })
    }

    setRadius(radius: number) {
        gsap.fromTo(this, {
            radius: this.radius < radius ? /*变大*/ radius * 0.8 : /*变小*/ radius * 1.2
        }, {
            radius,
            duration: .5,
            ease: 'power',
            onUpdate: () => this.updateCamera()
        })
    }

    updateCamera() {
        this.setLngLat(
            this.lngRange * (this.xRate - 0.5),
            -this.latRange * (this.yRate - 0.5))
    }
}