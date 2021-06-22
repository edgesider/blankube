import {ActionName} from "@/cube/Actions";
import {ISink} from "@/input/pipe";
import Game from "@/cube/index";

export type Action = () => any
export default class ActionExecutor implements ISink<ActionName> {
    constructor(public game: Game) {
    }

    actions: { [index: string]: Action | undefined } = {
        r: this.game.cube.faces.r.action.bind(null, true),
        r_rev: this.game.cube.faces.r.action.bind(null, false),
        l: this.game.cube.faces.l.action.bind(null, true),
        l_rev: this.game.cube.faces.l.action.bind(null, false),
        f: this.game.cube.faces.f.action.bind(null, true),
        f_rev: this.game.cube.faces.f.action.bind(null, false),
        b: this.game.cube.faces.b.action.bind(null, true),
        b_rev: this.game.cube.faces.b.action.bind(null, false),
        u: this.game.cube.faces.u.action.bind(null, true),
        u_rev: this.game.cube.faces.u.action.bind(null, false),
        d: this.game.cube.faces.d.action.bind(null, true),
        d_rev: this.game.cube.faces.d.action.bind(null, false),

        x: this.game.cube.rotate.bind(null, 'x', true),
        x_rev: this.game.cube.rotate.bind(null, 'x', false),
        y: this.game.cube.rotate.bind(null, 'y', true),
        y_rev: this.game.cube.rotate.bind(null, 'y', false),
        z: this.game.cube.rotate.bind(null, 'z', true),
        z_rev: this.game.cube.rotate.bind(null, 'z', false),

        reset: this.game.reset.bind(this.game),
    }

    async put(o: ActionName): Promise<any> {
        const act = this.actions[o]
        if (act)
            await act()
    }

    close() {
    }
}
