<template>
    <div class="container" :class="{hide: !show}" @keydown.esc="$emit('wantClose')">
        <label class="main">
            <input ref="input" id="action-input" type="text"
                   v-model="value"
                   @keydown.enter="$emit('commit', value)"
                   @blur="$emit('update:focus', false)"
                   @focus="$emit('update:focus', true)">
        </label>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component"
import {Prop, Watch} from "vue-property-decorator";

const acceptChars = 'rludbf\''

@Component({})
export default class ActionInput extends Vue {
    @Prop({default: false})
    show: boolean

    @Prop({default: false})
    focus: boolean

    value: string = ''

    @Watch('focus')
    toggleFocus(value) {
        if (value) {
            (this.$refs['input'] as HTMLInputElement).focus()
        } else {
            (this.$refs['input'] as HTMLInputElement).blur()
        }
    }

    @Watch('value')
    checkInput(value: string) {
        let res = ''
        for (const c of value) {
            if (acceptChars.indexOf(c) === -1)
                continue
            res += c
        }
        this.value = res
    }
}
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
.container {
    position: fixed;
    width: 100vw;
    bottom: 5px;
    z-index: 10;
    transition: all .3s ease-out;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.container.hide {
    transform: translateY(120%);
}

.toggle {
    position: absolute;
    top: 0;
    box-sizing: border-box;
    transform: translateY(-100%);
    appearance: none;
    background-color: #444;
    color: white;
    height: 17px;
    width: 40px;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    border: 1px #000 solid;
    border-bottom: none;
    cursor: pointer;
    z-index: 9;
}

.toggle:focus {
    outline: none;
}

.main {
    display: block;
    width: 600px;
    max-width: 80%;
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
</style>