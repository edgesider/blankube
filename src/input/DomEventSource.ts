import {ISource} from "@/input/pipe";

export default class DomEventSource<K extends keyof HTMLElementEventMap> implements ISource<HTMLElementEventMap[K]> {
    constructor(public readonly dom: HTMLElement | Document,
                public readonly eventName: K,
                public queueSize: number = -1) {
        this.enabled = true
    }

    private _enabled = true
    private waiters: [Function, Function][] = []
    private queued: HTMLElementEventMap[K][] = []
    private onEvent = ev => {
        const waiter = this.waiters.shift()
        if (waiter) {
            waiter[0].call(null, ev)
        } else if (this.queued.length < this.queueSize) {
            this.queued.push(ev)
        }
    }

    get enabled() {
        return this._enabled
    }

    set enabled(b) {
        if (b) {
            this.dom.addEventListener(this.eventName, this.onEvent)
        } else {
            this.dom.removeEventListener(this.eventName, this.onEvent)
            this.abort()
        }
        this._enabled = b
    }

    async get(): Promise<HTMLElementEventMap[K]> {
        if (this.queued.length > 0) {
            return this.queued.shift()
        } else {
            return new Promise((res, rej) => {
                this.waiters.push([res, rej])
            })
        }
    }

    /**
     * reject等待中的Promise
     */
    abort() {
        this.waiters.forEach(waiter => waiter[1](`EventWaiter [${this.eventName}] aborted`))
        this.waiters.length = 0
    }
}
