<template>
    <div class="container">
        <ul>
            <li class="btn undo" @mousedown="bindUndo" v-long-press="bindUndo"></li>
            <li class="btn redo" @mousedown="bindRedo" v-long-press="bindRedo"></li>
            <li class="btn reset" @mousedown="bindReset"></li>
        </ul>
    </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import {Prop} from "vue-property-decorator";
import Mover from "@/cube/Mover";
import {createPressDirective} from "@/utils";

@Component({
    directives: {
        longPress: createPressDirective(800, 300)
    }
})
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
    padding: 0 10px;
    width: 30px;
    height: 30px;
    font-size: 14px;
    line-height: 30px;
    text-align: center;
    margin: 0 2px;
    user-select: none;
}

.btn:hover {
    filter: brightness(110%);
}

.btn:active {
    filter: brightness(90%);
}

.btn.undo {
    background-image: url(~/asset/arrow.svg);
    background-size: cover;
    background-position: 0 0;
    background-repeat: no-repeat;
    transform: rotateZ(-90deg);
}

.btn.redo {
    background-image: url(~/asset/arrow.svg);
    background-size: cover;
    background-position: 0 0;
    background-repeat: no-repeat;
    transform: rotateZ(90deg);
}

.btn.reset {
    background-image: url(~/asset/reset.svg);
    background-size: cover;
    background-position: 0 0;
    background-repeat: no-repeat;
}
</style>
