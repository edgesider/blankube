import EventWaiter from "@/input/EventWaiter";

class ShortcutRecorder {
    private keydownWaiter = new EventWaiter(document, 'keydown', 1)
    private keyupWaiter = new EventWaiter(document, 'keyup', 1)

    async wait() {
        let key = ''
        while (true) {
            const ev = await Promise.race([this.keydownWaiter.wait(), this.keyupWaiter.wait()])
            ev.preventDefault()
            if (ev.type === 'keydown') {
                key = ev.getName()
                this.keyupWaiter.abort()
            } else {
                this.keydownWaiter.abort()
                if (key)
                    break
            }
        }
        return key
    }

    abort() {
        this.keydownWaiter.abort()
        this.keyupWaiter.abort()
    }
}