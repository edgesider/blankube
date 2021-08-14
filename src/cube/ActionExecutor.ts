import {ActionName} from "@/cube/Actions";
import {ISink} from "@/input/pipe";
import Game from "@/cube/index";

/**
 * basic action: rludfb, reset
 * Undo(action)
 * Redo(action)
 */

export type Action = () => any
export default class ActionExecutor implements ISink<ActionName> {
    constructor(public game: Game) {
        if (game.actionExecutor) {
            throw Error('This game instance already has an existed ActionExecutor')
        }
    }

    undoStack: ActionName[] = []
    redoStack: ActionName[] = []

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

        undo: this.undo.bind(this),
        redo: this.redo.bind(this),
    }

    async put(o: ActionName) {
        if (['undo', 'redo', 'reset'].indexOf(o) !== -1) {
            // TODO 支持reset
            await this.do(o, false);
        } else {
            await this.do(o);
            this.redoStack.length = 0
        }
    }

    async undo() {
        const lastAction = this.undoStack.pop()
        if (!lastAction)
            return
        const revAction = (lastAction.endsWith('_rev') ?
            lastAction.replace('_rev', '') : (lastAction + '_rev')) as ActionName
        await this.do(revAction, false)
        this.redoStack.splice(0, 0, lastAction)
    }

    async redo() {
        const act = this.redoStack.shift()
        if (!act)
            return
        await this.do(act)
    }

    async reset() {
        await this.do('reset')
    }

    async do(name: ActionName, record = true) {
        const act = this.actions[name]
        if (!act)
            return
        await act()
        if (record)
            this.undoStack.push(name)
    }

    close() {}
}
