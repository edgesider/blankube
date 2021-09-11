<template>
    <div class="main">
        <div v-for="(item, i) of manager.items"
             @click="goto(i)"
             :class="getClass(item, i)">
            {{ getText(item) }}
            <div v-if="i === manager.index" class="divider"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {BodyMove, LayerMove, ResetMove} from "@/cube/Mover";
import {delay} from "@/utils";
import {RubikCube} from "@/cube/RubikCube";
import gsap from "gsap";
import {Prop, Watch} from "vue-property-decorator";
import {GroupEndItem, GroupStartItem, MoveItem, StartItem, TimelineItem, TimelineManager} from "@/input/Timeline";

/**
 * 历史记录管理、公式输入管理、
 * 清除，暂停继续，跳转，预览
 * MoveGroup
 */
@Component({})
export default class Timeline extends Vue {
    @Prop()
    manager: TimelineManager
    @Prop()
    cube: RubikCube

    moveId = 0

    mounted() {
        this.gotoStart()
    }

    async goto(i) {
        const id = ++this.moveId

        if (i > this.manager.index) {
            while (i > this.manager.index) {
                await delay(200)
                if (this.moveId !== id)
                    break;
                await this.manager.forward(this.cube)
                this.scrollTo(this.manager.index)
            }
        } else if (i < this.manager.index) {
            while (i < this.manager.index) {
                await delay(200)
                if (this.moveId !== id)
                    break;
                await this.manager.backward(this.cube)
                this.scrollTo(this.manager.index)
            }
        }
    }

    @Watch('manager.index')
    indexChanged() {
        this.$nextTick(this.scrollTo.bind(this, this.manager.index))
    }

    async gotoEnd() {
        await this.goto(this.manager.items.length - 1)
    }

    async gotoStart() {
        await this.goto(0)
    }

    scrollTo(idx: number) {
        const el = this.getElement(idx)
        gsap.to(this.$el, {
            scrollLeft: el.offsetLeft - this.$el.clientWidth / 2 + el.clientWidth,
            duration: .2,
            ease: 'easeout',
        })
    }

    getElement(idx: number): HTMLElement {
        return this.$el.children[idx] as HTMLElement
    }

    getClass(item: TimelineItem, idx: number) {
        return {
            item: true,
            starter: idx === 0,
            done: idx <= this.manager.index && idx !== 0,
            waiting: idx > this.manager.index,
            reset: item instanceof MoveItem && item.move instanceof ResetMove
        }
    }

    getText(item: TimelineItem) {
        if (item instanceof MoveItem) {
            const move = item.move
            if (move instanceof LayerMove) {
                return move.face + (move.clockwise ? '' : '\'')
            } else if (move instanceof BodyMove) {
                return move.axis + (move.clockwise ? '' : '\'')
            } else if (move instanceof ResetMove) {
                return ''
            }
        } else if (item instanceof GroupStartItem) {
            return '('
        } else if (item instanceof GroupEndItem) {
            return ')'
        } else if (item instanceof StartItem) {
            return '0'
        }
    }
}
</script>

<style scoped>
.main {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    height: 60px;

    background-color: #444;
    border-radius: 5px;
    border: 1px #000 solid;
    position: relative;

    overflow: hidden;
}

.main::before, .main::after {
    content: '';
    width: calc(50% - 20px);
    height: 100%;
    flex-shrink: 0;
}

.main::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 6px;
}

.main::-webkit-scrollbar-thumb {
    background: green;
    border-radius: 6px;
}
</style>

<!--suppress CssUnusedSymbol -->
<style scoped>
.item {
    position: relative;
    height: 40px;
    width: 40px;
    line-height: 40px;
    text-align: center;

    font-size: 30px;
    font-family: monospace;
    user-select: none;

    flex-shrink: 0;
    overflow: visible;
}

.item.done {
    background: green;
    color: #ccc;
}

.item.waiting {
    background: gray;
}

.item.starter {
    background: orange;
    color: #fff;
}

.item.reset {
    background-size: contain;
    background-image: url("~/asset/reset.svg");
}

.item:hover {
    filter: brightness(1.1);
    z-index: 10;
}

.item:active {
    filter: brightness(0.95);
    z-index: 10;
}

.divider {
    width: 2px;
    height: 44px;
    background: aqua;
    flex-shrink: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(50%, -2px);
    z-index: 15;
}
</style>