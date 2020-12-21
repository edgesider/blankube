import Game from "@/cube/index";

export type Action = () => any

export default class Actions {
    constructor(public game: Game) {
    }

    r: Action = this.game.cube.faces.r.action.bind(null, true)
    r_rev: Action = this.game.cube.faces.r.action.bind(null, false)
    l: Action = this.game.cube.faces.l.action.bind(null, true)
    l_rev: Action = this.game.cube.faces.l.action.bind(null, false)
    f: Action = this.game.cube.faces.f.action.bind(null, true)
    f_rev: Action = this.game.cube.faces.f.action.bind(null, false)
    b: Action = this.game.cube.faces.b.action.bind(null, true)
    b_rev: Action = this.game.cube.faces.b.action.bind(null, false)
    u: Action = this.game.cube.faces.u.action.bind(null, true)
    u_rev: Action = this.game.cube.faces.u.action.bind(null, false)
    d: Action = this.game.cube.faces.d.action.bind(null, true)
    d_rev: Action = this.game.cube.faces.d.action.bind(null, false)

    x: Action = this.game.cube.rotate.bind(null, 'x', true)
    x_rev: Action = this.game.cube.rotate.bind(null, 'x', false)
    y: Action = this.game.cube.rotate.bind(null, 'y', true)
    y_rev: Action = this.game.cube.rotate.bind(null, 'y', false)
    z: Action = this.game.cube.rotate.bind(null, 'z', true)
    z_rev: Action = this.game.cube.rotate.bind(null, 'z', false)

    reset: Action = this.game.reset.bind(this.game)
}