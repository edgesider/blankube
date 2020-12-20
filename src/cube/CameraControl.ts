import {Three} from ".";
import gsap, {TweenMax} from "gsap";

const DEFAULT_RATE_X = .75
const DEFAULT_RATE_Y = .25

export class CameraControl {
    constructor(public camera: Three.Camera, public domElement: HTMLElement,
                public distance: number, public maxX: number, public maxY: number) {
        domElement.addEventListener('mousemove', this.onMouseMove)
        domElement.addEventListener('mouseenter', this.onMouseEnter)
        domElement.addEventListener('mouseleave', this.onMouseLeave)
        this.setRate(DEFAULT_RATE_X, DEFAULT_RATE_Y)
    }

    lastAnimation?: TweenMax

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
    setRate(xRate: number, yRate: number) {
        this.lastAnimation?.kill()

        this.lastAnimation = gsap.to(this, {
            xRate, yRate,
            duration: .1,
            ease: 'easeIn',
            onUpdate: () => {
                const x = this.maxX * (this.xRate - 0.5),
                    y = -(this.maxY * (this.yRate - 0.5)),
                    z = Math.sqrt(this.distance * this.distance - x * x - y * y)
                this.camera.position.set(x, y, z)
                this.camera.lookAt(0, 0, 0)
            }
        })
    }

    dispose() {
        this.domElement.removeEventListener('mousemove', this.onMouseMove)
        this.domElement.removeEventListener('mouseenter', this.onMouseEnter)
        this.domElement.removeEventListener('mouseleave', this.onMouseLeave)
    }
}