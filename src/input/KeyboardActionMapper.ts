import {IMapper} from "@/input/pipe";
import Actions, {Action} from "@/cube/Actions";

export default class KeyboardActionMapper implements IMapper<KeyboardEvent, Action> {
    constructor(public actions: Actions) {
    }

    map(o: KeyboardEvent): Action {
        return this.keyMap[o.getDescription()]
    }

    keyMap = {
        'r': this.actions.r,
        'shift+r': this.actions.r_rev,
        'l': this.actions.l,
        'shift+l': this.actions.l_rev,
        'u': this.actions.u,
        'shift+u': this.actions.u_rev,
        'd': this.actions.d,
        'shift+d': this.actions.d_rev,
        'f': this.actions.f,
        'shift+f': this.actions.f_rev,
        'b': this.actions.b,
        'shift+b': this.actions.b_rev,
        'x': this.actions.x,
        'shift+x': this.actions.x_rev,
        'y': this.actions.y,
        'shift+y': this.actions.y_rev,
        'z': this.actions.z,
        'shift+z': this.actions.z_rev,
        'space': this.actions.reset
    }
}

KeyboardEvent.prototype.getDescription = function (): string {
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
