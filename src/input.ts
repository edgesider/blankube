import {RubikCube} from "@/cube/rubik_cube";

const faceKeys = ['r', 'l', 'f', 'b', 'd', 'u']
const cubeKeys = ['x', 'y', 'z']
const otherKeys = [' ']

let _cube: RubikCube
let looperStarted = false

export function listenKey(cube: RubikCube) {
    _cube = cube
    if (!looperStarted) {
        setTimeout(loop, 0)
        looperStarted = true
    }
}

async function loop() {
    try {
        // noinspection InfiniteLoopJS
        while (true) {
            const ev = await waitKey()
            if (ev.altKey || ev.ctrlKey)
                continue
            const {key} = ev
            const key_l = key.toLowerCase()
            const clockwise = key_l === key
            if (faceKeys.indexOf(key_l) !== -1) {
                await _cube.faces[key_l].action(clockwise)
            } else if (cubeKeys.indexOf(key_l) != -1) {
                // @ts-ignore
                await _cube.rotate(key_l, clockwise)
            } else if (otherKeys.indexOf(key) != -1) {
                switch (key) {
                    case ' ':
                        _cube.reset()
                        break
                }
            }
        }
    } finally {
        console.warn('key listener exited')
        looperStarted = false
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
