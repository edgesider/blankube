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

    abstract close()
}

export interface ISource<T> {
    get(): Promise<T>

    close()
}

export interface ISink<T> {
    put(o: T): Promise<any>

    close()
}

export interface IMapper<TS, TD> {
    map(o: TS): TD
}

export interface IPipe<TS, TD> {
    join()

    close()
}

export class Pipe<TS, TD> extends Closable implements IPipe<TS, TD> {
    constructor(public source: ISource<TS>,
                public sink: ISink<TD>,
                public mapper: IMapper<TS, TD>) {
        super()
    }

    join() {
        this.checkClose()
        setTimeout(this.looper, 0)
    }

    protected async get() {
        this.checkClose()
        return await this.source.get()
    }

    protected async put(o: TD) {
        this.checkClose()
        return await this.sink.put(o)
    }

    protected looper = async () => {
        try {
            // noinspection InfiniteLoopJS
            while (true) {
                this.checkClose()
                await this.put(
                    this.mapper.map(
                        await this.get()))
            }
        } catch (e) {
            console.error(e)
        }
    }

    close() {
        if (this._closed)
            return
        this._closed = true
        // TODO exit looper
        this.source.close()
        this.sink.close()
    }
}

export class SelfMapper<T> implements IMapper<T, T> {
    map(o: T): T {
        return o
    }
}

export class CombinedSource<T> implements ISource<T> {
    constructor(public sources: ISource<T>[]) {
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

export class FilterSinkWrapper<T> implements ISink<T> {
    constructor(public filter: (o: T) => boolean,
                public sink: ISink<T>) {
    }

    put(o: T): Promise<any> {
        if (this.filter(o))
            return this.sink.put(o)
    }

    close() {
    }
}

export class ArraySource<T> implements ISource<T> {
    get(): Promise<T> {
        return Promise.resolve(undefined);
    }

    close() {
    }
}

export class FuncSink<T> implements ISink<T> {
    constructor(public f: (o: T) => any) {
    }

    put(o: T): Promise<any> {
        let rv = this.f(o)
        if (!(rv instanceof Promise))
            rv = Promise.resolve(rv)
        return rv
    }

    close() {
    }
}

