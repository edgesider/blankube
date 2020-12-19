import * as Three from 'three'
import {RubikCube} from "./rubik_cube";
import {listenKey} from "./input";

const canvas: HTMLCanvasElement = document.querySelector('#game')
export const scene = new Three.Scene()
export const camera = new Three.PerspectiveCamera(
    50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)

const renderer = new Three.WebGLRenderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)

addLight()
renderLoop()
export const cube = new RubikCube(scene, camera)
listenKey(cube)


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