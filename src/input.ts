import {RubikCube} from "./rubik_cube";

const faceKeys = ['r', 'l', 'f', 'b', 'd', 'u']
const cubeKeys = ['x', 'y', 'z']

export async function listenKey(cube: RubikCube) {
    // noinspection InfiniteLoopJS
    while (true) {
        const ev = await waitKey()
        if (ev.altKey || ev.ctrlKey)
            continue
        const {key} = ev
        const key_l = key.toLowerCase()
        const clockwise = key_l === key
        if (faceKeys.indexOf(key_l) !== -1) {
            await cube.faces[key_l].action(clockwise)
        } else if (cubeKeys.indexOf(key_l) != -1) {
            // @ts-ignore
            await cube.rotate(key_l, clockwise)
        }
    }
}

const keyWaiter = []
const cachedKeys: KeyboardEvent[] = []
const MAX_CACHED_KEYS = 2

document.addEventListener('keydown', ev => {
    const waiter = keyWaiter.shift()
    if (waiter) {
        waiter.call(null, ev)
    } else if (cachedKeys.length <= MAX_CACHED_KEYS) {
        cachedKeys.push(ev)
    }
})

async function waitKey(): Promise<KeyboardEvent> {
    if (cachedKeys.length > 0) {
        return cachedKeys.shift()
    } else {
        return new Promise(res => {
            keyWaiter.push(res)
        })
    }
}
