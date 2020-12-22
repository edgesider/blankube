import {Three} from ".";
import gsap from "gsap";

const DEFAULT_RATE_X = .75
const DEFAULT_RATE_Y = .25

export class CameraControl {
    constructor(public camera: Three.Camera, public domElement: HTMLElement,
                public distance: number, public maxX: number, public maxY: number) {
        this.enabled = true
    }

    private _enabled = false
    get enabled() {
        return this._enabled
    }

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
            onUpdate: () => {
                const x = this.maxX * (this.xRate - 0.5),
                    y = -(this.maxY * (this.yRate - 0.5)),
                    z = Math.sqrt(this.distance * this.distance - x * x - y * y)
                this.camera.position.set(x, y, z)
                this.camera.lookAt(0, 0, 0)
            }
        })
    }
}