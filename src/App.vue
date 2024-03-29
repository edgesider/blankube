<template>
    <div id="app">
        <div class="header">
            <label for="order">阶数
                <select name="order" id="order" v-model="order" @change="onOrderSelect">
                    <option v-for="o in orders" :value="o">{{ o }}阶</option>
                </select>
            </label>
            <button @click="game.statsEnabled = !game.statsEnabled">Stats</button>
        </div>
        <canvas ref="canvas" id="cube"></canvas>
        <div class="bottom" @keydown.esc="switchToKeyboard">
            <div class="control-panel-container">
                <control-panel :enabled="isKeyboard"
                               @commit="onControlPanelCommit"
                ></control-panel>
            </div>
            <div class="timeline-container">
                <timeline :manager="timelineManager"
                          :cube="game && game.cube"></timeline>
            </div>
            <div class="input-container">
                <formula-input :focus.sync="inputFocus"
                               @commit="onFormulaCommit"
                ></formula-input>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component"
import Game, {Three} from "@/cube";
import FormulaInput from "@/components/FormulaInput.vue";
import {CombinedSource, ISink, Pipe, QueuedSource} from "@/input/pipe";
import {Watch} from "vue-property-decorator";
import ControlPanel from "@/components/ControlPanel.vue";
import {IMove, RedoMove, ResetMove, TraceableMove, UndoMove} from "@/cube/Mover";
import {DomEventSource} from "@/input/EventSource";
import {keyboardMoveMapper} from "@/input/KeyboardActionMapper";
import CubeCalculator from "@/cube/CubeCalculator";
import Timeline from "@/components/Timeline.vue";
import {MoveItem, TimelineManager} from "@/input/Timeline";
import {RubikCube} from "@/cube/RubikCube";

enum Method {
    none = 'None',
    keyboard = 'Keyboard',
    input = 'Input'
}

class TimelineSink implements ISink<IMove> {
    constructor(public manager: TimelineManager, public cube: RubikCube) {
    }

    async put(move: IMove): Promise<any> {
        if (move instanceof TraceableMove) {
            if (move instanceof ResetMove &&
                (this.manager.index === 0 ||
                    (this.manager.items[this.manager.index] instanceof MoveItem &&
                        (this.manager.items[this.manager.index] as MoveItem).move instanceof ResetMove))
            ) {
                return
            }
            this.manager.pushWithClean(new MoveItem(move))
            await this.manager.forward(this.cube)
        } else if (move instanceof UndoMove)
            await this.manager.backward(this.cube)
        else if (move instanceof RedoMove)
            await this.manager.forward(this.cube)
    }
}

@Component({
    components: {Timeline, ControlPanel, FormulaInput}
})
export default class App extends Vue {
    game: Game = null
    orders = [1, 2, 3, 4, 5, 6, 7, 8]
    order = 3
    methods: Method[] = Object.values(Method)
    method: Method = Method.none

    pipe: Pipe<IMove>
    controlPanelSource: QueuedSource<IMove>
    formulaSource: QueuedSource<IMove[]>

    timelineManager: TimelineManager = new TimelineManager()

    inputFocus = false

    mounted() {
        this.game = new Game(this.$refs['canvas'] as HTMLCanvasElement)
        this.game.statsEnabled = true
        this.method = Method.keyboard
        document.addEventListener('keydown', ev =>
            ev.getDescriptor() == 'ctrl+enter' ? this.switchToInput() : undefined)
        global['cube'] = this.game.cube
    }

    get isInput() { return this.method === Method.input }

    get isKeyboard() { return this.method === Method.keyboard }

    onOrderSelect() {
        this.game.reset(this.order)
    }

    switchToInput() {
        this.method = Method.input
        this.$nextTick(() => this.inputFocus = true)
    }

    switchToKeyboard() {
        this.method = Method.keyboard
    }

    @Watch('inputFocus')
    inputFocusChange(focus) {
        if (focus)
            this.switchToInput()
        else
            this.switchToKeyboard()
    }

    @Watch('method', {immediate: true})
    onMethodChange(m: Method) {
        switch (m) {
            case Method.none:
                this.pipe?.close()
                this.pipe = new Pipe(null, null)
                break;
            case Method.keyboard:
                this.pipe?.close()
                const keySrc = new DomEventSource(document, 'keydown', 1)
                    .map(keyboardMoveMapper)
                    .filter(act => !!act)
                this.controlPanelSource = new QueuedSource()
                this.pipe = new Pipe(
                    new CombinedSource([keySrc, this.controlPanelSource]),
                    new TimelineSink(this.timelineManager, this.game.cube))
                    .join()
                break;
            case Method.input:
                this.pipe?.close()
                this.formulaSource = new QueuedSource()
                this.pipe = new Pipe(this.formulaSource.mapFlat<IMove>(it => it),
                    new TimelineSink(this.timelineManager, this.game.cube))
                    .join()
                break;
        }

        this.$nextTick(() => { this.inputFocus = m === Method.input })
    }

    async onControlPanelCommit(move: IMove) {
        this.controlPanelSource.add(move)
    }

    onFormulaCommit(moves: IMove[]) {
        this.formulaSource.add(moves)
    }
}
</script>

<style>
#app {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

.header {
    width: 100%;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 5px;
    box-sizing: border-box;
    background-color: #222;
    color: white;
    z-index: 1;
}

.header > * {
    margin-right: 10px;
}

.header > *:last-child {
    margin-right: 0;
}

#cube {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.bottom {
    width: 100vw;
    z-index: 10;
    position: fixed;
    bottom: 5px;
    transition: all .3s ease-out;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
}

.control-panel-container {
    margin-bottom: 8px;
}

.input-container {
    width: 800px;
}

.timeline-container {
    margin-bottom: 8px;
    width: 800px;
}
</style>