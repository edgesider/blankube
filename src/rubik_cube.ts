import * as Three from 'three'
import {Vector3} from 'three'
import gsap from "gsap";
import {Block, Face} from "./face";
import {BLK_SIZE, BLK_SPACE, colors, CUBE_SIZE, HALF_BLK_SPACE, HALF_PI,} from "./constants";

export class RubikCube {
    constructor(public scene: Three.Scene, public camera: Three.Camera) {
        scene.background = new Three.Color(0x222222)
        camera.position.set(CUBE_SIZE * 1.3, CUBE_SIZE * 1.3, CUBE_SIZE * 2)
        camera.lookAt(0, 0, 0)

        this.createBlocks()
        this.createFaces()
        scene.add(this.blockContainer)
        this.blockContainer.add(...Object.values(this.faces).map(f => f.dummy))
    }

    faces: Readonly<{ [key: string]: Face }>
    blocks = new Array<Block>()
    blockContainer = new Three.Mesh(new Three.BoxGeometry())

    createBlocks() {
        const geo = new Three.BoxGeometry(BLK_SIZE, BLK_SIZE, BLK_SIZE)
        for (let z = 0; z < 3; z++) {
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    if (x == 1 && y == 1 && z == 1) continue
                    const blockMaterial = new Three.MeshStandardMaterial({
                        // emissive: Number.parseInt(`0x${x * 3}${x * 3}${y * 3}${y * 3}${z * 3}${z * 3}`),
                        emissive: 'black',
                        side: Three.DoubleSide,
                    })
                    const blk = new Three.Mesh(geo, blockMaterial)
                    blk.position.set((x - 1) * BLK_SPACE, (y - 1) * BLK_SPACE, (z - 1) * BLK_SPACE)
                    this.blockContainer.add(blk)
                    this.blocks.push(blk)
                }
            }
        }
    }

    createFaces() {
        this.faces = Object.freeze({
            r: new Face(this, 'r', blk => blk.parent.localToWorld(blk.position.clone()).x >= HALF_BLK_SPACE),
            l: new Face(this, 'l', blk => blk.parent.localToWorld(blk.position.clone()).x <= -HALF_BLK_SPACE),
            u: new Face(this, 'u', blk => blk.parent.localToWorld(blk.position.clone()).y >= HALF_BLK_SPACE),
            d: new Face(this, 'd', blk => blk.parent.localToWorld(blk.position.clone()).y <= -HALF_BLK_SPACE),
            f: new Face(this, 'f', blk => blk.parent.localToWorld(blk.position.clone()).z >= HALF_BLK_SPACE),
            b: new Face(this, 'b', blk => blk.parent.localToWorld(blk.position.clone()).z <= -HALF_BLK_SPACE),
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
                ease: 'easeIn',
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
