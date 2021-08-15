declare module "*.vue" {
    import Vue from 'vue'
    export default Vue
}

interface KeyboardEvent {
    getDescriptor(): string
}