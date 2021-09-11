import {TraceableMove} from "@/cube/Mover";
import {RubikCube} from "@/cube/RubikCube";

export abstract class TimelineItem {
}

export class StartItem extends TimelineItem {
}

export class MoveItem extends TimelineItem {
    constructor(public readonly move: TraceableMove) {
        super();
    }
}

export class GroupStartItem extends TimelineItem {
    public static instance = new GroupStartItem()

    private constructor() {
        super();
    }
}

export class GroupEndItem extends TimelineItem {
    public static instance = new GroupEndItem()

    private constructor() {
        super();
    }
}

export class TimelineManager {
    items: TimelineItem[] = [new StartItem()]
    index = 0

    push(item: TimelineItem) {
        this.items.push(item)
    }

    pop(): TimelineItem {
        if (this.items.length === 1)
            return null
        if (this.index === this.items.length - 1)
            this.index--
        return this.items.pop()
    }

    pushWithClean(item: TimelineItem) {
        this.items.splice(this.index + 1, this.items.length - this.index - 1, item)
    }

    insert(item: TimelineItem) {
        this.items.splice(this.index + 1, 0, item)
    }

    async forward(cube: RubikCube) {
        if (this.index >= this.items.length - 1)
            return
        this.index++
        const item = this.items[this.index]
        if (item instanceof MoveItem) {
            await item.move.do(cube)
        }
    }

    async backward(cube: RubikCube) {
        if (this.index < 1)
            return
        const item = this.items[this.index]
        if (item instanceof MoveItem) {
            await item.move.undo(cube)
        }
        this.index--
    }

    clear() {
        this.items.splice(1, this.items.length - 1)
        this.index = 0
    }
}