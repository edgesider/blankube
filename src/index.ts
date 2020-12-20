import * as Three from 'three'
import {RubikCube} from "./rubik_cube";
import {listenKey} from "./input";
import {SCENE_COLOR} from "./constants";

const canvas: HTMLCanvasElement = document.querySelector('#game')
export const scene = new Three.Scene()
export const camera = new Three.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new Three.WebGLRenderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

scene.background = new Three.Color(SCENE_COLOR)
export const cube = new RubikCube(scene, 3, 200)
camera.position.set(cube.cubeSize * 1.3, cube.cubeSize * 1.3, cube.cubeSize * 3)
camera.lookAt(0, 0, 0)

listenKey(cube)
addLight()
renderLoop()

function addLight() {
    const light = new Three.DirectionalLight(0xffffff, .05)
    light.position.set(1, 1, 0)
    scene.add(light)
}

function renderLoop() {
    requestAnimationFrame(renderLoop)
    renderer.render(scene, camera)
}

export * as Three from 'three'