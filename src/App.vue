<template>
    <div id="app">
        <div class="header">
            <label for="method">控制方式
                <select name="method" id="method" v-model="method">
                    <option v-for="m in this.methods" :value="m">
                        {{ m }}
                    </option>
                </select>
            </label>
            <label for="order">阶数
                <select name="order" id="order" v-model="order" @change="onOrderSelect">
                    <option v-for="o in orders" :value="o">{{ o }}阶</option>
                </select>
            </label>
            <button @click="game.statsEnabled = !game.statsEnabled">Stats</button>
        </div>
        <canvas ref="canvas" id="cube"></canvas>
        <div class="bottom" @keydown.esc="switchToKeyboard">
            <control-panel></control-panel>
            <action-input :show="showInput"
                          :focus.sync="inputFocus"
                          @commit="onInputCommit"
            ></action-input>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component"
import Game from "@/cube";
import {listenKeyboard} from "@/input";
import ActionInput from "@/components/ActionInput.vue";
import {Pipe} from "@/input/pipe";
import {isNull} from "@/utils";
import {Watch} from "vue-property-decorator";
import ControlPanel from "@/components/ControlPanel.vue";
import {IMove} from "@/cube/Mover";

enum Method {
    none = 'None',
    keyboard = 'Keyboard',
    input = 'Input'
}

@Component({
    components: {ControlPanel, ActionInput}
})
export default class App extends Vue {
    game: Game = null
    orders = [1, 2, 3, 4, 5, 6, 7, 8]
    order = 3
    methods: Method[] = Object.values(Method)
    method: Method = Method.none

    keyPipe: Pipe<IMove>

    inputFocus = false
    inputCommitting = false

    get showInput() { return this.method === Method.input }

    mounted() {
        this.game = new Game(this.$refs['canvas'] as HTMLCanvasElement)
        this.game.statsEnabled = true
        this.method = Method.keyboard
        document.addEventListener('keydown', ev =>
            ev.getDescriptor() == 'ctrl+enter' ? this.switchToInput() : undefined)
    }

    onOrderSelect() {
        this.game.reset(this.order)
    }

    switchToInput() {
        this.method = Method.input
        this.inputFocus = true
    }

    switchToKeyboard() {
        this.method = Method.keyboard
    }

    @Watch('method', {immediate: true})
    onMethodChange(m: Method) {
        switch (m) {
            case Method.none:
                this.keyPipe?.close()
                break;
            case Method.keyboard:
                this.keyPipe = listenKeyboard(this.game)
                break;
            case Method.input:
                this.keyPipe?.close()
                break;
        }

        this.inputFocus = m == Method.input
    }

    async onInputCommit(str: string) {
        if (this.inputCommitting)
            return
        this.inputCommitting = true
        try {
            await this.inputCommitInner(str)
        } finally {
            this.inputCommitting = false
        }
    }

    async inputCommitInner(str: string) {
        const actions = [],
            checkRe = /^([rludfbxyz]'? *)+$/,
            re = /[rludfbxyz]'? */y
        if (!checkRe.test(str)) {
            console.error('invalid input')
            return
        }
        while (true) {
            const o = re.exec(str)
            if (isNull(o))
                break
            actions.push(o[0])
        }

        for (const act of actions) {
            // await this.game.actionExecutor.put(act.replace('\'', '_rev'))
        }
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
}
</style>