<template>
    <div id="main">
        <div class="header">
            <div>
                <label for="order">阶数</label>
                <select name="order" id="order" v-model="order" @change="orderSelected">
                    <option v-for="o in orders" :value="o">{{ o }}阶</option>
                </select>
            </div>
            <button @click="toggleStats">Stats</button>
        </div>
        <canvas ref="canvas" id="cube"></canvas>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component"
import Game from "@/cube";
import {listenKeyboard} from "@/input";

@Component({})
export default class App extends Vue {
    orders = [1, 2, 3, 4, 5, 6, 7, 8]
    order = 3
    game: Game

    mounted() {
        this.game = new Game(this.$refs['canvas'] as HTMLCanvasElement)
        listenKeyboard(this.game.actions)
    }

    orderSelected() {
        this.game.reset(this.order)
    }

    toggleStats() {
        this.game.statsEnabled = !this.game.statsEnabled
    }
}
</script>

<style>
#main {
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

#cube {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>