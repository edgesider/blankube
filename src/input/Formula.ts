import {BodyMove, LayerMove} from "@/cube/Mover";
import {FaceName} from "@/cube/Face";

/**
 * 从公式字符串构造move
 * 0 -> reset
 *
 * r
 * r0 r1
 * rm0 rm1
 * r'
 * ...
 */

const moveRe = /(?<face>[udfbrlUDFBRL])(?<multilayer>m?)(?<layer>\d*)|(?<axis>[xyzXYZ])/

export default class FormulaParser {
    static parseSingle(str: string): LayerMove | BodyMove | null {
        str = str.trim()
        return this.parseMatchGroup(moveRe.exec(str)?.groups)
    }

    static parseFormula(str: string): (LayerMove | BodyMove)[] {
        const checkRe = new RegExp(`^((${moveRe.source}) *)+$`),
            re = new RegExp(`(${moveRe.source}) *`, 'y')
        if (!checkRe.test(str))
            return null
        const moves: (LayerMove | BodyMove) [] = []
        while (true) {
            const m = this.parseMatchGroup(re.exec(str)?.groups)
            if (!m)
                break
            moves.push(m)
        }
        return moves
    }

    private static parseMatchGroup(group: { [p: string]: string }): LayerMove | BodyMove | null {
        if (!group)
            return null
        if (group['axis']) {
            // 整体运动BodyMove
            const axis = group['axis'].toLowerCase() as 'x' | 'y' | 'z',
                clockwise = axis === group['axis']
            return new BodyMove(clockwise, axis)
        } else {
            // 层运动LayerMove
            if (!group['face'])
                return null
            const face = group['face'].toLowerCase() as FaceName

            let multilayer: boolean
            if (group['multilayer'] === 'm')
                multilayer = true
            else if (group['multilayer'] === '')
                multilayer = false
            else
                return null

            const layer = group['layer'] === '' ? 0 : Number.parseInt(group['layer'])
            if (isNaN(layer))
                return null

            const clockwise = face === group['face']
            return new LayerMove(clockwise, face as FaceName, layer, multilayer)
        }
    }

    static test() {
        function t(s) {
            console.log(s, FormulaParser.parseSingle(s)?.toString())
        }

        function t2(s) {
            console.log(s, FormulaParser.parseFormula(s))
        }

        ['r', 'R', 'r0', 'rm0', 'rm1', 'rm10', 'k', 'rm', 'x', 'x0'].forEach(t)

        t2('')
        t2('rrru')
        t2('r u r u')
        t2('rU Ur')
        t2('r UUr')
        t2('rm2 r0 r1')
        t2('xX x0')
    }
}