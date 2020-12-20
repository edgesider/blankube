import * as Three from 'three'
import {RubikCube} from "@/cube/rubik_cube";
import {listenKey} from "@/input";
import {SCENE_COLOR} from "@/cube/constants";
import {CameraControl} from "@/cube/CameraControl";
import Stats from "three/examples/jsm/libs/stats.module";

export * as Three from 'three'

let _canvas: HTMLCanvasElement
export let scene: Three.Scene
export let camera: Three.PerspectiveCamera
let renderer: Three.WebGLRenderer
let cube: RubikCube
let cameraControls: CameraControl
let stats = Stats()

export function init(canvas: HTMLCanvasElement) {
    _canvas = canvas
    scene = new Three.Scene()
    camera = new Three.PerspectiveCamera(
        50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    renderer = new Three.WebGLRenderer({canvas, antialias: true, alpha: true})

    onResize()
    window.addEventListener('resize', onResize)
    scene.background = new Three.Color(SCENE_COLOR)

    cube = new RubikCube(scene, 3)
    setCamera(cube.cubeSize)

    stats.showPanel(0)
    document.body.append(stats.dom)
    addLight()
    renderLoop()
    listenKey(cube)
    return {cube, scene, camera, renderer}
}

export function setCamera(cubeSize: number) {
    const distance = cubeSize * 5
    camera.lookAt(0, 0, 0)
    cameraControls?.dispose()
    cameraControls = new CameraControl(camera, _canvas,
        distance, cube.cubeSize * 6, cube.cubeSize * 6)
}

function onResize() {
    const {clientWidth: w, clientHeight: h} = _canvas
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
    _canvas.width = w
    _canvas.height = h
}

function addLight() {
    const light = new Three.DirectionalLight(0xffffff, .05)
    light.position.set(1, 1, 0)
    scene.add(light)
}

function renderLoop() {
    stats.begin()
    renderer.render(scene, camera)
    stats.end()
    requestAnimationFrame(renderLoop)
}
