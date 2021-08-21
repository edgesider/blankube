import {QueuedSource} from "@/input/pipe";

export default class EventTargetSource<T> extends QueuedSource<T> {
    constructor(public readonly eventTarget: EventTarget,
                public readonly eventName: string,
                public readonly queueSize: number = 0) {
        super(queueSize);
        this.enabled = true
    }

    protected afterEnableChanged(enable) {
        if (enable) {
            this.eventTarget.addEventListener(this.eventName, this.add.bind(this))
        } else {
            this.eventTarget.removeEventListener(this.eventName, this.add.bind(this))
        }
    }
}

export class DomEventSource<K extends keyof HTMLElementEventMap> extends EventTargetSource<HTMLElementEventMap[K]> {
    constructor(public readonly eventTarget: HTMLElement | Document,
                public readonly eventName: K,
                public readonly queueSize: number = 0) {
        super(eventTarget, eventName, queueSize);
    }
}
