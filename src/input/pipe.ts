/**
 * 过程式的协程与函数式的事件流并不冲突。协程适合多个事件和过程的组合等待的场景，函数式的方式适合单个事件的处理。
 *
 * 常规的函数式的数据流方式并未提供将过程串在一起的方式，因此并未摆脱回调；它主要是利用了函数式强大地表达能力，简化了
 * 对事件的处理。
 *
 * 在使用协程时，仍旧可以使用函数式的方式对事件作预处理（map、filter等），但是事件并不以
 * 订阅的方式消耗，而是在协程中进行消耗，参与进整个过程的组合拼接中。
 *
 *
 * 协程为开发者提供了无限多个独立的"过程容器"，我们不必去思考怎样将很多个过程安排到一个线程中，而是去如何将现有的事件
 * 组织成一个完整的过程；不必站在计算资源的角度来思考，而是站在任务的角度思考。
 *
 * 与所有的事件驱动一样，整个协程框架可以说是被众多事件推着前进的，这些事件就像齿轮一样，互相咬合、互相推进；因此协程
 * 框架应当支持高效地事件传递和转化。
 *
 * 协程框架应当支持协程的中断。
 *
 * 结构化协程是一种数据组织和协程生命周期管理方式。
 *
 * 协程不是银弹，但它一定是另一种模式。
 */

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

    protected afterClose(firstClose: boolean) {
    }
}

export interface ISource<T> {
    get(): Promise<T>
}

export interface ISink<T> {
    put(o: T): Promise<any>
}

export interface IMapper<TS, TD> extends ISink<TD> {
    map(o: TS): TD
}

export interface IFilter<T> extends ISink<T> {
    accept(o: T): boolean
}

export interface IPipe<T> {
    join()
}

export class Pipe<T> extends Closable implements IPipe<T> {
    constructor(public source: ISource<T>,
                public sink: ISink<T>) {
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
        // TODO exit looper
        if (this.source instanceof Closable) {
            this.source.close()
        }
        if (this.sink instanceof Closable) {
            this.sink.close()
        }
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

export class FilterSinkWrapper<T> implements IFilter<T> {
    constructor(public filter: (o: T) => boolean,
                public sink: ISink<T>) {
    }

    put(o: T): Promise<any> {
        if (this.filter(o))
            return this.sink.put(o)
    }

    accept(o: T): boolean {
        return this.filter(o)
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

const CanceledException = {}

function CPromise(e) {
    let reject = null
    const p = new Promise((res, rej) => {
        reject = rej
        e(res, rej)
    })
    p['cancel'] = () => reject(CanceledException)
    return p
}

function CancelablePromise<T>(executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void) => void) {
}

const p = new Promise((res, rej) => {

})