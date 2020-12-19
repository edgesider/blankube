import * as Three from 'three'
import {Vector3} from 'three'
import gsap from "gsap";
import {Block, Face} from "./face";
import {BLK_PERCENT, colors, HALF_PI, ROTATE_EASE} from "./constants";

export class RubikCube {
    constructor(public scene: Three.Scene,
                public order: number,
                public cubeSize: number) {
        this.blockSpace = cubeSize / order
        this.blockSize = this.blockSpace * BLK_PERCENT

        this.createBlocks()
        this.createFaces()
        scene.add(this.blockContainer)
        this.blockContainer.add(...Object.values(this.faces).map(f => f.dummy))
    }

    /**
     * 块的实际大小
     */
    blockSize: number
    /**
     * 块所占的空间，包括块的实际大小和中间的间隙
     */
    blockSpace: number

    faces: Readonly<{ [key: string]: Face }>
    blocks = new Array<Block>()
    blockContainer = new Three.Mesh(new Three.BoxGeometry())

    createBlocks() {
        const geo = new Three.BoxGeometry(this.blockSize, this.blockSize, this.blockSize)
        for (let z = 0; z < this.order; z++) {
            for (let y = 0; y < this.order; y++) {
                for (let x = 0; x < this.order; x++) {
                    if (x != 0 && x != this.order - 1 && y != 0 && y !== this.order - 1 && z != 0 && z != this.order - 1)
                        continue
                    const blockMaterial = new Three.MeshStandardMaterial({
                        // emissive: Number.parseInt(`0x${x * 3}${x * 3}${y * 3}${y * 3}${z * 3}${z * 3}`),
                        emissive: 'black',
                        side: Three.DoubleSide,
                    })
                    const blk = new Three.Mesh(geo, blockMaterial)
                    blk.position.set((x + 0.5) * this.blockSpace, (y + 0.5) * this.blockSpace, (z + 0.5) * this.blockSpace)
                    blk.position.sub(new Vector3(this.cubeSize / 2, this.cubeSize / 2, this.cubeSize / 2))

                    this.blockContainer.add(blk)
                    this.blocks.push(blk)
                }
            }
        }
    }

    createFaces() {
        this.faces = Object.freeze({
            r: new Face(this, 'r', blk =>
                blk.parent.localToWorld(blk.position.clone()).x >= this.cubeSize / 2 - this.blockSpace),
            l: new Face(this, 'l', blk =>
                blk.parent.localToWorld(blk.position.clone()).x <= -(this.cubeSize / 2 - this.blockSpace)),
            u: new Face(this, 'u', blk =>
                blk.parent.localToWorld(blk.position.clone()).y >= this.cubeSize / 2 - this.blockSpace),
            d: new Face(this, 'd', blk =>
                blk.parent.localToWorld(blk.position.clone()).y <= -(this.cubeSize / 2 - this.blockSpace)),
            f: new Face(this, 'f', blk =>
                blk.parent.localToWorld(blk.position.clone()).z >= this.cubeSize / 2 - this.blockSpace),
            b: new Face(this, 'b', blk =>
                blk.parent.localToWorld(blk.position.clone()).z <= -(this.cubeSize / 2 - this.blockSpace)),
        })
        this.createPieces()
    }

    createPieces() {
        this.faces.r.createPieces(colors.red)
        this.faces.l.createPieces(colors.orange)
        this.faces.u.createPieces(colors.yellow)
        this.faces.d.createPieces(colors.white)
        this.faces.f.createPieces(colors.blue)
        this.faces.b.createPieces(colors.green)
    }

    async rotate(axis: 'x' | 'y' | 'z', clockwise: boolean) {
        return new Promise<void>(resolve => {
            const axisVec = new Vector3()
            axisVec[axis] = clockwise ? -1 : 1
            const obj = {value: 0}
            let last = 0
            gsap.to(obj, {
                value: HALF_PI,
                duration: .1,
                ease: ROTATE_EASE,
                onUpdate: () => {
                    this.blockContainer.rotateOnWorldAxis(axisVec, obj.value - last)
                    last = obj.value
                },
                onUpdateParams: ['{self}', 'value'],
                onComplete: resolve,
            })
        })
    }
}
