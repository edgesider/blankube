import * as Three from 'three'
import gsap from "gsap";
import {Block, Face} from "./face";
import {BLK_SIZE, BLK_SPACE, CUBE_SIZE, HALF_BLK_SPACE, HALF_PI} from "./constants";

export class RubikCube {
    constructor(public scene: Three.Scene, public camera: Three.Camera) {
        scene.background = new Three.Color(0x333333)
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
        this.faces.r.createPieces('red')
        this.faces.l.createPieces('orange')
        this.faces.u.createPieces('yellow')
        this.faces.d.createPieces('white')
        this.faces.f.createPieces('blue')
        this.faces.b.createPieces('green')
    }

    async rotate(axis: 'x' | 'y' | 'z', clockwise: boolean) {
        return new Promise<void>(resolve => {
            const to = {
                duration: .1,
                ease: 'easeIn',
                onComplete: resolve
            }
            to[axis] = this.blockContainer.rotation[axis] + (clockwise ? -HALF_PI : HALF_PI)
            gsap.to(this.blockContainer.rotation, to)
        })
    }
}
