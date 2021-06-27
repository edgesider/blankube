import {Three} from ".";
import gsap from "gsap";

const DEFAULT_RATE_X = .75
const DEFAULT_RATE_Y = .25

/**
 * 相机位于以原点为中心的球面上，始终看向原点。
 * 由于屏幕是有界的，所以需要在球面上找一部分，然后将屏幕投影到该球面部分上，具体思路为：
 * 1. 使用经纬度坐标系，以z-y平面作为0经度面，z-x屏幕作为0纬度面；
 * 2. {maxLng}和{maxLat}分别为所选择球面部分的经度和纬度范围大小，这两个值决定了可以相机运动的平面大小；
 * 3. 在计算投影时，根据鼠标坐标相对于屏幕的比例，等比例计算经纬度，然后将经纬度转为直角坐标。
 */
export class CameraControl {
    constructor(public camera: Three.Camera, public domElement: HTMLElement,
                public distance: number, public lngRange: number, public latRange: number) {
        this.enabled = true
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

    xRate = DEFAULT_RATE_X
    yRate = DEFAULT_RATE_Y

    onMouseMove = ev => this.setRate(
        ev.clientX / this.domElement.clientWidth, ev.clientY / this.domElement.clientHeight)
    onMouseEnter = this.onMouseMove
    onMouseLeave = () => this.setRate(DEFAULT_RATE_X, DEFAULT_RATE_Y)

    /**
     * @param xRate [0-1]
     * @param yRate [0-1]
     */
    setRate(xRate: number = DEFAULT_RATE_X, yRate: number = DEFAULT_RATE_Y) {
        gsap.to(this, {
            xRate, yRate,
            duration: .2,
            ease: 'easeOut',
            onUpdate: () => this.updateCamera()
        })
    }

    updateCamera() {
        const lng = this.lngRange * (this.xRate - 0.5),  // 经度
            lat = -this.latRange * (this.yRate - 0.5)  // 纬度
        const y = Math.sin(lat) * this.distance,  // 在经线上偏移求出y
            r = this.distance * Math.cos(lat),  // d*cos(y)是纬线半径
            x = Math.sin(lng) * r,  // 在纬线上偏移得到x
            z = Math.cos(lng) * r  // 得到z
        this.camera.position.set(x, y, z)
        this.camera.lookAt(0, 0, 0)
    }
}