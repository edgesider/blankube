import {DoubleSide, Mesh, Vector3} from "three";
import gsap from "gsap";
import {Three} from "./index";
import {RubikCube} from "./rubik_cube";
import {HALF_PI, PIECE_PERCENT, ROTATE_EASE} from "./constants";

export type Block = Mesh
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

    collect() {
        this.cube.blocks.filter(this.filter).forEach(blk => this.dummy.attach(blk))
    }

    release() {
        this.dummy.children.map(b => b).forEach(blk => this.cube.blockContainer.attach(blk))
        this.dummy.rotation.set(0, 0, 0)
    }

    get angle(): number {
        return this.dummy.rotation.toVector3().dot(this.axis)
    }

    set angle(angle: number) {
        this.dummy.rotation.setFromVector3(this.dummy.parent.worldToLocal(this.axis.clone().multiplyScalar(angle)))
    }

    async action(clockwise: boolean) {
        this.collect()
        return new Promise<void>(resolve => {
            gsap.to(this, {
                angle: this.angle + (clockwise ? -HALF_PI : HALF_PI),
                duration: .1,
                ease: ROTATE_EASE,
                onComplete: () => {
                    this.release()
                    resolve()
                },
            })
        })
    }

    createPieces(color: Three.Color | string) {
        const pieceSize = this.cube.blockSize * PIECE_PERCENT
        const geo = new Three.PlaneGeometry(pieceSize, pieceSize)
        const material = new Three.MeshStandardMaterial({emissive: color, roughness: 0, side: DoubleSide})
        this.cube.blocks.filter(this.filter).forEach(blk => {
            const piece = new Three.Mesh(geo, material)
            const pos = blk.getWorldPosition(new Vector3())
            pos.add(this.axis.clone().multiplyScalar(this.cube.blockSize / 2 + .05))
            piece.position.copy(blk.worldToLocal(pos))
            if (this.axis.x !== 0) {
                piece.rotation.y = HALF_PI
            } else if (this.axis.y !== 0) {
                piece.rotation.x = HALF_PI
            }
            blk.add(piece)
        })
    }
}
