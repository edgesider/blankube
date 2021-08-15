import {Vector3} from "three";
import gsap from "gsap";
import {Three} from "@/cube/index";
import {RubikCube} from "@/cube/RubikCube";
import {HALF_PI, ROTATE_DURATION, ROTATE_EASE} from "@/constants";
import {Block, Piece} from "@/cube/Block";
import {nearlyEqual} from "@/utils";

export type FaceName = 'r' | 'l' | 'u' | 'd' | 'f' | 'b'

/**
 * 收集和维护魔方的一个面
 */
export class Face {
    static faceAxis: { [key: string]: Vector3 } = {
        r: new Vector3(1, 0, 0), l: new Vector3(-1, 0, 0),
        u: new Vector3(0, 1, 0), d: new Vector3(0, -1, 0),
        f: new Vector3(0, 0, 1), b: new Vector3(0, 0, -1),
    }

    constructor(public readonly cube: RubikCube,
                public readonly name: FaceName,
                public readonly filter: (blk: Block) => Boolean) {
        this.axis = Face.faceAxis[name]
    }

    readonly axis: Vector3
    dummy = new Three.Mesh()

    private get angle(): number {
        return this.dummy.rotation.toVector3().dot(this.axis)
    }

    // noinspection JSUnusedLocalSymbols
    private set angle(angle: number) {
        this.dummy.rotation.setFromVector3(this.dummy.parent.worldToLocal(this.axis.clone().multiplyScalar(angle)))
    }

    isResolved(): boolean {
        const pieces = this.getPieces()
        return pieces.every(p => p.material === pieces[0].material)
    }

    getPieces(): Piece[] {
        return this.getBlocks().map(b => b.pieces).flat().filter(p =>
            !nearlyEqual(p.getWorldDirection(new Vector3()).dot(this.axis), 0)
        )
    }

    /**
     * 排序时忽略该面的法线轴，然后按照其余两轴坐标升序排序，排序顺序为x>y>z
     *
     * 是否存在一个方程z=f(x,y)，使得任意两组输入(x0,y0),(x1,y1)，若x0!=x1或者y0!=y1，则z0!=z1。
     * 应该是不存在的，否则二维平面上点的个数就和三维空间点的个数相同了。
     * 但是在局部范围内，应该是有这样的方程的。
     */
    getSortedPieces(): Piece[] {
        type PV = [Piece, Vector3]
        // 去除法线轴
        const [a0, a1] = nearlyEqual(Math.abs(this.axis.x), 1) ? ['y', 'z'] :
            nearlyEqual(Math.abs(this.axis.y), 1) ? ['x', 'z'] : ['x', 'y']
        const sortFn0 = (pv0: PV, pv1: PV) => pv0[1][a0] > pv1[1][a0] ? 1 : -1,
            sortFn1 = (pv0: PV, pv1: PV) => pv0[1][a1] > pv1[1][a1] ? 1 : -1
        const pieces = this.getPieces().map(p => [p, p.getWorldPosition(new Vector3())] as PV) // 根据世界坐标排序

        // 先按照第一个轴排序
        pieces.sort(sortFn0)

        // 每一行再按照第二个轴排序
        const rows: PV[][] = []
        for (let i = 0; i < this.cube.order; i++) {
            const row: PV[] = []
            for (let j = 0; j < this.cube.order; j++) {
                row.push(pieces.shift())
            }
            row.sort(sortFn1)
            rows.push(row)
        }
        return rows.flat().map(pv => pv[0])
    }

    move = async (clockwise: boolean) => {
        this.collect()
        return new Promise<void>(resolve => {
            gsap.to(this, {
                angle: this.angle + (clockwise ? -HALF_PI : HALF_PI),
                duration: ROTATE_DURATION,
                ease: ROTATE_EASE,
                onComplete: () => {
                    this.release()
                    resolve()
                },
            })
        })
    }

    getBlocks() {
        return this.cube.blocks.filter(this.filter)
    }

    collect() {
        this.getBlocks().forEach(blk => this.dummy.attach(blk))
    }

    release() {
        this.dummy.children.map(b => b).forEach(blk => this.cube.blockContainer.attach(blk))
        this.dummy.rotation.set(0, 0, 0)
    }

    toDescriptor() {
        return this.getSortedPieces().map(p => p.initFace).join('')
    }

    fromDescriptor(sd: string) {
        const pieces = this.getSortedPieces()
        console.assert(sd.length === pieces.length)
        for (let i in pieces) {
            pieces[i].updateInitFace(sd[i] as FaceName)
        }
    }
}
