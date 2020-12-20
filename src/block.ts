import * as Three from "three";
import {DoubleSide, Mesh} from "three";
import {Piece} from "@/rubik_cube";
import {BLOCK_SIZE, colors, PIECE_SIZE} from "@/constants";

const colorMap = {
    r: colors.red, l: colors.orange,
    u: colors.yellow, d: colors.white,
    f: colors.blue, b: colors.green
}
const blockGeometry = new Three.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
const blockMaterial = new Three.MeshStandardMaterial({
    emissive: 'black',
    side: Three.DoubleSide,
})
const pieceGeometry = new Three.PlaneGeometry(PIECE_SIZE, PIECE_SIZE)
const pieceMaterials = {}

Object.entries(colorMap).map(([name, color]) =>
    pieceMaterials[name] = new Three.MeshStandardMaterial({
        emissive: color,
        roughness: 0,
        side: DoubleSide
    })
)

export class Block extends Mesh {
    constructor() {
        super(blockGeometry, blockMaterial);
    }

    pieces = new Array<Piece>()

    addPiece(faceName: string): Piece {
        const piece = new Three.Mesh(pieceGeometry, pieceMaterials[faceName])
        this.add(piece)
        this.pieces.push(piece)
        return piece
    }
}