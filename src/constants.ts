export const PI = Math.PI
export const HALF_PI = PI / 2
export const QUARTER_PI = PI / 4

export const BLOCK_SIZE = 5
export const PIECE_SIZE = BLOCK_SIZE * 0.8

export const SCENE_COLOR = 0x222222

export const ROTATE_DURATION = .1
export const ROTATE_EASE = 'linear'

export const colors = {
    red: '#c41e3a',
    orange: '#FF5800',
    blue: '#0051BA',
    green: '#009E60',
    white: '#FFFFFF',
    yellow: '#FFD500',
}

/**
 * 魔方中心位于原点，相机位于以原点为中心的球面上，始终看向原点。
 */
export namespace camera {
    export const radiusScale = 4  // 相机球面半径与魔方宽度的比值
    export const lngRange = PI / 1.5  // 相机移动的经度范围
    export const latRange = PI / 1.5  // 相机移动的纬度范围
    export const defaultXRate = 0.70  // 默认的X轴比例
    export const defaultYRate = 0.35  // 默认的Y轴比例
}