import * as Three from 'three'
import {PerspectiveCamera, Scene, WebGLRenderer} from 'three'
import {RubikCube} from "@/cube/RubikCube";
import {camera, SCENE_COLOR} from "@/constants";
import {RateCameraControl} from "@/cube/RateCameraControl";
import Stats from "three/examples/jsm/libs/stats.module";
import Mover from "@/cube/Mover";

export * as Three from 'three'

/**
 * TODO 更换阶数时重置Mover
 * TODO 按过程重构：Mover过程
 */
export default class Game {
    constructor(public canvas: HTMLCanvasElement) {
        this.scene = new Three.Scene()
        this.scene.background = new Three.Color(SCENE_COLOR)
        this.camera = new Three.PerspectiveCamera(
            50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
        this.renderer = new Three.WebGLRenderer({canvas, antialias: true, alpha: true})
        this.cube = new RubikCube(this.scene, 3)
        this.cameraControl = new RateCameraControl(
            this.camera, document.body, this.cube.cubeSize * camera.radiusScale,
            camera.lngRange, camera.latRange,
            camera.defaultXRate, camera.defaultYRate)
        this.mover = new Mover(this.cube)

        this.addLight()
        this.renderLoop()
        this.onResize()
        window.addEventListener('resize', this.onResize)
    }

    scene: Scene
    camera: PerspectiveCamera
    cameraControl: RateCameraControl
    renderer: WebGLRenderer
    cube: RubikCube
    mover: Mover

    reset(order = -1) {
        if (order === -1)
            order = this.cube.order
        this.cube.reset(order)
        this.cameraControl.setRadius(this.cube.cubeSize * camera.radiusScale)
    }

    private stats = Stats()
    private _statsEnabled = false
    get statsEnabled() {
        return this._statsEnabled
    }

    set statsEnabled(b) {
        this._statsEnabled = b
        if (b)
            document.body.append(this.stats.dom)
        else
            document.body.removeChild(this.stats.dom)
    }

    private addLight() {
        const light = new Three.DirectionalLight(0xffffff, .05)
        light.position.set(1, 1, 0)
        this.scene.add(light)
    }

    private renderLoop = () => {
        this.stats.begin()
        this.renderer.render(this.scene, this.camera)
        this.stats.end()
        requestAnimationFrame(this.renderLoop)
    }

    private onResize = () => {
        const {clientWidth: w, clientHeight: h} = this.canvas
        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(w, h, false)
        this.canvas.width = w
        this.canvas.height = h
    }
}
