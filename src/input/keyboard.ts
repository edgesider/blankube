import Game from "@/cube";
import {DefaultKeyDownWaiter} from "./EventWaiter";
import {ActionMap} from "@/input/ActionMap";

let _game: Game

export function listenKeyboard(game: Game) {
    _game = game
    const map = new ActionMap(game)
    setTimeout(async () => {
        // noinspection InfiniteLoopJS
        while (true) {
            const ev = await DefaultKeyDownWaiter.wait(),
                action = map.keyMap[ev.getName()]
            if (action)
                await action()
        }
    }, 0)
}

KeyboardEvent.prototype.getName = function (): string {
    let s = ''
    if (this.ctrlKey)
        s += 'ctrl+'
    if (this.altKey)
        s += 'alt+'
    if (this.shiftKey)
        s += 'shift+'
    // TODO ...

    let keyName = this.key
    keyName = keyName.toLowerCase()
    if (['shift', 'alt', 'control', 'meta'].indexOf(keyName) !== -1) {
        // remove ending +
        s = s.substr(0, s.length - 1)
    } else {
        if (keyName === ' ')
            keyName = 'space'
        else if (keyName === 'escape')
            keyName = 'esc'
        s += keyName
    }
    // TODO ...
    return s
}
