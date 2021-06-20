import * as Three from 'three'
import {Vector3} from 'three'
import gsap from "gsap";
import {Face} from "@/cube/Face";
import {Block} from "@/cube/Block";
import {BLOCK_SIZE, HALF_PI, ROTATE_DURATION, ROTATE_EASE} from "@/constants";

export class RubikCube {
    constructor(public scene: Three.Scene,
                public order: number) {
        this.cubeSize = BLOCK_SIZE * order;

        this.createBlocks()
        this.createFaces()
        this.createPieces()
        scene.add(this.blockContainer)
        scene.add(...Object.values(this.faces).map(f => f.dummy))
    }

    cubeSize: number

    faces: Readonly<{ [key: string]: Face }>
    blocks = new Array<Block>()
    blockContainer = new Three.Mesh(new Three.BoxGeometry())

    private createBlocks() {
        for (let z = 0; z < this.order; z++) {
            for (let y = 0; y < this.order; y++) {
                for (let x = 0; x < this.order; x++) {
                    if (x != 0 && x != this.order - 1 && y != 0 && y !== this.order - 1 && z != 0 && z != this.order - 1)
                        continue
                    const blk = new Block()
                    blk.position.set((x + 0.5) * BLOCK_SIZE, (y + 0.5) * BLOCK_SIZE, (z + 0.5) * BLOCK_SIZE)
                    blk.position.sub(new Vector3(this.cubeSize / 2, this.cubeSize / 2, this.cubeSize / 2))

                    this.blockContainer.add(blk)
                    this.blocks.push(blk)
                }
            }
        }
    }

    private createFaces() {
        this.faces = Object.freeze({
            r: new Face(this, 'r', blk =>
                blk.getWorldPosition(new Vector3()).x >= this.cubeSize / 2 - BLOCK_SIZE),
            l: new Face(this, 'l', blk =>
                blk.getWorldPosition(new Vector3()).x <= -(this.cubeSize / 2 - BLOCK_SIZE)),
            u: new Face(this, 'u', blk =>
                blk.getWorldPosition(new Vector3()).y >= this.cubeSize / 2 - BLOCK_SIZE),
            d: new Face(this, 'd', blk =>
                blk.getWorldPosition(new Vector3()).y <= -(this.cubeSize / 2 - BLOCK_SIZE)),
            f: new Face(this, 'f', blk =>
                blk.getWorldPosition(new Vector3()).z >= this.cubeSize / 2 - BLOCK_SIZE),
            b: new Face(this, 'b', blk =>
                blk.getWorldPosition(new Vector3()).z <= -(this.cubeSize / 2 - BLOCK_SIZE)),
        })
    }

    private createPieces() {
        Object.values(this.faces).forEach(face => {
            face.getBlocks().forEach(blk => {
                const piece = blk.addPiece(face.name)
                const pos = blk.getWorldPosition(new Vector3())
                pos.add(face.axis.clone().multiplyScalar(BLOCK_SIZE / 2 + BLOCK_SIZE * .01))
                piece.position.copy(blk.worldToLocal(pos))
                // plane默认面向世界z轴，所以旋转另一个轴
                if (face.axis.x !== 0) {
                    piece.rotation.y = HALF_PI
                } else if (face.axis.y !== 0) {
                    piece.rotation.x = HALF_PI
                }
            })
        })
    }

    rotate = async (axis: 'x' | 'y' | 'z', clockwise: boolean) => {
        return new Promise<void>(resolve => {
            const axisVec = new Vector3()
            axisVec[axis] = clockwise ? -1 : 1
            const obj = {value: 0}
            let last = 0
            gsap.to(obj, {
                value: HALF_PI,
                duration: ROTATE_DURATION,
                ease: ROTATE_EASE,
                onUpdate: () => {
                    this.blockContainer.rotateOnWorldAxis(axisVec, obj.value - last)
                    last = obj.value
                },
                onComplete: resolve,
            })
        })
    }

    reset(order = -1) {
        if (order !== -1) {
            this.order = order
            this.cubeSize = BLOCK_SIZE * order
        }
        this.blocks.length = 0
        this.blockContainer.clear()
        this.blockContainer.rotation.set(0, 0, 0)
        this.blockContainer.position.set(0, 0, 0)
        this.createBlocks()
        this.createPieces()
    }

    isResolved() {
        return Object.values(this.faces).every(f => f.isResolved())
    }
}
