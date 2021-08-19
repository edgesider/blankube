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

const phraseRe = /((?<face>[udfbrlUDFBRL])(?<multilayer>m?)(?<layer>\d*)|(?<axis>[xyz]))(?<anticlock>'?)/
const checkRe = new RegExp(`^((${phraseRe.source}) *)+$`)
const formulaRe = new RegExp(`(${phraseRe.source}) *`, 'y')

export default class FormulaParser {
    static parseSingle(str: string): LayerMove | BodyMove | null {
        str = str.trim()
        return this.parseMatchGroup(phraseRe.exec(str)?.groups)
    }

    static parseFormula(str: string): (LayerMove | BodyMove)[] {
        if (!FormulaParser.checkFormula(str)) {
            console.log('formula check failed')
            return []
        }
        const moves: (LayerMove | BodyMove) [] = []
        while (true) {
            const m = this.parseMatchGroup(formulaRe.exec(str)?.groups)
            if (!m)
                break
            moves.push(m)
        }
        console.log(moves)
        return moves
    }

    static checkFormula(str: string): boolean {
        return checkRe.test(str)
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
            const clockwise = !group['anticlock']

            let multilayer = group['multilayer'] === 'm'

            let layer = !group['layer'] ? 0 : Number.parseInt(group['layer'])
            if (isNaN(layer))
                layer = 0

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