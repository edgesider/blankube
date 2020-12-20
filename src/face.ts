import {Vector3} from "three";
import gsap from "gsap";
import {Three} from "@/index";
import {Piece, RubikCube} from "@/rubik_cube";
import {HALF_PI, ROTATE_DURATION, ROTATE_EASE} from "@/constants";
import {Block} from "@/block";
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

    async action(clockwise: boolean) {
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
}
