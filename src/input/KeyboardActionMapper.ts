import Mover, {BodyMove, IMove, LayerMove} from "@/cube/Mover";

const keyMap = {
    'r': new LayerMove(true, 'r', 0, false),
    'shift+r': new LayerMove(false, 'r', 0, false),
    'l': new LayerMove(true, 'l', 0, false),
    'shift+l': new LayerMove(false, 'l', 0, false),
    'u': new LayerMove(true, 'u', 0, false),
    'shift+u': new LayerMove(false, 'u', 0, false),
    'd': new LayerMove(true, 'd', 0, false),
    'shift+d': new LayerMove(false, 'd', 0, false),
    'f': new LayerMove(true, 'f', 0, false),
    'shift+f': new LayerMove(false, 'f', 0, false),
    'b': new LayerMove(true, 'b', 0, false),
    'shift+b': new LayerMove(false, 'b', 0, false),

    'x': new BodyMove(true, 'x'),
    'shift+x': new BodyMove(false, 'x'),
    'y': new BodyMove(true, 'y'),
    'shift+y': new BodyMove(false, 'y'),
    'z': new BodyMove(true, 'z'),
    'shift+z': new BodyMove(false, 'z'),

    'space': Mover.ResetMove,
    'backspace': Mover.UndoMove,
    'shift+backspace': Mover.RedoMove,
    'ctrl+i': Mover.RedoMove,
    'ctrl+o': Mover.UndoMove,
}

export function keyboardMoveMapper(ev: KeyboardEvent): IMove {
    return keyMap[ev.getDescriptor()]
}

KeyboardEvent.prototype.getDescriptor = function (): string {
    let s = ''
    if (this.ctrlKey)
        s += 'ctrl+'
    if (this.metaKey)
        s += 'meta+'
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
