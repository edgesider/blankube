import Game from "@/cube";

export class ActionMap {
    constructor(public game: Game) {
    }

    R = this.game.cube.faces.r.action.bind(null, true)
    RRev = this.game.cube.faces.r.action.bind(null, false)
    L = this.game.cube.faces.l.action.bind(null, true)
    LRev = this.game.cube.faces.l.action.bind(null, false)
    F = this.game.cube.faces.f.action.bind(null, true)
    FRev = this.game.cube.faces.f.action.bind(null, false)
    B = this.game.cube.faces.b.action.bind(null, true)
    BRev = this.game.cube.faces.b.action.bind(null, false)
    U = this.game.cube.faces.u.action.bind(null, true)
    URev = this.game.cube.faces.u.action.bind(null, false)
    D = this.game.cube.faces.d.action.bind(null, true)
    DRev = this.game.cube.faces.d.action.bind(null, false)

    X = this.game.cube.rotate.bind(null, 'x', true)
    XRev = this.game.cube.rotate.bind(null, 'x', false)
    Y = this.game.cube.rotate.bind(null, 'y', true)
    YRev = this.game.cube.rotate.bind(null, 'y', false)
    Z = this.game.cube.rotate.bind(null, 'z', true)
    ZRev = this.game.cube.rotate.bind(null, 'z', false)

    Reset = this.game.reset.bind(this.game)

    keyMap = {
        'r': this.R,
        'shift+r': this.RRev,
        'l': this.L,
        'shift+l': this.LRev,
        'u': this.U,
        'shift+u': this.URev,
        'd': this.D,
        'shift+d': this.DRev,
        'f': this.F,
        'shift+f': this.FRev,
        'b': this.B,
        'shift+b': this.BRev,
        'x': this.X,
        'shift+x': this.XRev,
        'y': this.Y,
        'shift+y': this.YRev,
        'z': this.Z,
        'shift+z': this.ZRev,
        'space': this.Reset
    }
}