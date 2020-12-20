import * as Three from 'three'
import {RubikCube} from "@/cube/rubik_cube";
import {listenKey} from "@/input";
import {SCENE_COLOR} from "@/cube/constants";

export * as Three from 'three'

let _canvas: HTMLCanvasElement
export let scene: Three.Scene
export let camera: Three.PerspectiveCamera
let renderer: Three.WebGLRenderer
let cube: RubikCube

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
    camera.position.set(cube.cubeSize * 1.3, cube.cubeSize * 1.3, cube.cubeSize * 3)
    camera.lookAt(0, 0, 0)

    addLight()
    renderLoop()
    listenKey(cube)
}

function onResize() {
    camera.aspect = _canvas.clientWidth / _canvas.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(_canvas.clientWidth, _canvas.clientHeight, false)
    _canvas.width = _canvas.clientWidth
    _canvas.height = _canvas.clientHeight
}

function addLight() {
    const light = new Three.DirectionalLight(0xffffff, .05)
    light.position.set(1, 1, 0)
    scene.add(light)
}

function renderLoop() {
    requestAnimationFrame(renderLoop)
    renderer.render(scene, camera)
}
