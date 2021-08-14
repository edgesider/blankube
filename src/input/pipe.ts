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
        const first = this._closed == false
        this._closed = true
        this.afterClose(first)
    }

    protected afterClose(firstClose: boolean) {}
}

export abstract class AbsSource<T> extends Closable {
    abstract get(): Promise<T>

    public map<TD>(f: (T) => TD): AbsSource<TD> {
        return new MappedSource(this, f)
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
    constructor(public sources: AbsSource<T>[]) {
        super()
        this.cache = this.sources.map(() => CombinedSource.NOT_EXISTS)
    }

    private readonly cache: T[]
    private needResolve: Function[] = []

    get(): Promise<T> {
        const existId = this.cache.findIndex(v =>
            v !== CombinedSource.NOT_EXISTS && v !== CombinedSource.GETTING)
        if (existId === -1) {
            return new Promise<T>(resolve => {
                this.needResolve.push(resolve)
                this.sources
                    .filter((s, idx) => this.cache[idx] !== CombinedSource.GETTING)
                    .forEach(async (s, idx) => {
                        const o = await s.get()
                        if (this.needResolve.length > 0) {
                            this.needResolve.shift()(o)
                            this.cache[idx] = CombinedSource.NOT_EXISTS
                        } else {
                            this.cache[idx] = o
                        }
                    })
            })
        } else {
            const o = this.cache[existId]
            this.cache[existId] = CombinedSource.NOT_EXISTS
            return Promise.resolve(o)
        }
    }

    close() {
    }

    private static NOT_EXISTS: any = {type: "Not Exists"}
    private static GETTING: any = {type: "Getting"}
}

class MappedSource<S, D> extends AbsSource<D> {
    constructor(public origin: AbsSource<S>, public mapper: (S) => D) {
        super()
    }

    async get(): Promise<D> {
        return Promise.resolve(this.mapper(await this.origin.get()))
    }
}

class FilteredSource<T> extends AbsSource<T> {
    constructor(public origin: AbsSource<T>, public f: (T) => boolean) {
        super();
    }

    async get(): Promise<T> {
        while (true) {
            const v = await this.origin.get()
            if (!this.f(v))
                continue
            return v
        }
    }
}