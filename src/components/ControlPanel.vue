<template>
    <div class="container">
        <ul>
            <li class="btn" @click="actionExecutor.reset()"><<</li>
            <li class="btn" @click="actionExecutor.undo()"><</li>
            <li class="btn" @click="actionExecutor.redo()">></li>
            <li class="btn">>></li>
        </ul>
    </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import {Prop} from "vue-property-decorator";
import ActionExecutor from "@/cube/ActionExecutor";

@Component({})
export default class ControlPanel extends Vue {
    @Prop({required: true})
    actionExecutor: ActionExecutor
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
    width: 30px;
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
