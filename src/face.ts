import {DoubleSide, Mesh, Vector3} from "three";
import gsap from "gsap";
import {Three} from "./index";
import {RubikCube} from "./rubik_cube";
import {HALF_BLK_SIZE, HALF_PI, PIECE_SIZE} from "./constants";

export type Block = Mesh
export type FaceName = 'r' | 'l' | 'u' | 'd' | 'f' | 'b'

/**
 * Features:
 *  collect blocks and pieces belong to this face;
 *  maintain angle of face;
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
                ease: 'easeIn',
                onComplete: () => {
                    this.release()
                    resolve()
                },
            })
        })
    }

    createPieces(color: Three.Color | string) {
        const geo = new Three.PlaneGeometry(PIECE_SIZE, PIECE_SIZE)
        const material = new Three.MeshStandardMaterial({emissive: color, roughness: 0, side: DoubleSide})
        this.cube.blocks.filter(this.filter).forEach(blk => {
            const piece = new Three.Mesh(geo, material)
            const pos = blk.getWorldPosition(new Vector3())
            pos.add(this.axis.clone().multiplyScalar(HALF_BLK_SIZE + .05))
            piece.position.copy(blk.worldToLocal(pos))
            if (this.axis.x !== 0) {
                piece.rotation.y = HALF_PI
            } else if (this.axis.y !== 0) {
                piece.rotation.x = HALF_PI
            }
            // piece.rotation.setFromVector3(this.axis.clone().sub(new Vector3(0, 0, 1).multiplyScalar(HALF_PI)))
            blk.add(piece)
        })
    }
}
