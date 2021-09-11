/**
 * 排队，历史记录
 */
import {FaceName} from "@/cube/Face";
import {RubikCube} from "@/cube/RubikCube";
import {ISink} from "@/input/pipe";

export interface IMove {
    do(cube: RubikCube): Promise<any>
}

export abstract class TraceableMove implements IMove {
    abstract do(cube: RubikCube): Promise<any>

    abstract undo(cube: RubikCube): Promise<any>

    abstract redo(cube: RubikCube): Promise<any>
}

/**
 * 层移动
 * 如果multilayer为true，则移动face面的前layer层；
 *   如果为false，则移动face面的第layer层。
 */
export class LayerMove extends TraceableMove {
    constructor(public readonly clockwise: boolean,  // 顺时针
                public readonly face: FaceName,  // 面
                public readonly layer: number,  // 层
                public readonly multilayer: boolean)  // 多层模式
    {
        super()
    }

    async do(cube: RubikCube) {
        await cube.faces[this.face].move(this.clockwise)
    }

    async undo(cube: RubikCube) {
        await cube.faces[this.face].move(!this.clockwise)
    }

    async redo(cube: RubikCube) {
        await this.do(cube)
    }

    toString(): string {
        return `LayerMove {face: ${this.face}, layer: ${this.layer}, clockwise: ${this.clockwise}, multilayer: ${this.multilayer}}`
    }
}

export class BodyMove extends TraceableMove {
    constructor(public readonly clockwise: boolean,
                public readonly axis: 'x' | 'y' | 'z') {
        super()
    }

    async do(cube: RubikCube) {
        await cube.rotate(this.axis, this.clockwise)
    }

    async undo(cube: RubikCube) {
        await cube.rotate(this.axis, !this.clockwise)
    }

    async redo(cube: RubikCube) {
        await this.do(cube)
    }

    toString(): string {
        return `BodyMove {axis: ${this.axis}, clockwise: ${this.axis}}`
    }
}

export class ResetMove extends TraceableMove {
    constructor() {
        super()
    }

    descriptor: string = null

    async do(cube: RubikCube) {
        this.descriptor = cube.toDescriptor()
        await cube.reset()
    }

    async undo(cube: RubikCube) {
        cube.fromDescriptor(this.descriptor)
    }

    async redo(cube: RubikCube) {
        await this.do(cube)
    }

    toString(): string {
        return 'Reset {}'
    }
}

abstract class TraceMove implements IMove {
    async do(cube: RubikCube): Promise<any> {}
}


export class UndoMove extends TraceMove {
    toString(): string {
        return 'UndoMove {}'
    }
}

export class RedoMove extends TraceMove {
    toString(): string {
        return 'RedoMove {}'
    }
}

export default class Mover implements ISink<IMove> {
    static UndoMove = new UndoMove()
    static RedoMove = new RedoMove()
    static ResetMove = new ResetMove()

    constructor(public readonly cube: RubikCube) {}

    undoStack: TraceableMove[] = []
    redoStack: TraceableMove[] = []

    async put(m: IMove): Promise<any> {
        if (m instanceof TraceableMove) {
            if (m instanceof ResetMove && this.undoStack[this.undoStack.length - 1] instanceof ResetMove) {
                // 忽略连续的ResetMove
                return
            }
            this.undoStack.push(m)
            this.redoStack.length = 0
            await m.do(this.cube)
        } else if (m instanceof UndoMove) {
            if (this.undoStack.length === 0) {
                return
            }
            const final = this.undoStack.pop()
            this.redoStack.unshift(final)
            await final.undo(this.cube)
        } else if (m instanceof RedoMove) {
            if (this.redoStack.length === 0) {
                return
            }
            const final = this.redoStack.shift()
            this.undoStack.push(final)
            await final.redo(this.cube)
        }
    }
}