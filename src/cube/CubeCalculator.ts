import {FaceName} from "@/cube/Face";
import {Vector3} from "three";

const x = Object.freeze(new Vector3(1, 0, 0))
const y = Object.freeze(new Vector3(0, 1, 0))
const z = Object.freeze(new Vector3(0, 0, 1))
const x_ = Object.freeze(new Vector3(-1, 0, 0))
const y_ = Object.freeze(new Vector3(0, -1, 0))
const z_ = Object.freeze(new Vector3(0, 0, -1))

const faceAxis: { [key: string]: Readonly<Vector3> } = Object.freeze({r: x, l: x_, u: y, d: y_, f: z, b: z_})
const faces: Readonly<FaceName[]> = Object.freeze(['u', 'd', 'f', 'b', 'r', 'l'])

const DefaultCubeDescriptor = 'u=uuuuuuuuu;d=ddddddddd;f=fffffffff;b=bbbbbbbbb;r=rrrrrrrrr;l=lllllllll'

/**
 * 获取面对应的[主轴，副轴，法线轴]
 */
function getAxisVector(face: FaceName): [Readonly<Vector3>, Readonly<Vector3>, Readonly<Vector3>] {
    // 法向量
    const normal = faceAxis[face]
    return Math.abs(normal.x) === 1 ? [y, z, normal] :
        Math.abs(normal.y) === 1 ? [x, z, normal] : [x, y, normal]
}

function parseCubeDescriptor(cd: string, order: number): { [key: string]: string } {
    const fds = Object.fromEntries(cd.split(';').map(fd => fd.split('=')))
    for (let f of faces) {
        const fd = fds[f]
        if (!fd || fd.length !== order * order)
            throw Error('invalid cube descriptor')
    }
    return fds
}

/**
 * 旋转公式 --展开-> 置换公式
 * f -> replace[(uf,rf)(uf,df)(uf,lf)];rotate:f
 *
 * TODO 修改标准片序，建立面坐标系，保证都是右手系
 */
export default class CubeCalculator {
    constructor(cd: string = DefaultCubeDescriptor, public readonly order: number = 3) {
        this.fds = parseCubeDescriptor(cd, order)
    }

    readonly pieceCount: number = this.order * this.order
    readonly fds: { [key: string]: string }

    /**
     * 旋转face面算起的第layer层
     */
    rotateLayer(face: FaceName, layer: number, clockwise: boolean): CubeCalculator {
        this.rotateFace(face, clockwise)

        const nor = faceAxis[face]

        // 找到周围的四个面
        const sides = faces.filter(f => faceAxis[f].dot(nor) === 0)
        console.assert(sides.length === 4)

        // 四个面绕法线排序
        // 先选中第一个面
        const sortedSides = [sides[0]]
        for (let i = 1, currF = sides[0]; i < 4; i++) {
            // 下一个面的法线与当前面法线叉乘应该等于旋转面法线
            const next = sides.filter(f => faceAxis[f].clone().cross(faceAxis[currF]).equals(nor))
            console.assert(next.length === 1)
            sortedSides.push(next[0])
            currF = next[0]
        }
        if (!clockwise)
            sortedSides.reverse()

        this.swapEdge(face, sortedSides[0], sortedSides[1], layer)
        this.swapEdge(face, sortedSides[0], sortedSides[3], layer)
        this.swapEdge(face, sortedSides[2], sortedSides[3], layer)
        return this
    }

