export abstract class Closable {
    protected _closed = false

    protected checkClose() {
        if (this._closed) {
            throw new Error('closed')
        }
    }

    isClosed(): boolean {
        return this._closed
    }

    close() {
        if (!this._closed) {
            this._closed = true
            this.afterClose()
        }
    }

    protected afterClose() {}
}

export abstract class AbsSource<T> extends Closable {
    abstract get(): Promise<T>

    public map<TD>(f: (T) => TD): AbsSource<TD> {
        return new MappedSource(this, f)
    }

    public mapFlat<TD>(f: (T) => Array<TD>): AbsSource<TD> {
        return new FlattedSource(this.map(f))
    }

    public filter(f: (T) => boolean): AbsSource<T> {
        return new FilteredSource(this, f)
    }
}

export interface ISink<T> {
    put(o: T): Promise<any>
}

export class Pipe<T> extends Closable {
    constructor(public source: AbsSource<T>,
                public sink: ISink<T>) {
        super()
    }

    join(): Pipe<T> {
        this.checkClose()
        setTimeout(this.looper, 0)
        return this
    }

    protected async get() {
        this.checkClose()
        return await this.source.get()
    }

    protected async put(o: T) {
        this.checkClose()
        return await this.sink.put(o)
    }

    protected looper = async () => {
        try {
            // noinspection InfiniteLoopJS
            while (true) {
                this.checkClose()
                await this.put(await this.get())
            }
        } catch (e) {
            console.error(e)
        }
    }

    afterClose() {
        // TODO initiative exit looper
        if (this.source instanceof Closable) {
            this.source.close()
        }
        if (this.sink instanceof Closable) {
            this.sink.close()
        }
    }
}

export class CombinedSource<T> extends AbsSource<T> {
    constructor(sources: AbsSource<T>[]) {
        super()
        this.sourcesInfo = sources.map(it => ({source: it, value: CombinedSource.NOT_EXISTS}))
    }

    private sourcesInfo: { source: AbsSource<T>, value: T }[]
    private needResolve: Function[] = []

    private async startGetter(src: { source: AbsSource<T>, value: T }) {
        src.value = CombinedSource.GETTING
        const v = await src.source.get()
        if (this.needResolve.length > 0) {
            this.needResolve.shift()(v)
            src.value = CombinedSource.NOT_EXISTS
        } else {
            src.value = v
        }
    }

    get(): Promise<T> {
        const existed = this.sourcesInfo.find(it =>
            it.value !== CombinedSource.NOT_EXISTS && it.value !== CombinedSource.GETTING)
        if (!existed) {
            return new Promise(res => {
                this.needResolve.push(res)
                this.sourcesInfo
                    .filter(it => it.value !== CombinedSource.GETTING)
                    .forEach(it => this.startGetter(it))
            })
        } else {
            const v = existed.value
            existed.value = CombinedSource.NOT_EXISTS
            return Promise.resolve(v)
        }
    }

    protected afterClose() {
        this.sourcesInfo.forEach(it => it.source.close())
    }

    private static NOT_EXISTS: any = {type: "Not Exists"}
    private static GETTING: any = {type: "Getting"}
}

export class QueuedSource<T> extends AbsSource<T> {
    constructor(public queueSize: number = 0) {
        super()
    }

    private _enabled = false
    private waiters: [Function, Function][] = []
    private queued: T[] = []

    get enabled() {
        return this._enabled
    }

    set enabled(b) {
        this.checkClose()
        if (this._enabled != b) {
            this._enabled = b
            this.afterEnableChanged(b)
        }
    }

    protected afterEnableChanged(enable) {}

    add(item: T) {
        const waiter = this.waiters.shift()
        if (waiter) {
            waiter[0].call(null, item)
        } else if (this.queued.length < this.queueSize) {
            this.queued.push(item)
        }
    }

    async get(): Promise<T> {
        this.checkClose()
        if (this.queued.length > 0) {
            return this.queued.shift()
        } else {
            return new Promise((res, rej) => {
                this.waiters.push([res, rej])
            })
        }
    }

    close() {
        this.enabled = false
        super.close();
    }

    protected afterClose() {
        this.waiters.forEach(waiter => waiter[1](`source closed`))
        this.waiters.length = 0
        this.queued.length = 0
    }
}

class MappedSource<S, D> extends AbsSource<D> {
    constructor(public readonly origin: AbsSource<S>, public readonly mapper: (S) => D) {
        super()
    }

    async get(): Promise<D> {
        this.checkClose()
        return Promise.resolve(this.mapper(await this.origin.get()))
    }

    protected afterClose() {
        this.origin.close()
    }
}

class FilteredSource<T> extends AbsSource<T> {
    constructor(public readonly origin: AbsSource<T>, public readonly f: (T) => boolean) {
        super();
    }

    async get(): Promise<T> {
        this.checkClose()
        while (true) {
            const v = await this.origin.get()
            if (!this.f(v))
                continue
            return v
        }
    }

    protected afterClose() {
        this.origin.close()
    }
}

class FlattedSource<TA> extends AbsSource<TA> {
    constructor(public readonly origin: AbsSource<Array<TA>>,
                public readonly usePop = false) {
        super();
    }

    private arr: Array<TA> = null

    async get(): Promise<TA> {
        this.checkClose()
        if (!this.arr || this.arr.length === 0) {
            this.arr = await this.origin.get()
        }
        if (this.usePop)
            return this.arr.pop()
        else
            return this.arr.shift()
    }

    protected afterClose() {
        this.origin.close()
    }
}