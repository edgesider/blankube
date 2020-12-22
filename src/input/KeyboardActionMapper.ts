import {IMapper} from "@/input/pipe";
import Actions, {ActionName} from "@/cube/Actions";

export default class KeyboardActionMapper implements IMapper<KeyboardEvent, ActionName> {
    map(o: KeyboardEvent): ActionName {
        return KeyboardActionMapper.keyMap[o.getDescription()]
    }

    static keyMap = {
        'r': Actions.r,
        'shift+r': Actions.r_rev,
        'l': Actions.l,
        'shift+l': Actions.l_rev,
        'u': Actions.u,
        'shift+u': Actions.u_rev,
        'd': Actions.d,
        'shift+d': Actions.d_rev,
        'f': Actions.f,
        'shift+f': Actions.f_rev,
        'b': Actions.b,
        'shift+b': Actions.b_rev,
        'x': Actions.x,
        'shift+x': Actions.x_rev,
        'y': Actions.y,
        'shift+y': Actions.y_rev,
        'z': Actions.z,
        'shift+z': Actions.z_rev,
        'space': Actions.reset
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