    /**
     * 交换byFace四周的face0和face1两个面上的两条边；这两条边位于靠近byFace面的第layer层
     * cd为cube descriptor
     *
     * 旋转轴与主轴同轴 ? 选行 : 选列
     * 旋转轴方向为正方向 ? 前侧 : 后侧。
     * 目的面法线=(+-)原面法线轴*旋转轴
     * 原面排序：目的面的法线方向
     * 目的面：原面法线方向的反方向
     *
     * TODO 简化边的选择
     */
    swapEdge(byFace: FaceName, face0: FaceName, face1: FaceName, layer: number = 0): CubeCalculator {
        // u=xxxxxxxxx;d=xxxxxxxxx;f=xxxxxxxxx;b=xxxxxxxxx;r=xxxxxxxxx;l=xxxxxxxxx
        if (layer < 0 || layer >= this.order) {
            throw Error('no such layer')
        }

        const [, , norBy] = getAxisVector(byFace)
        const [pri0, sec0, nor0] = getAxisVector(face0)
        const [pri1, sec1, nor1] = getAxisVector(face1)

        // 检查参数
        if (norBy.dot(nor0) !== 0 || norBy.dot(nor1) !== 0) {
            throw Error('face0 or face1 not nearby the by-face')
        }
        if (nor0.dot(nor1) !== 0) {
            throw Error('face0 not nearby face1')
        }

        const fd0 = this.fds[face0], fd1 = this.fds[face1]
        const replacement: number[][] = [[], []]
        // 是否选列
        if (norBy.dot(pri0) === 0) {
            // 副轴和旋转轴同轴，选列
            if (sec0.dot(norBy) > 0) {
                // 副轴与旋转轴同向，倒数第layer列
                for (let i = 0; i < this.order; i++) {
                    replacement[0].push(this.order * i + (this.order - layer - 1))
                }
            } else {
                // 副轴与旋转轴反向，第layer列
                for (let i = 0; i < this.order; i++) {
                    replacement[0].push(this.order * i + layer)
                }
            }
            if (pri0.dot(nor1) < 0) {
                // 主轴与目标面的法线轴反向
                replacement[0].reverse()
            }
        } else {
            // 主轴和旋转轴同轴，选行
            if (pri0.dot(norBy) > 0) {
                // 主轴与旋转轴同向，倒数第layer行
                for (let i = 0; i < this.order; i++) {
                    replacement[0].push(this.order * (this.order - layer - 1) + i)
                }
            } else {
                // 主轴与旋转轴反向，第layer行
                for (let i = 0; i < this.order; i++) {
                    replacement[0].push(this.order * layer + i)
                }
            }
            if (sec0.dot(nor1) < 0) {
                // 副轴与目标面的法线轴反向
                replacement[0].reverse()
            }
        }
        if (norBy.dot(pri1) === 0) {
            // 副轴和旋转轴同轴，选列
            if (sec1.dot(norBy) > 0) {
                // 副轴与旋转轴同向，倒数第layer列
                for (let i = 0; i < this.order; i++) {
                    replacement[1].push(this.order * i + (this.order - layer - 1))
                }
            } else {
                // 副轴与旋转轴反向，第layer列
                for (let i = 0; i < this.order; i++) {
                    replacement[1].push(this.order * i + layer)
                }
            }
            if (pri1.dot(nor0) > 0) {
                // 主轴与目标面的法线轴同向
                replacement[1].reverse()
            }
        } else {
            // 主轴和旋转轴同轴，选行
            if (pri1.dot(norBy) > 0) {
                // 主轴与旋转轴同向，倒数第layer行
                for (let i = 0; i < this.order; i++) {
                    replacement[1].push(this.order * (this.order - layer - 1) + i)
                }
            } else {
                // 主轴与旋转轴反向，第layer行
                for (let i = 0; i < this.order; i++) {
                    replacement[1].push(this.order * layer + i)
                }
            }
            if (sec1.dot(nor0) > 0) {
                // 副轴与目标面的法线轴反向
                replacement[1].reverse()
            }
        }

        const fd0new = Array.from(fd0)
        for (let i = 0; i < this.order; i++) {
            fd0new[replacement[0][i]] = fd1[replacement[1][i]]
        }
        const fd1new = Array.from(fd1)
        for (let i = 0; i < this.order; i++) {
            fd1new[replacement[1][i]] = fd0[replacement[0][i]]
        }
        this.fds[face0] = fd0new.join('')
        this.fds[face1] = fd1new.join('')
        return this
    }

    /**
     * 面内的旋转相当于是行列的替换
     * 旋转向量与主副轴所成手性 -> 顺时针旋转对应的替换是同序（右手系）还是逆序（左手系）
     * 判断手性：主轴向量 * 副轴向量 === 法线轴向量 ? 右手 : 左手
     * rotate(f) -> (r1,c3)(r2,c2)(r3,c1)
     * rotate(u) -> (r1,c1)(r2,c2)(r3,c3)
     * rotate(r) -> (r1,c3)(r2,c2)(r3,c1)
     * rotate(b) -> (r1,c1)(r2,c2)(r3,c3)
     * rotate(l) -> (r1,c1)(r2,c2)(r3,c3)
     * rotate(d) -> (r1,c3)(r2,c2)(r3,c1)
     * TODO 修改标准片序，保证都是右手系
     *
     * @param face 所旋转的面
     * @param clockwise 是否顺时针
     */
    rotateFace(face: FaceName, clockwise: boolean): CubeCalculator {
        const fd = this.fds[face]
        if (this.pieceCount !== fd.length)
            throw Error('descriptor not match with order')
        // 主副轴
        const axis = getAxisVector(face)
        const pri = axis[0].clone(),
            sec = axis[1].clone(),
            nor = axis[2].clone()
        /**
         * 右手系：顺时针逆序，逆时针同序
         * 左手系：顺时针同序，逆时针逆序
         */
        const newFd: string[][] = []
        for (let i = 0; i < this.order; i++)
            newFd.push([])
        for (let i = 0; i < this.order; i++) {
            // 原来的第i行放到现在的第i列
            for (let j = 0; j < this.order; j++) {
                newFd[j][this.order - i - 1] = fd[i * this.order + j]
            }
        }
        // 是否是右手系
        const rightHand = pri.clone().cross(sec).equals(nor)
        if ((rightHand && !clockwise) || (!rightHand && clockwise)) {
            // 主轴作对称
            newFd.forEach(arr => arr.reverse())
            // 副轴作对称
            newFd.reverse()
        }
        this.fds[face] = newFd.flat().join('')
        return this
    }

    toDescriptor() {
        return ['u', 'd', 'f', 'b', 'r', 'l'].map(f => f + '=' + this.fds[f]).join(';')
    }
}

export function testReplace() {
    const cc = new CubeCalculator('u=uuuuuuuuu;d=ddddddddd;f=fffffffff;b=bbbbbbbbb;r=rrrrrrrrr;l=lllllllll', 3)
    cc.swapEdge('f', 'r', 'u')
    console.log(cc.toDescriptor())
}

export function test() {
    const cc = new CubeCalculator()
    cc.fds.f = 'luulfrfdd'
    console.assert(cc.rotateFace('f', true).fds.f === 'flldfudru')
    cc.fds.f = 'flldfudru'
    console.assert(cc.rotateFace('f', false).fds.f === 'luulfrfdd')
    cc.fds.u = 'flldfudru'
    console.assert(cc.rotateFace('u', true).fds.u === 'luulfrfdd')
    cc.fds.u = 'luulfrfdd'
    console.assert(cc.rotateFace('u', false).fds.u === 'flldfudru')
}