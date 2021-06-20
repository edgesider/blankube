import * as Three from "three";
import {DoubleSide, Mesh} from "three";
import {BLOCK_SIZE, colors, PIECE_SIZE} from "@/constants";

const initColorMap = {
    r: 'red', l: 'orange',
    u: 'yellow', d: 'white',
    f: 'blue', b: 'green'
}
const blockGeometry = new Three.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
const blockMaterial = new Three.MeshStandardMaterial({
    emissive: 'black',
    side: Three.DoubleSide,
})
const pieceGeometry = new Three.PlaneGeometry(PIECE_SIZE, PIECE_SIZE)
const pieceMaterials = {}  // {red: Material(red), ...}
Object.entries(colors).map(([name, color]) =>
    pieceMaterials[name] = new Three.MeshStandardMaterial({
        emissive: color,
        roughness: 0,
        side: DoubleSide
    })
)

export class Piece extends Mesh {
    constructor(public color: keyof typeof colors) {
        super(pieceGeometry, pieceMaterials[color]);
    }
}

export class Block extends Mesh {
    constructor() {
        super(blockGeometry, blockMaterial);
    }

    pieces = new Array<Piece>()

    addPiece(faceName: string): Piece {
        const piece = new Piece(initColorMap[faceName])
        this.add(piece)
        this.pieces.push(piece)
        return piece
    }
}