<template>
    <label class="main" :class="{error}">
        <input ref="input" id="action-input" type="text" spellcheck="false"
               :disabled="!enabled"
               v-model="value"
               @keydown.enter="bindEnter"
               @blur="$emit('update:focus', false)"
               @focus="$emit('update:focus', true)">
    </label>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component"
import {Prop, Watch} from "vue-property-decorator";
import FormulaParser from "@/input/Formula";

@Component({})
export default class FormulaInput extends Vue {
    @Prop({default: true})
    enabled: boolean
    @Prop({default: false})
    focus: boolean

    value: string = ''
    error = false

    @Watch('focus')
    toggleFocus(value) {
        if (value) {
            (this.$refs['input'] as HTMLInputElement).focus()
        } else {
            (this.$refs['input'] as HTMLInputElement).blur()
        }
    }

    @Watch('value', {immediate: true})
    checkInput(value: string): boolean {
        this.error = !!value && !FormulaParser.checkFormula(value)  // 不为空且不正确
        return !this.error
    }

    bindEnter() {
        if (this.checkInput(this.value))
            this.$emit('commit', FormulaParser.parseFormula(this.value))
    }
}
</script>

<style scoped>
.main {
    position: relative;
    display: block;
    background-color: #444;
    padding: 15px 20px;
    border-radius: 5px;
    border: 1px #000 solid;
    z-index: 10;
}

.main input {
    height: 30px;
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: inherit;
    border: none;

    appearance: none;
    color: white;
    font-size: 24px;
    font-family: SansSerif, monospace;
    font-weight: bold;
}

.main input:focus {
    outline: none;
}

.main input::selection {
    background-color: #777;
}

.main.error::after {
    content: "Error";
    color: red;
    position: absolute;
    right: 10px;
    top: 0;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>