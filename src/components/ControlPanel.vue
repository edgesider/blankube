<template>
    <div class="container">
        <ul>
            <li class="btn" @click="bindUndo"><</li>
            <li class="btn" @click="bindRedo">></li>
            <li class="btn" @click="bindReset">reset</li>
        </ul>
    </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import {Prop} from "vue-property-decorator";
import Mover from "@/cube/Mover";

/**
 * TODO
 * - 更换为图片
 * - 设置按钮的可用状态
 * - 快捷键
 */

@Component({})
export default class ControlPanel extends Vue {
    @Prop({default: false})
    enabled: boolean

    bindUndo() {
        if (!this.enabled)
            return
        this.$emit('commit', Mover.UndoMove)
    }

    bindRedo() {
        if (!this.enabled)
            return
        this.$emit('commit', Mover.RedoMove)
    }

    bindReset() {
        if (!this.enabled)
            return
        this.$emit('commit', Mover.ResetMove)
    }
}
</script>

<style scoped>
.container {
    width: 100vw;
    height: 30px;
    z-index: 10;
    margin-bottom: 8px;
}

.container > ul, .btn {
    appearance: none;
    list-style: none;
    padding: 0;
    margin: 0;
}

.container > ul {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
}

.btn {
    box-sizing: border-box;
    position: relative;
    color: white;
    display: block;
    /*width: 30px;*/
    padding: 0 10px;
    height: 30px;
    font-size: 14px;
    line-height: 30px;
    text-align: center;
    margin: 0 2px;
    user-select: none;
    background-color: #444;
    border-radius: 5px;
    border: 1px #444 solid;
}

.btn:hover {
    background-color: #333;
}

.btn:active {
    border: 1px #555 solid;
}
</style>
