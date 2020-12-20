<template>
    <div>
        <canvas ref="canvas" id="cube"></canvas>
    </div>
</template>

<script lang="ts">
import {init} from "@/cube"

export default {
    mounted() {
        init(this.$refs['canvas'] as HTMLCanvasElement)
    }
}
</script>

<style scoped>

</style>